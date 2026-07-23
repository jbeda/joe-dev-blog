# joe.dev — Claude Code Project Notes

## Project Overview

Hugo static blog at **joe.dev**, deployed via Cloudflare Pages. Posts are mirrored to
ATproto (Bluesky) via [Sequoia](https://sequoia.tools).

- **Repo:** `github.com/jbeda/joe-dev-blog`
- **Live site:** https://joe.dev
- **Deploy:** Cloudflare Pages (project: `joe-dev-blog`)
- **Hugo version:** 0.161.1 extended, PaperMod theme (git submodule)

## Checklists

See [`CHECKLISTS.md`](CHECKLISTS.md) before **publishing a post** (cover image, voice + source
check, social snippets, build, rebase) or making **layout / template / CSS changes** (mobile +
accessibility checks in both light and dark mode). The full mobile + axe-core run is reserved for
structural changes, not routine posts. It also documents the repeatable mobile and axe-core check
recipes.

## Writing & editing a post

A repeatable playbook for drafting and tightening posts (started with the "new 20% time" post,
2026-06; refine as we learn). Voice rules live in the global `~/.claude/CLAUDE.md` (voice
profile + writing rules) and govern every choice; this is the *process* around them.

### Draft
- Read the global voice files first (voice profile + writing rules).
- Read source material in full and verbatim before drafting. Don't work from summaries; pull
  the original text (an old post, a paper's actual abstract) so quotes are exact.
- Keep a working file beside the post: `content/posts/<slug>.notes.md` (excluded from the build
  via `ignoreFiles`). Sections: Status, dated Decisions, Section map, Research + sources,
  Parking lot, Social teasers (a Bluesky + LinkedIn companion post), Pre-publish checklist.
  It is the record of *why* the post is the way it is.
  These notes may go public someday: keep undeveloped future-post ideas out of them (park those
  in CoWork `WORK AREAS/Marketing/blog-ideas-project/`).
- Verify every factual claim against a primary source before it goes in. Flag unverifiable
  claims `[NEEDS SOURCE]`; never fabricate. Cite the primary (paper, on-the-record quote), not
  the secondary blog that paraphrases it (the paraphrase often gets it backwards).
- Pick a one-line **spine** (the post's central question or claim). Every section must serve
  it. A section that serves a different thread is a different post: cut it to a seed and park
  it in CoWork blog ideas.

### Tighten (length is the enemy of retention)
- Bias to cut. When unsure, cut. The reader's attention is the scarce resource.
- The open earns at most two short paragraphs before the first real idea. Kill preamble.
- Every paragraph earns its place with a fact, an insight, or forward momentum. If it can be
  deleted without loss, delete it.
- One idea per section. Watch cross-section redundancy: explain a thing once. A brief callback
  is fine; a re-explanation is not.
- One analogy per job. Don't stack analogies for the same point.
- Don't open a question you can't close in the space you have. Park it as a future post.
- Two short sentences beat a dash. No em/en-dashes. Run the banned-word / AI-tell check.
- Read the first sentence of each paragraph in sequence; vary the rhythm.

### Collaborate
- Use `AskUserQuestion` for genuine forks (use option previews for wording/heading choices).
- Commit safe, clearly-instructed edits directly; *propose* subjective rewrites (conclusions,
  reframes) before committing.
- Log decisions, dated, in the notes file as you go. Re-check the notes for drift after big
  changes: a stale "PENDING/TODO" reads as misleading.

### Review (before publish)
Run a multi-perspective expert review and fold the findings (separate verified from unverified).
Pick lenses that match the post's claims and risks. A good default set:
- **Domain fact-checker(s)** for time-sensitive, citation-heavy claims (industry history,
  pricing/economics, named companies and numbers).
- **Subject-matter checker** for any research cited (e.g. a cognitive-science read on an
  attention/psychology claim).
- **The most-affected reader** for any group the post characterizes (e.g. a working artist for
  a claim about creative work). Catches tone that reads as dismissive.
- **Hostile/contrarian peer** who argues the opposite of the thesis. Stress-tests the hedges.
- **Structure/retention editor**: will a reader finish it? Where does momentum sag? Is the
  spine always visible?

### Make it compelling (engagement levers)
Apply once the content is settled. These decide whether the post gets read and shared, not just
whether it's good.
- **Title carries the most weight.** It's the feed and social-card hook. Concrete noun plus a
  curiosity gap; front-load the interesting word; keep the searchable keyword if there is one.
- **Assume scanning, not reading.** People scan in an F-pattern and read a fraction of the words
  (Nielsen Norman Group). Earn the scroll with a concrete first sentence, descriptive section
  headings, and short paragraphs.
- **Pull quotes:** ~2 for a long post, via the `pullquote` shortcode
  (`layouts/shortcodes/pullquote.html`). Lift a self-contained line already in the body and mark
  it `aria-hidden` (it repeats). Place them at the longest text runs, and favor the most
  surprising / most shareable line.
- **Bold the one landing line** a skimmer must catch, roughly one per section, sparingly.
- **TOC on** (`ShowToc = true`) for long posts (~1.5k+ words).
- **Images:** the cover is `hidden = true` on-page (the warm parchment clashes with the post and
  reads as noise), but it IS the Bluesky/LinkedIn card, so it still must be strong with full alt
  text. Add at most one in-body image, and only if a concept genuinely wants a diagram. Never
  decorative stock.
- **End on a question or open thread,** not a summary; it invites replies and quote-shares.
- **Distribution is half the work.** Every post ships with a Bluesky + LinkedIn teaser (see the
  notes-file "Social teasers" section). The teaser hook matters as much as the on-page open: lead
  with the most surprising or most trending idea in the piece, not necessarily the thesis.

### Pre-publish
See `CHECKLISTS.md` and the post's notes-file checklist (five-point writing test, cover image,
social snippets, rebase, flip `draft = false`). The full mobile + axe-core a11y run is reserved
for structural / layout changes, not routine posts.

## Git Workflow

**Initialize submodules after cloning.** The PaperMod theme is a git submodule, and a fresh clone doesn't auto-initialize it — without this the dev server fails with missing shortcodes/partials. Run once after cloning:

```bash
git submodule update --init
```

**Always `git rebase origin/main` before pushing.** The CI pipeline (Sequoia publish +
`git-auto-commit`) writes commits back to `main` after every deploy, so the remote is
almost always ahead after a push. Never push without rebasing first or it will be rejected:

```bash
git add <files> && git commit -m "..." && git rebase origin/main && git push
```

**Don't push drafts as a backstop.** This repo is public, so pushing exposes unfinished
work — never suggest pushing early just to back up drafts or work-in-progress branches.
Keep those local.

---

## Brand & Theme

See [`BRAND.md`](BRAND.md) — the canonical source for all brand values: colors, typography,
Mermaid theme variables, cover image visual spec, and favicon design spec. **Update `BRAND.md`
first when anything changes**, then propagate to downstream files (CSS, `graphics-gen/src/cover.mjs`, etc.).

---

## Architecture Notes

### CI/CD Pipeline (`.github/workflows/deploy.yml`)
Order matters — Sequoia must publish before Hugo builds, then inject after:
1. `bunx sequoia-cli@0.5.7 publish` — writes `atUri` to post frontmatter
2. `git-auto-commit` — commits `.sequoia-state.json` and updated frontmatter `[skip ci]`
3. `hugo --minify` — builds into `public/`
4. `bunx sequoia-cli@0.5.7 inject` — injects `<link rel="site.standard.document">` into built HTML
5. `wrangler pages deploy public` — deploys to Cloudflare Pages

The Sequoia version is **pinned** in `deploy.yml` (both steps) for reproducible deploys.
Bumping it is a deliberate step — see `CHECKLISTS.md` → Upgrading pinned tools.

### Sequoia Config (`sequoia.json`)
- `contentDir`: `./content/posts`
- `outputDir`: `./public`
- `publishContent`: `true`
- `publicationUri`: `at://did:plc:vkn2vmcnsmlffrpwalvgybw5/site.standard.publication/3mmfe3yxkqd2b`

### Sequoia Reference
- **Quickstart:** https://sequoia.pub/quickstart
- **Source repo:** https://tangled.org/stevedylan.dev/sequoia
- **Commands:** `auth`, `init`, `publish`, `inject` — there is no built-in delete/cleanup command
- **Known issue:** `publish` appends `atUri` at the end of frontmatter, which nests it under a
  trailing `[cover]` table and breaks top-level `.Params.atUri`. Use the inline-table cover form
  (see Cover Images). Tracked at https://tangled.org/stevedylan.dev/sequoia/issues/46

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
- **Working notes:** keep per-post notes/outlines as `<slug>.notes.md` next to the post in `content/posts/`. Hugo skips these via `ignoreFiles = ['\.notes\.md$']` in `hugo.toml`. Verify exclusion with `hugo list all | grep notes` (want 0 matches). These files may eventually become public, so keep them clean.

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
# PaperMod cover — MUST be an inline table, not a [cover] section header (see below):
cover = { image = "/covers/my-post.png", alt = "Post title here", hidden = true }
```

**Always use the inline-table form (`cover = { … }`), never a `[cover]` section header.**
Sequoia's `publish` appends `atUri` to the *end* of the frontmatter. In TOML, a bare key
after a `[cover]` header belongs to that table — so the appended `atUri` parses as
`cover.atUri`, leaving top-level `.Params.atUri` empty. The recommend button (and anything
else gating on `atUri`) then silently disappears, with no build error. An inline table has
no open section, so the appended `atUri` stays top-level. (Upstream bug:
https://tangled.org/stevedylan.dev/sequoia/issues/46 — remove this workaround note if fixed.)

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
| `task fonts`          | Download brand fonts + generate static Nunito weight instances |
| `task cover POST=content/posts/foo.md` | Generate cover image for a post  |
| `task covers-regen`   | Regenerate all covers from sidecars (after branding changes) |
| `task atproto-check`  | List orphaned ATproto records (dry run)                  |
| `task atproto-cleanup`| Delete orphaned ATproto records (prompts for confirmation)|
| `task atproto-republish`| Force-republish all posts (re-uploads covers; use after regenerating a cover image) |
| `task publication-icon` | Upload PNG as publication icon blob (default: `static/apple-touch-icon.png`) |

Run `task fonts` once after cloning before any local image generation. Node tasks use the
nvm-managed node (resolved via `NODE_BIN` in the Taskfile); Python tasks run ephemerally
via `uv run` (no managed venv). Both require `uv` and nvm installed. Python tooling details:
see `scripts/CLAUDE.md`.

### Playwright MCP Server

The Playwright browser runs inside Docker (via ToolHive) and **cannot reach `localhost`**.
Always use `http://host.docker.internal:1313` for the local dev server — not `localhost:1313`.
The dev server binds to `0.0.0.0` for this reason.
