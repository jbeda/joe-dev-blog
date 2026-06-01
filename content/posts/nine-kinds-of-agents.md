+++
date = '2026-05-26T00:00:00-07:00'
draft = false
title = 'I counted nine kinds of agents'
description = 'The word "agent" is doing too much work. A rough map helps.'
tags = ['AI', 'agents', 'infrastructure', 'strategy']
ShowToc = false
coverImage = "static/covers/nine-kinds-of-agents.png"
atUri = "at://did:plc:vkn2vmcnsmlffrpwalvgybw5/site.standard.document/3mmrtnrnj752u"
cover = { image = "/covers/nine-kinds-of-agents.png", alt = "I counted nine kinds of agents. The word \"agent\" is doing too much work. A rough map helps.", hidden = true }
+++

"Agent" is everywhere in AI conversations. I'd been nodding along with my own rough definition, assuming I'd sharpen it later.

As an infra engineer, undefined terms are a bad habit. When a word means everything, it usually means nothing, and the ambiguity bites eventually. I watched two people use "agent" in the same meeting with clearly different meanings. Nobody flagged it. They both left thinking they'd agreed.

So I asked Claude. I started with _"What does agentic mean?"_ It sounds like some sort of concrete technology concept I needed to learn about. But it isn't: "agentic" means "of or relating to an agent." It sounds like a real technical term but it's just the adjective form of the noun I couldn't pin down.

Then I asked what an agent actually is. The answer: _it depends_. And once you understand why, the word gets a lot more useful.

---

