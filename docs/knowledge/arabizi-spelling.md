# Arabizi spelling convention

Every `arabizi` string follows one mapping:

- 2 for ء and for ق as Ammani speakers say it
- 3 for ع
- 7 for ح
- 5 for خ
- `gh` for غ
- plain `t d s z` for ط ض ص ظ
- `ee` and `oo` for long vowels
- the article as `el`, joined to its word with no hyphen and no sun-letter doubling (`elbeit`, `elshahr`); "in the" as a separate `bel` (`bel taree2`); "on the" as `3` (`3dowwar`), or `3al` before a hamza (`3al2ishara`), because `32ishara` is unreadable

The full table is in the README, where contributors will look for it.

## Why

Arabizi has no standard, and contributors will argue about spelling more than anything else. One written rule settles those arguments up front.

- **5 for خ:** this is how most Jordanians type it.
- **Plain letters for the emphatics:** `6` for ط is common too, but it's harder for non-Arabic readers to follow.

The Arabic itself is Ammani dialect, so the qaf is a glottal stop: `2`, not `g` or `q`.

The article rule came from the owner's native-speaker proofread on 2026-11-03. The first draft wrote `il-` with sun-letter assimilation (`is-sabe3`, `ish-shahr`). That's closer to how it sounds, but nobody types it that way.

## Rejected

- **Generating Arabizi from the Arabic automatically.** The Arabic omits short vowels, so the output would be wrong.
- **Generating it from a transliteration column.** That column used `'` for both ع and ء, so it can't tell them apart.

## Where it lives

- The table: `README.md`, under "Arabizi spelling".
- The character check: `test/library.test.js`, which allows only letters, digits, spaces and `' - . , ? ! %` in `arabizi`. Nothing checks the mapping itself; review covers that.
