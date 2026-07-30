from collections.abc import Callable

from fastapi import Request

from app.core.responses import success_response


def build_options_handler(methods: list[str]) -> Callable:
    def handler(request: Request) -> object:
        return success_response(request, {"methods": methods})

    return handler
