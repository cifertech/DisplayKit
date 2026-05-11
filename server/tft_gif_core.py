from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Literal

from PIL import Image, ImageOps, ImageSequence


SCREEN_W = 240
SCREEN_H = 240

InvertMode = Literal["auto", "true", "false"]
FitMode = Literal["contain", "cover", "stretch"]
DitherMode = Literal["none", "ordered"]


@dataclass
class ConvertSettings:
    sample_step: int = 2
    target_w: int = 232
    target_h: int = 232
    offset_x: int = 4
    offset_y: int = 4
    invert_mode: InvertMode = "auto"
    ink_threshold: int = 34
    max_points_per_frame: int = 4200
    max_gif_frames: int = 60
    min_frame_ms: int = 60
    frame_start: int = 0
    frame_end: int = 0  # 0 means last available frame
    frame_skip: int = 1
    fit_mode: FitMode = "contain"
    dither_mode: DitherMode = "none"


@dataclass
class ConversionResult:
    frames: list[list[tuple[int, int, int]]]
    durations: list[int]
    flat_points: list[tuple[int, int, int]]
    frame_offsets: list[int]
    total_source_frames: int


DEFAULT_SETTINGS = ConvertSettings()

ORDERED_4X4 = (
    (0, 8, 2, 10),
    (12, 4, 14, 6),
    (3, 11, 1, 9),
    (15, 7, 13, 5),
)


def clamp(value: int, lo: int, hi: int) -> int:
    return max(lo, min(hi, value))


