# ma3lesh

Jordanian excuses for the three questions everyone dodges: when will it be done, where are you, and why isn't it done. Each comes with what it really means.

```
$ npx ma3lesh when
After lunch
(real ETA: Lunch is at 4, confidence 6%)

$ npx ma3lesh where --lang arabizi
3ali2 3dowwar elsabe3
(really: tili3 min 3ashr da2aye2, confidence 11%)

$ npx ma3lesh why
The internet is out
(real reason: Watching the match, confidence 3%)
```

Run `npx ma3lesh` with no topic in a terminal and it asks which one you need. Answers come in three scripts: `en` (English, the default), `ar` (Ammani Arabic) and `arabizi`.

```
npm i ma3lesh
```

Needs Node 20.19 or later.

## In code

```js
import { excuse } from "ma3lesh";

excuse({ topic: "when", lang: "ar" });
// { id: "five-minutes", topic: "when", lang: "ar", says: "خمس دقايق", means: "أربعين دقيقة", confidence: 7 }
```

`topic` is `when`, `where` or `why`. Leave it out to pick from all three. `lang` defaults to `en`. Both are case-insensitive, and an empty value counts as missing. An unknown value throws a `RangeError`, and a non-string throws a `TypeError`. `confidence` is a percent and never goes above 19. The full list is exported as `excuses`, and the allowed values as `TOPICS` and `LANGS`.

## As plain JSON

No install needed, served from npm through jsDelivr:

```
https://cdn.jsdelivr.net/npm/ma3lesh/excuses.json
```

Each entry has `id`, `topic`, plus `says` and `means` in `en`, `ar` and `arabizi`. Pick one at random yourself.

## CLI options

```
ma3lesh [when|where|why] [--lang en|ar|arabizi] [--json] [--ask]
```

`-l` is short for `--lang`, and `--lang=ar` also works. `--json` prints the same object `excuse()` returns. Without a topic, ma3lesh asks in a terminal and picks any topic when piped. `--ask` always asks, reading the answer from stdin, so scripts can answer it. `--version` and `--help` do what they say.

## Arabizi spelling

One convention, so contributions stay consistent. Arabic is Ammani dialect.

| Letter | Arabizi | Example |
|---|---|---|
| ء, and ق as Ammani speakers say it | 2 | halla2, da2aye2 |
| ع | 3 | ba3d, ma3lesh |
| ح | 7 | 7ada, a7ad |
| خ | 5 | 5alas, 5amas |
| غ | gh | ghada |
| ط ض ص ظ | t d s z | tili3, dayel |
| ش ث ذ | sh th th | shway |

Long vowels are written `ee` and `oo` where it helps reading: `baseet`, `mudeer`, `bnshoof`.

The article is `el`, joined to its word with no hyphen and no sun-letter doubling: `elbeit`, `elshahr`, `elsabe3`. "In the" is `bel`, written as its own word: `bel taree2`, `bel beit`. "On the" shortens to `3`: `3dowwar`, `3sa3a`, except before a hamza, where it stays `3al`: `3al2ishara`.

## Adding an excuse

Add an entry to `src/excuses.js` under its topic, with `says` and `means` in all three languages, run `npm run build:json`, then `npm test`. The tests reject an unknown topic, an empty field, a duplicate id, Latin letters in `ar`, anything outside the Arabizi characters in `arabizi`, and an `excuses.json` that is out of date.

The content rules, the sign-off and how review works are in [CONTRIBUTING.md](CONTRIBUTING.md). Suggestions without code are welcome as a "New excuse" issue.

## License

Code is MIT, see [LICENSE](LICENSE). The excuse texts in `src/excuses.js` and `excuses.json` are released under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/), so you can reuse them anywhere without credit.

## Privacy

The package makes no network calls and collects nothing. If you fetch `excuses.json` from jsDelivr, jsDelivr's own privacy policy applies to that request.
