import io

import google.cloud.dialogflow_v2 as dialogflow
import speech_recognition as sr
from fastapi import UploadFile
from google.api_core.exceptions import InvalidArgument
from google.cloud.dialogflow_v2 import QueryResult
from pydub import AudioSegment

from app.config import settings
from app.shared.domain.exceptions.application_exception import ApplicationException
from app.web.application.dtos.chat_response_dto import ChatResponseDTO


class ChatService:
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

        intent = result.intent.name

        responses = []

        # INTENCIÓN: filtrar_suelo_urbano o agregar_filtro_suelo_urbano.
        if intent in ["filtrar_suelo_urbano", "agregar_filtro_suelo_urbano"]:
            action: str = result.action

            if action == "filtrar_suelo_urbano":
                categoria = result.parameters.get("categoria", None)
                propietario = result.parameters.get("propietario", None)
                provincia = result.parameters.get("provincia", None)
                region = result.parameters.get("region", None)
                servicios = result.parameters.get("servicios", None)
                zonificacion = result.parameters.get("zonificacion", None)

                print(
                    f"Categoria: {categoria}, Propietario: {propietario}, Provincia: {provincia}, Region: {region}, Servicios: {servicios}, Zonificacion: {zonificacion}")

        # INTENCIÓN: activar o desactivar capa.
        elif intent == "controlar_capa":
            active_layer: str = result.parameters.get("capa", "")
            action_value: str = result.parameters.get("accion", "")

            if not active_layer:
                responses.append(ChatResponseDTO(
                    message="☹️ No se ha especificado qué capa controlar. Por favor, indícalo con más detalle.",
                    initial_message=initial_message,
                    action="controlar_capa",
                    action_control="controlar_capa"
                ))
            else:
                if action_value == "activar":
                    responses.append(ChatResponseDTO(
                        message=f"✅ Se ha activado la capa: {active_layer}",
                        initial_message=initial_message,
                        action="activar_capa",
                        data={"layerName": active_layer},
                        action_control="activar_capa"
                    ))
                elif action_value == "desactivar":
                    responses.append(ChatResponseDTO(
                        message=f"🚫 Se ha desactivado la capa: {active_layer}",
                        initial_message=initial_message,
                        action="desactivar_capa",
                        data={"layerName": active_layer},
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
