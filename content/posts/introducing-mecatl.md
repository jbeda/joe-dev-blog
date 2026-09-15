---
date: '2026-09-15T00:00:00-07:00'
draft: false
title: 'Introducing Mecatl'
description: 'Defining and creating a "Cloud Native Harness"'
tags: ['AI', 'agents', 'infrastructure', 'Mecatl', 'Cloud Native', 'Kubernetes']
ShowToc: false
coverImage: 'static/covers/introducing-mecatl.png'
cover: { image: '/covers/introducing-mecatl.png', alt: 'Cover image for the post "Introducing Mecatl." On a warm parchment background, the black serif title is set above a short teal rule and the subtitle "Defining and creating a Cloud Native Harness." An illustration of Mecatito, Mecatl’s mascot, is large at the upper right. A teal stripe and joe.dev / Joe Beda signature sit along the bottom.', hidden: true }
---
I joined Stacklok a little over 5 months ago.
It has been a whirlwind.
The company we have now is not the company I joined.
The *industry* I reentered is not the industry we have now.
Reflecting on that is perhaps a different blog post.
Suffice to say that, like many startups, we are learning and adapting to an incredibly dynamic industry.
As such, we have new exciting ideas and directions.

Today we are open sourcing Mecatl.
Mecatl is a “Cloud Native Harness”.
What the heck is a Cloud Native Harness?
Why are we building Yet Another Harness?
I’m glad you asked.

A Cloud Native Harness is an advanced agent system built from the ground up for Kubernetes.
A client in your terminal or on your phone (eventually) connects to the main agent loop running there, while session storage, tools, filesystems, and sandboxing can be deployed, scaled, and secured independently.

Mecatl was started by [Ozz](https://github.com/JAORMX), a principal engineer here at Stacklok.
He picked the name and, personally, I love it.
Pronounced “Meh-kah-tl”, it is classical Nahuatl for cord, rope or string.
Hence the relationship to “harness”.
We even have a cute mascot named Mecatito.

{{< figure src="/images/mecatito.png" alt="Illustration of Mecatito, Mecatl's mascot.">}}

## From the desktop to the clouds

Coding agents got powerful when they became more than a chat box.
Four things changed the shape of the problem: powerful tools, a shared repo and filesystem, subagents, and skills that capture what the system has learned from prior work.
Together, those let an agent actually operate in an environment instead of merely answering questions about one.

{{< pullquote >}}Together, those let an agent actually operate in an environment instead of merely answering questions about one.{{< /pullquote >}}

These patterns evolved for developers because developers already live in terminals, repos, and toolchains.
But it is pretty clear that they are not staying there.
The next generation of agent experiences will bring the same capabilities to people who do not think of themselves as developers at all.

But the usual harness shape assumes a desktop.
One person, one machine, one local filesystem, one interactive process coordinating the loop.
This works well for a single developer but breaks down when it has to serve an enterprise, or people that do not necessarily live in the terminal.

Mecatl takes that familiar harness, blows it up, and puts it back together to be more scalable, more secure, and able to serve more kinds of clients.
The core engine owns the agent loop.
Sessions, memory, tools, filesystems and sandboxes sit outside of it behind extensible interfaces.
They can be deployed, scaled, and secured independently.

So this is what I mean when I say "Cloud Native Harness".
We are not just "lifting and shifting" a desktop harness into the cloud.
We are designing something that works *with* cloud systems so that hosting, exposure and security of these more capable agent systems falls out of the harness architecture.

{{< pullquote >}}We are designing something that works *with* cloud systems so that hosting, exposure and security of these more capable agent systems falls out of the harness architecture.{{< /pullquote >}}

## And back to the desktop

None of this means the desktop goes away.
In fact, we started there with a traditional TUI (Terminal User Interface) so we could make progress and learn by using it every day.

It is actually pretty great and has become my daily driver.
Most of my work on Mecatl has been done with Mecatl.

But the bones of the architecture for running on Kubernetes are already there.
It feels like a traditional TUI, but the engine is already split from the UI.
That same TUI can be pointed at a remote engine.

If you want to try it out, install it with `brew install stacklok/tap/mecatl`, run `mecatui providers setup` to configure a provider and then start `mecatui`.
There are some rough edges but it is already pretty darn useful.

To run the engine on Kubernetes, follow the [Kubernetes getting-started guide](https://mecatl.dev/docs/building/getting-started/kubernetes).

## And to the moon!

These are still early days for Mecatl.
There are rough edges and we have not proven out every idea yet.
But we are working on it and we have big ideas.

* **More clients.** Mecatl is fundamentally client/server with gRPC, HTTP/SSE and a TypeScript SDK.
  The TUI is a great start.
  Our immediate plans are a web UI followed by a desktop GUI and mobile experiences.
  While many of these will look like traditional chat interfaces, we also want to explore other ways to interface with agents such as via Slack or collaborative document editing.
* **Strong identity.** Identity in the age of agents is complicated.
  When you talk to outside systems do you want to act on behalf of the user?
  Or the agent?
  What does “agent” mean here?
  Is this the process running the agent or the session you are running?
  What about when the harness is multitenant?
  What about subagents?
  Our answer is to [encode the delegation chain in a JWT](https://github.com/stacklok/mecatl/blob/main/docs/agent-identity-model.md) so that external systems have full context when making policy decisions.
  Built on SPIFFE, we want to allow you to have a “call stack” of all the identities that are involved.
* **More tools.** MCP is a great start for extending the capabilities of Mecatl.
  It is well supported out of the gate both directly and through our open source MCP platform, [ToolHive](https://docs.stacklok.com/toolhive/).
  But there are ways to add tools to your harness that go beyond MCP.
  We want to create a rich ecosystem of tools that can not only enhance Mecatl but can call each other directly.
  For example, we want to enable a PDF decoding tool that can operate directly on your workspace filesystem without bloating the agent context window.
  [Scoped Resource Grants](https://github.com/stacklok/mecatl/blob/main/docs/scoped-resource-grants.md) are a key idea here: a way to give a tool exactly the resources it needs to do that work.
* **Cryptographic context attestation.** We laugh about prompt engineering but, in a lot of ways, prompts are the new code.
  We should treat them as such.
  If you are running an agent or a subagent with packaged, versioned and signed context we want to be able to represent that as part of your identity also.
  This goes beyond just the harness to building a packaging system for context that builds on the modern software supply chain: versioning, signing, provenance, distribution and policy.

What problems could a Cloud Native Harness solve for you?
Give it a try and let us know what you think.
Docs are at [mecatl.dev](https://mecatl.dev/).
We are just getting started and you might get sick of hearing me talk about it if you follow me at all.
