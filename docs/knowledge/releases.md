# Releases: GitHub release in, npm package out

Publishing a GitHub release whose tag is `v<version from package.json>` runs `.github/workflows/publish.yml`. The workflow checks the tag, tests the package and publishes it to npm with provenance. Prereleases are skipped.

## Why

- **No npm token exists anywhere.** npm trusted publishing lets npm accept this one workflow through GitHub's OIDC token. With nothing stored, there's nothing to leak or rotate.
- **Provenance** links each npm version to the commit and workflow that built it. npm only produces it for public repos. `--provenance` is passed explicitly, so a publish from a private repo fails loudly instead of quietly shipping without it.
- **The tag check** runs first, so a release can't publish a version number that differs from `package.json`.
- **Prereleases are skipped**, because a prerelease would otherwise become `latest` on npm.

Trusted publishing needs npm 11.5.1+ and Node 22.14.0+ ([npm docs](https://docs.npmjs.com/trusted-publishers)). The job uses Node 24, which ships a new enough npm, and a step fails the run if npm is ever older.

## First release, in this order

1. Make the repo public, then set up GitHub:
   - turn on private vulnerability reporting (`SECURITY.md` points to it);
   - protect the `npm` environment with the owner as required reviewer and a deployment tag rule of `v*`;
   - set default workflow permissions to read-only;
   - require approval for workflows from outside contributors;
   - create the `bug` and `excuse` labels the issue forms use.
2. Set the version to `1.0.0`, then run `npm publish --access public` from the owner's machine with 2FA. npm only allows a trusted publisher on a package that already exists.
3. Push the tag `v1.0.0`. Don't create a GitHub release for it: the workflow would try to publish 1.0.0 again and fail.
4. When the next version is ready, create the trusted publisher on npmjs.com:
   - owner `Sahmaoi`, repo `ma3lesh`;
   - workflow `publish.yml` (filename only, case-sensitive);
   - environment `npm`;
   - allowed actions must include **npm publish**. New configs default to staged publish only.

   The config expires if its first successful publish doesn't happen within 2 days. Set it up right before that release, not earlier.
5. Release that version through a GitHub release.
6. In the package's npm settings, choose "Require two-factor authentication and disallow tokens". The trusted publisher keeps working.

Cut releases only from a `main` commit where CI is green. The publish job only tests on Node 24, while CI also covers 20.19, 22 and Windows.

## Versions

Semver. The data shape, the `excuse()` options and result, the exports and the CLI flags are the public contract.

- **Patch:** fixes and spelling corrections.
- **Minor:** new excuses or options.
- **Major:** removing or renaming anything in the contract, or raising the minimum Node version.

## If a bad version ships

- **Fix forward:** release a patch. This is the normal path.
- **Deprecate:** `npm deprecate ma3lesh@<version> "<why>"` from the owner's machine. It stays installable, with a warning.
- **Move `latest` back:** `npm dist-tag add ma3lesh@<good version> latest`. Deprecating doesn't move it.
- **Unpublish:** npm only allows it within 72 hours, or while the package has no dependents and few downloads ([policy](https://docs.npmjs.com/policies/unpublish)). A version number can never be reused.
- **jsDelivr** caches `excuses.json`. After a bad data release, also check that the CDN serves the fixed file.

## Where it lives

- `.github/workflows/publish.yml`
- `package.json`: `version`, `repository` (provenance checks that it matches this repo, case-sensitively), `prepublishOnly`
