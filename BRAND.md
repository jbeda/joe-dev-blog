# joe.dev Brand Reference

**This file is the canonical source of truth for all joe.dev brand values.**
When brand values conflict between this file and any other source (CSS, scripts), this file wins.
Update this file first when anything changes; then propagate to downstream files (CSS, cover.mjs, etc.).

---

## Color Palette

### Light Mode
| Token               | Value                  | CSS Variable / Note              |
|---------------------|------------------------|----------------------------------|
| Page Background     | `#F5F1EB`              | `--theme`                        |
| Card Background     | `#F8F6F2`              | `--entry`                        |
| Border              | `#E8E4DE`              | `--border`                       |
| Code Block BG       | `#2A2620`              | `--code-block-bg`                |
| Inline Code BG      | `#E6F2F0`              | explicit rule (teal tint)        |
| Inline Code Text    | `#2D5F5B`              | explicit rule (muted teal)       |
| Teal Primary        | `#0A7A70`              | accent                           |
| Teal Hover          | `#086B62`              | accent:hover                     |
| Text Primary        | `#1F1F1F`              | `--primary`                      |
| Text Secondary      | `#6C6C6C`              | `--secondary`                    |

### Dark Mode
| Token               | Value                  | CSS Variable / Note              |
|---------------------|------------------------|----------------------------------|
| Page Background     | `#181511`              | `--theme`                        |
| Card Background     | `#24201A`              | `--entry`                        |
| Border              | `#3C362C`              | `--border`                       |
| Code Block BG       | `#2A2620`              | `--code-block-bg`                |
| Inline Code BG      | `#1E2C2A`              | explicit rule (dark teal tint)   |
| Inline Code Text    | `#7ECCC6`              | explicit rule (soft teal)        |
| Teal Primary        | `#2DD4BF`              | accent                           |
| Teal Hover          | `#5EEAD4`              | accent:hover                     |
| Text Primary        | `#C4C4C5`              | `--primary`                      |
| Text Secondary      | `#9B9C9D`              | `--secondary`                    |

All CSS overrides live in `assets/css/extended/custom.css`. PaperMod CSS variables use `:root { }` for light and `:root[data-theme=dark] { }` for dark (NOT `.dark`).

Note: `--code-bg` is still defined in `:root` for PaperMod compatibility, but inline code uses an explicit `.post-content code:not(pre code)` rule so background and color can be set independently.

---

## Typography

| Role              | Font         | Weight(s)         | Size notes                        |
|-------------------|--------------|-------------------|-----------------------------------|
| Headings (h1–h6)  | Cormorant    | 500 Medium        | h1: 40px, h2: 36px…               |
| Post title        | Cormorant    | 600 Semi Bold     |                                   |
| Card title (h2)   | Cormorant    | 600 Semi Bold     | `.entry-header h2` override       |
| Body text         | Nunito       | 300 Light         | 18px, line-height 1.7             |
| Bold / emphasis   | Nunito       | 600 Semi Bold     |                                   |
| Post description  | Nunito       | 300 Light         | 0.95rem, line-height 1.5, secondary color |
| Meta / small      | Nunito       | 300 Light         | 14px                              |
| Code (inline)     | Space Mono   | 400 Regular       | 0.82em, teal-tinted bg+color      |
| Code (blocks)     | Space Mono   | 400 Regular       | 14px                              |
| Site logo/nav     | Cormorant    | 600 Semi Bold     | 28px                              |

Google Fonts loaded in `layouts/partials/extend_head.html`:
```
Cormorant: ital,wght@0,300..700;1,300..700
Nunito: wght@300;400;600;700
Space Mono: ital,wght@0,400;0,700;1,400
```

---

## Mermaid Diagram Theme Variables

Light mode:
```js
{ theme: 'base', themeVariables: {
    primaryColor: '#e6f4f2', primaryBorderColor: '#0D9488',
    primaryTextColor: '#1a1a1a', lineColor: '#0D9488',
    edgeLabelBackground: '#f5f1ec', background: '#f5f1ec',
} }
```

Dark mode substitutes: `#2d3a39` / `#2DD4BF` / `#e8e3da` / `#18150f`.

---

## Cover Image Visual Spec

Standard size: **1200×630 px** PNG (OG / 16:9 dimensions; ATproto blob limit is 1 MB).

Current spec version: **"6"** (defined as `SPEC_VERSION` in `graphics-gen/src/cover.mjs`).

| Layer | Details |
|---|---|
| Background | `#F5F1EB` warm parchment |
| Title | Cormorant variable, 120 px (auto-reduces through 96/72/60/52 until ≤3 lines), `#1F1F1F` |
| Teal rule | `#0D9488`, 6 px × 380 px, 28 px below title block |
| Description | Nunito Regular (400), 28 px, `#505050`, 18 px below teal rule; max width 880 px to clear signature block |
| Bottom stripe | `#0D9488`, 8 px × full width, bottom edge |
| Signature block | `static/apple-touch-icon.png` at 128 px, bottom-right; `joe.dev` / `Joe Beda` stacked below at Nunito Regular 24 px, `#6C6C6C`, centred on icon |
| Padding | 80 px horizontal and vertical |

Title block is vertically centered −16 px above true center.

---

## Favicon Design Spec

- **Shape:** Rounded square, corner radius ~12%, +7% optical lift
- **Background:** `#0F766E` (deep teal)
- **Glyph:** Uppercase **J**, Cormorant Semi Bold, white
- **Sizes:** 512 px (source), 180 px (apple-touch-icon), 32 px, 16 px
- **Files:** `static/favicon.ico` (16+32), `static/favicon-16x16.png`, `static/favicon-32x32.png`, `static/apple-touch-icon.png`

For export and regeneration steps, see `static/CLAUDE.md`.
