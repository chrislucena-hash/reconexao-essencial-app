from fastapi import APIRouter, Depends, Request

from app.core.options import build_options_handler
from app.core.responses import success_response
from app.core.security import AuthContext, get_auth_context
from app.schemas.consents import ConsentUpsertRequest
from app.services import consent_service

router = APIRouter(prefix="/auth/consents", tags=["consents"])


@router.options("")
async def consents_collection_options(request: Request) -> object:
    return build_options_handler(["OPTIONS", "POST"])(request)


@router.post("")
async def create_consent(
    request: Request,
    payload: ConsentUpsertRequest,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(request, consent_service.upsert_consent(payload, auth_context).model_dump(mode="json"))


@router.options("/{consent_type}")
async def consent_item_options(request: Request, consent_type: str) -> object:
    return build_options_handler(["OPTIONS", "GET", "PUT", "PATCH"])(request)


@router.get("/{consent_type}")
async def get_consent(
    request: Request,
    consent_type: str,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(request, consent_service.get_consent(consent_type, auth_context).model_dump(mode="json"))


@router.put("/{consent_type}")
async def replace_consent(
    request: Request,
    consent_type: str,
    payload: ConsentUpsertRequest,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    normalized_payload = payload.model_copy(update={"consentType": consent_type})
    return success_response(
        request,
        consent_service.upsert_consent(normalized_payload, auth_context).model_dump(mode="json"),
    )


@router.patch("/{consent_type}")
async def update_consent(
    request: Request,
    consent_type: str,
    payload: ConsentUpsertRequest,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    normalized_payload = payload.model_copy(update={"consentType": consent_type})
    return success_response(
        request,
        consent_service.upsert_consent(normalized_payload, auth_context).model_dump(mode="json"),
    )
