---
title: "Three Flags, Three Chains — HTB Web Writeups"
published: 2026-08-31
description: "Three HTB-style web challenges, each a small ransomware-as-a-service panel guarded by a headless admin bot. Three roads to the flag: a DOM sink, a forged token, and a poisoned cache."
tags: ["CTF", "Web", "HackTheBox", "Writeups"]
category: CTF
draft: false
---

Three HTB-style web challenges, each a small ransomware-as-a-service panel guarded by a headless admin bot. Three different roads to the flag — a DOM sink, a forged token, and a poisoned cache. Full source-to-shell walkthroughs:

- **[Paid Forums](/posts/ctf/paid-forums/)** — DOM XSS → admin-bot cookie theft. A custom URL parser drops `?search=` into `innerHTML`; a crafted report ID makes the bot open it.
- **[Majestic Sales](/posts/ctf/majestic-sales/)** — JWT `kid` SQLi → forged admin token. The verification secret is looked up from the DB using the token's own `kid`; a `UNION SELECT` supplies the verifying key.
- **[REgregious](/posts/ctf/regregious/)** — cache poisoning → prototype pollution → XSS. A three-bug chain that plants poison under the bot's cache key and detonates it through a jQuery 3.6.0 gadget.

**Stack:** Node · Express · nunjucks · SQLite · Puppeteer bots.

> Only the REgregious flag is shown in full — captured live this session. The other two flag strings were retrieved in an earlier session; the vulnerabilities, payloads, and exploitation paths are reproduced in full from source.
