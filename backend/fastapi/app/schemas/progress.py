from datetime import date, datetime

from pydantic import Field, field_validator

from app.schemas.common import BaseSchema


class UserProgressUpsertRequest(BaseSchema):
    status: str
    progressPercent: float = Field(ge=0, le=100)
    lastSeenAt: datetime | None = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        if value not in {"locked", "in_progress", "done"}:
            raise ValueError("status is invalid.")
        return value


class UserProgressPayload(BaseSchema):
    id: str
    userId: str
    moduleSlug: str
    status: str
    progressPercent: float
    lastSeenAt: datetime | None = None
    updatedAt: datetime


class EvolutionSnapshotUpsertRequest(BaseSchema):
    snapshotDate: date
    energia: float | None = Field(default=None, ge=0, le=10)
    presenca: float | None = Field(default=None, ge=0, le=10)
    vibracaoMedia: float | None = Field(default=None, ge=0, le=10)
    sourceEntryId: str | None = None


class EvolutionSnapshotPayload(BaseSchema):
    id: str
    userId: str
    snapshotDate: date
    energia: float | None = None
    presenca: float | None = None
    vibracaoMedia: float | None = None
    sourceEntryId: str | None = None
    createdAt: datetime
