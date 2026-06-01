# joe.dev — Claude Code Project Notes

## Project Overview

Hugo static blog at **joe.dev**, deployed via Cloudflare Pages. Posts are mirrored to
ATproto (Bluesky) via [Sequoia](https://sequoia.tools). The repo uses a bare+worktree
layout managed by the `wt`/worktrunk CLI.

- **Repo:** `github.com/jbeda/joe-dev-blog`
- **Live site:** https://joe.dev
- **Deploy:** Cloudflare Pages (project: `joe-dev-blog`)
- **Hugo version:** 0.161.1 extended, PaperMod theme (git submodule)

## Checklists

See [`CHECKLISTS.md`](CHECKLISTS.md) before **publishing a post** (cover image, mobile +
accessibility eval, build, rebase) or making **layout / template / CSS changes** (mobile +
accessibility checks in both light and dark mode). It also documents the repeatable mobile
and axe-core check recipes.

## Git Workflow

**Submodule init is automated via `.config/wt.toml`.** The PaperMod theme is a git submodule, and new worktrees don't auto-initialize submodules — without it the dev server fails with missing shortcodes/partials. The `wt` `pre-start` hook runs `git submodule update --init` automatically on every `wt switch --create`. If you create a worktree by other means, run it manually once:

```bash
git submodule update --init
```

**Always `git rebase origin/main` before pushing.** The CI pipeline (Sequoia publish +
`git-auto-commit`) writes commits back to `main` after every deploy, so the remote is
almost always ahead after a push. Never push without rebasing first or it will be rejected:

```bash
git add <files> && git commit -m "..." && git rebase origin/main && git push
```

---

## Brand & Theme

See [`BRAND.md`](BRAND.md) — the canonical source for all brand values: colors, typography,
Mermaid theme variables, cover image visual spec, and favicon design spec. **Update `BRAND.md`
first when anything changes**, then propagate to downstream files (CSS, `graphics-gen/src/cover.mjs`, etc.).

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

Orphaned ATproto records can accumulate if `atUri` isn't committed between runs. Use
`task atproto-check` (dry run) and `task atproto-cleanup` (delete) to manage them.

### Hugo Template Override Locations
- `layouts/partials/extend_head.html` — Google Fonts + Mermaid script + standard.site publication link tag
- `layouts/partials/extend_footer.html` — empty (reserved; do not use for per-page content)
- `layouts/baseof.html` — **copied from PaperMod** (skip-to-content link + `id`/`tabindex` on `<main>`). Check on submodule updates.
- `layouts/partials/footer.html` — **copied from PaperMod** (colophon link change). Check on submodule updates.
- `layouts/partials/header.html` — **copied from PaperMod** (nav `aria-label` + logo-image a11y fix). Check on submodule updates.
- `layouts/partials/post_nav_links.html` — **copied from PaperMod** (pagination nav `aria-label`). Check on submodule updates.
- `layouts/partials/share_icons.html` — **copied from PaperMod** with modifications. Check on submodule updates.
- `layouts/partials/templates/schema_json.html` — **copied from PaperMod** with modifications. Check on submodule updates.
- `layouts/_default/_markup/render-codeblock-mermaid.html` — wraps mermaid fenced blocks
- `assets/css/extended/custom.css` — all theme customization

See `layouts/partials/CLAUDE.md` for Mermaid implementation notes and full drift details on all copied partials.

### Bluesky Enhanced Link Cards

**Link tags required on every article page** — both must be present:
1. `<link rel="site.standard.document" …>` — injected by `bunx sequoia-cli inject` during CI
2. `<link rel="site.standard.publication" …>` — emitted by `extend_head.html` from `params.standardSitePublicationURI` in `hugo.toml`

The publication tag is also emitted on the home page.

**Config:** `params.standardSitePublicationURI` in `hugo.toml`. If unset, the tag is silently omitted.

**Testing:** paste any post URL into the composer at https://main.bsky.dev — the enhanced card preview appears without posting.

---

## Content

- Posts live in `content/posts/` as Markdown with TOML frontmatter
- `atUri` frontmatter field is written by `sequoia publish` — do not edit manually
- About page: `content/about.md` — uses `.about-photo` CSS class for the headshot float
- Headshot: `static/joe.png` (341×512px portrait)

---

## Cover Images

Generate a cover before publishing any post:

```bash
task cover POST=content/posts/my-post.md
# → static/covers/my-post.png  +  static/covers/my-post.cover.json (sidecar)
```

Then add to the post's TOML frontmatter:

```toml
coverImage = "static/covers/my-post.png"   # Sequoia → ATproto blob

[cover]
  image = "/covers/my-post.png"            # PaperMod → og:image / twitter:image
  alt = "Post title here"
  hidden = true                            # OG tags only; not shown on page
```

`hidden = true` is deliberate — the warm parchment background clashes with dark mode.
`coverImage` (local path) → Sequoia uploads as ATproto blob (Bluesky card thumbnail).
`cover.image` (URL path) → PaperMod populates `og:image` / `twitter:image` for social previews.

Visual spec and branding-change procedure: see `BRAND.md` and `graphics-gen/CLAUDE.md`.

---

## Local Tooling

Copy `.env.example` → `.env` and fill in credentials. The Taskfile loads `.env` automatically.

Common tasks (`brew install go-task`):

| Command        | Description                                      |
|----------------|--------------------------------------------------|
| `task dev`         | Start Hugo dev server on port 1313 (kills any existing instance first) |
| `task dev:stop`    | Stop any running Hugo dev server                                        |
| `task dev:restart` | Restart the Hugo dev server                                             |
| `task build`       | Production build → `public/`                                            |
| `task preview`     | Production build + serve locally on port 1313                           |
| `task clean`       | Remove `public/`, `resources/_gen/`, build lock                         |
| `task scripts:setup`  | Create `scripts/.venv/` (Python 3.13) and install dependencies |
| `task fonts`          | Download brand fonts + generate static Nunito weight instances |
| `task cover POST=content/posts/foo.md` | Generate cover image for a post  |
| `task covers-regen`   | Regenerate all covers from sidecars (after branding changes) |
| `task atproto-check`  | List orphaned ATproto records (dry run)                  |
| `task atproto-cleanup`| Delete orphaned ATproto records (prompts for confirmation)|
| `task publication-icon` | Upload PNG as publication icon blob (default: `static/apple-touch-icon.png`) |

Run `task fonts` once after cloning before any local image generation. Python tooling details: see `scripts/CLAUDE.md`.

### Playwright MCP Server

The Playwright browser runs inside Docker (via ToolHive) and **cannot reach `localhost`**.
Always use `http://host.docker.internal:1313` for the local dev server — not `localhost:1313`.
The dev server binds to `0.0.0.0` for this reason.
