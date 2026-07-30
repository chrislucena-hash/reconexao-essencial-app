from datetime import date, datetime

from pydantic import Field, field_validator

from app.schemas.common import BaseSchema

ALLOWED_MEAL_TYPES = {"desjejum", "almoco", "jantar", "lanches"}
ALLOWED_WATER_LABELS = {"1 copo", "2 copos", "3 copos", "4 copos", "5 copos", "Mais de 5 copos"}
ALLOWED_REST_LABELS = {"3 horas", "4 horas", "5 horas", "6 horas", "7 horas", "8 horas ou mais"}


class JournalMealInput(BaseSchema):
    mealType: str
    description: str | None = None

    @field_validator("mealType")
    @classmethod
    def validate_meal_type(cls, value: str) -> str:
        if value not in ALLOWED_MEAL_TYPES:
            raise ValueError("mealType is not supported by the current frontend.")
        return value


class JournalReflectionsInput(BaseSchema):
    emanacoesAlmaText: str | None = None
    sincronicidadesText: str | None = None


class JournalEntryUpsertRequest(BaseSchema):
    entryDate: date
    energyLevel: float | None = Field(default=None, ge=0, le=10)
    presenceLevel: float | None = Field(default=None, ge=0, le=10)
    waterIntakeLabel: str | None = None
    restWindowLabel: str | None = None
    meals: list[JournalMealInput] = Field(default_factory=list)
    reflections: JournalReflectionsInput | None = None

    @field_validator("waterIntakeLabel")
    @classmethod
    def validate_water_label(cls, value: str | None) -> str | None:
        if value is not None and value not in ALLOWED_WATER_LABELS:
            raise ValueError("waterIntakeLabel is not supported by the current frontend.")
        return value

    @field_validator("restWindowLabel")
    @classmethod
    def validate_rest_label(cls, value: str | None) -> str | None:
        if value is not None and value not in ALLOWED_REST_LABELS:
            raise ValueError("restWindowLabel is not supported by the current frontend.")
        return value


class JournalMealPayload(BaseSchema):
    mealType: str
    description: str | None = None


class JournalReflectionsPayload(BaseSchema):
    emanacoesAlmaText: str | None = None
    sincronicidadesText: str | None = None


class JournalEntryPayload(BaseSchema):
    id: str
    userId: str
    entryDate: date
    energyLevel: float | None = None
    presenceLevel: float | None = None
    waterIntakeLabel: str | None = None
    restWindowLabel: str | None = None
    meals: list[JournalMealPayload]
    reflections: JournalReflectionsPayload | None = None
    createdAt: datetime
    updatedAt: datetime
