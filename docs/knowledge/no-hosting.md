# A package, not a service

ma3lesh ships as an npm package with an `excuse()` function, a CLI and a generated `excuses.json`. There's no server.

## Why

A joke should cost nothing to keep alive. A hosted endpoint needs uptime, rate limiting and abuse protection, and it keeps logs that raise privacy questions. A package needs none of that. The random pick happens on the caller's machine, and anyone who wants plain HTTP can fetch `excuses.json` from jsDelivr, which serves npm packages for free.

## Rejected

- **A hosted endpoint such as `GET /eta?lang=...` on a serverless platform.** It would make the project a running service, with all the upkeep above.

## Where it lives

- `src/index.js`: the library.
- `bin/ma3lesh.js`: the CLI.
- `scripts/build-json.js`: writes the JSON. See [excuses-json-sync.md](excuses-json-sync.md).
