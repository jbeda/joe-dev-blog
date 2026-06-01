+++
date = '2026-05-29T00:00:00-07:00'
draft = true
title = "R&D is two jobs, and research doesn't run on autopilot"
description = 'Research figures out what good looks like. Development executes against a known good. Coding agents help with both, but the autonomous factory only does one, and the trap is the work in between.'
tags = ['AI', 'agents', 'engineering', 'strategy']
ShowToc = true
+++

We say "R&D" like it's one word for one activity. It isn't. Research and development are two different jobs with different rhythms, and a coding agent helps with each in a completely different way.

This matters because most people reach for the same workflow for both. You point an agent at a problem, give it a goal, and let it run. Sometimes that works beautifully. Sometimes it produces something that looks finished and is quietly wrong. Sometimes the agent misunderstands you and the workflow starts to thrash. The difference usually isn't the agent. It's whether you were doing research or development, and whether you knew which one.

This is similar to the analysis in my previous post, [I counted nine kinds of agents](https://joe.dev/posts/nine-kinds-of-agents/): take a familiar word that's smushing together things that behave differently, and pull them apart until the word gets useful again.

{{< figure src="/images/research-vs-development-spectrum.png" alt="Diagram titled 'R&D is two jobs', with the subtitle 'Research figures out what good looks like; development executes against a known good.' It maps a left-to-right spectrum. At the top, two bars show the reach of two kinds of AI tool: a bold, full-width teal bar reading 'Interactive agent (you in the loop): works across the whole spectrum', and below it a smaller, lighter teal bar covering only the right half, reading 'Autonomous factory: needs a known target.' Beneath the bars is the spectrum itself, drawn as a horizontal double-headed arrow with a pole at each end: on the left, 'Research: find what good looks like'; on the right, 'Development: execute against a known good.' The background gradient shifts from warm parchment on the research side to teal on the development side. A vertical amber marker line sits near the middle of the spectrum, annotated 'drifts left over time', and it lines up with the left edge of the factory bar above, showing the factory only operates to the right of that boundary. Hanging from that boundary is an amber warning box reading 'The dangerous middle: work that looks like development but hides an unproven assumption. Point the factory at it and it converges confidently on the wrong target. And it looks done.' The takeaway: an interactive agent helps everywhere on the spectrum, but the autonomous factory only works once you have a checkable target, and the danger is mistaking still-unproven research for development." >}}

## Two different jobs

Research is exploring a space to find out what "good" looks like.

You're iterating the idea space to find something worth building, then de-risking the parts that aren't proven yet. The product question (will anyone want this?) and the technical question (can this even work?) are both research. The output isn't shipped code. The output is knowledge: you now know what good looks like, where you didn't before.

This is where taste lives, and taste doesn't fully automate. A model can generate a hundred directions. It can't reliably tell you which of the hundred is the one worth pursuing, because that judgment is the whole point and it's grounded in context the model doesn't have. What a model can do is make the loop _around_ the judgment fast. Throw out bad ideas cheaply. Stand up a throwaway prototype to kill an assumption before you've spent a week on it. The judgment stays with you. Everything feeding the judgment gets faster. Often the act of research will change your understanding of the space and you'll modify your goal to reflect the new understanding.

Development is the opposite shape. The target is legible, success is checkable, and the work decomposes into pieces. You know what good looks like already: a spec, an interface to match, a test that should pass. Now you're executing against it. This is the comfortable, well-understood end, and it's where coding agents look most impressive, because the thing you'd otherwise spend hours typing is exactly the thing they're good at producing.

## The factory wants a target

Coding agents run on a spectrum, from interactive (you in the loop) to fully autonomous. There's a growing body of work on that autonomous end: no human reviewing each line, agents writing and checking code against an automated definition of done. It's worth understanding plainly, because it makes the research/development split concrete.

The metaphor started with Luke's ["The Software Factory"](https://lukepm.com/blog/the-software-factory/) in December 2024, written in the future tense as something that would arrive: teams of specialized agents producing software with humans out of the inner loop. Dan Shapiro turned the vibe into a taxonomy with ["The Five Levels: from Spicy Autocomplete to the Dark Factory"](https://www.danshapiro.com/blog/2026/01/the-five-levels-from-spicy-autocomplete-to-the-software-factory/), where Level 5 is the lights-out factory, code produced by robots that don't need anyone watching. StrongDM's [factory.strongdm.ai](https://factory.strongdm.ai/) is a concrete build of that idea: specs and scenarios drive agents that write code, run harnesses, and converge without human review. Their rules are blunt. "Code must not be written by humans." "Code must not be reviewed by humans." Steve Yegge's [Gas Town](https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04) is the rowdier take: swarms of agents running flat out under a human overseer, where plenty ships and some of it gets lost.

{{< pullquote >}}The factory is a machine for converging on a target.{{< /pullquote >}}

Sam Schillace, who created Google Docs and now leads the Amplifier project in Microsoft's Office of the CTO, is the most grounded voice here. In ["I have seen the compounding teams"](https://sundaylettersfromsam.substack.com/p/i-have-seen-the-compounding-teams) he reports what holds this kind of work together in practice: the models aren't trusted, so "acceptance tests are meaningful and constant," and problems "have to be broken down into solvable pieces." He's also honest about the cost. His Amplifier project took roughly six months of work before it was "only just now starting to be useful." Even at the aggressive end, the discipline is constant tests and decomposition with humans firmly in the loop. The factory is real, and it is not free.

Pull back and every one of these mechanisms is doing the same thing. A scenario, a satisfaction metric, an acceptance test: each one encodes a definition of "good" and then grinds toward it. **The factory is a machine for converging on a target.** It's very good at that. What it cannot do is invent the target. Someone has to hand it a definition of good, and producing that definition is research.

That's too absolute, strictly. In closed worlds, autonomous loops do invent targets: AlphaGo's move 37, or a reinforcement-learning system that finds a strategy no one specified. But those all optimize a ground-truth metric the search can trust: win the game, lower the loss. Most software is built for people, where the target is human judgment, not a number, and no metric you hand the factory is the real thing. That's the research the factory can't do.

## The dangerous middle

This is where it goes wrong: when you think you're doing development and you aren't.

You tell yourself it's just writing code now. The hard thinking is done. But an unproven assumption is still sitting in the work, and you've handed it to a machine whose entire job is to converge confidently on whatever target it's given. It takes two shapes. Either the technology isn't actually understood yet, or the product experience hasn't been proven with real users. In both cases there's an open research question wearing a development costume.

Game development makes this vivid. How do you write an acceptance test for _fun_? You can't. Fun isn't a property you can assert against. It's discovered through playtesting, which is research. Point a factory at a feature described as "fun" and treat it like development, and you'll get something coherent and complete and not fun. And it will look done.

And it isn't only soft domains. A distributed-systems change can pass every test and still rest on an unproven assumption about behavior under partition. Green tests, coherent code, wrong target.

That's the part that makes the middle dangerous. **Coherence hides the missed question.** A factory failure doesn't look like a factory failure. It looks like a finished feature. Compare that to a stall, where the agent gets stuck and you can see it got stuck. A stall is visible, so you go look. A confident wrong answer with passing tests is invisible until something downstream tells you the target was wrong all along. The factory did its job perfectly. The bug was in the conditions you set for the factory.

The defenses are the ones that don't trust the factory's own definition of done: hold back a check it never sees, or ask it to outline the assumptions it's making. Even then, nothing catches an assumption you didn't know you were making, which is why the real question is upstream: what here am I taking on faith? You can still use the factory even with open research questions. Just go in eyes open, and use it as a technique to help answer them, not as if they're already answered.

## The agent isn't the factory

It would be easy to read all of that as "agents are bad at research," and that's not the claim.

Keep two things separate: the interactive agent, and the autonomous factory. An interactive agent with you in the loop helps across the whole spectrum, research included. It's one of the fastest ways I know to iterate the idea space and stand up disposable experiments. The judgment stays with you; the agent makes the cycle around it cheap. It's the _autonomous_ stack, the one running without you, that degrades when you point it at unproven work. That's a property of removing the human, not a property of the model.

{{< pullquote >}}The better you know what good looks like, the longer the leash you can let out.{{< /pullquote >}}

The choice between interactive and factory isn't a switch. It's a dial for how much the agent runs before you look: sit in every loop and review each diff, approve a plan up front and check the result, oversee a swarm and skim what ships (roughly Gas Town), or let it run lights-out (StrongDM). Those are points on one line. How far you can safely go is set by the other spectrum: how well you know the target. The better you know what good looks like, the longer the leash you can let out. The dangerous middle is letting it out past what the target justifies.

Conflating the two leads to both common mistakes. Trust the factory too much and you ship coherent wrong answers. Dismiss agents wholesale because the factory burned you, and you give up the fast research loop that was the easiest win on the table. They're different tools. The factory needs a target. The interactive agent helps you find one.

## The boundary keeps moving

None of this boundary is fixed. It keeps moving, and mostly one way: as iteration cost collapses, today's research becomes tomorrow's development. A thing that needed a careful experiment last year is a known quantity this year, with a checkable definition of good, ready for the factory. The floor keeps rising, and the autonomy dial rises with it: as the target gets more known, the leash you can safely let out gets longer. A human still has to specify the target; the abstraction level they specify it at just climbs over time. So the research/development label was never the real variable. The real variable is decomposition: whether the work has been broken into pieces that each have a checkable "good." A genuine research problem that's been decomposed into runnable experiments is more factory-able than a vague feature that's hiding a single unproven assumption.

## Before you point an agent at it

So here's the practical version. Before you point an agent loop at something, ask: do I actually know what good looks like here, or am I assuming it? Rarely is a whole task one or the other. The useful version is per piece: which parts can I write a test for, and for the parts I can't, what's the unproven assumption I'm smuggling in? The testable pieces are development; hand them to the factory. The assumption is the research, and that part is still yours no matter what the ticket says. Point an autonomous loop at it and it just converges on the wrong thing faster.

What's left when the testable parts are handed off is uniquely human, and it's two things. Experience is the one that keeps you out of the dangerous middle. It's what lets you see around the corner to the soft spot in your own understanding, the assumption you're about to hand the factory as if it were settled. You don't reason your way to that. You've been burned by an assumption shaped like this one before, and the scar tissue fires before the tests do. Taste is the other. It's the intuition for where to steer the experiment: which of the hundred directions is worth pursuing, what "good" even means before anyone writes the test. The model can generate the hundred. It can't tell you which one, because that judgment runs on context it doesn't have.[^borrowed]

Decomposition you can teach, and the factory keeps eating more of it. Experience and taste are slower. They come from having shipped the wrong thing and felt it, and that's not a loop you can run a thousand times an hour. So as the boundary moves and the constraint shifts from "can we build it" to "what should we build," those are the two that compound. I don't think they automate away. But I've been wrong about the pace of this before.

[^borrowed]: The agent has a version of this, but it's borrowed from what it's seen, which is why it helps more in some problem spaces than others. A CRUD app over a database of recipes is a shape it has a million examples of, so it brings real "taste" to that for free. Something esoteric has no crowd to borrow from, and that's exactly the work that's still research, where your own experience has to carry it.
