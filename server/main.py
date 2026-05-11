"""
DisplayKit server: /api/* JSON routes plus static UI.

Local dev (serves repo root — same as opening files, plus API):
  uvicorn server.main:app --reload --host 127.0.0.1 --port 8000

Production (Docker): only files under DISPLAYKIT_STATIC_ROOT are served as static content.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from fastapi import Body, FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.gzip import GZipMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from .icon_export import build_icons_router
from .tft_gif_converter import build_tft_gif_router

REPO_ROOT = Path(__file__).resolve().parent.parent


def _is_production() -> bool:
    return os.environ.get("DISPLAYKIT_ENV", "").strip().lower() in (
        "production",
        "prod",
    )


def _static_root() -> Path:
    raw = os.environ.get("DISPLAYKIT_STATIC_ROOT", "").strip()
    root = Path(raw).resolve() if raw else REPO_ROOT
    if not root.is_dir():
        raise RuntimeError(
            f"Static root is not a directory: {root}. "
            "Set DISPLAYKIT_STATIC_ROOT to a folder containing index.html, app.js, …"
        )
    return root


def _trusted_hosts() -> list[str] | None:
    raw = os.environ.get("DISPLAYKIT_TRUSTED_HOSTS", "").strip()
    if not raw:
        return None
    hosts = [h.strip() for h in raw.split(",") if h.strip()]
    return hosts or None


def create_app() -> FastAPI:
    static_root = _static_root()
    prod = _is_production()
    app_version = os.environ.get("DISPLAYKIT_APP_VERSION", "1.0.0").strip() or "1.0.0"

    app = FastAPI(
        title="DisplayKit",
        version=app_version,
        docs_url=None if prod else "/docs",
        redoc_url=None if prod else "/redoc",
        openapi_url=None if prod else "/openapi.json",
    )

    # Outermost on the stack is added last: gzip responses, then optional host filter.
    app.add_middleware(GZipMiddleware, minimum_size=512)
    trusted = _trusted_hosts()
    if trusted is not None:
        app.add_middleware(TrustedHostMiddleware, allowed_hosts=trusted)

    @app.get("/api/health")
    def api_health() -> dict[str, str]:
        payload: dict[str, str] = {
            "status": "ok",
            "service": "displaykit",
            "version": app_version,
        }
        if not prod:
            payload["env"] = "development"
        return payload

    @app.post("/api/project/summary")
    def api_project_summary(project: dict[str, Any] = Body(...)) -> dict[str, Any]:
        screens = project.get("screens")
        if not isinstance(screens, list):
            return {
                "ok": False,
                "error": "expected_top_level_array",
                "detail": "body.screens must be a JSON array",
            }

        per_screen: list[dict[str, Any]] = []
        total_elements = 0
        for s in screens:
            if not isinstance(s, dict):
                continue
            elements = s.get("elements")
            n = len(elements) if isinstance(elements, list) else 0
            total_elements += n
            per_screen.append(
                {
                    "id": s.get("id"),
                    "name": s.get("name"),
                    "element_count": n,
                }
            )

        return {
            "ok": True,
            "screen_count": len(screens),
            "element_count": total_elements,
            "disp_width": project.get("dispWidth"),
            "disp_height": project.get("dispHeight"),
            "driver_mode": project.get("driverMode"),
            "screens": per_screen,
        }

    app.include_router(build_icons_router(static_root))
    app.include_router(build_tft_gif_router())

    app.mount(
        "/",
        StaticFiles(directory=str(static_root), html=True),
        name="site",
    )
    return app


app = create_app()
