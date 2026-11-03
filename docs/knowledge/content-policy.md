# Content policy for excuses

`CONTRIBUTING.md` lists what never gets merged:

- religion beyond the light everyday phrases already in the list
- the royal family, the army or the security services
- politics, sects, ethnicity or nationality
- named people, companies or brands
- anything sexual or insulting

## Why

The maintainer publishes from Jordan and is responsible for everything merged. The risk was never the first excuses but the two-hundredth pull request, so the rule is written down, every pull request is read by a person, and nothing is auto-merged.

## Where the line sits

- **Allowed:** "inshallah", "after Eid" and "after Ramadan", because each joke is about the speaker's scheduling, not the faith.
- **Not allowed:** the obvious "why aren't you working" answers about prayer or fasting.
- **Allowed:** roads and places such as 7th Circle and Airport Road.
- **Not allowed:** businesses, malls, telcos or ministries.
- **Removed:** "Scrolling reels" became "Scrolling videos", because Reels is a brand.

## Where it lives

- `CONTRIBUTING.md`, under "What gets merged"
- `.github/ISSUE_TEMPLATE/new-excuse.yml`: a required checkbox (blank issues are turned off in `config.yml`, so the form can't be skipped)
- `test/library.test.js`: rejects hidden format characters such as bidi overrides and zero-width spaces
- `.github/pull_request_template.md`: a checklist item
- `CODE_OF_CONDUCT.md`, which points to the same rules
