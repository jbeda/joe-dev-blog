#!/usr/bin/env python3
"""
Generate the home page OG image (static/og-home.png).

Design: large favicon centrepiece, site title in Cormorant, teal rule.
No wordmark — the favicon IS the brand mark at this size.

Usage:
    python3 scripts/generate-og-home.py

Requires: pip install Pillow  +  task fonts (run once)
"""

import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.exit("Pillow not installed. Run: pip install Pillow")

W, H     = 1200, 630
BG       = "#F5F1EB"
TEAL     = "#0D9488"
TEXT     = "#1F1F1F"
FONT_DIR = Path("fonts")


def load_font(name: str, size: int) -> "ImageFont.FreeTypeFont":
    path = FONT_DIR / name
    if not path.exists():
        sys.exit(f"Font not found: {path}\nRun: task fonts")
    return ImageFont.truetype(str(path), size)


def main() -> None:
    img  = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)

    # Large favicon
    favicon = Image.open("static/apple-touch-icon.png").convert("RGBA")
    icon_size = 220
    favicon = favicon.resize((icon_size, icon_size), Image.LANCZOS)

    # Title
    title_font = load_font("Cormorant-variable.ttf", 108)
    title = "joe.dev"
    title_w = int(draw.textlength(title, font=title_font))
    _, tt, _, tb = draw.textbbox((0, 0), title, font=title_font)
    title_h = tb - tt

    # Teal rule
    rule_w, rule_h, rule_gap = 220, 4, 28

    # Block layout: icon → gap → title → rule_gap → rule
    icon_title_gap = 28
    total_h = icon_size + icon_title_gap + title_h + rule_gap + rule_h

    # Vertically centred, nudged slightly above midpoint
    y = (H - total_h) // 2 - 15

    # Icon (centred)
    img.paste(favicon, ((W - icon_size) // 2, y), favicon)
    y += icon_size + icon_title_gap

    # Title (centred, corrected for font bbox offset)
    draw.text(((W - title_w) // 2, y - tt), title, font=title_font, fill=TEXT)
    y += title_h

    # Teal rule (centred)
    rule_x = (W - rule_w) // 2
    rule_y = y + rule_gap
    draw.rectangle([(rule_x, rule_y), (rule_x + rule_w, rule_y + rule_h)], fill=TEAL)

    output = Path("static/og-home.png")
    img.save(output, "PNG", optimize=True)
    print(f"✓ {output}  ({output.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
