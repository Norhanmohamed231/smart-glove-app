#!/usr/bin/env python3
"""Generate 32 premium natural-style hand-pattern SVG illustrations for Binary Mode.

Each file is named by its 5-bit pattern (Thumb, Index, Middle, Ring, Pinky).
bit=0 → extended finger, bit=1 → bent finger.

Usage:
  python scripts/generate_binary_gesture_illustrations.py
"""

from __future__ import annotations

import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "assets" / "binary-gestures"

SIZE = 240
PALM_CX = 120
PALM_CY = 168

FINGERS = [
    {"name": "Thumb", "base_x": 48, "base_y": 156, "width": 20, "length": 56, "lean": -12, "order": 5, "spread": -18},
    {"name": "Index", "base_x": 84, "base_y": 122, "width": 15, "length": 76, "lean": -6, "order": 4, "spread": -6},
    {"name": "Middle", "base_x": 112, "base_y": 112, "width": 16, "length": 84, "lean": 0, "order": 3, "spread": 0},
    {"name": "Ring", "base_x": 136, "base_y": 116, "width": 15, "length": 78, "lean": 6, "order": 2, "spread": 6},
    {"name": "Pinky", "base_x": 158, "base_y": 128, "width": 12, "length": 62, "lean": 10, "order": 1, "spread": 14},
]

COLORS = {
    "bg": "#070B18",
    "bg_glow": "#121A30",
    "bg_accent": "#1A1040",
    "palm_shadow": "#1A2332",
    "palm_dark": "#2A3544",
    "palm_mid": "#3B4A5E",
    "palm_light": "#52657A",
    "palm_highlight": "#6B8098",
    "skin_shadow": "#B87D58",
    "skin_dark": "#CF9A72",
    "skin_mid": "#E4B896",
    "skin_light": "#F7DCC4",
    "skin_highlight": "#FFF1E6",
    "skin_stroke": "#A56F4D",
    "bent_shadow": "#5B21B6",
    "bent_dark": "#7C3AED",
    "bent_mid": "#A855F7",
    "bent_light": "#C084FC",
    "bent_glow": "#DDD6FE",
    "bent_stroke": "#6D28D9",
    "knuckle_line": "#B07852",
    "knuckle_dot": "#8F6044",
    "nail_base": "#F6E8DE",
    "nail_tip": "#FFFFFF",
    "wrist": "#243044",
    "badge_bg": "#7C3AED",
    "badge_text": "#E9D5FF",
    "label_extended": "#E2E8F0",
    "label_bent": "#D8B4FE",
}


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def finger_spine_extended(finger: dict) -> list[tuple[float, float]]:
    bx, by = finger["base_x"], finger["base_y"]
    length = finger["length"]
    lean = finger["lean"]
    spread = finger.get("spread", lean)

    return [
        (bx, by),
        (lerp(bx, bx + spread * 0.35, 0.35), by - length * 0.34),
        (lerp(bx, bx + lean * 0.45, 0.65), by - length * 0.66),
        (bx + lean * 0.38, by - length),
    ]


def finger_spine_bent(finger: dict) -> list[tuple[float, float]]:
    bx, by = finger["base_x"], finger["base_y"]
    lean = finger["lean"]
    name = finger["name"]

    if name == "Thumb":
        return [
            (bx, by),
            (bx + 18, by - 14),
            (bx + 36, by + 2),
            (bx + 50, by + 20),
        ]

    fold = 1 if lean >= 0 else -1
    return [
        (bx, by),
        (bx + fold * 4, by - 24),
        (bx + fold * 14, by - 8),
        (bx + fold * 18, by + 10),
    ]


