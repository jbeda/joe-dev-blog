# joe.dev Accessibility / Screen-Reader Audit — 2026-06-01

## How This Was Generated

Run inside a Claude Code session combining automated and manual checks:

- **[axe-core 4.10](https://github.com/dequelabs/axe-core)** injected into each live page
  via the Playwright MCP server (Docker/ToolHive, reaching the dev server at
  `http://host.docker.internal:1313`). axe catches roughly a third of WCAG issues —
  the machine-checkable ones (contrast, ARIA conflicts, landmark uniqueness, missing
  names).
- **Manual DOM + keyboard inspection** for the things axe can't judge: heading order,
  link-text quality, diagram/SVG alternatives, skip-link behavior, focus visibility.

**Pages audited:** home, all four posts (`hello-world`, `nine-kinds-of-agents`,
`thinking-out-loud`, `10-years-of-spiffe`), about, colophon, search.

**Result:** went from 3 distinct violation types on content posts to **0 axe violations
across all 8 pages**, plus several screen-reader fixes axe doesn't flag.

---

## Findings & Fixes

Ordered by impact.

- [x] **No skip-to-content link** *(high — keyboard / screen-reader)* — every page forced
  keyboard and SR users to tab through the full header nav before reaching content. No
  bypass mechanism existed (WCAG 2.4.1).
  > Fixed: added a `.skip-link` ("Skip to main content") as the first focusable element in
  > `layouts/baseof.html`, with `id="main" tabindex="-1"` on `<main>` as its target. The
  > link is visually hidden until focused, then slides in at the top-left. Styles in
  > `assets/css/extended/custom.css`.

- [x] **Low-contrast code comments** *(serious)* — PaperMod's default Chroma comment color
  `#6e738d` is only **3.2:1** against our warm dark code-block background `#2A2620`, below
  the WCAG AA threshold of 4.5:1. Comments were hard to read in both light and dark mode
  (the code block uses the same background in both).
  > Fixed: overrode the comment token colors (`.chroma .c, .ch, .cm, .c1, .cs, .cp, .cpf`)
  > to `#9E9C8C` (**5.4:1**) in `custom.css` — a warm gray that clears AA while still
  > reading as muted.

- [x] **Duplicate unnamed `navigation` landmarks** *(moderate)* — on post pages the header
  nav (`.header-nav`) and the prev/next pagination nav (`.paginav`) are both `navigation`
  landmarks with no accessible name, so SR landmark navigation announced "navigation,
  navigation" indistinguishably.
  > Fixed: `aria-label="Main"` on the header nav (`layouts/partials/header.html`) and
  > `aria-label="More posts"` on the pagination nav (`layouts/partials/post_nav_links.html`).

- [x] **Logo image presentation-role conflict** *(minor)* — the header logo `<img>` had both
  `alt=""` (decorative → presentation role) and `aria-label="logo"` (a name), a direct
  contradiction. Present on every page.
  > Fixed: removed `aria-label="logo"` from both branches in `layouts/partials/header.html`.
  > The image stays decorative (`alt=""`); the wrapping link is already named by its
  > "joe.dev" text.

- [x] **Unlabeled Mermaid diagram** *(axe doesn't flag this)* — the rendered diagram SVG was
  an opaque `graphics-document` with no name or description; assistive tech got nothing
  meaningful.
  > Fixed: added Mermaid `accTitle:` and `accDescr { ... }` directives to the diagram source
  > in `content/posts/hello-world.md`. Mermaid renders these into the SVG's `<title>`/`<desc>`
  > and wires up `aria-labelledby`. Documented as a convention for future diagrams in
  > `layouts/partials/CLAUDE.md`.

- [x] **Raw-URL link text** *(axe doesn't flag this)* — the SPIFFE post had two links whose
  visible text was the full URL (e.g. `https://docs.google.com/document/d/1Gjur…`), which
  screen readers read out character-by-character.
  > Fixed: changed to descriptive text — "Original design doc" and "Original presentation at
  > GlueCon" — in `content/posts/10-years-of-spiffe.md`.

---

## Already Good (verified, no change needed)

- `<html lang="en">` set on every page.
- Single `<h1>` per page and logical heading order (no skipped levels) across home, posts,
  about, and colophon.
- Exactly one `<main>` landmark per page.
- Search input has an `aria-label`.
- Theme-toggle button and code-copy buttons have accessible names.
- Color chips (colophon table + inline): the value is real text (announced); the swatch is
  an empty decorative `<span>` (ignored). The colophon table uses `<th scope>` correctly.
- Focus is visible site-wide — an on-brand teal `:focus-visible` outline (from the prior
  critique).

---

## Deferred / Optional

- **figure-pair alt vs. caption** — in the SPIFFE post the two logo images' `alt` text equals
  their visible `<figcaption>`, so a screen reader hears each description twice. Options:
  set `alt=""` (let the caption describe it) or write a distinct *visual* description in the
  alt. Minor; left to author preference.
- **`#top-link` outside a landmark** — PaperMod's floating "back to top" button sits outside
  any landmark, so axe flags one moderate `region` violation ("all page content should be
  contained by landmarks") on every page once you scroll. Site-wide template element, not
  tied to any post. Fix by wrapping/moving the button into a landmark. (Surfaced 2026-06-06
  while checking the "new 20% time" post.)

---

## Notes

- The favicon `ERR_CONNECTION_REFUSED` console errors seen during testing are a dev-only
  artifact: favicon `<link>` tags use absolute `localhost:1313` URLs the Docker-based
  browser can't reach. They resolve normally on production. Not an accessibility issue.
- axe was loaded from a CDN at audit time; it is **not** added to the site.
- The new copied-from-theme overrides (`baseof.html`, `header.html`, `post_nav_links.html`)
  are tracked in `layouts/partials/CLAUDE.md` — re-check them on PaperMod submodule updates.
