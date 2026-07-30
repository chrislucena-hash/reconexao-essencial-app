from datetime import datetime

from pydantic import EmailStr

from app.schemas.common import BaseSchema


class RegistrationRequest(BaseSchema):
    firebaseUid: str
    email: EmailStr
    displayName: str | None = None
    photoUrl: str | None = None
    phoneNumber: str | None = None
    provider: str = "password"
    emailVerified: bool = False


class LoginRequest(BaseSchema):
    email: EmailStr
    password: str


class PasswordResetRequest(BaseSchema):
    email: EmailStr


class AuthUserPayload(BaseSchema):
    id: str
    firebaseUid: str
    email: EmailStr
    displayName: str | None = None
    photoUrl: str | None = None
    phoneNumber: str | None = None
    emailVerified: bool = False
    createdAt: datetime
    updatedAt: datetime
    lastLoginAt: datetime | None = None
