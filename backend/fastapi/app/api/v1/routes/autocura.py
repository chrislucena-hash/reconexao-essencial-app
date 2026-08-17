from fastapi import APIRouter, Depends, Request

from app.core.options import build_options_handler
from app.core.responses import success_response
from app.core.security import AuthContext, get_auth_context
from app.schemas.autocura import AutocuraSessionUpsertRequest
from app.services import autocura_service

router = APIRouter(prefix="/autocura", tags=["autocura"])


@router.options("/programs")
async def autocura_programs_options(request: Request) -> object:
    return build_options_handler(["OPTIONS", "GET"])(request)


@router.get("/programs")
async def list_programs(request: Request, auth_context: AuthContext = Depends(get_auth_context)) -> object:
    return success_response(
        request,
        [item.model_dump(mode="json") for item in autocura_service.list_programs()],
    )


@router.options("/programs/{program_slug}")
async def autocura_program_item_options(request: Request, program_slug: str) -> object:
    return build_options_handler(["OPTIONS", "GET"])(request)


@router.get("/programs/{program_slug}")
async def get_program(
    request: Request,
    program_slug: str,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(request, autocura_service.get_program(program_slug).model_dump(mode="json"))


@router.options("/programs/{program_slug}/contents")
async def autocura_contents_options(request: Request, program_slug: str) -> object:
    return build_options_handler(["OPTIONS", "GET"])(request)


@router.get("/programs/{program_slug}/contents")
async def list_contents(
    request: Request,
    program_slug: str,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(request, autocura_service.list_contents(program_slug))


@router.options("/sessions")
async def autocura_sessions_options(request: Request) -> object:
    return build_options_handler(["OPTIONS", "GET", "POST"])(request)


@router.get("/sessions")
async def list_sessions(request: Request, auth_context: AuthContext = Depends(get_auth_context)) -> object:
    return success_response(
        request,
        [item.model_dump(mode="json") for item in autocura_service.list_sessions(auth_context)],
    )


@router.post("/sessions")
async def create_session(
    request: Request,
    payload: AutocuraSessionUpsertRequest,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(request, autocura_service.upsert_session(payload, auth_context).model_dump(mode="json"))


@router.options("/sessions/{session_id}")
async def autocura_session_item_options(request: Request, session_id: str) -> object:
    return build_options_handler(["OPTIONS", "GET", "PUT", "PATCH", "DELETE"])(request)


@router.get("/sessions/{session_id}")
async def get_session(
    request: Request,
    session_id: str,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(request, autocura_service.get_session(session_id, auth_context).model_dump(mode="json"))


@router.put("/sessions/{session_id}")
async def replace_session(
    request: Request,
    session_id: str,
    payload: AutocuraSessionUpsertRequest,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(
        request,
        autocura_service.upsert_session(payload, auth_context, session_id=session_id).model_dump(mode="json"),
    )


@router.patch("/sessions/{session_id}")
async def update_session(
    request: Request,
    session_id: str,
    payload: AutocuraSessionUpsertRequest,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(
        request,
        autocura_service.upsert_session(payload, auth_context, session_id=session_id).model_dump(mode="json"),
    )


@router.delete("/sessions/{session_id}")
async def delete_session(
    request: Request,
    session_id: str,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(request, autocura_service.delete_session(session_id, auth_context))
