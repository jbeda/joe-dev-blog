+++
date = '2026-05-24T11:23:34-07:00'
draft = false
title = '10 Years of SPIFFE'
description = 'A decade ago I wrote the design doc for SPIFFE. Workload identity is finally having its moment.'
tags = ['spiffe', 'identity', 'open-source', 'history']
coverImage = "static/covers/10-years-of-spiffe.png"

[cover]
  image = "/covers/10-years-of-spiffe.png"
  alt = "10 Years of SPIFFE"
  hidden = true
atUri = "at://did:plc:vkn2vmcnsmlffrpwalvgybw5/site.standard.document/3mmmmxiypaj2x"
+++

A little over 10 years ago I wrote the design doc for [SPIFFE](https://spiffe.io), a standard for giving workloads cryptographic identities so services can authenticate to each other without passwords. I launched it at a talk at [GlueCon](https://gluecon.com) that year. This was a unique thing as it was an "open source" project that was just a document. There was no code initially.

I almost started a company around it but did Heptio instead. I handed it off to [Sunil James](https://www.linkedin.com/in/sunilrjames/) who started a company and got it into the [CNCF](https://cncf.io). Sunil and the folks at his company, Scytale, also wrote the companion reference implementation called [SPIRE](https://spiffe.io/docs/latest/spire-about/).

This just goes to show I suck at timing. 😂 It is having a moment now. It only took 10 years for the need for workload identity to be obvious with the advent of agents.

To mark this I want to get some of the original artifacts out there for anyone that is interested.

- Original design doc: https://docs.google.com/document/d/1GjurNK2ROw4rXz-k-l68JtpGRkGj2fZcWqP6gksEriQ/edit
- Original presentation at GlueCon: http://slides.eightypercent.net/spiffe-intro/index.html#p1

Easter egg: the colors in the original logo and design doc were based on my last name. Fun you can have when your name can be represented as hex. `#00BEDA` and `#BEDA00`. Those colors (or very similar) are still used in the logo!

{{< figure-pair src1="/images/spiffe/spiffe-logo-original.png" cap1="The original SPIFFE logo, circa 2016" src2="/images/spiffe/spiffe-logo-current.png" cap2="The current SPIFFE logo" >}}

Huge thank you to everyone who took the baton. Picking up someone else's half-formed idea and shipping it is harder than having the idea. You all did that.

---

_This was originally posted on [LinkedIn](https://www.linkedin.com/feed/update/urn:li:activity:7460489657508663298/) but I want the long-term home to be on this blog._