def capsule_path(p1: tuple[float, float], p2: tuple[float, float], width: float) -> str:
    x1, y1 = p1
    x2, y2 = p2
    dx, dy = x2 - x1, y2 - y1
    length = math.hypot(dx, dy) or 1.0
    nx, ny = -dy / length, dx / length
    half = width / 2

    lx1, ly1 = x1 + nx * half, y1 + ny * half
    rx1, ry1 = x1 - nx * half, y1 - ny * half
    lx2, ly2 = x2 + nx * half, y2 + ny * half
    rx2, ry2 = x2 - nx * half, y2 - ny * half

    c1 = 0.42 * length
    return (
        f"M {lx1:.1f} {ly1:.1f} "
        f"C {lx1 + nx * 2:.1f} {ly1 + ny * 2 - c1:.1f} {lx2 + nx * 2:.1f} {ly2 + ny * 2 + c1:.1f} {lx2:.1f} {ly2:.1f} "
        f"A {half:.1f} {half:.1f} 0 0 1 {rx2:.1f} {ry2:.1f} "
        f"C {rx2 - nx * 2:.1f} {ry2 - ny * 2 + c1:.1f} {rx1 - nx * 2:.1f} {ry1 - ny * 2 - c1:.1f} {rx1:.1f} {ry1:.1f} "
        f"A {half:.1f} {half:.1f} 0 0 1 {lx1:.1f} {ly1:.1f} Z"
    )


def segment_width(base_width: float, segment_index: int, total: int) -> float:
    taper = [1.0, 0.88, 0.74][segment_index] if total == 3 else [1.0, 0.82][segment_index]
    return base_width * taper


def finger_segments(finger: dict, bent: bool) -> list[tuple[str, float]]:
    spine = finger_spine_bent(finger) if bent else finger_spine_extended(finger)
    base_width = finger["width"]
    segments: list[tuple[str, float]] = []

    for i in range(len(spine) - 1):
        width = segment_width(base_width, i, len(spine) - 1)
        if bent and i == len(spine) - 2:
            width *= 0.92
        segments.append((capsule_path(spine[i], spine[i + 1], width), width))

    return segments


def knuckle_joint(x: float, y: float, width: float, bent: bool) -> str:
    color = COLORS["knuckle_dot"] if not bent else COLORS["bent_shadow"]
    return (
        f'  <circle cx="{x:.1f}" cy="{y:.1f}" r="{width * 0.18:.1f}" '
        f'fill="{color}" opacity="0.55"/>'
    )


def segment_highlight(p1: tuple[float, float], p2: tuple[float, float], width: float, bent: bool) -> str:
    x1, y1 = p1
    x2, y2 = p2
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    angle = math.degrees(math.atan2(y2 - y1, x2 - x1))
    hl_w = width * 0.22
    hl_h = math.hypot(x2 - x1, y2 - y1) * 0.55
    opacity = 0.22 if not bent else 0.18
    fill = COLORS["skin_highlight"] if not bent else COLORS["bent_glow"]
    return (
        f'  <ellipse cx="{mx - width * 0.12:.1f}" cy="{my:.1f}" rx="{hl_w:.1f}" ry="{hl_h:.1f}" '
        f'fill="{fill}" opacity="{opacity}" transform="rotate({angle - 90:.1f} {mx:.1f} {my:.1f})"/>'
    )


def finger_crease_line(p1: tuple[float, float], p2: tuple[float, float], width: float) -> str:
    x1, y1 = p1
    x2, y2 = p2
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    return (
        f'  <path d="M {mx - width * 0.24:.1f} {my:.1f} Q {mx:.1f} {my + 1:.1f} {mx + width * 0.24:.1f} {my:.1f}" '
        f'fill="none" stroke="{COLORS["knuckle_line"]}" stroke-width="0.9" stroke-linecap="round" opacity="0.42"/>'
    )


