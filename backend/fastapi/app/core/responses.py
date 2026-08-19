from typing import Any

from fastapi import Request

from app.core.config import get_settings


def success_response(request: Request, data: Any, errors: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    settings = get_settings()
    return {
        "data": data,
        "meta": {
            "requestId": getattr(request.state, "request_id", "unknown"),
            "schemaVersion": settings.schema_version,
        },
        "errors": errors or [],
    }


def build_error_payload(
    *,
    request: Request,
    code: str,
    message: str,
    field: str | None = None,
    details: Any | None = None,
) -> dict[str, Any]:
    error_item: dict[str, Any] = {
        "code": code,
        "message": message,
    }
    if field:
        error_item["field"] = field
    if details is not None:
        error_item["details"] = details
    return success_response(request, None, errors=[error_item])
