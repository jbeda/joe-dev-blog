+++
date = '2026-05-26T00:00:00-07:00'
draft = true
title = 'I counted nine kinds of agents'
description = 'The word "agent" is doing too much work. A rough map helps.'
tags = ['AI', 'agents', 'infrastructure', 'strategy']
ShowToc = false
+++

The term "Agent" is background noise in the AI world. Everyone uses it with the easy confidence of someone discussing an obvious thing. I nodded along. I constructed my own working definition, kept going, and assumed I'd sharpen it over time.

But as an infra engineer, lack of concrete definition is hard to stomach. In my experience, when a word means everything, it usually means nothing, and that ambiguity has a way of biting you later.

As often happens in a fast moving space with a lot of heat, two people can use the word in the same meeting and clearly mean different things. I saw this happen and nobody flagged it. The conversation continued. Both parties walked away having agreed on something, though I wasn't sure what.

So I started asking (Claude).

---

*"What does agentic mean?"* Agentic, it turns out, means agent-y. It's the adjective form of a noun that I still couldn't define. Not helpful.

*"What is an agent, exactly?"*

I expected a clean definition with maybe some nuance at the edges. What I got was: it depends.

"It depends" is the real answer, and once you understand why, the word becomes a lot more useful.

"Agent" is being applied to things that are genuinely different from each other. Different architectures, different failure modes, different infrastructure requirements, different buyers. They share an LLM somewhere in the execution path, and some degree of model-driven decision-making that shapes subsequent steps. That's about it. I like [Simon Willison's definition](https://simonwillison.net/2025/Sep/18/agents/): "an LLM agent runs tools in a loop to achieve a goal." But that still leaves a lot of room for people to talk past each other.

To make sense of the space I found it useful to draw a rough map. Two axes: how much autonomy the agent has, and who it's built for.

The autonomy axis runs from **autocomplete** (reactive, inline, sub-second response) to **chat** (you prompt, it responds, you go back and forth) to **fully autonomous** (you assign a task and walk away).

The tech-depth axis runs from **consumer** to **knowledge worker** to **developer**.

That gives you a 3x3 grid:

{{< figure src="/images/nine-kinds-of-agents-grid.png" alt="A 3×3 grid titled 'Nine Kinds of Agents'. The horizontal axis is labeled 'Tech Depth' with three columns: Consumer, Knowledge Worker, and Developer. The vertical axis is labeled 'Autonomy' with three rows from top to bottom: Fully Autonomous, Chat, and Autocomplete. Fully Autonomous row: Consumer cell — 'Autonomous personal agents', examples: ChatGPT Agent, Perplexity Comet, OpenClaw; Knowledge Worker cell — 'Autonomous enterprise agents', examples: Salesforce Agentforce, ServiceNow, Harvey AI; Developer cell — 'Dark Factory', examples: Gas Town, StrongDM, OpenAI harness engineering. Chat row: Consumer cell — 'Consumer chat', examples: ChatGPT, Gemini, Claude.ai; Knowledge Worker cell — 'Knowledge worker chat agents', examples: Glean, Claude CoWork; Developer cell — 'Interactive coding agents', examples: Claude Code, Cursor, Windsurf, Codex, Cline, Aider. Autocomplete row: Consumer cell is intentionally empty — consumer AI skipped this phase; Knowledge Worker cell — 'Knowledge worker assist', examples: M365 Copilot, Notion AI; Developer cell — 'Coding autocomplete', examples: GitHub Copilot, early Cursor." >}}

Before walking the cells: [the map is not the territory](https://en.wikipedia.org/wiki/Map%E2%80%93territory_relation). Products straddle the lines. Dimensions are fuzzy. The space moves fast enough that a product can change cells in the blink of an eye (more on that shortly). The grid helps you ask better questions. It doesn't give you the answers.

---

**Coding autocomplete** is the most mature cell on the grid. The modern LLM moment, in many ways, started with GitHub Copilot and then early Cursor. Most developers have touched something here. The feedback loop is tight: code runs, tests pass or fail. A mistake is a broken build, not a sent email. That unambiguous feedback signal is probably why this category figured itself out first. The bar for "is this working?" is clear.

**Interactive coding agents** (Claude Code, new Cursor, Windsurf, OpenAI Codex, Cline, Aider) are where you direct an agent to execute multi-step tasks across a repo. Still developer-supervised, but genuinely autonomous within a task. This cell is also the most crowded on the grid by a significant margin. The investment concentration here is visible just from counting names.

Cursor is also the clearest example of why the map is not the territory. Cursor 3, released earlier this year, rebuilt the product around managing parallel coding agents across multiple repos. A year ago, Cursor was firmly in the autocomplete cell. **Products move.**

**Consumer chat** (ChatGPT, Gemini, Claude.ai) is what most people picture when they first hear "AI." General-purpose, reactive, mostly single-session. This cell also covers scoped brand-bearing deployments like Sierra, Decagon, and Intercom Fin. Those look the same on the autonomy axis but have a completely different dominant constraint: when the agent is the face of your customer support operation, getting it wrong isn't an internal problem. Brand risk and eval on a narrow domain drive everything.

**Knowledge worker assist** (M365 Copilot, Notion AI) lands in the autocomplete row despite having a chat interface. The distinction is whether the agent crosses tool boundaries. Summarize this meeting, draft this email, suggest the next paragraph: reactive, single-context, not operating across systems. Useful. But the same underlying pattern as code autocomplete, with a different surface.

**Knowledge worker chat agents** is where things get interesting and honest: there isn't much there yet. A lot of the agent framework investment (LangChain, LangGraph, AutoGen, CrewAI) gets pointed here in conversations, but those are developer tools for building agents, not products that knowledge workers actually use. The hard problems in this cell are identity (who is the agent acting as?), permissions (what is it allowed to touch?), and trust (how do you know it did the right thing without reading every output?). None of those have clean solutions. **The gap between framework activity and shipped product is real.**

**The fully autonomous row** shares one property across all three columns: **no human in the loop.** The blast radius differs by column. On the consumer side: a personal assistant that actually books flights and clears your inbox. On the enterprise side: autonomous corporate task execution, where orchestration and observability become load-bearing. On the developer side: [Gas Town](https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04) and [dark factories](https://factory.strongdm.ai) -- fully automated pipelines where the dominant failure mode is "looked like it worked." This row also has the most hype and the least settled ground. There's genuine excitement here, but which domains actually work well for full autonomy is still shaking out.

**The empty cell** (consumer + autocomplete) is worth a moment. Consumer autocomplete exists: keyboard predictions, search suggestions. But it predates LLMs and nobody calls it an agent. **Consumer AI skipped the autocomplete phase and went straight to chat**, and that says something about how differently the consumer and developer markets have evolved.

---

The grid uses two axes. You could add more: how much engineering it takes to deploy, whether the agent's actions are reversible, whether it acts as a tool or acts *as you* with your credentials and permissions, how you verify it did the right thing. Add enough dimensions and you've got a DoD PowerPoint slide instead of a map. I'll write more about those dimensions separately. For now, two axes are enough to tell the things being called "agents" apart.

Side note: Anthropic is the only competitor with (disjoint) offerings across the "chat" row.

The grid doesn't tell you what to build. It gives you situational awareness.

We've been here before. For years, "cloud-native" was everywhere. Everyone used it with confidence. I took [my own stab](https://blog.heptio.com/cloud-native-part-1-definition-716ed30e9193) at defining it. It meant different things to different people, and that ambiguity had real costs: category-error vendor pitches, infrastructure decisions made for the wrong use case, strategy conversations that went in circles. "Agent" is earlier in that cycle. Not much earlier.

The next time someone tells you they're building an agent, or pitching an agent strategy, or evaluating agent infrastructure: ask which cell. The failure modes, the infrastructure requirements, and whether their solution is relevant to your problem -- all of those are different depending on the answer.
