# No dependencies, including in the CLI

The package has no runtime dependencies and no dev dependencies. The CLI parses its own arguments.

## Why

It's a joke package, and the joke stops being funny once it brings in a dependency tree, its advisories, or Dependabot pull requests. The CLI has one optional topic and five flags. A hand-written loop in `bin/ma3lesh.js` handles them in about twenty-five lines.

The tests use the built-in `node:test`.

## Rejected

- **`commander` or `yargs`:** both are far more than a topic and five flags need.
- **`util.parseArgs`:** it's built into Node and would work. The loop was kept for two reasons:
  - An empty `--lang=` or `--lang ""` needs a manual check either way.
  - The loop's `ma3lesh: ...` / `Try 'ma3lesh --help'` errors are the shape the tests pin.

  Revisit if the CLI grows past a handful of flags.

## Where it lives

- `bin/ma3lesh.js`, in `parse()`
- `test/cli.test.js`, which covers missing values, `--lang=`, a second topic and unknown options
