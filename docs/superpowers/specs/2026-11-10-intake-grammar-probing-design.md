# Intake note builder: spelling/grammar review and probing-question engine

Date: 2026-11-10 · Status: approved design, awaiting spec review
Target file: `intake-note-builder/index.html` (single offline page)

## Goal

1. Catch and fix far more spelling and grammar errors in free-text fields, with fewer false flags.
2. Tell the agent, during the call, which facts are still needed to classify the case,
   including dual case types, and which question to ask next.

## Decisions (from the user)

| Topic | Decision |
|---|---|
| Privacy | Strictly offline. No text leaves the computer. No network calls. |
| Failures to fix | Missed misspellings; grammar flagged but not fixed; wrong/noisy flags. English only. |
| Fix mode | Suggest → agent Accepts/Rejects each change. |
| Dictionary | Embedded, about 25k words (~200–300 KB). |
| Probe logic | Per-case-type facts checklist + story keyword triggers, ranked "Ask next" list + completeness score. |
| Probe wording | Generic, neutral drafts in SETTINGS; firm edits locally. |
| Enforcement | Warning flag only. Never blocks copy or disposition. |
| Dual cases in scope | MVA + WC, Premises + WC, MVA + Premises, Dog bite + Premises. |

## Non-goals

No external grammar API or LLM. No Spanish spell check (the voicemail scripts are unaffected). No rewriting
of sentence meaning, no legal conclusions, no auto-changing structured answers (selects/checkboxes).

## 1. Spelling engine

- **Dictionary source:** an SCOWL-derived English list (size ~35, about 25k words), embedded as one
  space-separated string and loaded into a `Set` at startup. *Open item:* confirm the SCOWL license
  allows embedding, and keep its notice in a comment, before committing the list.
- **Allow list (`CONFIG.allowWords`):** medical (MRI, ER, ICU, chiropractor, herniated, lumbar…),
  auto (rideshare, sedan, rear-ended, T-boned…), legal/intake (PC, MVA, WC, UM, UIM, PIP…), US state
  names and common city terms. Firms add words here.
- **Session ignore:** "Ignore" on a suggestion adds the word to an in-memory set for that lead only.
  Cleared on New lead. Nothing is stored.
- **Not checked:** tokens with digits; ALL-CAPS tokens (2+ letters); words that start with a capital
  letter mid-sentence (likely names or places, so not flagged, which also avoids echoing identifiers);
  `___` blanks; email/phone patterns.
- **Suggestions:** candidates at Damerau-Levenshtein distance ≤ 2 (transposition counts as 1). Rank:
  (a) the existing `SPELL` known-typo map first, (b) lower distance, (c) keyboard-neighbour
  substitutions cost 0.5, (d) dictionary order (the list is stored most-common first). Up to 3 suggestions.
  Words of 3 letters or fewer: distance ≤ 1 only.
- **Performance target:** checking all free-text fields takes < 100 ms on a typical note (about 300 words).
  Use length-bucketed lookup plus a deletes index for distance 1, and a brute-force pass on the same-length ±2
  bucket only for words still unresolved.

## 2. Grammar engine

Each rule is `{ id, re, fix(m) → replacement | null, msg, examples: { bad: [...], good: [...] } }`.
A rule with `fix` produces a before→after suggestion. A rule without one is a note only (for example, a long sentence).

Initial rules (all with fixes unless noted):

| id | Detects → fix |
|---|---|
| repeat | "the the" → "the" (skips "had had", "that that") |
| a-an | "a accident" → "an accident"; "an car" → "a car"; sound exceptions (an hour, an MRI, an ER, a uniform, a one-car…) |
| of-have | "should/could/would/must of" → "… have" |
| sva-sing | "PC/he/she/it/the client/the driver were/are/have/don't" → was/is/has/doesn't |
| sva-plural | "they/we/you was/is/has/doesn't" → were/are/have/don't |
| was-went | "was went/came/took…" → "went/came/took…" (drops the auxiliary) |
| there-their | "their was/is/were/are" → "there …" |
| its-it's | "its a/the/been/not" → "it's"; "it's own" → "its own" |
| then-than | "more/less/better/worse/rather then" → "than" |
| lose-loose | "loose consciousness" → "lose consciousness" |
| ive-pron | lowercase "i" alone → "I" |
| space-punct | " ," → ","; double space → single |
| cap-start | sentence starting lowercase → capitalized |
| end-period | narrative field without final period → add "." |
| run-on | sentence > 40 words (note only, no fix) |

Noise fixes: lowercase-start and repeated-word rules ignore text inside quotes and list-like lines.
`a-an` uses an exceptions table, not the current lookahead hack. Every rule must pass its own
`examples` and must produce zero hits on a shared corpus of correct sample sentences (written by us,
synthetic).

## 3. Review panel (replaces separate Polish / Check grammar results)

- Button **Review writing** runs spelling + grammar on the narrative and detail fields (`what, spec, inj,
  tx, outcome, loc, fault-d, ins-d, oins-d, ocomp-d, docs-d`).
