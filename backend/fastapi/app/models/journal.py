from dataclasses import dataclass, field
from datetime import date, datetime


@dataclass(slots=True)
class JournalMeal:
    meal_type: str
    description: str | None


@dataclass(slots=True)
class JournalReflections:
    emanacoes_alma_text: str | None = None
    sincronicidades_text: str | None = None


@dataclass(slots=True)
class JournalEntry:
    id: str
    user_id: str
    entry_date: date
    energy_level: float | None
    presence_level: float | None
    water_intake_label: str | None
    rest_window_label: str | None
    meals: list[JournalMeal] = field(default_factory=list)
    reflections: JournalReflections | None = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
