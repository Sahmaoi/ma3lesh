# Three topics: when, where, why

Every excuse belongs to one topic:

- **when:** "When will it be done?"
- **where:** "Where are you?"
- **why:** "Why isn't it done?" or "Why aren't you working?"

`excuse({ topic })` picks only from that topic. Leaving the topic out picks from all three.

## Why

The first version answered only "when will it be done?". Proofreading turned up entries that answered other questions: "I'm on my way" and "Stuck at 7th Circle" are about where someone is, and "The system is down" is about why nothing is happening. The owner chose to group them instead of cutting them. Each topic has to hold at least eight excuses, so a topic doesn't repeat itself after two tries.

The CLI takes the topic as a bare word (`ma3lesh where`). With no topic in a terminal, it shows a menu, because the owner wanted people to be offered the choice.

## Decisions inside this

- **`eta()` became `excuse()`, and `real_eta` became `means`.** "ETA" made no sense for where or why. Nothing had been published, so this was a rename, not a breaking change. `means` matches the field name in the data.
- **Different label per topic in the CLI:** "real ETA", "really" and "real reason". This lives in `bin/ma3lesh.js`, not the data, because the JSON shape stays the same for every topic.
- **The menu only appears when stdin, stdout and stderr are all terminals.** Otherwise a pipe or CI job would wait forever for an answer. `--ask` forces the menu and reads the answer from stdin, which is also how the tests cover it. The prompt goes to stderr, so `--json` output stays parseable.
- **Topic is checked the same way as `lang`:** a frozen list, case-insensitive, a length cap before anything else, and an escaped echo in the error.

## Content limits for the new topics

The legal review's content policy applies, and it matters most here:

- **why:** the most natural Jordanian "why aren't you working" answers involve prayer or fasting, and those are off limits.
- **where:** may name roads and circles (7th Circle, Airport Road), never a business, mall, ministry or telco.

## Where it lives

- `src/excuses.js`: the `topic` field, with entries grouped by topic.
- `src/index.js`: `TOPICS`, `normalizeTopic()`, `excuse()`.
- `bin/ma3lesh.js`: the topic argument, `askTopic()` and the labels.
- `test/library.test.js`: valid topics, a minimum of eight per topic, and per-topic picks.
- `test/cli.test.js`: the `--ask` answers and the no-wait behaviour.
