from humps import camelize
from pydantic import BaseModel


def to_camel(string):
    return camelize(string)


class BaseDTO(BaseModel):
    class Config:
        alias_generator = to_camel
        populate_by_name = True
