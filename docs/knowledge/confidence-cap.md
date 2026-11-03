# Confidence never goes above 19%

`excuse()` returns a `confidence` from 1 to 19, drawn at random.

## Why

It's the second half of the joke. The answer says "five minutes", and the confidence tells you not to believe it. Any value from 20 up would read as a real estimate. The value is never 0, because that would just mean "no".

## Where it lives

`src/index.js`, in `excuse()`: `1 + draw(random, 19)`, where `draw` rejects any `random` value outside [0, 1). The test injects `random` and pins both ends of the range.
