from fastapi import APIRouter, Depends, Request

from app.core.options import build_options_handler
from app.core.responses import success_response
from app.core.security import AuthContext, get_auth_context
from app.schemas.progress import UserProgressUpsertRequest
from app.services import progress_service

router = APIRouter(prefix="/progress/modules", tags=["progress"])


@router.options("")
async def progress_collection_options(request: Request) -> object:
    return build_options_handler(["OPTIONS", "GET"])(request)


@router.get("")
async def list_progress(request: Request, auth_context: AuthContext = Depends(get_auth_context)) -> object:
    return success_response(
        request,
        [item.model_dump(mode="json") for item in progress_service.list_progress(auth_context)],
    )


@router.options("/{module_slug}")
async def progress_item_options(request: Request, module_slug: str) -> object:
    return build_options_handler(["OPTIONS", "PUT", "PATCH", "DELETE"])(request)


@router.put("/{module_slug}")
async def replace_progress(
    request: Request,
    module_slug: str,
    payload: UserProgressUpsertRequest,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(
        request,
        progress_service.upsert_progress(module_slug, payload, auth_context).model_dump(mode="json"),
    )


@router.patch("/{module_slug}")
async def update_progress(
    request: Request,
    module_slug: str,
    payload: UserProgressUpsertRequest,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(
        request,
        progress_service.upsert_progress(module_slug, payload, auth_context).model_dump(mode="json"),
    )


@router.delete("/{module_slug}")
async def delete_progress(
    request: Request,
    module_slug: str,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(request, progress_service.delete_progress(module_slug, auth_context))
