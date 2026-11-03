# excuses.json is generated and committed

`src/excuses.js` is the source. `npm run build:json` writes `excuses.json` from it, and the JSON file is committed and published.

## Why

`excuses.json` has to sit in the published package so jsDelivr can serve it with no server (see [no-hosting.md](no-hosting.md)). It's also committed, so people browsing the repo can see the list.

The JS file is the source because contributors edit it, and it can carry comments.

## Keeping them in sync

- **A test:** it compares the JSON with the module and fails when the JSON is stale, so a contributor who forgets the build step gets told.
- **`prepublishOnly`:** it rebuilds the JSON and runs the tests, so a stale file can't be published.

## Rejected

- **JSON as the source, imported with `with { type: "json" }`.** That syntax needs newer Node and bundler support, and JSON can't hold comments.
- **Not committing the JSON.** jsDelivr's GitHub route would then serve nothing, and the repo would hide the data.

## Where it lives

- `scripts/build-json.js`
- `test/library.test.js`, in the sync test
- `package.json`: the `build:json` and `prepublishOnly` scripts
