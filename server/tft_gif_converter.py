from __future__ import annotations

import base64
import io
import json
import tempfile
from pathlib import Path
from typing import Any

from fastapi import APIRouter, File, Form, UploadFile

from .tft_gif_core import DEFAULT_SETTINGS, ConvertSettings, build_header_text, convert_source, preview_image


def _parse_settings(raw: str | None) -> ConvertSettings:
    if not raw:
        return DEFAULT_SETTINGS
    data = json.loads(raw)
    if not isinstance(data, dict):
        return DEFAULT_SETTINGS

    s = ConvertSettings()
    for k, v in data.items():
        if not hasattr(s, k):
            continue
        setattr(s, k, v)

    # Clamp a few critical fields to safe ranges
    s.sample_step = max(1, min(8, int(s.sample_step)))
    s.target_w = max(1, min(240, int(s.target_w)))
    s.target_h = max(1, min(240, int(s.target_h)))
    s.offset_x = int(s.offset_x)
    s.offset_y = int(s.offset_y)
    s.ink_threshold = max(0, min(255, int(s.ink_threshold)))
    s.max_points_per_frame = max(100, min(20000, int(s.max_points_per_frame)))
    s.max_gif_frames = max(1, min(300, int(s.max_gif_frames)))
    s.min_frame_ms = max(0, min(2000, int(s.min_frame_ms)))
    s.frame_start = max(0, int(s.frame_start))
    s.frame_end = max(0, int(s.frame_end))
    s.frame_skip = max(1, min(60, int(s.frame_skip)))
    return s


def build_tft_gif_router() -> APIRouter:
    r = APIRouter(prefix="/api/tftgif", tags=["tftgif"])

    @r.post("/convert")
    async def convert_endpoint(
        file: UploadFile = File(...),
        settings: str | None = Form(None),
        preview_scale: int = Form(2),
        preview_frame: int = Form(0),
    ) -> dict[str, Any]:
        if not file.filename:
            return {"ok": False, "error": "missing_filename"}

        raw_bytes = await file.read()
        if not raw_bytes:
            return {"ok": False, "error": "empty_file"}

        s = _parse_settings(settings)
        preview_scale = max(1, min(6, int(preview_scale)))
        preview_frame = max(0, int(preview_frame))

        # converter_core expects a filesystem path (Pillow is fine with bytes, but we keep parity).
        suffix = Path(file.filename).suffix or ".bin"
        with tempfile.TemporaryDirectory() as td:
            src_path = Path(td) / ("upload" + suffix)
            src_path.write_bytes(raw_bytes)

            result = convert_source(src_path, s)
            frame_idx = min(preview_frame, max(0, len(result.frames) - 1))
            preview = preview_image(result.frames[frame_idx], scale=preview_scale)

            buf = io.BytesIO()
            preview.save(buf, format="PNG")
            preview_b64 = base64.b64encode(buf.getvalue()).decode("ascii")

            header_text = build_header_text(file.filename, s, result)

        return {
            "ok": True,
            "source_name": file.filename,
            "frame_count": len(result.frames),
            "total_source_frames": result.total_source_frames,
            "durations_ms": result.durations,
            "points_per_frame": [len(f) for f in result.frames],
            "frame_offsets": result.frame_offsets,
            "point_count": len(result.flat_points),
            "estimated_point_bytes": len(result.flat_points) * 6,
            "header_text": header_text,
            "preview_png_base64": preview_b64,
            "preview_frame": frame_idx,
            "preview_scale": preview_scale,
            "settings": s.__dict__,
        }

    return r

