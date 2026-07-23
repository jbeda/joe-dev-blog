+++
date = '2026-07-23T00:00:00-07:00'
draft = false
title = 'An always-on home for Claude Code'
description = "Running Claude Code on a spare NUC sounds simple, but the devil is in the details."
tags = ['AI', 'agents', 'Claude Code', 'ssh', 'tmux', 'dotfiles']
ShowToc = true
coverImage = "static/covers/always-on-claude-code.png"
cover = { image = "/covers/always-on-claude-code.png", alt = "Cover image for the post \"An always-on home for Claude Code\" on a cream parchment background. The title is set in a large black serif typeface with a short teal underline beneath it, above the subtitle \"Running Claude Code on a spare NUC sounds simple, but the devil is in the details.\" A teal rounded square containing a white letter J sits at the lower right, labeled joe.dev / Joe Beda.", hidden = true }
atUri = "at://did:plc:vkn2vmcnsmlffrpwalvgybw5/site.standard.document/3mrdt6k6wik2x"
+++

I was about to get on a plane with Claude Code mid-session on my laptop, an agent halfway through a change I didn't want to lose. Closing the lid would suspend the session.

I had a spare Intel NUC on a shelf from another project, so I (well, my 17yo daughter) put Debian on it and made it the machine where Claude Code runs. The work now lives on a box that stays on. I attach from my laptop, detach when I board, and reattach from the hotel with the session still running. This is how I set that up, and what broke along the way.

## The always-on box

