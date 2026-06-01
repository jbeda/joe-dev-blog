# layouts/partials — Claude Notes

## Mermaid Implementation

The Mermaid script lives in `extend_head.html` (NOT `extend_footer.html`).

**Why:** PaperMod's `baseof.html` calls `partialCached "footer.html"`, which caches the footer
across all posts of the same kind — changes to `extend_footer.html` don't reliably propagate.
`extend_head.html` is called via plain `partial` (uncached) so it always executes fresh.

The script uses dynamic `import()` and only fetches Mermaid when a `.mermaid` div is present:
```html
<script type="module">
  if (document.querySelector('.mermaid')) {
    const { default: mermaid } = await import('https://cdn.jsdelivr.net/npm/mermaid@11/...');
    ...
    mermaid.run();
  }
</script>
```

Mermaid theme variables live in `BRAND.md`.

**Accessibility:** every Mermaid diagram should declare `accTitle:` and `accDescr { ... }`
in its source. Mermaid renders these into the SVG's `<title>`/`<desc>` and wires up
`aria-labelledby`, giving screen readers a name and description for the diagram. Without
them the SVG is an unlabeled `graphics-document` — opaque to assistive tech. See the
diagram in `content/posts/hello-world.md` for the pattern.

---

## Copied-partial Drift Notes

These files are full copies of PaperMod partials that do not receive upstream updates automatically.
**On each `git submodule update` for PaperMod, diff these against their originals.**

### `layouts/baseof.html`
Original: `themes/PaperMod/layouts/baseof.html`

Accessibility changes:
- Added a `.skip-link` ("Skip to main content") as the first focusable element in `<body>`.
- Added `id="main" tabindex="-1"` to `<main>` so the skip link has a focusable target.

Everything else is unchanged. Watch for upstream changes to the `<head>`/`<body>`/`block "main"` structure.

### `layouts/partials/header.html`
Original: `themes/PaperMod/layouts/_partials/header.html`

Accessibility changes:
- Added `aria-label="Main"` to `<nav class="header-nav">` (landmark uniqueness — the post
  pagination nav is a second `navigation` landmark; both need distinct names).
- Removed `aria-label="logo"` from the logo `<img>` (both branches). The image is decorative
  (`alt=""`); the surrounding link is already named by its "joe.dev" text, so the empty alt +
  aria-label was a presentation-role conflict.

### `layouts/partials/post_nav_links.html`
Original: `themes/PaperMod/layouts/_partials/post_nav_links.html`

Only change: added `aria-label="More posts"` to `<nav class="paginav">` (landmark uniqueness, paired with the header nav label above).

### `layouts/partials/footer.html`
Original: `themes/PaperMod/layouts/_partials/footer.html`

Only change: replaced the "Powered by Hugo & PaperMod" `<span>` with `<span><a href="/colophon/">Colophon</a></span>`.

The bulk of the file (scroll-position JS, anchor-click smoothing, theme-toggle JS, code-copy button JS) is unchanged. Watch for upstream changes to those scripts.

### `layouts/partials/share_icons.html`
Original: `themes/PaperMod/layouts/_partials/share_icons.html`

Changes from upstream:
- Added `<li><span class="share-label">Share:</span></li>` header
- Added Bluesky share button (first in list; upstream doesn't have it)
- Removed Facebook, WhatsApp, Telegram, YCombinator buttons
- Button order: Bluesky → LinkedIn → Reddit → Email → X/Twitter
- X/Twitter SVG uses the **old bird icon** rather than upstream's new X square logo
- Removed hashtags scratch logic (upstream computes `#hashtags` for the tweet URL; ours omits them)

When upstream adds new social buttons, evaluate whether they belong in `ShareButtons` in `hugo.toml`.

### `layouts/partials/templates/schema_json.html`
Original: `themes/PaperMod/layouts/_partials/templates/schema_json.html`

Changes from upstream:
- Home page: emits `Person` schema instead of `Organization` (personal blog)
- About page (`layout="about"`): emits `ProfilePage` + `Person` `mainEntity` instead of `BlogPosting`
- BlogPosting `publisher`: `Person` instead of `Organization`
- `sameAs` links on Person schemas pull from `params.socialIcons` in `hugo.toml`
