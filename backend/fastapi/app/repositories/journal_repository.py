from datetime import datetime
from uuid import uuid4

from app.models.journal import JournalEntry

_ENTRIES_BY_ID: dict[str, JournalEntry] = {}
_ENTRY_IDS_BY_USER_DATE: dict[tuple[str, str], str] = {}


def list_entries(user_id: str, *, entry_date: str | None = None) -> list[JournalEntry]:
    entries = [item for item in _ENTRIES_BY_ID.values() if item.user_id == user_id]
    if entry_date is not None:
        entries = [item for item in entries if item.entry_date.isoformat() == entry_date]
    return sorted(entries, key=lambda item: item.entry_date.isoformat())


def get_entry(entry_id: str) -> JournalEntry | None:
    return _ENTRIES_BY_ID.get(entry_id)


def upsert_entry(entry: JournalEntry) -> JournalEntry:
    entry_key = (entry.user_id, entry.entry_date.isoformat())
    existing_entry_id = _ENTRY_IDS_BY_USER_DATE.get(entry_key)
    if existing_entry_id:
        entry.id = existing_entry_id
        entry.created_at = _ENTRIES_BY_ID[existing_entry_id].created_at
    else:
        entry.id = entry.id or str(uuid4())
    entry.updated_at = datetime.utcnow()
    _ENTRIES_BY_ID[entry.id] = entry
    _ENTRY_IDS_BY_USER_DATE[entry_key] = entry.id
    return entry


def delete_entry(entry_id: str) -> bool:
    entry = _ENTRIES_BY_ID.pop(entry_id, None)
    if entry is None:
        return False
    _ENTRY_IDS_BY_USER_DATE.pop((entry.user_id, entry.entry_date.isoformat()), None)
    return True
