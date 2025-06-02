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

        print(initial_message)

        return []

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

        # Limitar a 20 segundos.
        audio_segment = audio_segment[:20000]

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
