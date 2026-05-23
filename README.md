# joe-dev-blog

Source for [joe.dev](https://joe.dev) — a personal blog built with Hugo, deployed
via Cloudflare Pages, with posts mirrored to the ATproto network (Bluesky) as
[standard.site](https://standard.site) documents via [Sequoia](https://sequoia.pub).

The repo is public so others can learn from the workflow and tooling setup.

## Licenses

**Workflow & infrastructure** (Hugo config, templates, layouts, scripts, Taskfile,
CI, CSS): [CC0 1.0 Universal](LICENSE) — public domain, use freely.

**Blog content** (`content/`): [CC BY-NC-ND 4.0](content/LICENSE) — you may share
with attribution, but no commercial use and no derivatives.

## Stack

- [Hugo](https://gohugo.io) static site generator (PaperMod theme)
- [Cloudflare Pages](https://pages.cloudflare.com) for hosting
- [Sequoia](https://sequoia.pub) for ATproto mirroring ([standard.site](https://standard.site) protocol)

## What is ATproto / standard.site mirroring?

[ATproto](https://atproto.com) is the open protocol underlying Bluesky. It's not
just a social network — it's a decentralized data layer where any application can
store and exchange structured records.

[standard.site](https://standard.site) is an open protocol built on ATproto for
publishing websites and blog posts. Each post gets a `site.standard.document` record
written to your ATproto Personal Data Server (PDS), making your content a first-class
citizen on the open social web — discoverable and linkable from Bluesky and any other
ATproto client.

[Sequoia](https://sequoia.pub) is the tool that handles this: it reads your Hugo
posts, publishes them as ATproto records, and injects the canonical `<link>` tag
into your built HTML so the connection between your website and the ATproto record
is machine-readable.

The net result: your blog post exists both at `https://joe.dev/posts/...` and as a
verifiable, portable record on the open social web — no platform lock-in.

You can browse the ATproto records for this blog directly at
[pdsls.dev](https://pdsls.dev/at://did:plc:vkn2vmcnsmlffrpwalvgybw5).

See [CLAUDE.md](CLAUDE.md) for full architecture notes and local tooling setup.
