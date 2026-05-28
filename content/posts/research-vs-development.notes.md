# Working notes: Research vs. Development post

Not rendered to the site. `*.notes.md` is excluded via `ignoreFiles` in `hugo.toml`.

## Status

Outline approved (pending final tweaks). Prose not yet drafted.

## Working title

Leaning **"The dangerous middle"**. Alternatives considered: "R&D is two jobs",
"What does good look like?". Open to leading with the R&D conflation in the title.

## Core throughline

R&D is really two different jobs. **Research's job is to figure out what "good"
looks like; development's job is to execute against a known "good."** Where and
how a coding agent helps changes dramatically depending on which one you're doing.

## Audience

Software professional interested in coding agents. Has used Claude Code a bit,
still learning where and how it works. Be technical; don't over-explain.

## Outline

1. **Open on the R&D conflation.** We say "R&D" as one word like it's one
   activity. It isn't. Research and development are different jobs with different
   rhythms. Most people reach for the same agent workflow for both; that's where
   it goes wrong. (Parallels the nine-kinds move: a familiar term smushing
   together things that behave differently.)

2. **Research: exploring the space to find what's good.** Iterating the idea
   space to find something interesting, then de-risking the parts that aren't
   proven. This is where **taste** lives, and taste doesn't fully automate. But
   the loop around the judgment can go fast: throw out lots of ideas cheaply,
   run experiments to kill unproven assumptions. The output of research isn't
   shipped code. It's knowing what "good" looks like (product or technical).

3. **Development: executing against a known good.** Target is legible, success
   is checkable, work decomposes. The comfortable, well-understood end.

4. **The factory wants the development end.** Describe the autonomous/dark-factory
   stack plainly: scenarios, satisfaction metrics, acceptance tests, agents
   writing + checking code with little per-line review. Lineage: Luke's origin
   essay, Shapiro's Level 5 (factory.strongdm.ai), Schillace's compounding teams.
   Unifying point: every mechanism encodes a definition of "good." The factory
   is a machine for converging on a target. It needs the target handed to it.
   Research produces the target.

5. **The dangerous middle.** Thinking you're in pure development ("it's just
   writing code now") when an unproven assumption is still sitting in the work.
   Two shapes: technology that isn't actually understood yet, or a product
   experience that hasn't been proven. Game-dev parallel: how do you write an
   acceptance test for *fun*? You can't. Fun is discovered through playtesting
   (research). Point a factory at a "fun" feature as if it were development and
   it ships something coherent that isn't fun, and it looks done. Coherence
   hides the missed question. Worse than a stall, because a stall is visible.

6. **Don't confuse the agent with the factory.** Interactive agents (human in
   loop) help across the whole spectrum, including research: fast way to iterate
   the idea space and stand up throwaway experiments. It's the autonomous stack
   that degrades toward research, not the agent. Conflating the two makes people
   over-trust the factory or dismiss agents wholesale.

7. **The boundary moves; decomposition is the real variable.** Iteration cost
   collapses, so today's research becomes tomorrow's development. What determines
   whether the factory can run isn't the research/development label, it's whether
   the work is decomposed into pieces with a checkable "good." A research problem
   broken into runnable experiments is more factory-able than a vague feature
   hiding an unproven assumption. Scarce skill: decomposition + knowing what good
   looks like, not typing code. Binding constraint shifts from "can we build it"
   to "what should we build."

8. **Close: practical takeaway + open question.** Before you point an agent loop
   at something, ask whether you actually know what good looks like here, or
   you're assuming it. If you can't write down the test, you're still doing
   research no matter what the ticket says. End on the shifted constraint as an
   open question.

## Source material

- Dan Shapiro (StrongDM) — Level 5 "dark factory" (factory.strongdm.ai).
- Sam Schillace (Microsoft) — compounding teams; decomposition as the binding
  constraint; the months-long below-the-line build curve; "models aren't
  trusted, acceptance tests are meaningful and constant."
- Luke PM — "The Software Factory" (Dec 2024). Origin of the metaphor;
  aspirational. Cite for lineage, not substance.
- Reference style: https://joe.dev/posts/nine-kinds-of-agents/
