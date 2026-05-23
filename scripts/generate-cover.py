#!/usr/bin/env python3
"""
Generate a 1200×630 cover image for a blog post.

For every PNG produced, a sidecar <name>.cover.json is written alongside it.
This records the parameters used so images can be regenerated when branding changes.
To regenerate all covers: task covers-regen

Usage:
    # Read title (and description) from post frontmatter
    python3 scripts/generate-cover.py --post content/posts/my-post.md

    # Explicit title and optional description
    python3 scripts/generate-cover.py --title "My Title" --description "A subtitle" --output static/covers/my-post.png

    # Regenerate from an existing sidecar
    python3 scripts/generate-cover.py --from-sidecar static/covers/my-post.cover.json

Requires: pip install Pillow
          task fonts  (downloads brand fonts into fonts/)
"""

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Optional

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.exit("Pillow not installed. Run: pip install Pillow")

W, H    = 1200, 630
PAD_X   = 80
PAD_Y   = 80

BG             = "#F5F1EB"
TEAL           = "#0D9488"
TEXT_PRIMARY   = "#1F1F1F"
TEXT_SECONDARY = "#6C6C6C"
TEXT_DESC      = "#3D3D3D"

FONT_DIR    = Path("fonts")

# Try largest first; auto-reduce until title fits in ≤3 lines.
# Wide range so short titles get a big, confident treatment.
TITLE_SIZES = [120, 96, 72, 60, 52]

# Bump this when the visual design changes so old sidecars can be detected.
SPEC_VERSION = "2"


def load_font(name: str, size: int) -> "ImageFont.FreeTypeFont":
    path = FONT_DIR / name
    if not path.exists():
        sys.exit(f"Font not found: {path}\nRun: task fonts")
    return ImageFont.truetype(str(path), size)


def wrap_text(draw, text: str, font, max_width: int) -> list:
    words = text.split()
    lines = []
    current = []
    for word in words:
        candidate = " ".join(current + [word])
        if draw.textlength(candidate, font=font) > max_width and current:
            lines.append(" ".join(current))
            current = [word]
        else:
            current.append(word)
    if current:
        lines.append(" ".join(current))
    return lines


def measure_lh(draw, font) -> int:
    _, top, _, bottom = draw.textbbox((0, 0), "Hg", font=font)
    return bottom - top


def generate_cover(
    title: str,
    output: Path,
    description: Optional[str] = None,
    source_post: Optional[str] = None,
) -> None:
    img  = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    wordmark_font     = load_font("Nunito-variable.ttf", 26)
    description_font  = load_font("Nunito-variable.ttf", 28)

    max_w = W - PAD_X * 2

    # Pick the largest title size that wraps to ≤3 lines
    title_font = None
    title_lines = []
    for size in TITLE_SIZES:
        title_font = load_font("Cormorant-variable.ttf", size)
        title_lines = wrap_text(draw, title, title_font, max_w)
        if len(title_lines) <= 3:
            break

    title_lh = measure_lh(draw, title_font)
    title_gap = 10
    title_block_h = len(title_lines) * title_lh + (len(title_lines) - 1) * title_gap

    # Description block (optional)
    desc_lines = []
    desc_lh = 0
    desc_gap = 8
    if description:
        desc_lines = wrap_text(draw, description, description_font, max_w)
        desc_lh = measure_lh(draw, description_font)

    desc_block_h = len(desc_lines) * desc_lh + (len(desc_lines) - 1) * desc_gap if desc_lines else 0

    # Teal rule height
    rule_gap  = 28
    rule_h    = 4
    desc_top_gap = 18  # space between rule and description

    total_h = (
        title_block_h
        + rule_gap + rule_h
        + (desc_top_gap + desc_block_h if desc_lines else 0)
    )

    # Vertically center the whole block, nudged slightly above center
    y = (H - total_h) // 2 - 20

    # Draw title
    for line in title_lines:
        draw.text((PAD_X, y), line, font=title_font, fill=TEXT_PRIMARY)
        y += title_lh + title_gap
    y -= title_gap  # remove trailing gap

    # Teal rule
    rule_y = y + rule_gap
    draw.rectangle([(PAD_X, rule_y), (PAD_X + 180, rule_y + rule_h)], fill=TEAL)
    y = rule_y + rule_h

    # Description
    if desc_lines:
        y += desc_top_gap
        for line in desc_lines:
            draw.text((PAD_X, y), line, font=description_font, fill=TEXT_DESC)
            y += desc_lh + desc_gap

    # joe.dev wordmark — bottom-right
    wm_w = int(draw.textlength("joe.dev", font=wordmark_font))
    _, t, _, b = draw.textbbox((0, 0), "joe.dev", font=wordmark_font)
    wm_h = b - t
    draw.text(
        (W - PAD_X - wm_w, H - PAD_Y - wm_h),
        "joe.dev",
        font=wordmark_font,
        fill=TEXT_SECONDARY,
    )

    output.parent.mkdir(parents=True, exist_ok=True)
    img.save(output, "PNG", optimize=True)
    print(f"✓ {output}")

    # Write sidecar so the image can be regenerated when branding changes
    sidecar = output.with_suffix(".cover.json")
    sidecar_data = {
        "spec_version": SPEC_VERSION,
        "title": title,
        "output": str(output),
    }
    if description:
        sidecar_data["description"] = description
    if source_post:
        sidecar_data["source_post"] = source_post
    sidecar.write_text(json.dumps(sidecar_data, indent=2) + "\n")
    print(f"  sidecar → {sidecar}")


