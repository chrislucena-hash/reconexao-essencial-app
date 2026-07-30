from datetime import datetime
from uuid import uuid4

from app.models.auth import AuthUser, UserConsent

_USERS_BY_ID: dict[str, AuthUser] = {}
_USER_IDS_BY_FIREBASE_UID: dict[str, str] = {}
_CONSENTS: dict[tuple[str, str], UserConsent] = {}


def create_or_update_user(
    *,
    firebase_uid: str,
    email: str,
    display_name: str | None,
    photo_url: str | None,
    phone_number: str | None,
    email_verified: bool,
) -> AuthUser:
    user_id = _USER_IDS_BY_FIREBASE_UID.get(firebase_uid)
    if user_id is None:
        user = AuthUser(
            id=str(uuid4()),
            firebase_uid=firebase_uid,
            email=email,
            display_name=display_name,
            photo_url=photo_url,
            phone_number=phone_number,
            email_verified=email_verified,
            last_login_at=datetime.utcnow(),
        )
        _USERS_BY_ID[user.id] = user
        _USER_IDS_BY_FIREBASE_UID[firebase_uid] = user.id
        return user

    user = _USERS_BY_ID[user_id]
    user.email = email
    user.display_name = display_name
    user.photo_url = photo_url
    user.phone_number = phone_number
    user.email_verified = email_verified
    user.last_login_at = datetime.utcnow()
    user.updated_at = datetime.utcnow()
    return user


def get_user_by_id(user_id: str) -> AuthUser | None:
    return _USERS_BY_ID.get(user_id)


def get_user_by_firebase_uid(firebase_uid: str) -> AuthUser | None:
    user_id = _USER_IDS_BY_FIREBASE_UID.get(firebase_uid)
    return _USERS_BY_ID.get(user_id) if user_id else None


def soft_delete_user(user_id: str) -> AuthUser | None:
    user = _USERS_BY_ID.get(user_id)
    if user is None:
        return None
    user.deleted_at = datetime.utcnow()
    user.updated_at = datetime.utcnow()
    return user


def upsert_consent(
    *,
    user_id: str,
    consent_type: str,
    consent_version: str,
    accepted: bool,
    accepted_at: datetime,
) -> UserConsent:
    key = (user_id, consent_type)
    consent = _CONSENTS.get(key)
    if consent is None:
        consent = UserConsent(
            id=str(uuid4()),
            user_id=user_id,
            consent_type=consent_type,
            consent_version=consent_version,
            accepted=accepted,
            accepted_at=accepted_at,
        )
        _CONSENTS[key] = consent
        return consent

    consent.consent_version = consent_version
    consent.accepted = accepted
    consent.accepted_at = accepted_at
    return consent


def get_consent(user_id: str, consent_type: str) -> UserConsent | None:
    return _CONSENTS.get((user_id, consent_type))
