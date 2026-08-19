from fastapi import APIRouter, Depends, Request

from app.core.options import build_options_handler
from app.core.responses import success_response
from app.core.security import AuthContext, get_auth_context
from app.schemas.assessments import AssessmentSubmissionUpsertRequest
from app.services import assessment_service

router = APIRouter(prefix="/assessments", tags=["assessments"])


@router.options("/templates")
async def assessment_templates_options(request: Request) -> object:
    return build_options_handler(["OPTIONS", "GET"])(request)


@router.get("/templates")
async def list_templates(request: Request, auth_context: AuthContext = Depends(get_auth_context)) -> object:
    return success_response(
        request,
        [item.model_dump(mode="json") for item in assessment_service.list_templates()],
    )


@router.options("/templates/{slug}")
async def assessment_template_item_options(request: Request, slug: str) -> object:
    return build_options_handler(["OPTIONS", "GET"])(request)


@router.get("/templates/{slug}")
async def get_template(request: Request, slug: str, auth_context: AuthContext = Depends(get_auth_context)) -> object:
    return success_response(request, assessment_service.get_template(slug).model_dump(mode="json"))


@router.options("/submissions")
async def assessment_submissions_options(request: Request) -> object:
    return build_options_handler(["OPTIONS", "POST"])(request)


@router.post("/submissions")
async def create_submission(
    request: Request,
    payload: AssessmentSubmissionUpsertRequest,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(
        request,
        assessment_service.create_submission(payload, auth_context).model_dump(mode="json"),
    )


@router.options("/submissions/{submission_id}")
async def assessment_submission_item_options(request: Request, submission_id: str) -> object:
    return build_options_handler(["OPTIONS", "GET", "PUT", "PATCH", "DELETE"])(request)


@router.get("/submissions/{submission_id}")
async def get_submission(
    request: Request,
    submission_id: str,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(
        request,
        assessment_service.get_submission(submission_id, auth_context).model_dump(mode="json"),
    )


@router.put("/submissions/{submission_id}")
async def replace_submission(
    request: Request,
    submission_id: str,
    payload: AssessmentSubmissionUpsertRequest,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(
        request,
        assessment_service.update_submission(submission_id, payload, auth_context).model_dump(mode="json"),
    )


@router.patch("/submissions/{submission_id}")
async def update_submission(
    request: Request,
    submission_id: str,
    payload: AssessmentSubmissionUpsertRequest,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(
        request,
        assessment_service.update_submission(submission_id, payload, auth_context).model_dump(mode="json"),
    )


@router.delete("/submissions/{submission_id}")
async def delete_submission(
    request: Request,
    submission_id: str,
    auth_context: AuthContext = Depends(get_auth_context),
) -> object:
    return success_response(request, assessment_service.delete_submission(submission_id, auth_context))
