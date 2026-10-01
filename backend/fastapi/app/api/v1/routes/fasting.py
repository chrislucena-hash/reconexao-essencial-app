from fastapi import APIRouter, Depends, Request

from app.core.options import build_options_handler
from app.core.responses import success_response
from app.core.security import AuthContext, get_auth_context
from app.schemas.fasting import FastingSessionUpsertRequest
from app.services import fasting_service

router = APIRouter(prefix="/fasting/sessions", tags=["fasting"])


@router.options("")
async def fasting_collection_options(request: Request) -> object:
    return build_options_handler(["OPTIONS", "GET", "POST"])(request)


@router.get("")
async def list_fasting_sessions(request: Request, auth_context: AuthContext = Depends(get_auth_context)) -> object:
    return success_response(
        request,
        [item.model_dump(mode="json") for item in fasting_service.list_sessions(auth_context)],
    )


@router.post("")
async def create_fasting_session(
    request: Request,
    payload: FastingSessionUpsertRequest,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(request, fasting_service.upsert_session(payload, auth_context).model_dump(mode="json"))


@router.options("/{session_id}")
async def fasting_item_options(request: Request, session_id: str) -> object:
    return build_options_handler(["OPTIONS", "GET", "PUT", "PATCH", "DELETE"])(request)


@router.get("/{session_id}")
async def get_fasting_session(
    request: Request,
    session_id: str,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(request, fasting_service.get_session(session_id, auth_context).model_dump(mode="json"))


@router.put("/{session_id}")
async def replace_fasting_session(
    request: Request,
    session_id: str,
    payload: FastingSessionUpsertRequest,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(
        request,
        fasting_service.upsert_session(payload, auth_context, session_id=session_id).model_dump(mode="json"),
    )


@router.patch("/{session_id}")
async def update_fasting_session(
    request: Request,
    session_id: str,
    payload: FastingSessionUpsertRequest,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(
        request,
        fasting_service.upsert_session(payload, auth_context, session_id=session_id).model_dump(mode="json"),
    )


@router.delete("/{session_id}")
async def delete_fasting_session(
    request: Request,
    session_id: str,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(request, fasting_service.delete_session(session_id, auth_context))