The box is `claudes-plan`, a repurposed [Intel NUC 11](https://en.wikipedia.org/wiki/Next_Unit_of_Computing) (a 4-core i7, 32 GB of RAM) running Debian 13. It sits on a shelf and does one job: hold long-running Claude Code sessions I can reach from anywhere. I used hardware I already had rather than a cloud VM, which also keeps the agent's access to my repos and keys on a machine I own.

My side is a Mac, with [Ghostty](https://ghostty.org) as the terminal. I use Ghostty everywhere, so I'm comfortable baking in terminal-specific settings that assume it. That matters for the color and key fixes below: I'm willing to hardcode things like `CLAUDE_CODE_TMUX_TRUECOLOR` because I know exactly what my terminal supports.

Two things make it "always on." The first is [Tailscale](https://tailscale.com/), so the box has one name that resolves and routes on every network I roam to. Home wifi, a coffee shop, the hotel: `ssh claudes-plan` finds it and usually gets a direct peer-to-peer path rather than routing through a relay. A home-only DNS name would just fail to reconnect the moment I left the house.

The second is [tmux](https://github.com/tmux/tmux). Claude Code runs inside a tmux session on the box, so the session is decoupled from my connection to it. Close the laptop and the SSH link dies, but the session on the box keeps running. Open the laptop somewhere else, reattach, and the agent is exactly where I left it. That decoupling is the point: **the work happens on the box, and my laptop is just a window onto it**.

That part is easy. The friction starts when you use it over SSH.

## What breaks over SSH

A local dev setup quietly assumes the machine you're typing on is the machine with your screen, your clipboard, and your browser. Move the work to a headless box and every one of those assumptions breaks:

- The agent wants to open a URL. There's no browser on the box, and `xdg-open` has nothing to talk to.
- You copy a command off a webpage on your Mac and it's stranded there. You can paste in via your terminal but you don't get CLI conveniences like `pbcopy` and `pbpaste`.
- A screenshot you want to hand to Claude Code is on the Mac. The box is text-only.
- Your terminal colors go muted, and Shift-Enter stops doing what it does locally.
- After you sleep the laptop and move networks, the next command that needs your SSH key hangs forever.

Each of these has a dozen possible fixes. Here are the ones I settled on.

## A bridge back to the Mac

Most of the friction is really one problem: things on the box need to reach my Mac. So I gave the box exactly one channel back. A single reverse-forwarded port (randomly picked port: 17603) carries one `verb<TAB>args` line to a small listener on the Mac, which reads the verb and runs the matching command. The whole thing is a plain [`dispatch` script](https://github.com/jbeda/dotfiles/blob/master/darwin/mac-bridge/dispatch) behind an inetd-style [launchd](https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/CreatingLaunchdJobs.html) job, so it stays readable instead of being crammed into a plist.

Three verbs cover most of what I need:

- [`browse <url>`](https://github.com/jbeda/dotfiles/blob/master/linux/bin/browse) opens a URL in the Mac's browser. I also point `$BROWSER` at it and alias `open`/`xdg-open` to it while I'm in an SSH session, so `gh`, `python -m webbrowser`, and anything else that wants a browser just work.
- [`code-mac`](https://github.com/jbeda/dotfiles/blob/master/linux/bin/code-mac) opens VS Code on the Mac attached to a directory on the box, via `code --remote`. The bridge is only the trigger here. The Mac then makes its own SSH connection back to the box, the same one I log in with.
- [`paste-image`](https://github.com/jbeda/dotfiles/blob/master/linux/bin/paste-image) grabs the image on the Mac's clipboard, copies it to the box, and prints the path. I bound it to `Ctrl-Space i` in tmux, so it types the path straight into whatever pane I'm in. Copy a screenshot on the Mac, press `Ctrl-Space i` at a Claude Code prompt, and the path lands there ready to send. Claude Code reads an image from a plain file path, so that's all it takes.

Each verb validates its arguments before running anything: `open` only accepts `http`/`https`, and the VS Code and image verbs require a real ssh alias and a safe absolute path. **The port itself is not a trust boundary**, though. The tunnel lands on the box's loopback, which on a shared machine is reachable by every local user and process there, including agents running on the box. So each request also carries a shared-secret token, and the dispatcher fails closed without it.

There are still real tradeoffs here. An agent compromised while running as me on the box holds the same token and can drive every verb, and the OSC 52 write path means text rendered in a pane can quietly set my Mac clipboard. I wrote up the [full threat model and residuals](https://github.com/jbeda/dotfiles/blob/master/darwin/mac-bridge/README.md#security); read it before copying any of this.

## The clipboard is asymmetric

Clipboard text works differently in each direction, and the difference comes from how terminals treat SSH.

Writing to the Mac clipboard from the box needs no bridge. `pbcopy` on the box emits an OSC 52 escape sequence, `ESC ] 52 ; c ; <base64> BEL`, straight to the terminal. tmux has `set-clipboard on`, so it catches the sequence and forwards it, and the terminal writes my Mac's system clipboard.

Getting it back the other way needs the bridge. OSC 52 can read as well as write, but terminals gate clipboard *reads*, because **a program silently reading your clipboard is an exfiltration risk**. So `pbpaste` on the box uses a `clip-get` verb that runs the real `pbpaste` on the Mac and pipes the text back over the reverse tunnel.

Writing the clipboard that way is a commonly accepted risk. Allowing the read back through the tunnel is the sharper tradeoff, but one I'm making eyes open.

## The papercuts

Three things broke in ways that took time to understand.

Colors went muted. Inside tmux over SSH, `TERM` is `tmux-256color` and SSH doesn't forward `COLORTERM`, so anything checking color depth (including the library Claude Code uses) falls back to 256 colors and quantizes the 24-bit status line to the nearest palette entry. The fix is three assertions in [`.tmux.conf`](https://github.com/jbeda/dotfiles/blob/master/link/.tmux.conf): tell tmux the outer terminal can do `RGB`, set `COLORTERM truecolor` for programs inside tmux, and set `CLAUDE_CODE_TMUX_TRUECOLOR 1`. That last one exists because Claude Code deliberately downgrades to 256 colors whenever `$TMUX` is set, as a guard against misconfigured tmux, unless you opt out ([anthropics/claude-code#46146](https://github.com/anthropics/claude-code/issues/46146)). I opt out because I know Ghostty and my tmux config pass 24-bit color through cleanly. On a terminal you're less sure of, it's safer to leave the downgrade in place.

Shift-Enter stopped submitting. By default tmux collapses modified keys like Shift-Enter back to plain Enter, so Claude Code can't tell "newline" from "submit." Turning on `extended-keys` in tmux (and telling it the terminal can carry them) forwards the real key sequence through.

The one that took an afternoon to pin down was SSH agent auth. I forward my key with `ssh -A`, but the forwarded socket lives at a per-connection path that dies when the connection drops. So I keep a [stable symlink](https://github.com/jbeda/dotfiles/blob/master/linux/source/50_ssh_agent.sh) that every tmux pane points at, and repoint it at the freshest live socket on each login. The subtle bug: **a forwarded socket whose SSH connection has died still accepts connections, it just never answers**. So a plain `ssh-add -l` after a network roam blocks forever, which hung every new shell I opened. The fix was to wrap every probe in `timeout 2` and treat a timeout as "no agent here."

## Keeping it alive

A laptop that sleeps and changes networks will drop its SSH connections. Nothing keeps a single TCP session alive across a multi-hour sleep and an IP change, so the goal isn't an immortal connection. **It's auto-heal: every piece re-establishes itself instead of needing me to clean up stale state by hand**.

The bridge tunnel runs under [autossh](https://www.harding.motd.ca/autossh/) inside a launchd job. autossh restarts the inner SSH when keepalive probes find it dead, and launchd restarts autossh if it ever exits, so port 17603 is forwarded whenever the Mac can reach the box. Keepalives on both ends (on the Mac, and in `sshd_config` on the box) declare a dead session dead in about a minute. That's what stops a sleep from leaving an orphaned VS Code server or a stale connection squatting on the port, the failure mode where the terminal works but the bridge doesn't. tmux handles the rest: the session was never tied to the connection, so I just reattach.

One command ties it together. [`cplan`](https://github.com/jbeda/dotfiles/blob/master/darwin/source/50_cplan.sh) connects to the box and drops me into the `main` tmux session in one step, over an interactive login so the agent symlink gets repointed. It also resets the terminal on both sides, because a connection that drops mid-tmux can leave mouse-tracking on and your local terminal spewing escape junk.

## The dotfiles behind all this

{{< pullquote >}}A cleanup I'd have put off for months is now a quick conversation.{{< /pullquote >}}

I've kept my [dotfiles](https://github.com/jbeda/dotfiles) in one repo since 2013, adding to them a machine and a job at a time. Almost everything above lives there. What's changed lately is how cheap they are to edit. A cleanup I'd have put off for months is now a quick conversation: moving my shell from bash to zsh, or switching my prompt over to [Starship](https://starship.rs/). I say what I want, Claude makes the change across the files it touches, and I read the diff.

That is also what made this project approachable. It's a lot of new tools at once, and I hadn't used tmux in years, so the muscle memory was gone. Claude wrote me a [tmux cheatsheet](https://github.com/jbeda/dotfiles/blob/master/docs/tmux-cheatsheet.md) (and a broader [terminal one](https://github.com/jbeda/dotfiles/blob/master/docs/terminal-cheatsheet.md)) tuned to my own bindings, marking which are mine and which are stock. It's been working well while the prefix keys get back into my fingers.

## None of this is new

Every piece here has prior art. OSC 52 clipboard writes are a well-worn trick ([pbcopy-sh](https://github.com/mikepqr/pbcopy-sh), [vim's OSC 52 support](https://jvns.ca/til/vim-osc52/)). Reading the clipboard back over a reverse tunnel is exactly what [Clipper](https://github.com/wincent/clipper) has done for years. The closest prior art to the whole bridge is Carlos Becker's ["Using open, pbcopy and pbpaste over SSH"](https://carlosbecker.com/posts/pbcopy-pbpaste-open-ssh/), which does open plus clipboard over one reverse tunnel. Someone even [asked Claude Code to do OSC 52 natively](https://github.com/anthropics/claude-code/issues/20974); it was closed as not planned, so for now the bridge stays.

As is often the case, the legos are all there; the trick is knowing how to put them together. What would have taken me two or three afternoons of fiddling, I did on the side while Claude made the edits. Rare, fiddly config work is exactly where that speed-up shows up most. Hopefully it's useful to you.