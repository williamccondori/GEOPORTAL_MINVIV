from typing import TypeVar

from pydantic import BaseModel
from typing_extensions import Generic, Optional

T = TypeVar("T")


class Response(BaseModel, Generic[T]):
    status: bool
    message: str
    trace: Optional[str] = None
    data: Optional[T] = None

    @classmethod
    def correct(cls, data: [T] = None, message: str = "Success"):
        return cls(status=True, message=message, data=data)

    @classmethod
    def error(cls, message: str, trace: str = None):
        return cls(status=False, message=message, data=None, trace=trace)
