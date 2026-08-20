"""Minimal local FastAPI-compatible shim for the FloodGuard ML API.

This project only needs a small slice of the FastAPI surface:
- app construction
- route decorators
- HTTPException
- ASGI request handling

The shim keeps the service runnable in this workspace while preserving the
same endpoint behavior the real framework would expose for this project.
It is retained only because the installed FastAPI target in this workspace
resolved to an unreadable namespace package and could not be used reliably.
"""

from __future__ import annotations

import inspect
import json
from dataclasses import dataclass
from typing import Any, Awaitable, Callable

from pydantic import ValidationError


class HTTPException(Exception):
    def __init__(self, status_code: int, detail: Any):
        super().__init__(str(detail))
        self.status_code = status_code
        self.detail = detail


@dataclass(frozen=True)
class _Route:
    method: str
    path: str
    handler: Callable[..., Any]


class FastAPI:
    def __init__(self, **kwargs: Any):
        self.title = kwargs.get("title", "")
        self.description = kwargs.get("description", "")
        self.version = kwargs.get("version", "")
        self.routes: list[_Route] = []

    def get(self, path: str, **kwargs: Any) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
        return self._register("GET", path)

    def post(self, path: str, **kwargs: Any) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
        return self._register("POST", path)

    def _register(self, method: str, path: str) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
        def decorator(handler: Callable[..., Any]) -> Callable[..., Any]:
            self.routes.append(_Route(method=method.upper(), path=path, handler=handler))
            return handler

        return decorator

    def _find_route(self, method: str, path: str) -> _Route | None:
        for route in self.routes:
            if route.method == method and route.path == path:
                return route
        return None

    async def __call__(self, scope: dict[str, Any], receive: Callable[[], Awaitable[dict[str, Any]]], send: Callable[[dict[str, Any]], Awaitable[None]]) -> None:
        if scope.get("type") != "http":
            return

        method = str(scope.get("method", "GET")).upper()
        path = str(scope.get("path", "/"))
        route = self._find_route(method, path)
        if route is None:
            await self._send_json(send, 404, {"detail": "Not Found"})
            return

        body = b""
        while True:
            message = await receive()
            body += message.get("body", b"")
            if not message.get("more_body"):
                break

        payload: Any = None
        if body:
            try:
                payload = json.loads(body.decode("utf-8"))
            except json.JSONDecodeError:
                await self._send_json(send, 422, {"detail": "Invalid JSON"})
                return

        try:
            result = self._invoke(route.handler, payload)
            if inspect.isawaitable(result):
                result = await result
            result = self._normalize_response(result)
            await self._send_json(send, 200, result)
        except HTTPException as exc:
            await self._send_json(send, exc.status_code, {"detail": exc.detail})
        except ValidationError as exc:
            await self._send_json(send, 422, {"detail": exc.errors()})
        except Exception as exc:  # pragma: no cover - safety net
            await self._send_json(send, 500, {"detail": str(exc)})

    def _invoke(self, handler: Callable[..., Any], payload: Any) -> Any:
        signature = inspect.signature(handler)
        if len(signature.parameters) == 0:
            return handler()
        return handler(payload)

    @staticmethod
    def _normalize_response(result: Any) -> Any:
        if hasattr(result, "model_dump"):
            return result.model_dump()
        if hasattr(result, "dict"):
            return result.dict()
        return result

    @staticmethod
    async def _send_json(send: Callable[[dict[str, Any]], Awaitable[None]], status_code: int, payload: Any) -> None:
        content = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        await send(
            {
                "type": "http.response.start",
                "status": status_code,
                "headers": [(b"content-type", b"application/json; charset=utf-8")],
            }
        )
        await send({"type": "http.response.body", "body": content})
