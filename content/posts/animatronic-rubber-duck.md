+++
date = '2026-07-07T00:00:00-07:00'
draft = false
title = 'The animatronic rubber duck'
description = "One of the best ways to use AI is as an active listener to build understanding and expertise."
tags = ['AI', 'agents', 'collaboration', 'chess']
ShowToc = false
coverImage = "static/covers/animatronic-rubber-duck.png"
cover = { image = "/covers/animatronic-rubber-duck.png", alt = "Cover image for the post 'The animatronic rubber duck' on a warm off-white background. The title is set in large black serif type across two lines, with a short teal underline beneath it, above the gray subtitle: 'One of the best ways to use AI is as an active listener to build understanding and expertise.' In the lower right, a teal rounded square holds a white serif J monogram, with 'joe.dev' and 'Joe Beda' stacked below. A thin teal band runs along the bottom edge.", hidden = true }
atUri = "at://did:plc:vkn2vmcnsmlffrpwalvgybw5/site.standard.document/3mq3dw22xxe2r"
+++

You know rubber duck debugging even if you have never named it: put a rubber duck on your desk, and when you are stuck, explain your code to it out loud, line by line. The duck says nothing back. That is not a limitation of the technique. It is the whole mechanism. 

The name comes from *The Pragmatic Programmer*, which tells the story of a research assistant, Greg Pugh, who carried a rubber duck around for exactly this purpose.[^duck] The duck is not doing any work. You are, by being forced to say out loud what you think you understand, in order, to an audience that cannot interrupt. A good fraction of the bugs I have found, I found in the second sentence of explaining them to someone who had not said a word yet.

## What changes when it talks back

Now put a chat window where the duck used to sit. Same impulse: talk through the problem out loud. But the thing on the other end does not stay quiet. It asks what happens on the error path. It notices the case you skipped. It pushes back on an assumption you did not know you were making. That is not a rubber duck anymore. It is closer to an **animatronic** one: not alive, no more a real collaborator than the original prop, but it moves and it responds, and that changes what the interaction is for.

I like "animatronic" because it does not dress the thing up. It is a very good prop, motorized and scripted, and it carries a whiff of the uncanny valley on purpose. That whiff is honest: something moved from inert to responsive, and it is still, underneath, a prop.

Talking to yourself out loud has a real ceiling. It surfaces the gap between what you think you built and what you can explain, but nothing on the other end checks whether either version is correct or even self-consistent. A model that talks back does something silent articulation cannot: it catches what you would never catch by narrating to yourself, because your own blind spot does not announce itself no matter how carefully you describe it. **You get a second, independent pass at the problem, not just a cleaner first one.**

## The centaur precedent

The same pattern showed up once before, at much higher stakes. After Deep Blue beat Garry Kasparov in 1997, "freestyle" chess let a team be any mix of humans and computers, and the winners were never the strongest grandmasters or the most powerful machines. In 2005, two amateur players, Steven Cramton and Zackary Stephen, running three ordinary computers as team ZackS, beat a field of grandmaster-led teams and the supercomputer Hydra.[^chessbase]

{{< pullquote >}}The computer did the calculating. The human stayed in charge.{{< /pullquote >}}

Kasparov's own conclusion was blunt: a weaker human paired with a machine, guided by good judgment, beat a raw supercomputer.[^kasparov] That judgment was human intuition: knowing which line to trust, when to override it, when to ignore it outright. The computer did the calculating. The human stayed in charge.

David Epstein picks up the same thread in *Range* and aims it straight at the "10,000 hours" rule: his own centaur example is Anson Williams, a British engineer with **no official chess rating**, whose team beat grandmasters who had spent a career earning one.[^range]

I am not a chess player, and I do not need to be. Both stories point at the same thing: a human and a computer outperforming either one alone.

## The skill nobody hands you for free

Having a tool that can push back does not make you smarter by itself. It is too easy to outsource all of your thinking to the tool. **That is not collaboration. It is delegation**, and it leaves you just as ignorant and over-confident.

I recently built a small tool called [modelith](https://modelith.sh). It helps you author domain models, plain-language descriptions of what a system is, by talking to an agent to develop your understanding of a system. The tempting shortcut is describing the system loosely and letting the agent fill in the rest from its own guesses. Modelith is built to resist that: the agent's job is to keep asking until your own understanding is complete enough to write down. AI, when used in this mode, helps you develop your thinking.

{{< pullquote >}}Without this discipline, you produce something plausible but broken and you don't even know why.{{< /pullquote >}}

The centaur teams had the same discipline: enough of their own judgment to know when the machine was right and when to override it. Build that judgment and the agent makes you sharper. Without this discipline, you produce something plausible but broken and you don't even know why.

## Developing expertise

AI can help you develop expertise. It can accelerate you. **What it cannot do is replace the work of understanding your own problem**: describing it, deciding what matters, working through the nitty gritty details. The animatronic duck helps most with exactly that work, when you are pushing on a half-formed idea and want the friction of an objection.

The old, silent duck still has a job too. Sometimes you already know where you are going, and all you need is quiet room to get there without being interrupted. Use whichever duck the moment actually calls for.

[^duck]: The anecdote comes from Andrew Hunt and David Thomas, *The Pragmatic Programmer* (1999), which describes a research assistant, Greg Pugh, who carried a rubber duck for exactly this purpose. See the summary at [Wikipedia: Rubber duck debugging](https://en.wikipedia.org/wiki/Rubber_duck_debugging).

[^chessbase]: ChessBase's contemporaneous report on the tournament: ["Dark horse ZackS wins Freestyle Chess Tournament"](https://en.chessbase.com/post/dark-horse-zacks-wins-freestyle-che-tournament) (2005). Kasparov's own essay does not name the winning players; the team names and tournament details come from this report.

[^kasparov]: Kasparov's own words: "weak human + machine + better process was superior to a strong computer alone and, more remarkably, superior to a strong human + machine + inferior process." Garry Kasparov, ["The Chess Master and the Computer"](https://www.nybooks.com/articles/2010/02/11/the-chess-master-and-the-computer/), *The New York Review of Books*, February 11, 2010. "Process" in his sense covers the specific skills and technique behind how you work with the machine, a real subject, and a different piece than this one.

[^range]: David Epstein, *Range: Why Generalists Triumph in a Specialized World* (Riverhead Books, 2019), chapter 1, "The Cult of the Head Start." Epstein's centaur example is a different freestyle chess tournament than the one described above: Anson Williams and teammate Nelson Hernandez, playing as team Intagrand, beat grandmaster-led teams and the supercomputer Hydra.
