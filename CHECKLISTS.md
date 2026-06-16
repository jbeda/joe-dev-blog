# Checklists

Operational checklists for joe.dev. Referenced from [`CLAUDE.md`](CLAUDE.md).

Two flows are covered: **publishing a post** and **changing layout / templates / CSS**.
The full **mobile** and **accessibility** (axe-core) checks at the bottom are for **structural
changes** (layout / templates / CSS), not routine posts — see each flow below.

---

## Publishing a post

Before a new post goes live (merged to `main` / deployed):

- [ ] **Frontmatter complete** — `title`, `date`, `description`, `tags`, `showToc` as needed.
      Do **not** hand-edit `atUri` (Sequoia writes it).
- [ ] **Cover image generated** — `task cover POST=content/posts/<slug>.md`, then add
      `coverImage` + the cover block to frontmatter (see `CLAUDE.md` → Cover Images).
- [ ] **Cover uses the inline-table form** — write the cover as a one-line TOML inline table
      (`cover = { image = "…", alt = "…", hidden = true }`), **not** a `[cover]` section header.
      Sequoia's `publish` appends `atUri` at the end of the frontmatter; a `[cover]` header
      would swallow it into the table (`cover.atUri`), leaving top-level `atUri` empty so the
      recommend button silently disappears. The inline table has no open section, so the
      appended `atUri` stays top-level. See `CLAUDE.md` → Cover Images.
- [ ] **Cover alt text** written for a no-vision reader — include the post title and a
      description, not a filename or one-word label.
- [ ] **Prose voice check** — apply `voice-profile.md` + `writing-rules.md` and the
      five-point test (see user-level CLAUDE.md → Writing voice & style).
- [ ] **Links use descriptive text** — never a raw URL as the link text (screen readers
      read URLs character-by-character).
- [ ] **Images have full alt text** — describe what the image shows for a no-vision reader.
- [ ] **Mermaid diagrams** (if any) include `accTitle:` and `accDescr { … }` in the source
      (see `layouts/partials/CLAUDE.md`).
- [ ] **Social snippets drafted** — Bluesky + LinkedIn teasers in the post's notes file. Lead
      with the most surprising / most shareable line, not necessarily the thesis (see
      `CLAUDE.md` → Make it compelling).
- [ ] **Build passes** — `task build` (only the known PaperMod deprecation warnings).
- [ ] **Rebase before push** — `git rebase origin/main` (CI auto-commits to `main`).

> **Mobile + axe-core a11y are not part of routine post publishing** — too noisy for
> content-only changes. Reserve the full checks for layout / template / CSS work (next section).
> The content-level a11y items above (alt text, descriptive link text, Mermaid
> `accTitle`/`accDescr`) still apply to every post.

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

## Upgrading pinned tools (Hugo, Sequoia)

Build-affecting tools are **pinned to an explicit version** so deploys are reproducible and
breakage never arrives silently on a random deploy:

- **Hugo** — `hugo-version` in `.github/workflows/deploy.yml` (and `0.161.1` in `CLAUDE.md`).
- **Sequoia** — `bunx sequoia-cli@<version>` in **both** the publish and inject steps of
  `deploy.yml`. (Unpinned `bunx` auto-pulls latest — don't rely on that.)

Bumping a pin is a deliberate change, not automatic:

- [ ] Check the new version's changelog / release notes for **breaking changes**.
- [ ] Confirm config still validates — for Sequoia, check `sequoia.json` against the current
      schema (`https://tangled.org/stevedylan.dev/sequoia/raw/main/sequoia.schema.json`); for
      Hugo, watch for deprecated config keys / template APIs.
- [ ] Update the pinned version in `deploy.yml` **and** the matching reference in `CLAUDE.md`
      (CI/CD Pipeline section / Hugo version) so docs and pipeline agree.
- [ ] Let the deploy run and verify the published output (post records, injected link tags).

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

**When to write a dated audit doc.** Only for **infrastructure or design changes** —
layout / template / CSS work, brand or theme changes, tooling upgrades. Record those as a
dated doc in [`audits/`](audits/); see `audits/2026-06-01-accessibility-audit.md` for the
worked example and method. **Publishing a single post does not warrant an audit doc, and no
longer triggers the mobile + a11y run at all** — content-only changes are too noisy to gate on
it. Reserve both the `audits/` folder and the full checks for changes that affect the whole blog.
