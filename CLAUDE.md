# joe.dev — Claude Code Project Notes

## Project Overview

Hugo static blog at **joe.dev**, deployed via Cloudflare Pages. Posts are mirrored to
ATproto (Bluesky) via [Sequoia](https://sequoia.tools). The repo uses a bare+worktree
layout managed by the `wt`/worktrunk CLI.

- **Repo:** `github.com/jbeda/joe-dev-blog`
- **Live site:** https://joe.dev
- **Deploy:** Cloudflare Pages (project: `joe-dev-blog`)
- **Hugo version:** 0.161.1 extended, PaperMod theme (git submodule)

---

## Brand & Theme

### Figma Brand Book
Full visual reference: https://www.figma.com/design/FE0YU473kXl1u9I6uHn29r

### Color Palette

#### Light Mode
| Token            | Value              | CSS Variable       |
|------------------|--------------------|--------------------|
| Page Background  | `#F5F1EB`          | `--theme`          |
| Card Background  | `#F8F6F2`          | `--entry`          |
| Border           | `#E8E4DE`          | `--border`         |
| Inline Code BG   | `#F2EFEA`          | `--code-bg`        |
| Code Block BG    | `rgb(42, 38, 32)`  | `--code-block-bg`  |
| Teal Primary     | `#0D9488`          | accent             |
| Teal Hover       | `#0F766E`          | accent:hover       |
| Text Primary     | `#1F1F1F`          | `--primary`        |
| Text Secondary   | `#6C6C6C`          | `--secondary`      |

#### Dark Mode
| Token            | Value              | CSS Variable       |
|------------------|--------------------|--------------------|
| Page Background  | `rgb(24, 21, 17)`  | `--theme`          |
| Card Background  | `rgb(36, 32, 26)`  | `--entry`          |
| Border           | `rgb(60, 54, 44)`  | `--border`         |
| Inline Code BG   | `rgb(46, 41, 33)`  | `--code-bg`        |
| Code Block BG    | `rgb(42, 38, 32)`  | `--code-block-bg`  |
| Teal Primary     | `#2DD4BF`          | accent             |
| Teal Hover       | `#5EEAD4`          | accent:hover       |
| Text Primary     | `rgb(196, 196, 197)`| `--primary`       |
| Text Secondary   | `rgb(155, 156, 157)`| `--secondary`     |

All overrides live in `assets/css/extended/custom.css`. PaperMod CSS variables use
`:root { }` for light and `:root[data-theme=dark] { }` for dark (NOT `.dark`).

### Typography

| Role            | Font         | Weight(s)         | Size notes            |
|-----------------|--------------|-------------------|-----------------------|
| Headings (h1–h6)| Cormorant    | 500 Medium        | h1: 40px, h2: 36px…  |
| Post title      | Cormorant    | 600 Semi Bold     |                       |
| Body text       | Nunito       | 300 Light         | 18px, line-height 1.6 |
| Bold / emphasis | Nunito       | 600 Semi Bold     |                       |
| Meta / small    | Nunito       | 300 Light         | 14px                  |
| Code (inline)   | Space Mono   | 400 Regular       | 0.82em (runs large)   |
| Code (blocks)   | Space Mono   | 400 Regular       | 14px                  |
| Site logo/nav   | Cormorant    | 600 Semi Bold     | 28px                  |

Google Fonts loaded in `layouts/partials/extend_head.html`:
```
Cormorant: ital,wght@0,300..700;1,300..700
Nunito: wght@300;400;600;700
Space Mono: ital,wght@0,400;0,700;1,400
```

### Mermaid Diagrams (light mode themeVariables)
```js
{ theme: 'base', themeVariables: {
    primaryColor: '#e6f4f2', primaryBorderColor: '#0D9488',
    primaryTextColor: '#1a1a1a', lineColor: '#0D9488',
    edgeLabelBackground: '#f5f1ec', background: '#f5f1ec',
} }
```
Dark mode substitutes `#2d3a39` / `#2DD4BF` / `#e8e3da` / `#18150f`.

---

## Architecture Notes

### CI/CD Pipeline (`.github/workflows/deploy.yml`)
Order matters — Sequoia must publish before Hugo builds, then inject after:
1. `bunx sequoia-cli publish` — writes `atUri` to post frontmatter
2. `git-auto-commit` — commits `.sequoia-state.json` and updated frontmatter `[skip ci]`
3. `hugo --minify` — builds into `public/`
4. `bunx sequoia-cli inject` — injects `<link rel="site.standard.document">` into built HTML
5. `wrangler pages deploy public` — deploys to Cloudflare Pages

### Sequoia Config (`sequoia.json`)
- `contentDir`: `./content/posts`
- `outputDir`: `./public`
- `publishContent`: `true`
- `publicationUri`: `at://did:plc:vkn2vmcnsmlffrpwalvgybw5/site.standard.publication/3mmfe3yxkqd2b`

### Mermaid Implementation
The mermaid script lives in `layouts/partials/extend_head.html` (NOT `extend_footer.html`).
Reason: PaperMod's `baseof.html` calls `partialCached "footer.html"` which caches the footer
across all posts of the same kind, so changes to `extend_footer.html` don't reliably propagate.
`extend_head.html` is called via plain `partial` (uncached) so it always executes fresh.

The script uses dynamic `import()` and only fetches mermaid when a `.mermaid` div is present:
```html
<script type="module">
  if (document.querySelector('.mermaid')) {
    const { default: mermaid } = await import('https://cdn.jsdelivr.net/npm/mermaid@11/...');
    ...
    mermaid.run();
  }
</script>
```

### Favicon
Files live in `static/` and are picked up automatically by PaperMod's head template:
- `static/favicon.ico` — multi-size (16+32) ICO for legacy browsers
- `static/favicon-16x16.png` — 16×16 PNG
- `static/favicon-32x32.png` — 32×32 PNG
- `static/apple-touch-icon.png` — 180×180 PNG for iOS

Design: uppercase **J**, Cormorant Semi Bold, white on `#0F766E` (deep teal), rounded square
(corner radius ~12%), +7% optical lift. Source frames live in the Figma Brand Book
(see link above) under "D — Optical Centering Refinement → +7%".

To regenerate favicons: screenshot the brand book frame `2:2` at `maxDimension=3650`
(renders 1:1 at 1440×3650), then crop with ImageMagick:
```
magick brandbook.png -crop 200x200+440+3384 +repage favicon-200.png
magick favicon-200.png -resize 180x180 static/apple-touch-icon.png
magick favicon-200.png -resize 32x32  static/favicon-32x32.png
magick favicon-200.png -resize 16x16  static/favicon-16x16.png
magick static/favicon-16x16.png static/favicon-32x32.png static/favicon.ico
```

### Hugo Template Override Locations
- `layouts/partials/extend_head.html` — Google Fonts + Mermaid script
- `layouts/partials/extend_footer.html` — empty (reserved; do not use for per-page content)
- `layouts/_default/_markup/render-codeblock-mermaid.html` — wraps mermaid fenced blocks
- `assets/css/extended/custom.css` — all theme customization

### DNS & Deployment
- Domain registrar: Porkbun
- DNS hosting: Cloudflare (required for apex domain on Cloudflare Pages)
- Cloudflare Pages requires Cloudflare DNS for root/apex domains (no CNAME flattening otherwise)

---

## Content

- Posts live in `content/posts/` as Markdown with TOML frontmatter
- `atUri` frontmatter field is written by `sequoia publish` — do not edit manually
- About page: `content/about.md` — uses `.about-photo` CSS class for the headshot float
- Headshot: `static/joe.png` (341×512px portrait)

## Scripts & Local Tooling

- `scripts/download-fonts.sh` — downloads brand fonts (Cormorant, Nunito, Space Mono) from
  Google Fonts GitHub mirror into `fonts/` (gitignored). Run once after cloning.
  Requires `curl`. Used for local image generation with ImageMagick.

## GitHub Secrets Required
- `ATP_IDENTIFIER` — ATproto handle (e.g. `h.olysh.it`)
- `ATP_APP_PASSWORD` — ATproto app password
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
