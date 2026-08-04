from fastapi import APIRouter, Depends, Request

from app.core.options import build_options_handler
from app.core.responses import success_response
from app.core.security import AuthContext, get_auth_context
from app.schemas.auth import LoginRequest, PasswordResetRequest, RegistrationRequest
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.options("/registration")
async def auth_registration_options(request: Request) -> object:
    return build_options_handler(["OPTIONS", "POST"])(request)


@router.post("/registration")
async def register(
    request: Request,
    payload: RegistrationRequest,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(request, auth_service.sync_user(payload, auth_context).model_dump(mode="json"))


@router.options("/login")
async def auth_login_options(request: Request) -> object:
    return build_options_handler(["OPTIONS", "POST"])(request)


@router.post("/login")
async def login(request: Request, payload: LoginRequest) -> object:
    return success_response(request, auth_service.login(payload).model_dump(mode="json"))


@router.options("/sync-user")
async def auth_sync_options(request: Request) -> object:
    return build_options_handler(["OPTIONS", "POST"])(request)


@router.post("/sync-user")
async def sync_user(
    request: Request,
    payload: RegistrationRequest,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(request, auth_service.sync_user(payload, auth_context).model_dump(mode="json"))


@router.options("/me")
async def auth_me_options(request: Request) -> object:
    return build_options_handler(["OPTIONS", "GET", "PATCH", "DELETE"])(request)


@router.get("/me")
async def me(request: Request, auth_context: AuthContext = Depends(get_auth_context)) -> object:
    return success_response(request, auth_service.get_current_user(auth_context).model_dump(mode="json"))


@router.patch("/me")
async def update_me(
    request: Request,
    payload: RegistrationRequest,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(request, auth_service.update_current_user(payload, auth_context).model_dump(mode="json"))


@router.delete("/me")
async def delete_me(request: Request, auth_context: AuthContext = Depends(get_auth_context)) -> object:
    return success_response(request, auth_service.delete_current_user(auth_context).model_dump(mode="json"))


@router.options("/password/reset")
async def auth_reset_options(request: Request) -> object:
    return build_options_handler(["OPTIONS", "POST"])(request)


@router.post("/password/reset")
async def password_reset(request: Request, payload: PasswordResetRequest) -> object:
    return success_response(request, auth_service.request_password_reset(payload).model_dump(mode="json"))