def bool_from_mode(value: str | bool, frame: Image.Image) -> bool:
    if isinstance(value, bool):
        return value
    mode = value.lower()
    if mode == "true":
        return True
    if mode == "false":
        return False
    corners = [
        frame.getpixel((0, 0)),
        frame.getpixel((frame.width - 1, 0)),
        frame.getpixel((0, frame.height - 1)),
        frame.getpixel((frame.width - 1, frame.height - 1)),
    ]
    return (sum(corners) // len(corners)) > 128


def load_source_frames(src: Path, settings: ConvertSettings) -> tuple[list[Image.Image], list[int], int]:
    img = Image.open(src)
    all_frames = [frame.copy() for frame in ImageSequence.Iterator(img)]
    total_frames = len(all_frames)
    if not all_frames:
        raise ValueError("No image frames found.")

    start = clamp(settings.frame_start, 0, total_frames - 1)
    end = settings.frame_end if settings.frame_end > 0 else total_frames - 1
    end = clamp(end, start, total_frames - 1)
    skip = max(1, settings.frame_skip)

    selected = all_frames[start : end + 1 : skip][: max(1, settings.max_gif_frames)]
    frames: list[Image.Image] = []
    durations: list[int] = []
    for frame in selected:
        durations.append(max(settings.min_frame_ms, int(frame.info.get("duration", 100))))
        frames.append(frame.convert("RGBA").copy())
    return frames, durations, total_frames


def reduce_points_evenly(points: list[tuple[int, int, int]], max_points: int) -> list[tuple[int, int, int]]:
    if len(points) <= max_points:
        return points
    reduced: list[tuple[int, int, int]] = []
    step = len(points) / max_points
    for i in range(max_points):
        reduced.append(points[int(i * step)])
    return reduced


def fit_frame(frame: Image.Image, settings: ConvertSettings) -> Image.Image:
    size = (settings.target_w, settings.target_h)
    if settings.fit_mode == "cover":
        return ImageOps.fit(frame, size, method=Image.Resampling.LANCZOS)
    if settings.fit_mode == "stretch":
        return frame.resize(size, Image.Resampling.LANCZOS)
    return ImageOps.contain(frame, size, Image.Resampling.LANCZOS)


def dither_adjust(source: int, x: int, y: int, settings: ConvertSettings) -> int:
    if settings.dither_mode != "ordered":
        return source
    threshold = ORDERED_4X4[y & 3][x & 3] - 8
    return clamp(source + threshold * 5, 0, 255)


def convert_frame(frame: Image.Image, settings: ConvertSettings) -> list[tuple[int, int, int]]:
    frame = fit_frame(frame.convert("L"), settings)
    invert_frame = bool_from_mode(settings.invert_mode, frame)
    canvas = Image.new("L", (settings.target_w, settings.target_h), 255 if invert_frame else 0)
    canvas.paste(frame, ((settings.target_w - frame.width) // 2, (settings.target_h - frame.height) // 2))

    points: list[tuple[int, int, int]] = []
    step = max(1, settings.sample_step)
    for y in range(0, settings.target_h, step):
        for x in range(0, settings.target_w, step):
            vals = []
            for yy in range(step):
                for xx in range(step):
                    px = min(settings.target_w - 1, x + xx)
                    py = min(settings.target_h - 1, y + yy)
                    vals.append(canvas.getpixel((px, py)))
            source = dither_adjust(sum(vals) // len(vals), x, y, settings)
            if invert_frame:
                ink = 255 - source
                if ink <= settings.ink_threshold:
                    continue
                shade = max(52, min(255, ink + 58))
            else:
                if source <= settings.ink_threshold:
                    continue
                shade = max(48, min(255, source))
            points.append((settings.offset_x + x, settings.offset_y + y, shade))
    return reduce_points_evenly(points, max(1, settings.max_points_per_frame))


def convert_source(src: Path, settings: ConvertSettings) -> ConversionResult:
    source_frames, durations, total_source_frames = load_source_frames(src, settings)
    frames = [convert_frame(frame, settings) for frame in source_frames]
    frame_offsets = [0]
    flat_points: list[tuple[int, int, int]] = []
    for frame_points in frames:
        flat_points.extend(frame_points)
        frame_offsets.append(len(flat_points))
    return ConversionResult(frames, durations, flat_points, frame_offsets, total_source_frames)


def preview_image(points: list[tuple[int, int, int]], scale: int = 2) -> Image.Image:
    img = Image.new("RGB", (SCREEN_W, SCREEN_H), "black")
    pix = img.load()
    for x, y, shade in points:
        if 0 <= x < SCREEN_W and 0 <= y < SCREEN_H:
            pix[x, y] = (shade, shade, shade)
    if scale != 1:
        return img.resize((SCREEN_W * scale, SCREEN_H * scale), Image.Resampling.NEAREST)
    return img


def build_header_text(src_name: str, settings: ConvertSettings, result: ConversionResult) -> str:
    lines = [
        "#pragma once",
        "#include <Arduino.h>",
        "#include <pgmspace.h>",
        "",
        "#define IMAGE_POINTS_HAS_FRAMES 1",
        f"// Generated from: {src_name}",
        f"// Fit area: {settings.target_w}x{settings.target_h}, offset: {settings.offset_x},{settings.offset_y}",
        f"// Invert mode: {settings.invert_mode}",
        f"// Fit mode: {settings.fit_mode}, dither: {settings.dither_mode}",
        f"// Sample step: {settings.sample_step}, max points/frame: {settings.max_points_per_frame}",
        f"// Frames: {len(result.frames)}, total points: {len(result.flat_points)}",
        "",
        "struct ImagePoint {",
        "  int16_t x;",
        "  int16_t y;",
        "  uint8_t shade;",
        "};",
        "",
        f"constexpr uint16_t IMAGE_FRAME_COUNT = {len(result.frames)};",
        f"constexpr uint32_t IMAGE_POINT_COUNT = {len(result.flat_points)}UL;",
        "const uint32_t IMAGE_FRAME_OFFSETS[] PROGMEM = {",
        "  " + ", ".join(f"{v}UL" for v in result.frame_offsets),
        "};",
        "const uint16_t IMAGE_FRAME_DURATIONS_MS[] PROGMEM = {",
        "  " + ", ".join(str(v) for v in result.durations),
        "};",
        "const ImagePoint IMAGE_POINTS[] PROGMEM = {",
    ]
    for i, (x, y, shade) in enumerate(result.flat_points):
        comma = "," if i < len(result.flat_points) - 1 else ""
        lines.append(f"  {{{x}, {y}, {shade}}}{comma}")
    lines.append("};")
    lines.append("")
    return "\n".join(lines)

