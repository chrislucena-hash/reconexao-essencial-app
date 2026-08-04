from typing import Any, Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class BaseSchema(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)


class ApiMeta(BaseSchema):
    requestId: str
    schemaVersion: str


class ApiErrorItem(BaseSchema):
    code: str
    message: str
    field: str | None = None
    details: Any | None = None


class ApiEnvelope(BaseSchema, Generic[T]):
    data: T | None
    meta: ApiMeta
    errors: list[ApiErrorItem] = Field(default_factory=list)


class OptionsPayload(BaseSchema):
    methods: list[str]


class MessagePayload(BaseSchema):
    message: str
