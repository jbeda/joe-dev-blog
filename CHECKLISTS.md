# Checklists

Operational checklists for joe.dev. Referenced from [`CLAUDE.md`](CLAUDE.md).

Two flows are covered: **publishing a post** and **changing layout / templates / CSS**.
Both rely on the shared **mobile** and **accessibility** checks defined at the bottom — run
those the same way every time.

---

## Publishing a post

Before a new post goes live (merged to `main` / deployed):

- [ ] **Frontmatter complete** — `title`, `date`, `description`, `tags`, `showToc` as needed.
      Do **not** hand-edit `atUri` (Sequoia writes it).
- [ ] **Cover image generated** — `task cover POST=content/posts/<slug>.md`, then add
      `coverImage` + the `[cover]` block to frontmatter (see `CLAUDE.md` → Cover Images).
- [ ] **Cover alt text** written for a no-vision reader — include the post title and a
      description, not a filename or one-word label.
- [ ] **Prose voice check** — apply `voice-profile.md` + `writing-rules.md` and the
      five-point test (see user-level CLAUDE.md → Writing voice & style).
- [ ] **Links use descriptive text** — never a raw URL as the link text (screen readers
      read URLs character-by-character).
- [ ] **Images have full alt text** — describe what the image shows for a no-vision reader.
- [ ] **Mermaid diagrams** (if any) include `accTitle:` and `accDescr { … }` in the source
      (see `layouts/partials/CLAUDE.md`).
- [ ] **Mobile check** — run the mobile recipe below. New posts most often break on wide
      code blocks, tables, and side-by-side figures.
- [ ] **Accessibility check** — run the a11y recipe below. Expect **0 axe violations** and a
      sane heading order (single `<h1>`, no skipped levels).
- [ ] **Build passes** — `task build` (only the known PaperMod deprecation warnings).
- [ ] **Rebase before push** — `git rebase origin/main` (CI auto-commits to `main`).

---

## Layout / template / CSS changes

Whenever you touch `layouts/`, shortcodes, partials, or `assets/css/`:

- [ ] **Mobile check** — run the mobile recipe below at 375px **and** 320px. Confirm no
      horizontal page overflow and that the changed components reflow sensibly.
- [ ] **Accessibility check** — run the a11y recipe below on a representative page of each
      affected type (home / post / page). For any **new color**, verify contrast ≥ 4.5:1
      (≥ 3:1 for large text / UI). Confirm landmarks and labels are intact.
- [ ] **Light *and* dark mode** both checked — the code-block background is shared across
      modes, so token contrast must hold in both.
- [ ] **Copied-from-theme partial?** If you changed one (or added a new override), update the
      drift notes in `layouts/partials/CLAUDE.md` and the override list in `CLAUDE.md`.
- [ ] **Brand value changed?** Update `BRAND.md` **first**, then propagate to CSS /
      `graphics-gen` (see `CLAUDE.md` → Brand & Theme).
- [ ] **Build passes** — `task build`.

---

## How to run the checks

Both recipes use the dev server + the Playwright MCP server (Docker/ToolHive). The browser
**cannot reach `localhost`** — always use `http://host.docker.internal:1313`.

```bash
task dev   # serve on :1313 (binds 0.0.0.0 so the Docker browser can reach it)
```

### Mobile

1. Resize the Playwright viewport to **375×812**, then **320×700** (smallest common phone).
2. On each target page, check for horizontal overflow — fail if any element's right edge
   exceeds the viewport width, or `document.documentElement.scrollWidth > window.innerWidth`.
3. Confirm wide content is handled: code blocks scroll horizontally, tables fit or scroll in
   a wrapper, paired figures stack.

### Accessibility

1. Load **axe-core** into the page (injected from CDN at audit time — it is *not* shipped):
   `fetch` `https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js`, `eval` it,
   then `await axe.run(document, {resultTypes:['violations']})`. Target **0 violations**.
2. Manually verify what axe can't: heading order, descriptive link text, image alt text,
   diagram `accTitle`/`accDescr`, the skip link and landmark labels, visible focus.

Record substantive audits as a dated doc in [`audits/`](audits/) — see
`audits/2026-06-01-accessibility-audit.md` for the worked example and method.