"Agent" is being applied to things that are genuinely different from each other. They have different architectures, different failure modes, different infrastructure requirements, and different buyers. They share an LLM and decision-making in the execution path. That's about it. I like [Simon Willison's definition](https://simonwillison.net/2025/Sep/18/agents/): "an LLM agent runs tools in a loop to achieve a goal." But that still leaves a lot of room for people to talk past each other.

So I drew a rough map with two axes: how much autonomy the agent has, and who it's built for.

The autonomy axis runs from **autocomplete** (reactive, inline, sub-second response) to **chat** (you prompt, it responds, you go back and forth) to **fully autonomous** (you assign a task and walk away).

The tech-depth axis runs from **consumer** to **knowledge worker** to **developer**.

That gives you a 3x3 grid:

{{< figure src="/images/nine-kinds-of-agents-grid.png" alt="A 3×3 grid titled 'Nine Kinds of Agents'. The horizontal axis is labeled 'Tech Depth' with three columns: Consumer, Knowledge Worker, and Developer. The vertical axis is labeled 'Autonomy' with three rows from top to bottom: Fully Autonomous, Chat, and Autocomplete. Fully Autonomous row: Consumer cell — 'Autonomous personal agents', examples: ChatGPT Agent, Perplexity Comet, OpenClaw; Knowledge Worker cell — 'Autonomous enterprise agents', examples: Salesforce Agentforce, ServiceNow, Harvey AI; Developer cell — 'Dark Factory', examples: Gas Town, StrongDM, OpenAI harness engineering. Chat row: Consumer cell — 'Consumer chat', examples: ChatGPT, Gemini, Claude.ai; Knowledge Worker cell — 'Knowledge worker chat agents', examples: Glean, Claude CoWork; Developer cell — 'Interactive coding agents', examples: Claude Code, Cursor, Windsurf, Codex, Cline, Aider. Autocomplete row: Consumer cell is intentionally empty — consumer AI skipped this phase; Knowledge Worker cell — 'Knowledge worker assist', examples: M365 Copilot, Notion AI; Developer cell — 'Coding autocomplete', examples: GitHub Copilot, early Cursor." >}}

The grid has limits: [the map is not the territory](https://en.wikipedia.org/wiki/Map%E2%80%93territory_relation). Products straddle the lines. Dimensions are fuzzy. Things move fast enough that a product can change cells in months (more on that shortly). The grid helps you ask better questions. It doesn't give you the answers.

---

**Coding autocomplete** is the most mature cell on the grid. The modern LLM moment started with GitHub Copilot and then early Cursor. Most developers have touched something here. The feedback loop is tight: code runs, tests pass or fail. When something breaks, it's a broken build: fast, visible, reversible. That unambiguous feedback signal is probably why this category figured itself out first.

**Interactive coding agents** (Claude Code, new Cursor, Windsurf, OpenAI Codex, Cline, Aider) are where you direct an agent to execute multi-step tasks across a repo. These are still developer-supervised, but genuinely autonomous within a task. This cell is also the most crowded on the grid by a significant margin. The investment concentration here is visible just from counting names.

Cursor is also the clearest example of why the map is not the territory. Cursor 3, released earlier this year, rebuilt the product around managing parallel coding agents across multiple repos. A year ago, Cursor was firmly in the autocomplete cell. **Products move.**

**Consumer chat** (ChatGPT, Gemini, Claude.ai) is what most people picture when they first hear "AI." It's general-purpose, reactive, and mostly single-session. This cell also covers scoped brand-bearing deployments like Sierra, Decagon, and Intercom Fin. Those look the same on the autonomy axis, but the stakes are different: when the agent is the face of your customer support operation, getting it wrong isn't an internal problem. Brand risk and eval on a narrow domain drive everything.

**Knowledge worker assist** (M365 Copilot, Notion AI) lands in the autocomplete row despite having a chat interface. The distinction is whether the agent crosses tool boundaries. These tools handle reactive, single-context tasks (summarize this meeting, draft this email, suggest the next paragraph) without crossing system boundaries. It's the same underlying pattern as code autocomplete with a different surface.

**Knowledge worker chat agents**: there isn't much here yet. A lot of the agent framework investment (LangChain, LangGraph, AutoGen, CrewAI) gets pointed here in conversations, but those are developer tools for building agents. None of them are products that knowledge workers actually use. The hard problems in this cell are identity (who is the agent acting as?), permissions (what is it allowed to touch?), and trust (how do you know it did the right thing without reading every output?). None of those have clean solutions. **The gap between framework activity and shipped product is real.**

**The fully autonomous row** shares one property: **no human in the loop.** The blast radius differs by column.

**Autonomous personal agents** are personal assistants that actually book flights, manage your inbox, and act on your behalf across services.

**Autonomous enterprise agents** run business workflows without human sign-off at each step. Orchestration and observability become load-bearing here.

**Dark factory** pipelines like [Gas Town](https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04) and [factory.strongdm.ai](https://factory.strongdm.ai) are fully automated with no human review step. The dominant failure mode is "looked like it worked."

This row has the most hype and the fewest shipped answers. Which domains actually work well for full autonomy is still shaking out.

**The empty cell** (consumer + autocomplete) is worth a moment. Consumer autocomplete exists in the form of keyboard predictions and search suggestions, but it predates LLMs and nobody calls it an agent. **Consumer AI skipped the autocomplete phase and went straight to chat.**

---

The grid uses two axes. You could add more: how much engineering it takes to deploy, whether the agent's actions are reversible, whether it acts as a tool or acts _as you_ with your credentials and permissions, how you verify it did the right thing. Add enough dimensions and you've got a DoD PowerPoint slide instead of a map. I'll write more about those dimensions separately. For now, two axes are enough to tell the things being called "agents" apart.

Every major AI provider now has products across all three chat-row columns. Whether those are genuinely different products or the same one repackaged is a different question.

This grid doesn't tell you what to build. It gives you situational awareness.

We've been here before. For years, "cloud-native" was everywhere. Everyone used it with confidence. I took [my own stab](https://blog.heptio.com/cloud-native-part-1-definition-716ed30e9193) at defining it. It meant different things to different people, and that ambiguity had real costs: category-error vendor pitches, infrastructure decisions made for the wrong use case, strategy conversations that went in circles. "Agent" is earlier in that cycle. Not much earlier.

The next time someone tells you they're building an agent, or pitching an agent strategy, or evaluating agent infrastructure: clarify which type of agent. The failure modes, the infrastructure requirements, and whether their solution is relevant to your problem are all different depending on the answer.