- Output is grouped by field. Each item shows the context snippet, before → after, and the buttons **Accept**,
  **Reject** (spelling items also get **Ignore word** and a choice of up to 3 suggestions).
  There are also **Accept all safe** and **Undo last** buttons.
- **Safety guard (kept):** before applying an edit, run `addsNothing(before, after)`. Numbers must be
  unchanged, and new words may come only from the dictionary suggestion or the rule's fix. Otherwise the
  item is shown as "manual fix needed".
- Edits are applied by character offset, right to left, and items are recomputed after each accept.
- The existing **Polish** button stays for whitespace/punctuation/capitalization formatting only.

## 4. Probing engine

### Data (editable in SETTINGS)

```js
CONFIG.facts = {
  mva: [ { id, label, q, field | test(f), level: "critical"|"helpful" }, ... ],
  pl: [...], dog: [...], wc: [...], other: [...]
};
CONFIG.triggers = [
  { id, re, in?: [fields], when?(f), adds: "wc"|"pl"|"dog"|..., facts: [ ...extra facts ], msg }
];
```

A fact is **answered** when its `field` is non-empty (and has no `___` blanks), when `test(f)` returns true,
or when the agent marks it **PC didn't know**. **Not relevant** dismisses it for this lead.

### Draft facts (generic, neutral, non-leading wording; the firm edits these)

- **All types (critical):** incident date; city/state; injuries; treatment; represented by attorney;
  claim settled.
- **MVA:** PC's role (driver/passenger/pedestrian/cyclist) · how the crash happened · at-fault insurance ·
  police report · was the other driver working (company vehicle) · PC's own insurance (helpful).
- **Premises:** what caused the fall/injury (hazard) · property name/type · was it reported to staff ·
  photos/witnesses (helpful) · incident report.
- **Dog bite:** who owns the dog · where it happened (owner's property, PC's, public) · is the PC's
  relationship to the owner known (helpful) · medical treatment for the bite · animal control report (helpful).
- **WC:** employer name · was the PC working at the time · was it reported to the employer · date reported (helpful).

### Dual-case triggers (initial set)

| Trigger (story text) | Adds | Extra facts asked |
|---|---|---|
| work words (existing `work` rule: at work, company vehicle, delivering, on the clock, rideshare/delivery app) on MVA | WC | Was the PC working when this happened? Who were they working for? Reported to employer? |
| work words on Premises | WC | Same WC facts + "Whose property was it — the employer's or someone else's?" |
| parking lot, gas station, driveway, garage, store lot, drive-thru on MVA | Premises | Who owns/manages the location? Did a condition of the property play a part (lighting, potholes, signage)? |
| yard, porch, apartment, complex, landlord, neighbor's on Dog bite | Premises | Who owns the property? Is the dog owner a tenant? Was the landlord aware of the dog? |
| (existing rules) lawyer, passengers, minor | — | Kept as triggers with their current messages. |

A trigger only fires when the second type isn't already selected (`type`/`type2`). It suggests checking
**Possible dual case** and selecting the type; it never sets them itself.

### Output

- Panel **Ask next** beside the script: completeness `answered critical / total critical` (and a
  helpful count), then up to 5 unanswered facts ranked critical → helpful, then in call order. Each fact
  shows its question text and the buttons **PC didn't know** and **Not relevant**.
- Missing critical facts add one **warning** flag ("3 critical facts not yet asked: …"). No blocking.
- Compact note: unanswered critical facts appear in "Not asked (raise on callback)".
- The current `CONFIG.consistency` rules migrate into `CONFIG.triggers`, and `renderConsistency` is replaced.
  The "Confirmed" dismiss behavior is kept.

## 5. Testing

- Extend `window.__test` with `spellCheck`, `grammarSuggest`, `applyFix`, `probeState`.
- Add `intake-note-builder/tests/run.js` (Node + the preinstalled Playwright). It loads the page and asserts:
  - each grammar rule's `examples.bad` gives its fix and `examples.good` gives no hit;
  - a synthetic correct corpus gives zero grammar hits and ≤ 1 spelling flag per 200 words;
  - 30 synthetic typos: the correct word is in the top 3 for ≥ 90% of them;
  - `addsNothing` rejects edits that add numbers or words;
  - for each of the 4 dual scenarios (synthetic stories), the trigger fires, the extra facts appear, and
    it does not fire once `type2` is set;
  - the spelling pass takes < 100 ms on a 300-word synthetic note.
- All test text is invented. No real caller data.

## Done criteria

All tests pass. The page still opens from `file://` with no network requests (checked in Playwright).
The file stays under 1 MB. The SETTINGS block documents how to edit `facts`, `triggers` and `allowWords`.

## Risks

- **Dictionary false flags on names:** mitigated by skipping capitalized mid-sentence words and by the allow list.
- **Grammar fixes that change meaning:** fixes are narrow, every one is shown before it is applied, and the safety guard runs.
- **Probe fatigue:** the panel caps at 5 items, and "Not relevant" dismisses.
