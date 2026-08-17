from fastapi import APIRouter, Depends, Request

from app.core.options import build_options_handler
from app.core.responses import success_response
from app.core.security import AuthContext, get_auth_context
from app.schemas.progress import EvolutionSnapshotUpsertRequest
from app.services import evolucao_service

router = APIRouter(prefix="/evolucao", tags=["evolucao"])


@router.options("/series")
async def evolution_series_options(request: Request) -> object:
    return build_options_handler(["OPTIONS", "GET"])(request)


@router.get("/series")
async def list_series(request: Request, auth_context: AuthContext = Depends(get_auth_context)) -> object:
    return success_response(
        request,
        [item.model_dump(mode="json") for item in evolucao_service.list_series(auth_context)],
    )


@router.options("/snapshots")
async def snapshot_collection_options(request: Request) -> object:
    return build_options_handler(["OPTIONS", "POST"])(request)


@router.post("/snapshots")
async def create_snapshot(
    request: Request,
    payload: EvolutionSnapshotUpsertRequest,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(request, evolucao_service.upsert_snapshot(payload, auth_context).model_dump(mode="json"))


@router.options("/snapshots/{snapshot_id}")
async def snapshot_item_options(request: Request, snapshot_id: str) -> object:
    return build_options_handler(["OPTIONS", "GET", "PUT", "PATCH", "DELETE"])(request)


@router.get("/snapshots/{snapshot_id}")
async def get_snapshot(
    request: Request,
    snapshot_id: str,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(request, evolucao_service.get_snapshot(snapshot_id, auth_context).model_dump(mode="json"))


@router.put("/snapshots/{snapshot_id}")
async def replace_snapshot(
    request: Request,
    snapshot_id: str,
    payload: EvolutionSnapshotUpsertRequest,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(
        request,
        evolucao_service.upsert_snapshot(payload, auth_context, snapshot_id=snapshot_id).model_dump(mode="json"),
    )


@router.patch("/snapshots/{snapshot_id}")
async def update_snapshot(
    request: Request,
    snapshot_id: str,
    payload: EvolutionSnapshotUpsertRequest,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(
        request,
        evolucao_service.upsert_snapshot(payload, auth_context, snapshot_id=snapshot_id).model_dump(mode="json"),
    )


@router.delete("/snapshots/{snapshot_id}")
async def delete_snapshot(
    request: Request,
    snapshot_id: str,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(request, evolucao_service.delete_snapshot(snapshot_id, auth_context))
