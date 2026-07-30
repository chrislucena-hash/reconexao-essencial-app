from datetime import datetime

from pydantic import field_validator

from app.schemas.common import BaseSchema

FASTING_LABEL_TO_HOURS = {
    "12h": 12,
    "14h": 14,
    "16h": 16,
    "18h": 18,
    "24h": 24,
    "Option 1": 12,
    "Option 2": 14,
    "Option 3": 16,
    "3": 18,
    "4": 24,
}

NORMALIZED_FASTING_LABELS = {
    "Option 1": "12h",
    "Option 2": "14h",
    "Option 3": "16h",
    "3": "18h",
    "4": "24h",
}


class FastingSessionUpsertRequest(BaseSchema):
    selectedWindowLabel: str
    selectedWindowHours: int | None = None
    startedAt: datetime
    status: str = "active"
    source: str = "bussoladaalma"
    endedAt: datetime | None = None

    @field_validator("selectedWindowLabel")
    @classmethod
    def normalize_label(cls, value: str) -> str:
        normalized = NORMALIZED_FASTING_LABELS.get(value, value)
        if normalized not in {"12h", "14h", "16h", "18h", "24h"}:
            raise ValueError("selectedWindowLabel is not supported by the current frontend.")
        return normalized

    @field_validator("status")
    @classmethod
    def validate_status(cls, value: str) -> str:
        if value not in {"active", "completed", "interrupted"}:
            raise ValueError("status is invalid.")
        return value


class FastingSessionPayload(BaseSchema):
    id: str
    userId: str
    selectedWindowLabel: str
    selectedWindowHours: int
    startedAt: datetime
    endedAt: datetime | None = None
    status: str
    source: str
    createdAt: datetime
    updatedAt: datetime
