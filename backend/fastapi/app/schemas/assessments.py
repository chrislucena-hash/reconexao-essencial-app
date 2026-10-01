from datetime import datetime

from app.schemas.common import BaseSchema


class AssessmentQuestionPayload(BaseSchema):
    id: str
    code: str
    questionText: str
    questionType: str
    sortOrder: int
    isRequired: bool
    weight: float


class AssessmentTemplatePayload(BaseSchema):
    id: str
    slug: str
    title: str
    description: str
    category: str
    isActive: bool
    questions: list[AssessmentQuestionPayload]


class AssessmentAnswerInput(BaseSchema):
    questionCode: str
    value: bool


class AssessmentSubmissionUpsertRequest(BaseSchema):
    templateSlug: str
    startedAt: datetime | None = None
    submittedAt: datetime
    answers: list[AssessmentAnswerInput]


class AssessmentAnswerPayload(BaseSchema):
    questionCode: str
    value: bool


class AssessmentSubmissionPayload(BaseSchema):
    id: str
    userId: str
    templateSlug: str
    startedAt: datetime | None = None
    submittedAt: datetime
    answers: list[AssessmentAnswerPayload]
    score: float | None = None
    resultLevel: str | None = None
