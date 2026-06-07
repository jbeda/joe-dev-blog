# Working notes: The new 20% time

Not rendered to the site (`*.notes.md` excluded via `ignoreFiles` in hugo.toml).

## Status (2026-06-07)

Cut to a sharp ~6-min post (~1,370 words) on a single spine. The money/tokens thread,
the transparency thread, and the deeper creative-fields treatment were spun out to separate
post ideas (CoWork `WORK AREAS/Marketing/blog-ideas-project/`). Still `draft = true`.
Remaining work: see checklist.

## Spine

20% time was an optimistic bet about giving people room to explore. AI is making that bet
again, but only for some, and the open question is **who benefits** (who captures the gains).
The hours -> attention shift is the supporting mechanism. Tokens get a one-line nod, not a
section.

## Section map (as shipped)

1. **Intro** (no heading) — the 2005 post ("a result, not a cause"); optimism + 20% as a lens
   for reading the AI moment; ends on "Who benefits?"
2. **A day a week was never the point** — it was the culture, not the day; 20% died because
   the company got good at measuring output ("120% time").
3. **What's actually scarce** — define "side project" (the speculative end of the job); clay
   analogy; juggling agents; attention is the bottleneck; brain fry vs burnout; "20% of what?"
4. **Who collects the dividend** — creative-fields caveat (the optimism isn't on offer to
   everyone; for artists it reads as destruction); who captures the dividend; ends on
   "I want this one to break the pattern. I can't, with a straight face, say it will."

## Governing decisions

- Tone: genuinely two-sided; verdict stays open.
- "side project" = the speculative/exploratory end of the job itself, not something unrelated.
  Defined early.
- Creative-fields caveat: accelerate (devs) vs replace (artists); one paragraph, left
  unresolved. Deeper treatment lives in the "Coding with AI feels like flying" idea.
- Old 2005 post: footnote about maybe migrating eightypercent.net; both its body links are dead
  (link rot). Don't break the old post's URL if migrating.
- Pullquotes (2): "It isn't burnout. Brain fry is almost the reverse." /
  "Fifty years of productivity gains have accrued to the top, not those doing the work."

## Verified sources (claims still in the post)

- **2005 post** (primary, Joe's own): https://www.eightypercent.net/post/old/00235.html
  Key quote used: "a result of an environment and philosophy to development more than a cause."
- **Google 20% -> "120% time"** (Page "more wood behind fewer arrows," Labs shut ~2011-13):
  https://www.huffpost.com/entry/google-20-percent-time_n_3768586
- **Gmail myth** (Buchheit says it wasn't a 20% project) — footnote.
- **NotebookLM / Project Tailwind** (revived Google Labs) — footnote:
  https://www.latent.space/p/notebooklm
- **"AI brain fry"** (HBR, 2026-03): https://hbr.org/2026/03/when-using-ai-leads-to-brain-fry
- **Attention residue** — Sophie Leroy (2009), primary cite (not the blogs):
  https://ideas.repec.org/a/eee/jobhdp/v109y2009i2p168-181.html

## Pre-publish checklist

NOTE: cover, expert review, and the writing test were all redone on the cut version (marked
below). Joe waived the mobile + axe-core a11y re-check for this round (2026-06-07).

- [x] Five-point writing test (2026-06-07): mechanical clean (no dashes / curly quotes / banned
      words); fixed a stray period after "Who benefits?"; one optional "But"-rhythm nit in the
      close left to Joe.
- [x] Writing test re-run on the new opening (2026-06-08) after the "promise vs room" / hours->
      attention clarification was added to paras 1-2: clean. One intentional inline "X, not Y"
      left in place ("the promise is back, not the room itself") as the load-bearing thesis pivot.
- [x] Cover alt rewritten for accessibility (2026-06-08): now describes the full image (layout,
      colors, monogram) rather than just repeating title + description. Image itself unchanged.
- [x] Multi-lens expert review incl. AI-skeptic lens (2026-06-07). Folded in: named the
      120%-time inversion, hedged the productivity claim ("at least for me"), full artist-
      solidarity move, fixed the bridge seam, strengthened the Leroy footnote.
- [x] Cover regenerated (2026-06-07) for the new title/description; renders cleanly.
- [x] Tags finalized (2026-06-07): AI, agents, 20% time, Google, culture (added `agents`,
      dropped `management`).
- [x] Social teasers rewritten to the new spine (2026-06-07, below); tune voice before posting.
- [ ] Update the article `date` (frontmatter) to the actual publish date before flipping draft.
- [ ] `hugo list all | grep notes` => 0 matches (notes excluded).
- [ ] `git rebase origin/main` before push (CI writes back to main).
- [ ] Flip `draft = false`.

## Social teasers (rewritten 2026-06-07; tune voice before posting)

Honesty-forward, with brain fry as the trending hook. The Bluesky one is personal per Joe:
this was hard to write because he had to get honest with himself.

**Bluesky (under ~300 chars + link):**
> I meant to write a hopeful post: AI quietly brought back Google's 20% time. Writing it forced
> me to be honest. The scarce thing isn't hours now, it's attention ("brain fry" is real), and
> the optimism I felt isn't on offer to everyone. So who actually benefits? [link]

**LinkedIn (longer):**
> Twenty years ago, a few weeks into my job at Google, I wrote about 20% time. I went back to it
> because the instinct behind it, room to explore, is quietly back as a side effect of AI.
>
> I meant to write something hopeful. Writing it honestly took me somewhere harder.
>
> The scarce thing isn't hours anymore. When an agent does the typing, what runs out is your
> attention, and there's a name for it now: AI brain fry. And the room I'm getting to explore?
> The same tools were trained on the work of illustrators, voice actors, and writers who are
> watching their livelihoods taken. My dividend may be built on what was taken from them.
>
> So I won't tell you AI is handing everyone more room to do their best work. It handed me some.
> Who actually benefits is the question I couldn't answer, and wouldn't pretend to.
>
> [link]
