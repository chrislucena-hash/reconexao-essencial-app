from datetime import datetime

from app.schemas.common import BaseSchema


class AutocuraContentPayload(BaseSchema):
    id: str
    slug: str
    title: str
    contentType: str
    bodyText: str | None = None
    mediaUrl: str | None = None
    durationSeconds: int | None = None
    sortOrder: int


class AutocuraProgramPayload(BaseSchema):
    id: str
    slug: str
    title: str
    description: str
    isActive: bool
    contents: list[AutocuraContentPayload]


class AutocuraSessionUpsertRequest(BaseSchema):
    programSlug: str
    contentSlug: str
    startedAt: datetime
    completed: bool = False
    interruptionReason: str | None = None
    endedAt: datetime | None = None


class AutocuraSessionPayload(BaseSchema):
    id: str
    userId: str
    programSlug: str
    contentSlug: str
    startedAt: datetime
    endedAt: datetime | None = None
    completed: bool
    interruptionReason: str | None = None
    createdAt: datetime
    updatedAt: datetime