def regen_from_sidecar(sidecar_path: Path) -> None:
    data   = json.loads(sidecar_path.read_text())
    title  = data["title"]
    output = Path(data["output"])
    desc   = data.get("description")
    source = data.get("source_post")
    print(f"Regenerating: {output}")
    generate_cover(title, output, description=desc, source_post=source)


def read_frontmatter(path: Path):
    """Return (title, description) from TOML frontmatter."""
    text = path.read_text()
    title_m = re.search(r"""\btitle\s*=\s*['"](.+?)['"]""", text)
    desc_m  = re.search(r"""\bdescription\s*=\s*['"](.+?)['"]""", text)
    if not title_m:
        sys.exit(f"No title found in {path}")
    return title_m.group(1), (desc_m.group(1) if desc_m else None)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate blog post cover image")
    src = parser.add_mutually_exclusive_group(required=True)
    src.add_argument("--title", help="Post title text")
    src.add_argument("--post", type=Path, metavar="FILE",
                     help="Path to post .md (reads title + description from frontmatter)")
    src.add_argument("--from-sidecar", type=Path, metavar="FILE",
                     help="Regenerate from an existing .cover.json sidecar")
    src.add_argument("--regen-all", action="store_true",
                     help="Regenerate all covers from sidecars in static/covers/")
    parser.add_argument("--description", help="Optional subtitle/description text")
    parser.add_argument("--output", "-o", type=Path, metavar="FILE",
                        help="Output PNG path (default: static/covers/<slug>.png)")
    args = parser.parse_args()

    if args.regen_all:
        sidecars = sorted(Path("static/covers").glob("*.cover.json"))
        if not sidecars:
            sys.exit("No sidecar files found in static/covers/")
        for s in sidecars:
            regen_from_sidecar(s)
        return

    if args.from_sidecar:
        regen_from_sidecar(args.from_sidecar)
        return

    if args.post:
        title, description = read_frontmatter(args.post)
        if args.description:
            description = args.description
        output      = args.output or Path("static/covers") / (args.post.stem + ".png")
        source_post = str(args.post)
    else:
        title       = args.title
        description = args.description
        if not args.output:
            sys.exit("--output required when using --title")
        output      = args.output
        source_post = None

    generate_cover(title, output, description=description, source_post=source_post)


if __name__ == "__main__":
    main()
