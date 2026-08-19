from dataclasses import dataclass, field
from datetime import datetime


@dataclass(slots=True)
class AuthUser:
    id: str
    firebase_uid: str
    email: str
    display_name: str | None = None
    photo_url: str | None = None
    phone_number: str | None = None
    email_verified: bool = False
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    last_login_at: datetime | None = None
    deleted_at: datetime | None = None


@dataclass(slots=True)
class UserConsent:
    id: str
    user_id: str
    consent_type: str
    consent_version: str
    accepted: bool
    accepted_at: datetime
