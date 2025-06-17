import io
import os
import uuid
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

        responses: list[ChatResponseDTO] = []

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

                # si categoria es array, convertirlo a string
                if categoria:
                    categoria = list(categoria)
                if isinstance(categoria, list):
                    categoria = ", ".join(categoria)

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
                message=str(result.fulfillment_text),
                initial_message=initial_message
            )]

        return responses

    async def get_query(self, session_id: str, message: str) -> list[ChatResponseDTO]:
        try:
            result: QueryResult = self.__get_response_from_dialog_flow(session_id, message)
        except Exception as e:
            print(e)
            raise ApplicationException("Ha ocurrido un error al consultar el asistente virtual")
        resulta = await self.__generate_result(result)

        return resulta

    @staticmethod
    async def __convertir_y_almacenar_audio(audio: UploadFile) -> tuple[str, bytes]:
        """
        Almacena y convierte el audio a formato WAV.
        Args:
            audio (UploadFile): Archivo de audio.
        Returns:
            tuple[str, bytes]: Ruta del archivo y bytes del archivo.
        """
        tipos_validos = ["audio/webm"]
        if audio.content_type not in tipos_validos:
            raise ApplicationException("El archivo de audio debe ser válido")
        audio_bytes: bytes = await audio.read()
        # Se obtiene el texto de la transcripción.
        return os.path.join(uuid.uuid4().hex + ".wav"), audio_bytes

    @staticmethod
    async def __obtener_texto_transcripcion(nombre_archivo: str) -> str:
        recognizer = sr.Recognizer()

        # ✅ 1) Abrir y procesar con pydub
        audio = AudioSegment.from_file(nombre_archivo)
        audio = audio.set_channels(1)
        audio = audio.set_frame_rate(16000)
        audio = audio + 6  # aumentar volumen +6 dB

        # ✅ 2) Exportar a WAV en buffer en memoria
        wav_buffer = io.BytesIO()
        audio.export(wav_buffer, format="wav")
        wav_buffer.seek(0)

        # ✅ 3) Usar AudioFile con buffer en memoria
        with sr.AudioFile(wav_buffer) as source:
            audio_data = recognizer.record(source)

        # ✅ 4) Usar API oficial (credentials_json usa GOOGLE_APPLICATION_CREDENTIALS por defecto)
        texto_transcripcion = recognizer.recognize_google(
            audio_data,
            language="es-ES",
        )

        return texto_transcripcion

    async def get_voice_query(self, session_id: str, audio: UploadFile) -> list[ChatResponseDTO]:
        nombre_archivo, contenido_archivo = await self.__convertir_y_almacenar_audio(audio)

        try:
            # El archivo se convierte a formato WAV porque el servicio de deteccion solo trabaja con ese formato.
            audio = AudioSegment.from_file(io.BytesIO(contenido_archivo), format="webm")
            audio.export(nombre_archivo, format="wav")

            # Se realiza la conversion de audio a texto.
            texto_transcripcion: str = await self.__obtener_texto_transcripcion(nombre_archivo)
        except Exception as e:
            print(e)
            raise ApplicationException("Ha ocurrido un error al procesar el audio")
        finally:
            # Una vez terminada la conversion de audio a texto, se elimina el archivo temporal.
            if os.path.exists(nombre_archivo):
                os.remove(nombre_archivo)

            # Con el mensaje obtenido de la transcripcion, se realiza la consulta.
        message: str = texto_transcripcion.lower()

        return await self.get_query(session_id, message)

    @staticmethod
    def __get_layer_id_by_df_name(df_name: str) -> str:
        equivalents = {
            "proyectos_suelo_urbano": "684e4c876f591c3bcb14c01a",
            "directorio_municipalidades": "684e4ff66f591c3bcb14c798",
        }
        return equivalents.get(df_name, "")

    async def __get_layer_name_by_id(self, active_layer_id):
        layer: Optional[Layer] = await self.layer_repository.get(active_layer_id)
        if layer:
            return layer.name
        else:
            return "Capa sin nombre"
