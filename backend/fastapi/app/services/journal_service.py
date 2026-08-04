from app.core.exceptions import ApiException
from app.core.security import AuthContext
from app.models.journal import JournalEntry, JournalMeal, JournalReflections
from app.models.progress import EvolutionSnapshot
from app.repositories import auth_repository, journal_repository, progress_repository
from app.schemas.journal import JournalEntryPayload, JournalEntryUpsertRequest


def list_entries(auth_context: AuthContext, *, entry_date: str | None = None) -> list[JournalEntryPayload]:
    user = _get_user(auth_context)
    return [_to_payload(item) for item in journal_repository.list_entries(user.id, entry_date=entry_date)]


def get_entry(entry_id: str, auth_context: AuthContext) -> JournalEntryPayload:
    user = _get_user(auth_context)
    entry = journal_repository.get_entry(entry_id)
    if entry is None or entry.user_id != user.id:
        raise ApiException(status_code=404, code="journal_not_found", message="Journal entry not found.")
    return _to_payload(entry)


def upsert_entry(payload: JournalEntryUpsertRequest, auth_context: AuthContext, entry_id: str | None = None) -> JournalEntryPayload:
    user = _get_user(auth_context)
    entry = JournalEntry(
        id=entry_id or "",
        user_id=user.id,
        entry_date=payload.entryDate,
        energy_level=payload.energyLevel,
        presence_level=payload.presenceLevel,
        water_intake_label=payload.waterIntakeLabel,
        rest_window_label=payload.restWindowLabel,
        meals=[JournalMeal(meal_type=item.mealType, description=item.description) for item in payload.meals],
        reflections=(
            JournalReflections(
                emanacoes_alma_text=payload.reflections.emanacoesAlmaText,
                sincronicidades_text=payload.reflections.sincronicidadesText,
            )
            if payload.reflections
            else None
        ),
    )
    saved_entry = journal_repository.upsert_entry(entry)
    _sync_snapshot_from_entry(saved_entry)
    return _to_payload(saved_entry)


def delete_entry(entry_id: str, auth_context: AuthContext) -> dict[str, str]:
    user = _get_user(auth_context)
    entry = journal_repository.get_entry(entry_id)
    if entry is None or entry.user_id != user.id:
        raise ApiException(status_code=404, code="journal_not_found", message="Journal entry not found.")
    journal_repository.delete_entry(entry_id)
    return {"message": "Journal entry deleted."}


def _sync_snapshot_from_entry(entry: JournalEntry) -> None:
    values = [item for item in [entry.energy_level, entry.presence_level] if item is not None]
    average = round(sum(values) / len(values), 2) if values else None
    snapshot = EvolutionSnapshot(
        id="",
        user_id=entry.user_id,
        snapshot_date=entry.entry_date,
        energia=entry.energy_level,
        presenca=entry.presence_level,
        vibracao_media=average,
        source_entry_id=entry.id,
    )
    progress_repository.save_snapshot(snapshot)


def _get_user(auth_context: AuthContext):
    user = auth_repository.get_user_by_firebase_uid(auth_context.user_id)
    if user is None:
        raise ApiException(status_code=404, code="user_not_found", message="Authenticated user was not found.")
    return user


def _to_payload(entry: JournalEntry) -> JournalEntryPayload:
    return JournalEntryPayload(
        id=entry.id,
        userId=entry.user_id,
        entryDate=entry.entry_date,
        energyLevel=entry.energy_level,
        presenceLevel=entry.presence_level,
        waterIntakeLabel=entry.water_intake_label,
        restWindowLabel=entry.rest_window_label,
        meals=[{"mealType": item.meal_type, "description": item.description} for item in entry.meals],
        reflections=(
            {
                "emanacoesAlmaText": entry.reflections.emanacoes_alma_text,
                "sincronicidadesText": entry.reflections.sincronicidades_text,
            }
            if entry.reflections
            else None
        ),
        createdAt=entry.created_at,
        updatedAt=entry.updated_at,
    )
