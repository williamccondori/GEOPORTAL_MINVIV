import io
from typing import Optional

import google.cloud.dialogflow_v2 as dialogflow
import speech_recognition as sr
from fastapi import UploadFile
from google.api_core.exceptions import InvalidArgument
from google.cloud.dialogflow_v2 import QueryResult
from pydub import AudioSegment

from app.config import settings
from app.shared.domain.exceptions.application_exception import ApplicationException
from app.web.application.dtos.chat_response_dto import ChatResponseDTO
from app.web.domain.models.layer import Layer
from app.web.domain.repositories.layer_information_repository import LayerInformationRepository
from app.web.domain.repositories.layer_repository import LayerRepository


class ChatService:
    def __init__(self, layer_repository: LayerRepository, layer_information_repository: LayerInformationRepository):
        self.layer_repository = layer_repository
        self.layer_information_repository = layer_information_repository

    def __get_response_from_dialog_flow(self, session_id: str, message: str) -> QueryResult:
        self.client = dialogflow.SessionsClient()
        self.client_session = self.client.session_path(settings.DIALOGFLOW_PROJECT_ID, session_id)
        text = dialogflow.types.TextInput({
            'text': message,
            'language_code': settings.DIALOGFLOW_LANGUAGE_CODE
        })
        query_input = dialogflow.types.QueryInput({'text': text})
        try:
            response = self.client.detect_intent(session=self.client_session, query_input=query_input)
        except InvalidArgument:
            raise
        return response.query_result

    async def __generate_result(self, result: QueryResult) -> list[ChatResponseDTO]:
        initial_message: str = result.query_text

        intent = result.intent.display_name

        responses = []

        # INTENCIÓN: consultar_suelo_urbano_inicial o consultar_suelo_urbano.
        if intent in ["consultar_suelo_urbano_inicial", "consultar_suelo_urbano"]:
            action: str = result.action

            if action == "filtrar_suelo_urbano":
                categoria = result.parameters.get("categoria", None)
                propietario = result.parameters.get("propietario", None)
                provincia = result.parameters.get("provincia", None)
                region = result.parameters.get("region", None)
                servicios = result.parameters.get("servicios", None)
                zonificacion = result.parameters.get("zonificacion", None)

                mensaje = "🔍 Se ha filtrado el suelo urbano con los siguientes criterios:\n"
                if categoria:
                    mensaje += f"Categoría: {categoria}, "
                if propietario:
                    mensaje += f"Propietario: {propietario}, "
                if provincia:
                    mensaje += f"Provincia: {provincia}, "
                if region:
                    mensaje += f"Región: {region}, "
                if servicios:
                    mensaje += f"Servicios: {servicios}, "
                if zonificacion:
                    mensaje += f"Zonificación: {zonificacion}, "
                mensaje += "Puedes consultar el suelo urbano filtrado en el visor."

                responses.append(ChatResponseDTO(
                    message=mensaje,
                    initial_message=initial_message,
                    action="filtrar_suelo_urbano",
                    action_window="filtrar_suelo_urbano",
                    data={
                        "CATEGORÍA": categoria,
                        "PROPIETARI": propietario,
                        "PROVINCIA": provincia,
                        "REGIÓN": region,
                        "SERVICIOS": servicios,
                        "ZONIFICACI": zonificacion
                    }
                ))

        # INTENCIÓN: activar o desactivar capa.
        elif intent == "controlar_capas":
            active_layer_id: str = self.__get_layer_id_by_df_name(result.parameters.get("capa", ""))
            action_value: str = result.parameters.get("accion", "")

            active_layer_name: str = await self.__get_layer_name_by_id(active_layer_id)

            if not active_layer_id:
                responses.append(ChatResponseDTO(
                    message="☹️ No se ha especificado qué capa controlar. Por favor, indícalo con más detalle.",
                    initial_message=initial_message,
                    action="controlar_capa",
                    action_control="controlar_capa"
                ))
            else:
                if action_value == "activar":
                    responses.append(ChatResponseDTO(
                        message=f"✅ Se ha activado la capa: {active_layer_name}",
                        initial_message=initial_message,
                        action="activar_capa",
                        data={"layerId": active_layer_id},
                        action_control="activar_capa"
                    ))
                elif action_value == "desactivar":
                    responses.append(ChatResponseDTO(
                        message=f"🚫 Se ha desactivado la capa: {active_layer_name}",
                        initial_message=initial_message,
                        action="desactivar_capa",
                        data={"layerId": active_layer_id},
                        action_control="desactivar_capa"
                    ))
                else:
                    responses.append(ChatResponseDTO(
                        message="⚠️ No entendí si deseas activar o desactivar la capa. Por favor, acláralo.",
                        initial_message=initial_message,
                        action="accion_no_reconocida",
                        action_control="accion_no_reconocida"
                    ))

        else:
            responses = [ChatResponseDTO(
                message=result.fulfillment_text,
                initial_message=initial_message
            )]

        return responses

    async def get_query(self, session_id: str, message: str) -> list[ChatResponseDTO]:
        try:
            result: QueryResult = self.__get_response_from_dialog_flow(session_id, message)
        except Exception as e:
            print(e)
            raise ApplicationException("Ha ocurrido un error al consultar el asistente virtual")
        return await self.__generate_result(result)

    async def get_voice_query(self, session_id: str, audio: UploadFile) -> list[ChatResponseDTO]:
        try:
            audio_segment = AudioSegment.from_file(io.BytesIO(await audio.read()), format="webm")  # noqa
        except Exception as e:
            print(e)
            raise ApplicationException("El archivo de audio debe ser válido")

        message: str = ""

        with io.BytesIO() as wav_io:
            audio_segment.export(wav_io, format="wav")
            wav_io.seek(0)

            r = sr.Recognizer()

            try:
                with sr.AudioFile(wav_io) as source:
                    audio_data = r.record(source)
                message = r.recognize_google(audio_data, language="es-ES")  # noqa
            except sr.UnknownValueError:
                message = "_"
            except sr.RequestError as e:
                print(e)
                raise ApplicationException(
                    f"Error al procesar el audio, no se pudo conectar al servicio de reconocimiento.")

        return await self.get_query(session_id, message)

    @staticmethod
    def __get_layer_id_by_df_name(df_name: str) -> str:
        equivalents = {
            "proyectos_suelo_urbano": "683c83d10cd4a888fb9a10c9",
            "directorio_municipalidades": "683dc2017b8702bd1c562a4d",
        }
        return equivalents.get(df_name, "")

    async def __get_layer_name_by_id(self, active_layer_id):
        layer: Optional[Layer] = await self.layer_repository.get(active_layer_id)
        if layer:
            return layer.name
        else:
            return "Capa sin nombre"
