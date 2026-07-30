from datetime import datetime

from app.schemas.common import BaseSchema


class ConsentUpsertRequest(BaseSchema):
    consentType: str
    consentVersion: str
    accepted: bool
    acceptedAt: datetime


class ConsentPayload(BaseSchema):
    id: str
    userId: str
    consentType: str
    consentVersion: str
    accepted: bool
    acceptedAt: datetime
