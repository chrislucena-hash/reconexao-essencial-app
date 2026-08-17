from app.core.exceptions import ApiException
from app.core.security import AuthContext
from app.models.assessments import AssessmentAnswer
from app.repositories import assessment_repository, auth_repository
from app.schemas.assessments import (
    AssessmentQuestionPayload,
    AssessmentSubmissionPayload,
    AssessmentSubmissionUpsertRequest,
    AssessmentTemplatePayload,
)


def list_templates() -> list[AssessmentTemplatePayload]:
    return [_template_to_payload(item) for item in assessment_repository.list_templates()]


def get_template(slug: str) -> AssessmentTemplatePayload:
    template = assessment_repository.get_template_by_slug(slug)
    if template is None:
        raise ApiException(status_code=404, code="template_not_found", message="Assessment template not found.")
    return _template_to_payload(template)


def create_submission(payload: AssessmentSubmissionUpsertRequest, auth_context: AuthContext) -> AssessmentSubmissionPayload:
    user = _get_user(auth_context)
    template = assessment_repository.get_template_by_slug(payload.templateSlug)
    if template is None:
        raise ApiException(status_code=404, code="template_not_found", message="Assessment template not found.")

    answers = [AssessmentAnswer(question_code=item.questionCode, value=item.value) for item in payload.answers]
    _validate_question_codes(template.slug, [item.question_code for item in answers])
    score, result_level = _compute_score(answers)
    submission = assessment_repository.create_submission(
        user_id=user.id,
        template_slug=payload.templateSlug,
        started_at=payload.startedAt,
        submitted_at=payload.submittedAt,
        answers=answers,
        score=score,
        result_level=result_level,
    )
    return _submission_to_payload(submission)


def get_submission(submission_id: str, auth_context: AuthContext) -> AssessmentSubmissionPayload:
    _get_user(auth_context)
    submission = assessment_repository.get_submission(submission_id)
    if submission is None:
        raise ApiException(status_code=404, code="submission_not_found", message="Assessment submission not found.")
    return _submission_to_payload(submission)


def update_submission(
    submission_id: str,
    payload: AssessmentSubmissionUpsertRequest,
    auth_context: AuthContext,
) -> AssessmentSubmissionPayload:
    _get_user(auth_context)
    template = assessment_repository.get_template_by_slug(payload.templateSlug)
    if template is None:
        raise ApiException(status_code=404, code="template_not_found", message="Assessment template not found.")
    answers = [AssessmentAnswer(question_code=item.questionCode, value=item.value) for item in payload.answers]
    _validate_question_codes(template.slug, [item.question_code for item in answers])
    score, result_level = _compute_score(answers)
    submission = assessment_repository.update_submission(
        submission_id,
        started_at=payload.startedAt,
        submitted_at=payload.submittedAt,
        answers=answers,
        score=score,
        result_level=result_level,
    )
    if submission is None:
        raise ApiException(status_code=404, code="submission_not_found", message="Assessment submission not found.")
    return _submission_to_payload(submission)


def delete_submission(submission_id: str, auth_context: AuthContext) -> dict[str, str]:
    _get_user(auth_context)
    deleted = assessment_repository.delete_submission(submission_id)
    if not deleted:
        raise ApiException(status_code=404, code="submission_not_found", message="Assessment submission not found.")
    return {"message": "Assessment submission deleted."}


def _get_user(auth_context: AuthContext):
    user = auth_repository.get_user_by_firebase_uid(auth_context.user_id)
    if user is None:
        raise ApiException(status_code=404, code="user_not_found", message="Authenticated user was not found.")
    return user


def _validate_question_codes(template_slug: str, question_codes: list[str]) -> None:
    template = assessment_repository.get_template_by_slug(template_slug)
    available_codes = {item.code for item in template.questions} if template else set()
    invalid_codes = [code for code in question_codes if code not in available_codes]
    if invalid_codes:
        raise ApiException(
            status_code=422,
            code="invalid_question_code",
            message="One or more question codes do not belong to this template.",
            field="answers.questionCode",
        )


def _compute_score(answers: list[AssessmentAnswer]) -> tuple[float, str]:
    if not answers:
        return 0.0, "baixo"
    positive_answers = len([item for item in answers if item.value])
    score = round((positive_answers / len(answers)) * 100, 2)
    if score >= 70:
        return score, "alto"
    if score >= 35:
        return score, "moderado"
    return score, "baixo"


def _template_to_payload(template) -> AssessmentTemplatePayload:
    return AssessmentTemplatePayload(
        id=template.id,
        slug=template.slug,
        title=template.title,
        description=template.description,
        category=template.category,
        isActive=template.is_active,
        questions=[
            AssessmentQuestionPayload(
                id=item.id,
                code=item.code,
                questionText=item.question_text,
                questionType=item.question_type,
                sortOrder=item.sort_order,
                isRequired=item.is_required,
                weight=item.weight,
            )
            for item in template.questions
        ],
    )


def _submission_to_payload(submission) -> AssessmentSubmissionPayload:
    return AssessmentSubmissionPayload(
        id=submission.id,
        userId=submission.user_id,
        templateSlug=submission.template_slug,
        startedAt=submission.started_at,
        submittedAt=submission.submitted_at,
        answers=[{"questionCode": item.question_code, "value": item.value} for item in submission.answers],
        score=submission.score,
        resultLevel=submission.result_level,
    )