def finger_nail(finger: dict) -> str:
    spine = finger_spine_extended(finger)
    tip = spine[-1]
    prev = spine[-2]
    width = finger["width"] * 0.68
    angle = math.degrees(math.atan2(tip[1] - prev[1], tip[0] - prev[0]))
    return f"""
  <ellipse cx="{tip[0]:.1f}" cy="{tip[1] + 3:.1f}" rx="{width * 0.34:.1f}" ry="{width * 0.22:.1f}"
           fill="url(#nailGrad)" transform="rotate({angle - 90:.1f} {tip[0]:.1f} {tip[1] + 3:.1f})"/>
  <ellipse cx="{tip[0] - 1:.1f}" cy="{tip[1] + 1:.1f}" rx="{width * 0.12:.1f}" ry="{width * 0.06:.1f}"
           fill="{COLORS["nail_tip"]}" opacity="0.55" transform="rotate({angle - 90:.1f} {tip[0]:.1f} {tip[1] + 1:.1f})"/>"""


def finger_svg(finger: dict, bent: bool, index: int) -> str:
    spine = finger_spine_bent(finger) if bent else finger_spine_extended(finger)
    segments = finger_segments(finger, bent)
    fill = f"url(#bentGrad{index})" if bent else f"url(#skinGrad{index})"
    stroke = COLORS["bent_stroke"] if bent else COLORS["skin_stroke"]
    shadow = "url(#bentGlow)" if bent else "url(#softShadow)"

    parts: list[str] = []
    for i, (path, width) in enumerate(segments):
        parts.append(
            f'  <path d="{path}" fill="{fill}" stroke="{stroke}" stroke-width="1.1" '
            f'stroke-linejoin="round" filter="{shadow}"/>'
        )
        parts.append(segment_highlight(spine[i], spine[i + 1], width, bent))
        if not bent and i < len(segments) - 1:
            parts.append(finger_crease_line(spine[i], spine[i + 1], width))
        if i < len(spine) - 1:
            parts.append(knuckle_joint(spine[i + 1][0], spine[i + 1][1], width, bent))

    if not bent:
        parts.append(finger_nail(finger))

    if bent:
        parts.append(
            f'  <circle cx="{spine[-1][0]:.1f}" cy="{spine[-1][1]:.1f}" r="{finger["width"] * 0.16:.1f}" '
            f'fill="{COLORS["bent_glow"]}" opacity="0.35"/>'
        )

    return "\n".join(parts)


def palm_path() -> str:
    cy = PALM_CY
    return (
        f"M {PALM_CX - 76:.1f} {cy + 10:.1f} "
        f"C {PALM_CX - 86:.1f} {cy - 20:.1f} {PALM_CX - 50:.1f} {cy - 46:.1f} {PALM_CX:.1f} {cy - 48:.1f} "
        f"C {PALM_CX + 50:.1f} {cy - 46:.1f} {PALM_CX + 86:.1f} {cy - 20:.1f} {PALM_CX + 76:.1f} {cy + 10:.1f} "
        f"C {PALM_CX + 70:.1f} {cy + 36:.1f} {PALM_CX + 36:.1f} {cy + 48:.1f} {PALM_CX:.1f} {cy + 50:.1f} "
        f"C {PALM_CX - 36:.1f} {cy + 48:.1f} {PALM_CX - 70:.1f} {cy + 36:.1f} {PALM_CX - 76:.1f} {cy + 10:.1f} Z"
    )


def wrist_block() -> str:
    wrist_d = (
        f"M {PALM_CX - 42:.1f} {PALM_CY + 48:.1f} "
        f"C {PALM_CX - 28:.1f} {PALM_CY + 58:.1f} {PALM_CX + 28:.1f} {PALM_CY + 58:.1f} {PALM_CX + 42:.1f} {PALM_CY + 48:.1f} "
        f"L {PALM_CX + 36:.1f} {PALM_CY + 68:.1f} "
        f"C {PALM_CX + 18:.1f} {PALM_CY + 74:.1f} {PALM_CX - 18:.1f} {PALM_CY + 74:.1f} {PALM_CX - 36:.1f} {PALM_CY + 68:.1f} Z"
    )
    line_d = (
        f"M {PALM_CX - 30:.1f} {PALM_CY + 56:.1f} "
        f"Q {PALM_CX:.1f} {PALM_CY + 60:.1f} {PALM_CX + 30:.1f} {PALM_CY + 56:.1f}"
    )
    return f"""
  <path d="{wrist_d}" fill="url(#wristGrad)" opacity="0.95"/>
  <path d="{line_d}" fill="none" stroke="#334155" stroke-width="1" opacity="0.45"/>"""


