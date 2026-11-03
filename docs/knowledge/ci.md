# CI: what runs on every push and pull request

`.github/workflows/test.yml` runs three checks on each job:

- `npm test`
- a check that `excuses.json` is current
- `npm pack --dry-run`

The jobs cover Node 20.19, 22 and 24 on Linux, plus Node 24 on Windows.

## Why

- **Node 20.19:** it's the `engines` minimum, so the claim gets tested. 20.19 is the first 20.x that can `require()` this ESM-only package.
- **Windows:** the owner uses it, and npm installs CLIs there through `.cmd` and `.ps1` shims.
- **The `excuses.json` check:** it repeats the sync test from the build side. It catches someone editing the generated JSON on GitHub instead of `src/excuses.js`, which the owner did once while proofreading.
- **Least privilege:** the workflow token is read-only, and checkout doesn't keep credentials. A fork's pull request can't write anything.
- **Dependabot:** it updates only the workflow actions, monthly. The package itself has no npm dependencies to update. See [zero-dependencies.md](zero-dependencies.md).

## Where it lives

- `.github/workflows/test.yml`
- `.github/dependabot.yml`
