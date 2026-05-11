"""Run from repo root: python scripts/smoke_test_server.py (requires: pip install httpx)"""

from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


def main() -> None:
    from fastapi.testclient import TestClient

    import importlib

    import server.main as m

    os.environ.pop("DISPLAYKIT_ENV", None)
    importlib.reload(m)
    c = TestClient(m.app)

    r = c.get("/api/health")
    assert r.status_code == 200, r.text
    j = r.json()
    assert j["status"] == "ok" and j.get("service") == "displaykit"
    print("OK GET /api/health (dev)", j)

    r = c.get("/")
    assert r.status_code == 200 and "<title>DisplayKit" in r.text
    print("OK GET /")

    r = c.post("/api/project/summary", json={"screens": []})
    assert r.status_code == 200 and r.json()["ok"] is True
    assert r.json()["element_count"] == 0
    print("OK POST /api/project/summary (empty)")

    r = c.post(
        "/api/project/summary",
        json={"screens": [{"id": "a", "name": "Home", "elements": [{"id": 1}]}]},
    )
    assert r.json()["element_count"] == 1
    print("OK POST /api/project/summary (1 element)")

    r = c.get("/docs")
    assert r.status_code == 200
    print("OK GET /docs (dev)")

    r = c.post(
        "/api/icons/export",
        json={
            "mode": "tft_rgb565",
            "bg_color": "#000000",
            "icons": [{"file": "16x16/wifi_1.png"}],
        },
    )
    assert r.status_code == 200, r.text
    ex = r.json()
    assert ex.get("ok") is True and "uint16_t" in ex.get("content", "")
    print("OK POST /api/icons/export (tft_rgb565)")

    r = c.post(
        "/api/icons/export",
        json={
            "mode": "u8g2_xbm",
            "bg_color": "#000000",
            "icons": [{"file": "16x16/wifi_1.png"}],
        },
    )
    assert r.status_code == 200, r.text
    ex2 = r.json()
    assert ex2.get("ok") is True and "unsigned char" in ex2.get("content", "")
    print("OK POST /api/icons/export (u8g2_xbm)")

    os.environ["DISPLAYKIT_ENV"] = "production"
    importlib.reload(m)
    c2 = TestClient(m.app)

    r = c2.get("/docs")
    assert r.status_code == 404
    print("OK GET /docs -> 404 (production)")

    r = c2.get("/api/health")
    assert r.status_code == 200 and "env" not in r.json()
    print("OK GET /api/health (production)", r.json())

    r = c2.get("/")
    assert r.status_code == 200
    print("OK GET / (production)")

    print("\nAll smoke tests passed.")


if __name__ == "__main__":
    main()
