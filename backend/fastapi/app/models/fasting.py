from dataclasses import dataclass, field
from datetime import datetime


@dataclass(slots=True)
class FastingSession:
    id: str
    user_id: str
    selected_window_label: str
    selected_window_hours: int
    status: str
    source: str
    started_at: datetime
    ended_at: datetime | None = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