def palm_details() -> str:
    cy = PALM_CY
    crease_a = (
        f"M {PALM_CX - 30:.1f} {cy + 4:.1f} "
        f"Q {PALM_CX:.1f} {cy + 12:.1f} {PALM_CX + 30:.1f} {cy + 4:.1f}"
    )
    crease_b = (
        f"M {PALM_CX - 20:.1f} {cy - 10:.1f} "
        f"Q {PALM_CX:.1f} {cy - 4:.1f} {PALM_CX + 20:.1f} {cy - 10:.1f}"
    )
    return f"""
  <path d="{crease_a}" fill="none" stroke="#1E293B" stroke-width="1.3" stroke-linecap="round" opacity="0.5"/>
  <path d="{crease_b}" fill="none" stroke="#64748B" stroke-width="0.9" stroke-linecap="round" opacity="0.35"/>
  <ellipse cx="{PALM_CX - 26:.1f}" cy="{cy:.1f}" rx="10" ry="7" fill="#1E293B" opacity="0.18"/>
  <ellipse cx="{PALM_CX + 26:.1f}" cy="{cy:.1f}" rx="10" ry="7" fill="#1E293B" opacity="0.18"/>
  <ellipse cx="{PALM_CX:.1f}" cy="{cy - 6:.1f}" rx="18" ry="10" fill="{COLORS["palm_highlight"]}" opacity="0.08"/>"""


def background_layers() -> str:
    return f"""
  <rect width="{SIZE}" height="{SIZE}" rx="20" fill="url(#bgGrad)"/>
  <ellipse cx="{PALM_CX}" cy="118" rx="88" ry="92" fill="url(#ambientGlow)" opacity="0.55"/>
  <ellipse cx="{PALM_CX}" cy="198" rx="58" ry="11" fill="#000000" opacity="0.2"/>"""


def pattern_badge(bits: str) -> str:
    return f"""
  <rect x="14" y="14" width="78" height="28" rx="14" fill="url(#badgeGrad)" opacity="0.22"/>
  <rect x="14" y="14" width="78" height="28" rx="14" fill="none" stroke="{COLORS["badge_bg"]}" stroke-width="1" opacity="0.35"/>
  <text x="53" y="33" text-anchor="middle" font-family="Consolas, monospace" font-size="13" font-weight="700" fill="{COLORS["badge_text"]}">{bits}</text>"""


def bit_labels(bits: str) -> str:
    labels = ["T", "I", "M", "R", "P"]
    xs = [finger["base_x"] for finger in FINGERS]
    parts = []
    for label, x, bit in zip(labels, xs, bits):
        color = COLORS["label_bent"] if bit == "1" else COLORS["label_extended"]
        pill_w = 28
        parts.append(
            f'  <rect x="{x - pill_w / 2:.1f}" y="214" width="{pill_w:.1f}" height="16" rx="8" '
            f'fill="{color}" opacity="0.12"/>'
        )
        parts.append(
            f'  <text x="{x:.1f}" y="226" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" '
            f'font-size="10" font-weight="700" fill="{color}">{label}:{bit}</text>'
        )
    return "\n".join(parts)


