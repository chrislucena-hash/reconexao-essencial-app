from fastapi import APIRouter, Depends, Query, Request

from app.core.options import build_options_handler
from app.core.responses import success_response
from app.core.security import AuthContext, get_auth_context
from app.schemas.journal import JournalEntryUpsertRequest
from app.services import journal_service

router = APIRouter(prefix="/journal/entries", tags=["journal"])


@router.options("")
async def journal_entries_options(request: Request) -> object:
    return build_options_handler(["OPTIONS", "GET", "POST"])(request)


@router.get("")
async def list_entries(
    request: Request,
    date: str | None = Query(default=None),
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(
        request,
        [item.model_dump(mode="json") for item in journal_service.list_entries(auth_context, entry_date=date)],
    )


@router.post("")
async def create_entry(
    request: Request,
    payload: JournalEntryUpsertRequest,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(request, journal_service.upsert_entry(payload, auth_context).model_dump(mode="json"))


@router.options("/{entry_id}")
async def journal_entry_item_options(request: Request, entry_id: str) -> object:
    return build_options_handler(["OPTIONS", "GET", "PUT", "PATCH", "DELETE"])(request)


@router.get("/{entry_id}")
async def get_entry(
    request: Request,
    entry_id: str,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(request, journal_service.get_entry(entry_id, auth_context).model_dump(mode="json"))


@router.put("/{entry_id}")
async def replace_entry(
    request: Request,
    entry_id: str,
    payload: JournalEntryUpsertRequest,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(
        request,
        journal_service.upsert_entry(payload, auth_context, entry_id=entry_id).model_dump(mode="json"),
    )


@router.patch("/{entry_id}")
async def update_entry(
    request: Request,
    entry_id: str,
    payload: JournalEntryUpsertRequest,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(
        request,
        journal_service.upsert_entry(payload, auth_context, entry_id=entry_id).model_dump(mode="json"),
    )


@router.delete("/{entry_id}")
async def delete_entry(
    request: Request,
    entry_id: str,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(request, journal_service.delete_entry(entry_id, auth_context))
