# joe.dev Site Critique — 2026-05-24

## How This Was Generated

This critique was produced by spawning four parallel AI agents inside a Claude Code
session, each given a distinct expert persona and a specific area of the codebase to
examine. No human reviewed the site manually before reading the agent outputs — the
findings came entirely from the agents.

**Agents and their scope:**

| Agent | Persona | Tools used |
|---|---|---|
| Visual / UX | Senior frontend engineer + design critic | Playwright (live site screenshots), direct file reads of `custom.css` and layout partials |
| Hugo architecture | Hugo expert + JAMstack architect | Direct file reads of all templates, config, scripts, and the PaperMod submodule |
| CI/CD & workflow | Senior DevOps / platform engineer | Direct file reads of `.github/workflows/`, `Taskfile.yml`, Python scripts |
| Performance & SEO | Web performance engineer + SEO specialist | `WebFetch` of live HTML pages, direct file reads of head partials and `hugo.toml` |

Each agent was prompted to be critical and specific — to flag real problems separately
from stylistic preferences, and to reference file paths and line numbers. The four
reports were then synthesized into this document by hand (with Claude's help).

**Why this approach:**
Spawning agents with distinct roles forces coverage breadth that a single review pass
would miss. A visual agent looks at contrast ratios and heading weight; a DevOps agent
looks at the same CI file for failure modes. They find different things. The Playwright
MCP server (managed via ToolHive, running in Docker) enabled live visual inspection
without manually opening a browser.

---

## Checklist

Items are ordered by priority within each tier. Check them off as they're resolved.

### Fix Now — real bugs or meaningful risk

- [ ] **Pin Hugo version in CI** — `.github/workflows/deploy.yml` uses `hugo-version: latest`. CLAUDE.md specifies `0.161.1` as the known-good version; enforce it there. A breaking Hugo release will silently break the build.
- [ ] **Fix `locale` → `languageCode` in `hugo.toml`** — `locale` is not a Hugo config key. Hugo ignores it, so `og:locale` is never emitted and anything reading `site.Language.LanguageCode` gets an empty string.
- [ ] **Fix teal link contrast (light mode)** — `#0D9488` on `#F5F1EB` is ~3.8:1, below the WCAG AA threshold of 4.5:1 for normal body text. Darken to ~`#0A7A70` in `assets/css/extended/custom.css` (lines 95 and 99).
- [ ] **Add OG image to home page** — `https://joe.dev` shared on social renders as a text-only card. Set `params.images` in `hugo.toml` pointing to a branded static asset as the default fallback.
- [ ] **Add `description` to `about.md` frontmatter** — PaperMod falls back to truncating body text, producing a stale 300-char blob starting mid-sentence. Add an explicit `description = "..."` field.
- [ ] **Compress `static/joe.png`** — 316 KB uncompressed PNG for a small portrait. Convert to WebP at 80% quality → ~25–35 KB. Not lazy-loaded on `/about/`.

### Fix Soon — quality and operational risk

- [ ] **Fix render-blocking Google Fonts** — `extend_head.html` loads fonts as a `rel=stylesheet`, blocking first paint. Use `rel=preload` + async `onload` swap, or self-host via the fonts already downloaded by `task fonts`.
- [ ] **Delete dead `hasMermaid` Store variable** — `layouts/_default/_markup/render-codeblock-mermaid.html` sets `.Page.Store.Set "hasMermaid" true` but `extend_head.html` ignores it, using a client-side `querySelector` guard instead. Remove the Store line; the JS approach is fine.
- [ ] **Add `fonts` prereq to `cover` and `covers-regen` tasks** — fresh clone + `task cover` fails with a cryptic error. Add `deps: [fonts]` to both tasks in `Taskfile.yml`.
- [ ] **Suppress post meta on About page** — "May 22, 2026 · 2 min · Joe Beda" and share-to-Reddit are semantically wrong for an about page. Add `hideMeta: true` to `about.md` frontmatter (and consider suppressing share buttons on non-post pages).
- [ ] **Fix About page JSON-LD schema** — PaperMod emits `@type: BlogPosting` for all single pages. The about page should be `ProfilePage` or `Person`. Requires a custom schema partial override.
- [ ] **Fix frontmatter regex scope in `scripts/generate-cover.py`** — the `title =` / `description =` regex runs on the entire file, not just the TOML block between `+++` delimiters. A post with `title = "..."` in a code example will produce the wrong cover. Parse only the frontmatter region.
- [ ] **Audit Cloudflare API token scope** — CI only needs `Pages:Edit`. An over-scoped token is unnecessary blast radius. Verify in the Cloudflare dashboard.
- [ ] **Verify / fix `sequoia.json` `imagesDir`** — currently `"./assets"`, which only contains CSS. If Sequoia enumerates this directory for images, it finds nothing. Should likely be `"./static"` or removed.

### Polish / Lower Priority

- [ ] **Pin Mermaid CDN import to an exact version** — `mermaid@11` is a floating tag; pin to `mermaid@11.x.x` in `extend_head.html`. A breaking 11.x patch has caught people before.
- [ ] **Fix Mermaid dark mode detection** — `data-theme` may not be set when the user relies on OS `prefers-color-scheme` rather than the manual toggle. Diagrams render with light-mode colors on a dark-OS page. Add a `prefers-color-scheme: dark` media query fallback.
- [ ] **Add long-lived cache headers for static assets** — covers and CSS have a 4-hour `max-age`. Add a `static/_headers` file setting `Cache-Control: public, max-age=31536000, immutable` for `/covers/*`, `/images/*`, and hashed CSS files.
- [ ] **Investigate Cloudflare edge caching for HTML** — pages return `cf-cache-status: DYNAMIC` (`max-age=0`). A static site's HTML should be cacheable at the edge with stale-while-revalidate.
- [ ] **Add RSS autodiscovery to single post pages** — the `<link rel=alternate type=application/rss+xml>` tag is only on the home page. Feed readers discovering feeds from article URLs won't find it. Add it conditionally in `extend_head.html`.
- [ ] **Add `noindex` to Search and Archives pages** — both are indexed with no unique content value (one is client-side JS, one is a reordering of post metadata). Use `_build.list: never` or `noindex` in frontmatter.
- [ ] **Fix `og:locale` casing** — after fixing `languageCode`, the emitted value will be `en_us`; OG spec wants `en_US`. Set `languageCode = 'en-US'` (capital) in `hugo.toml`.
- [ ] **Set body `line-height`** — CLAUDE.md spec says 1.6 but it's absent from `custom.css`. Add `line-height: 1.7` to the `body {}` rule for better long-form readability.
- [ ] **Add `:focus-visible` styles** — PaperMod's default is browser-native blue, which clashes with the warm palette. Add a teal `outline: 2px solid #0D9488` rule in `custom.css`.
- [ ] **Add `font-weight: 600` for h4–h6 in post content** — Cormorant 500 at 16px or smaller is nearly indistinguishable from body text. Small headings need more weight to maintain hierarchy.
- [ ] **Style post description as subtitle** — `.post-description` inherits body styling and reads as a continuation of body copy rather than a subhead. Give it explicit `color: var(--secondary)` and `font-size: 1.1rem`.
- [ ] **Add `Person` structured data** — no `Person` schema exists anywhere on the site. The About page and/or home page should include a `Person` entity with `name`, `url`, `sameAs` linking to social profiles.
- [ ] **Address `footer.html` and `share_icons.html` template drift** — both are full copies of PaperMod partials (only `footer.html` has a meaningful change). Upstream improvements silently won't apply. Document the diff from the source template and check on each PaperMod submodule update.
- [ ] **Add `width`/`height` to headshot `<img>`** — `about.md` renders `<img src=/joe.png>` with no dimensions, causing layout shift (CLS) while the image loads.

---

## What's Working Well

Not everything needs fixing. These decisions are sound — don't second-guess them:

- **Warm parchment palette** (`#F5F1EB`) — distinctive and coherent, carries across light/dark modes.
- **Font pairing** — Cormorant + Nunito + Space Mono is unusual and works. The code block warm-dark background (`rgb(42, 38, 32)`) is more on-brand than PaperMod's default.
- **CI pipeline ordering** — Sequoia publish → state commit → Hugo build → inject → deploy is the correct dependency chain. Getting this right took real thought.
- **GitHub Actions pinned to commit SHAs** — good supply chain hygiene, not floating version tags.
- **`extend_head.html` vs `extend_footer.html`** — using the uncached partial for per-page scripts is correct; many people get this wrong and wonder why their JS doesn't fire.
- **Cover image sidecar regen pattern** — the `.cover.json` sidecar for `task covers-regen` is well-designed for long-term maintainability.
- **Full-text RSS** (`ShowFullTextinRSS = true`) — the right call for feed reader users.
- **Mermaid runtime guard** — only loads the ~500 KB bundle on pages that actually have diagrams.
- **ATproto orphan cleanup tooling** — `task atproto-check` / `task atproto-cleanup` exist and work. The operational risk is documented.
- **Card hover lift** (`translateY(-2px)`) — subtle, correct, on-brand.
