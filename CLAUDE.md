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

### Sequoia Reference
- **Quickstart:** https://sequoia.pub/quickstart
- **Source repo:** https://tangled.org/stevedylan.dev/sequoia
- **Commands:** `auth`, `init`, `publish`, `inject` — there is no built-in delete/cleanup command

**Stale records on the PDS:** Sequoia tracks published posts via `atUri` in each post's
frontmatter and `.sequoia-state.json`. If those weren't committed between runs (e.g. during
initial testing), each `publish` creates a new ATproto record instead of updating the
existing one, leaving orphaned records on the PDS. Each `site.standard.document` record
references its publication via the `site` field (not `publicationUri`).

Use `task atproto-check` (dry run) and `task atproto-cleanup` (delete) to manage these.
The underlying script is `scripts/delete-orphaned-records.py`; requires `ATP_IDENTIFIER`
and `ATP_APP_PASSWORD` env vars.

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

Export frames live in the brand book at canvas y=4000 as standalone frames named
`favicon-export/512`, `favicon-export/180`, `favicon-export/32`, `favicon-export/16`
(node IDs 21:2, 21:4, 21:6, 21:8).

**To regenerate favicons** — use `exportAsync` via `use_figma` (NOT `get_screenshot`,
which captures the canvas background and produces opaque corners). `exportAsync` renders
the frame in isolation giving proper alpha-0 corners:

```js
// In use_figma — export one frame as base64 PNG
const node = figma.getNodeById("21:4"); // e.g. 180px
const bytes = await node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
let binary = '';
for (let i = 0; i < bytes.length; i += 8192)
  binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
return JSON.stringify({ data: btoa(binary) });
```

Decode and save with: `echo "<base64>" | base64 -d > static/apple-touch-icon.png`

Rebuild ICO after updating PNGs:
```
magick static/favicon-16x16.png static/favicon-32x32.png static/favicon.ico
```

To recreate the export frames from scratch (if lost), run `use_figma` with the code
from the commit that added them — it uses `figma.createFrame()` + `exportAsync` design
at y=4000 in the brand book.

### Cover Images

Standard cover image: **1200×630 px** PNG (16:9 / OG dimensions; also the ATproto blob size limit is 1 MB, so optimize).

#### Visual spec (spec_version "2")

| Layer | Details |
|---|---|
| Background | `#F5F1EB` warm parchment |
| Title | Cormorant variable, 120 px (auto-reduces through 96/72/60/52 until ≤3 lines), `#1F1F1F` |
| Teal rule | `#0D9488`, 4 px × 180 px, 28 px below title block |
| Description | Nunito variable, 28 px, `#3D3D3D`, 18 px below teal rule |
| Wordmark | `joe.dev`, Nunito variable 26 px, `#6C6C6C`, bottom-right |
| Padding | 80 px horizontal and vertical |

Title block is vertically centered −30 px above true center.

#### Generating a cover

```bash
# Requires: pip install Pillow  +  task fonts (run once)

task cover POST=content/posts/my-post.md
# → static/covers/my-post.png  +  static/covers/my-post.cover.json (sidecar)
```

The sidecar `.cover.json` records the title, source post path, and `spec_version` so covers can be regenerated when the branding changes:

```bash
task covers-regen        # regenerates all covers from their sidecars
```

Script: `scripts/generate-cover.py`. See `--help` for manual title/output overrides.

#### Attaching a cover to a post

Add to the post's TOML frontmatter:

```toml
coverImage = "static/covers/my-post.png"   # Sequoia → ATproto blob

[cover]
  image = "/covers/my-post.png"            # PaperMod → og:image / twitter:image
  alt = "Post title here"
  hidden = true                            # hide from page & list; OG tags still emitted
```

`coverImage` (local path) is read by Sequoia on `publish` and uploaded as an ATproto blob.
`cover.image` (URL path) is used by PaperMod to populate `og:image` and `twitter:image` meta tags for LinkedIn and social previews. `hidden = true` keeps it off the page — the warm parchment background clashes with dark mode and the title is already in the post header.

#### When branding changes

1. Update the colour/font constants at the top of `scripts/generate-cover.py` and bump `SPEC_VERSION`.
2. Run `task covers-regen` to rebuild all images.
3. Re-publish affected posts so Sequoia uploads the new blobs.

### Bluesky Enhanced Link Cards

Bluesky uses `site.standard.*` records to display enhanced previews when a joe.dev URL is shared. See [atproto discussion #4978](https://github.com/bluesky-social/atproto/discussions/4978).

**What Bluesky pulls from the record (as of 2026-05-23 — this integration is in active development):**
- `coverImage` blob → card thumbnail
- `textContent` → estimated reading time
- `title`, `description` → card headline and body

**Link tags required on every article page** — both must be present:
1. `<link rel="site.standard.document" …>` — injected by `bunx sequoia-cli inject` during CI
2. `<link rel="site.standard.publication" …>` — emitted by `extend_head.html` from `params.standardSitePublicationURI` in `hugo.toml`

The publication tag is also emitted on the home page (needed for publication-only links).

**Config:** `params.standardSitePublicationURI` in `hugo.toml`. If unset (e.g. a fork that hasn't configured ATproto yet), the tag is silently omitted.

**Testing:** paste any post URL into the composer at https://main.bsky.dev — the enhanced card preview appears without posting.

### Hugo Template Override Locations
- `layouts/partials/extend_head.html` — Google Fonts + Mermaid script + standard.site publication link tag
- `layouts/partials/extend_footer.html` — empty (reserved; do not use for per-page content)
- `layouts/partials/footer.html` — **copied from PaperMod** (only change: colophon link replaces "Powered by" text). Check this file whenever the PaperMod submodule is updated — it can drift from the theme's version.
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

## Local Tooling

Copy `.env.example` → `.env` and fill in your credentials. The Taskfile loads `.env`
automatically so all tasks pick up `ATP_IDENTIFIER`, `ATP_APP_PASSWORD`, etc.

Common tasks are defined in `Taskfile.yml` (requires [Task](https://taskfile.dev), `brew install go-task`):

| Command        | Description                                      |
|----------------|--------------------------------------------------|
| `task dev`         | Start Hugo dev server on port 1313 (kills any existing instance first) |
| `task dev:stop`    | Stop any running Hugo dev server                                        |
| `task dev:restart` | Restart the Hugo dev server                                             |
| `task build`       | Production build → `public/`                                            |
| `task preview`     | Production build + serve locally on port 1313                           |
| `task clean`       | Remove `public/`, `resources/_gen/`, build lock                         |
| `task fonts`          | Download brand fonts into `fonts/` (gitignored)         |
| `task cover POST=content/posts/foo.md` | Generate cover image for a post  |
| `task covers-regen`   | Regenerate all covers from sidecars (after branding changes) |
| `task atproto-check`  | List orphaned ATproto records (dry run)                  |
| `task atproto-cleanup`| Delete orphaned ATproto records (prompts for confirmation)|

Run `task fonts` once after cloning before any local image generation with ImageMagick.

## GitHub Secrets Required
- `ATP_IDENTIFIER` — ATproto handle (e.g. `h.olysh.it`)
- `ATP_APP_PASSWORD` — ATproto app password
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