def defs_block(bits: str) -> str:
    finger_defs = []
    for i, finger in enumerate(FINGERS):
        bx, by = finger["base_x"], finger["base_y"]
        finger_defs.append(
            f"""
    <linearGradient id="skinGrad{i}" x1="{bx - 8}" y1="{by}" x2="{bx + 8}" y2="{by - finger['length']}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="{COLORS['skin_shadow']}"/>
      <stop offset="35%" stop-color="{COLORS['skin_dark']}"/>
      <stop offset="70%" stop-color="{COLORS['skin_mid']}"/>
      <stop offset="100%" stop-color="{COLORS['skin_light']}"/>
    </linearGradient>
    <linearGradient id="bentGrad{i}" x1="{bx - 6}" y1="{by}" x2="{bx + 10}" y2="{by + 12}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="{COLORS['bent_shadow']}"/>
      <stop offset="45%" stop-color="{COLORS['bent_dark']}"/>
      <stop offset="75%" stop-color="{COLORS['bent_mid']}"/>
      <stop offset="100%" stop-color="{COLORS['bent_light']}"/>
    </linearGradient>"""
        )

    return f"""
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="{SIZE}" y2="{SIZE}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="{COLORS['bg_glow']}"/>
      <stop offset="45%" stop-color="{COLORS['bg']}"/>
      <stop offset="100%" stop-color="#050810"/>
    </linearGradient>
    <radialGradient id="ambientGlow" cx="{PALM_CX}" cy="120" r="90" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="{COLORS['bg_accent']}" stop-opacity="0.55"/>
      <stop offset="55%" stop-color="{COLORS['bg_glow']}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="{COLORS['bg']}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="palmGrad" cx="{PALM_CX - 8}" cy="{PALM_CY - 10}" r="82" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="{COLORS['palm_highlight']}"/>
      <stop offset="40%" stop-color="{COLORS['palm_light']}"/>
      <stop offset="72%" stop-color="{COLORS['palm_mid']}"/>
      <stop offset="100%" stop-color="{COLORS['palm_dark']}"/>
    </radialGradient>
    <linearGradient id="wristGrad" x1="{PALM_CX}" y1="{PALM_CY + 48}" x2="{PALM_CX}" y2="{PALM_CY + 74}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="{COLORS['palm_mid']}"/>
      <stop offset="100%" stop-color="{COLORS['wrist']}"/>
    </linearGradient>
    <linearGradient id="nailGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{COLORS['nail_tip']}"/>
      <stop offset="100%" stop-color="{COLORS['nail_base']}"/>
    </linearGradient>
    <linearGradient id="badgeGrad" x1="14" y1="14" x2="92" y2="42" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="{COLORS['badge_bg']}"/>
      <stop offset="100%" stop-color="#4C1D95"/>
    </linearGradient>
    <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="2.5" stdDeviation="2.4" flood-color="#000000" flood-opacity="0.32"/>
    </filter>
    <filter id="palmShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="5" stdDeviation="5.5" flood-color="#000000" flood-opacity="0.38"/>
    </filter>
    <filter id="bentGlow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-color="{COLORS['bent_mid']}" flood-opacity="0.35"/>
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.28"/>
    </filter>
    {''.join(finger_defs)}
  </defs>"""


def render_svg(bits: str) -> str:
    ordered = sorted(enumerate(FINGERS), key=lambda item: item[1]["order"])
    finger_layers = "\n".join(
        finger_svg(finger, bits[i] == "1", i) for i, finger in ordered
    )

    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{SIZE}" height="{SIZE}" viewBox="0 0 {SIZE} {SIZE}" role="img" aria-label="Hand pattern {bits}">
{defs_block(bits)}
{background_layers()}
{wrist_block()}
  <path d="{palm_path()}" fill="url(#palmGrad)" stroke="#55657A" stroke-width="1.3" filter="url(#palmShadow)"/>
{palm_details()}
{finger_layers}
{pattern_badge(bits)}
{bit_labels(bits)}
</svg>
"""


def all_patterns() -> list[str]:
    return [format(i, "05b") for i in range(32)]


def main() -> None:
    import xml.etree.ElementTree as ET

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for bits in all_patterns():
        path = OUT_DIR / f"{bits}.svg"
        content = render_svg(bits)
        path.write_text(content, encoding="utf-8")
        ET.fromstring(content)

    print(f"Generated {len(all_patterns())} enhanced illustrations in {OUT_DIR}")


if __name__ == "__main__":
    main()
