from app.core.exceptions import ApiException
from app.core.security import AuthContext
from app.models.progress import EvolutionSnapshot
from app.repositories import auth_repository, progress_repository
from app.schemas.progress import EvolutionSnapshotPayload, EvolutionSnapshotUpsertRequest


def list_series(auth_context: AuthContext) -> list[EvolutionSnapshotPayload]:
    user = _get_user(auth_context)
    return [_to_payload(item) for item in progress_repository.list_snapshots(user.id)]


def get_snapshot(snapshot_id: str, auth_context: AuthContext) -> EvolutionSnapshotPayload:
    user = _get_user(auth_context)
    snapshot = progress_repository.get_snapshot(snapshot_id)
    if snapshot is None or snapshot.user_id != user.id:
        raise ApiException(status_code=404, code="snapshot_not_found", message="Snapshot not found.")
    return _to_payload(snapshot)


def upsert_snapshot(
    payload: EvolutionSnapshotUpsertRequest,
    auth_context: AuthContext,
    snapshot_id: str | None = None,
) -> EvolutionSnapshotPayload:
    user = _get_user(auth_context)
    snapshot = EvolutionSnapshot(
        id=snapshot_id or "",
        user_id=user.id,
        snapshot_date=payload.snapshotDate,
        energia=payload.energia,
        presenca=payload.presenca,
        vibracao_media=payload.vibracaoMedia,
        source_entry_id=payload.sourceEntryId,
    )
    saved_snapshot = progress_repository.save_snapshot(snapshot)
    return _to_payload(saved_snapshot)


def delete_snapshot(snapshot_id: str, auth_context: AuthContext) -> dict[str, str]:
    user = _get_user(auth_context)
    snapshot = progress_repository.get_snapshot(snapshot_id)
    if snapshot is None or snapshot.user_id != user.id:
        raise ApiException(status_code=404, code="snapshot_not_found", message="Snapshot not found.")
    progress_repository.delete_snapshot(snapshot_id)
    return {"message": "Snapshot deleted."}


def _get_user(auth_context: AuthContext):
    user = auth_repository.get_user_by_firebase_uid(auth_context.user_id)
    if user is None:
        raise ApiException(status_code=404, code="user_not_found", message="Authenticated user was not found.")
    return user


def _to_payload(snapshot: EvolutionSnapshot) -> EvolutionSnapshotPayload:
    return EvolutionSnapshotPayload(
        id=snapshot.id,
        userId=snapshot.user_id,
        snapshotDate=snapshot.snapshot_date,
        energia=snapshot.energia,
        presenca=snapshot.presenca,
        vibracaoMedia=snapshot.vibracao_media,
        sourceEntryId=snapshot.source_entry_id,
        createdAt=snapshot.created_at,
    )
