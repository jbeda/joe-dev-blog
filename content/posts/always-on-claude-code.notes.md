# Notes: "An always-on home for Claude Code"

## Status (review pass 2026-07-23)
Ran 4-lens review (technical/Opus, security/Opus, contrarian/Sonnet, structure+voice/Sonnet).
Applied per Joe's decisions:
- Struck the "hotel wifi with Tailscale down" claim (was factually wrong; Joe: don't cover bridge-down failure modes).
- Clipboard write reframed from "safe" to "a commonly accepted risk"; cut the redundant recap sentence.
- Softened Tailscale "each time" -> "usually ... rather than routing through a relay."
- Fixed typos (conviences), banned word (streamline), double spaces; varied the symmetric clipboard openers; OSC read gating no longer says "over SSH."
- Added one line on NUC-vs-cloud (#10). Skipped alternative-survey adds (Remote Control/lemonade/mosh) per Joe: "not a survey of the space."
- Kept bash->zsh/Starship examples + the "two or three afternoons" framing (Joe's call: drives the point).
- Rewrote the ending (dropped chatbot "hopefully this gives you some ideas", significance inflation, streamline); moved a no-overpromise "hopefully it's useful to you" to the close; cut the opening hedge.
- Added 5 sparing bolds + 1 pull quote (AI-acceleration line) per Joe (#13). AWAITING Joe's eval of bolds + ending.

## Status
- 2026-07-23: First draft. `draft = true`. Cover not yet generated. Title is a working title.
- 2026-07-23: Security caveat added per Joe, after dotfiles commit 4eecef9
  ("authenticate the bridge with a shared token, fail closed"). A security review
  found the box's loopback is NOT a trust boundary (multi-user box). CORRECTED the
  post's earlier overclaim ("listener binds to loopback only / exposed surface is
  just those few validated actions") to: token auth + fail-closed, plus honest
  residuals (same-uid compromised agent holds the token; OSC 52 write bypasses the
  listener). Links to README#security for the full threat model. Kept tight per Joe
  ("don't belabor"). Note Joe's own clip-get "eyes open" line in the clipboard
  section is slightly duplicative now but is his edit; left as-is.
- 2026-07-23: Dry pass per Joe. Cut the engagement-lever framing: renamed the
  clipboard section from the "Copy is free, paste needs a tunnel" slogan to a plain
  "The clipboard is asymmetric," dropped the bolded landing line and the "one idea
  I'd keep" flourish, removed several one-sentence "X, not Y" contrasts, and dialed
  the open/close down. Register is now dry/technical: information transfer, not
  persuasion.

## Scope
This post covers availability: an always-on home for Claude Code (a spare NUC,
reached over Tailscale, sessions kept alive in tmux) and the SSH friction that
shows up when you live in it (browser, clipboard, colors, Shift-Enter, agent
auth, auto-heal). Theme Joe gave: "creating a Claude Code always-on experience."
Fleet/awareness tooling (tracking many agents at once) is intentionally out of
scope for this post.

## Spine
How I turned a spare NUC into an always-on home for Claude Code, and fixed
everything that breaks when you live in it over SSH.

- Featured insight (the standout, per brief): **copy is free, paste needs a
  tunnel.** OSC 52 write rides the terminal for free; clipboard *read* over SSH is
  gated as an exfiltration risk, so it needs the reverse tunnel.

## Cold open (Joe's framing, 2026-07-23)
About to board a plane, mid-session with Claude Code, didn't want to close the
laptop and kill the session. Spare NUC on the shelf. Plugged it in, made it home
for Claude Code. But over SSH things break. Tons of ways to solve this; here's how
I did it. Register: opinionated, not prescriptive.

## Section map
1. Cold open: the plane.
2. A box that never sleeps: NUC + Tailscale + tmux persistence = the always-on core.
3. Then you try to use it over SSH: the honest friction list.
4. A bridge back to the Mac: one reverse port, verb dispatcher (open / code / clip-image).
5. Copy is free, paste needs a tunnel: the asymmetry (featured).
6. The papercuts: tmux truecolor + CLAUDE_CODE_TMUX_TRUECOLOR, Shift-Enter/extended-keys, the ssh-agent hang.
7. Keeping it alive: autossh + launchd + keepalives (auto-heal, not immortality).
8. None of this is new: prior art + honest differentiator.
9. Close on an open thread.

## Title + subhead (DECIDED 2026-07-23)
- Title: "An always-on home for Claude Code"
- Subhead/description: "Running Claude Code on a spare NUC sounds simple, but the devil is in the details." (Joe's natural phrasing, kept deliberately.)

## Verified sources (all read in full 2026-07-23; cite primary, link public files)
Repo: github.com/jbeda/dotfiles (PUBLIC, default branch **master**). Link with
`/blob/master/<path>`.

- `darwin/mac-bridge/README.md` — the bridge writeup: port 17603, verb dispatcher,
  two-block SSH split, autossh/launchd persistence, security, OSC 52 asymmetry.
- `darwin/mac-bridge/dispatch` — inetd-style handler; 4 validated verbs
  (open http/https only; code + clip-image require alias+abspath; clip-get).
- `linux/bin/{browse,code-mac,paste-image,pbcopy,pbpaste}` — box-side senders.
  pbcopy = OSC 52 (`ESC ] 52 ; c ; <b64> BEL`); pbpaste = clip-get over bridge.
- `linux/source/50_mac_bridge.sh` — MAC_BRIDGE_PORT=17603, remaps open/xdg-open/$BROWSER under SSH.
- `linux/source/50_ssh_agent.sh` — stable SSH_AUTH_SOCK symlink; `timeout 2` on
  every ssh-add probe (the hang-after-roam fix). Commit efd565e.
- `link/.tmux.conf` — Ctrl-Space prefix, truecolor (terminal-features RGB +
  COLORTERM truecolor + CLAUDE_CODE_TMUX_TRUECOLOR 1, anthropics/claude-code#46146),
  extended-keys on (Shift-Enter), set-clipboard on, resurrect+continuum (vendored
  submodules), C-Spc i image paste.
- `darwin/source/50_cplan.sh` — cplan: interactive login so the agent symlink
  repoints; ServerAlive; term-sane reset (commit e7de77c).

Box facts (from brief): repurposed Intel NUC 11 (i7-1165G7, 4c/8t, 32 GB),
Debian 13 (trixie, kernel 6.12 — matches `uname` on the box), reachable over
Tailscale. Hostname `claudes-plan`.

## Prior art to cite (verified in brief §5)
- OSC 52 write is standard: pbcopy-sh (github.com/mikepqr/pbcopy-sh), vim OSC52
  (jvns.ca/til/vim-osc52), tmux set-clipboard.
- Reverse-tunnel clipboard read-back: Clipper (github.com/wincent/clipper) is the
  canonical one; Carlos Becker "Using open, pbcopy and pbpaste over SSH"
  (carlosbecker.com) is the closest prior art (open+pbcopy+pbpaste over one tunnel,
  but no image paste, no VS Code verb, no autossh/Tailscale persistence).
- Native OSC 52 request in Claude Code: anthropics/claude-code#20974 — verified
  2026-07-23, CLOSED as not planned (title "Support OSC 52 for clipboard operations
  over SSH"). Do NOT call it "open." Carlos Becker URL verified:
  carlosbecker.com/posts/pbcopy-pbpaste-open-ssh/ (uses netcat over RemoteForward).
- Differentiator to state plainly: nobody bundles all the verbs behind one
  persistent, sleep/roam-hardened dispatcher, and the write=OSC52 / read=tunnel
  split is cleaner than the prior art. Each piece is old; the assembly + operational
  hardening is the contribution. (Honesty rule: no sole-inventor framing.)

## Parking lot (cut from this post)
- The cheat sheets: now USED in the "dotfiles behind all this" section (2026-07-23,
  per Joe) alongside the "Claude makes tweaking dotfiles cheap" point (dotfiles since
  2013; bash to zsh; Starship prompt). tmux muscle-memory-gone + Claude-made-cheatsheet.
- Per-host Starship hostname color (commit 29925b2): parked, out of scope for this post.
- kind/docker + completion work: unrelated, ignore.

## Social teasers (2026-07-23; Joe may or may not use)
Link: https://joe.dev/posts/always-on-claude-code/

**Bluesky (primary, friction hook, ~270 chars):**
I moved Claude Code onto a spare NUC so closing my laptop doesn't kill a running
session. The interesting part was everything that quietly breaks over SSH: no
browser, a trapped clipboard, muted colors, a hung ssh-agent. Wrote up how I
fixed each. https://joe.dev/posts/always-on-claude-code/

**Bluesky (alt, technical hook, CHECK length vs 300 before posting):**
Copying from a headless box to my Mac clipboard is free: OSC 52 rides the
terminal. Reading it back needs a reverse SSH tunnel, since terminals treat
clipboard reads as an exfiltration risk. One piece of running Claude Code on an
always-on box: https://joe.dev/posts/always-on-claude-code/

**LinkedIn (plane story, narrative):**
I was about to board a flight with Claude Code mid-task, and didn't want to close
my laptop and lose the session.

So I turned a spare NUC into an always-on home for it: reachable from anywhere
over Tailscale, with sessions kept alive in tmux. The catch was the pile of things
that quietly break when you live over SSH: opening a browser, sharing the
clipboard, pasting a screenshot, even terminal colors. I wrote up how I worked
through each, and tipped my hat to the prior art it builds on.

https://joe.dev/posts/always-on-claude-code/

## Pre-publish checklist
- [x] Final title + subhead
- [x] Five-point writing test + dash sweep (no em/en dashes)
- [x] Cover image + inline-table `cover = { ... }` frontmatter (og:image/twitter verified in prod build)
- [x] Social teasers drafted
- [x] Multi-perspective review (4 lenses, findings folded)
- [ ] Update `date` in frontmatter to the actual ship day (drafted over multiple days)
- [ ] `git rebase origin/main` before push; flip `draft = false`; commit cover PNG + sidecar with the post
