# Contributing

The most useful contribution is a good excuse. Bug fixes are welcome too.

## Adding an excuse

1. Pick its topic:
   - `when`: when will it be done
   - `where`: where are you
   - `why`: why isn't it done
2. Add it to `src/excuses.js` under that topic. It needs a short kebab-case `id`, plus `says` and `means` in `en`, `ar` and `arabizi`. `means` is the punchline: what the excuse really means.
3. Write the Arabic in Ammani dialect. Follow the Arabizi spelling rules in the [README](README.md#arabizi-spelling).
4. Run `npm run build:json`, then `npm test`.
5. Open a pull request. If you would rather not touch code, open an issue with the "New excuse" form instead.

A native speaker reviews every excuse before it's merged. Expect the spelling to be adjusted.

## What gets merged

These are excuses people actually make at work and on the way there: delays, traffic, systems that are always down, managers who are always away.

These are not merged, however funny:

- Anything about religion beyond the light everyday phrases already in the list. No jokes about God, the Prophet, the Quran, prayer or fasting.
- Anything about the royal family, the army or the security services.
- Politics, sects, ethnicity or nationality.
- Named real people, companies, brands, banks, telcos, malls or ministries. Roads and places are fine (7th Circle, Airport Road).
- Anything sexual or insulting.

The maintainer has the final say. This repo is published from Jordan, and its content has to be fine under Jordanian law.

## Sign your commits

Every commit from a contributor needs a `Signed-off-by` line, which certifies the [Developer Certificate of Origin](https://developercertificate.org/): you wrote the change, or have the right to submit it. Add the line with:

```
git commit -s
```

The maintainer checks for it before merging. Commits from Dependabot are exempt.

Code contributions are released under the [MIT license](LICENSE). Excuse texts are released under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).

## Code changes

- Keep the package free of dependencies, including dev dependencies.
- Add or update a test for any behaviour change. Run `npm test` before opening the pull request.
- If a change involves a decision a reviewer would question, add a short note in `docs/knowledge/` and link it from the code with a `// Why:` comment.

Pull requests that only add or fix excuses don't need a knowledge note.
