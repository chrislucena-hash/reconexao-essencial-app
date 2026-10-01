from datetime import datetime
from uuid import uuid4

from app.models.progress import EvolutionSnapshot, UserProgress

_PROGRESS: dict[tuple[str, str], UserProgress] = {}
_SNAPSHOTS: dict[str, EvolutionSnapshot] = {}


def list_progress(user_id: str) -> list[UserProgress]:
    return sorted(
        [item for item in _PROGRESS.values() if item.user_id == user_id],
        key=lambda item: item.module_slug,
    )


def upsert_progress(
    *,
    user_id: str,
    module_slug: str,
    status: str,
    progress_percent: float,
    last_seen_at: datetime | None,
) -> UserProgress:
    key = (user_id, module_slug)
    progress = _PROGRESS.get(key)
    if progress is None:
        progress = UserProgress(
            id=str(uuid4()),
            user_id=user_id,
            module_slug=module_slug,
            status=status,
            progress_percent=progress_percent,
            last_seen_at=last_seen_at,
        )
        _PROGRESS[key] = progress
        return progress

    progress.status = status
    progress.progress_percent = progress_percent
    progress.last_seen_at = last_seen_at
    progress.updated_at = datetime.utcnow()
    return progress


def delete_progress(user_id: str, module_slug: str) -> bool:
    return _PROGRESS.pop((user_id, module_slug), None) is not None


def list_snapshots(user_id: str) -> list[EvolutionSnapshot]:
    return sorted(
        [item for item in _SNAPSHOTS.values() if item.user_id == user_id],
        key=lambda item: item.snapshot_date.isoformat(),
    )


def get_snapshot(snapshot_id: str) -> EvolutionSnapshot | None:
    return _SNAPSHOTS.get(snapshot_id)


def save_snapshot(snapshot: EvolutionSnapshot) -> EvolutionSnapshot:
    if not snapshot.id:
        snapshot.id = str(uuid4())
    _SNAPSHOTS[snapshot.id] = snapshot
    return snapshot


def delete_snapshot(snapshot_id: str) -> bool:
    return _SNAPSHOTS.pop(snapshot_id, None) is not None
