+++
title = "Colophon"
description = "How this site is built, themed, and published."
date = "2026-05-23"
showToc = true
+++

## Source & hosting

The source for this site is on [GitHub](https://github.com/jbeda/joe-dev-blog) and
published under a dual license: workflow and infrastructure are
[CC0 (public domain)](https://github.com/jbeda/joe-dev-blog/blob/main/LICENSE);
blog content is [CC BY-NC-ND 4.0](https://github.com/jbeda/joe-dev-blog/blob/main/content/LICENSE).

The site is built with [Hugo](https://gohugo.io) using the
[PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme, and deployed via
[Cloudflare Pages](https://pages.cloudflare.com).

## ATproto & standard.site

Every post on this site is also published as a record on the
[ATproto](https://atproto.com) network — the open protocol that powers
[Bluesky](https://bsky.app). ATproto isn't just a social network; it's a
decentralized data layer where any application can store and exchange structured
records.

[standard.site](https://standard.site) is an open protocol built on ATproto for
publishing websites and blog posts. Each post gets a `site.standard.document` record
written to my Personal Data Server (PDS), making it a first-class citizen on the open
social web — discoverable and linkable from Bluesky and any ATproto-aware client.

[Sequoia](https://sequoia.pub) handles the publishing: it reads Hugo posts, writes the
ATproto records, and injects a canonical `<link>` tag into the built HTML so the
connection between the website and the ATproto record is machine-readable.

The net result: each post exists at `https://joe.dev/posts/...` *and* as a verifiable,
portable record on the open social web — no platform lock-in.

Browse my ATproto records directly at
[pdsls.dev](https://pdsls.dev/at://did:plc:vkn2vmcnsmlffrpwalvgybw5).

## Branding & theme

The visual design uses a warm off-white palette with teal accents, with a near-black dark mode.

### Typefaces

{{< font-sample family="'Cormorant', serif" size="2rem" weight="600" sample="Cormorant Semi Bold" role="Headings & site logo" url="https://fonts.google.com/specimen/Cormorant" >}}
{{< font-sample family="'Nunito', sans-serif" size="1.1rem" weight="300" sample="Nunito Light — the quick brown fox jumps over the lazy dog" role="Body text (300 Light, 600 Semi Bold for emphasis)" url="https://fonts.google.com/specimen/Nunito" >}}
{{< font-sample family="'Space Mono', monospace" size="0.9rem" weight="400" sample="Space Mono — fmt.Println(\"hello, world\")" role="Inline & block code" url="https://fonts.google.com/specimen/Space+Mono" >}}

### Colors

{{< color-swatch role="Page background"  light="#F5F1EB"        dark="rgb(24,21,17)"    >}}
{{< color-swatch role="Teal accent"      light="#0D9488"        dark="#2DD4BF"          >}}
{{< color-swatch role="Primary text"     light="#1F1F1F"        dark="rgb(196,196,197)" >}}
{{< color-swatch role="Secondary text"   light="#6C6C6C"        dark="rgb(155,156,157)" >}}
{{< color-swatch role="Border"           light="#E8E4DE"        dark="rgb(60,54,44)"    >}}
{{< color-swatch role="Code block bg"    light="rgb(42,38,32)"  dark="rgb(42,38,32)"    >}}

### Favicon

{{< favicon-sample >}}

White **J** (Cormorant Semi Bold) on deep teal `#0F766E`, rounded square with ~12% corner radius and +7% optical lift.
