from app.core.exceptions import ApiException
from app.core.security import AuthContext
from app.repositories import auth_repository
from app.schemas.consents import ConsentPayload, ConsentUpsertRequest


def get_consent(consent_type: str, auth_context: AuthContext) -> ConsentPayload:
    user = _get_user(auth_context)
    consent = auth_repository.get_consent(user.id, consent_type)
    if consent is None:
        raise ApiException(status_code=404, code="consent_not_found", message="Consent not found.")
    return _to_payload(consent)


def upsert_consent(payload: ConsentUpsertRequest, auth_context: AuthContext) -> ConsentPayload:
    user = _get_user(auth_context)
    consent = auth_repository.upsert_consent(
        user_id=user.id,
        consent_type=payload.consentType,
        consent_version=payload.consentVersion,
        accepted=payload.accepted,
        accepted_at=payload.acceptedAt,
    )
    return _to_payload(consent)


def _get_user(auth_context: AuthContext):
    user = auth_repository.get_user_by_firebase_uid(auth_context.user_id)
    if user is None:
        raise ApiException(status_code=404, code="user_not_found", message="Authenticated user was not found.")
    return user


def _to_payload(consent) -> ConsentPayload:
    return ConsentPayload(
        id=consent.id,
        userId=consent.user_id,
        consentType=consent.consent_type,
        consentVersion=consent.consent_version,
        accepted=consent.accepted,
        acceptedAt=consent.accepted_at,
    )
