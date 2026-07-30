from dataclasses import dataclass, field
from datetime import datetime


@dataclass(slots=True)
class AssessmentQuestion:
    id: str
    code: str
    question_text: str
    question_type: str
    sort_order: int
    is_required: bool = True
    weight: float = 1.0


@dataclass(slots=True)
class AssessmentTemplate:
    id: str
    slug: str
    title: str
    description: str
    category: str
    is_active: bool
    questions: list[AssessmentQuestion] = field(default_factory=list)


@dataclass(slots=True)
class AssessmentAnswer:
    question_code: str
    value: bool


@dataclass(slots=True)
class AssessmentSubmission:
    id: str
    user_id: str
    template_slug: str
    started_at: datetime | None
    submitted_at: datetime
    answers: list[AssessmentAnswer]
    score: float | None = None
    result_level: str | None = None
