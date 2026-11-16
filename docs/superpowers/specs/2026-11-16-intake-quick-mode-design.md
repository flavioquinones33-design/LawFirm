# Intake note builder: Quick mode (no double entry)

Date: 2026-11-16 · Status: design, awaiting review
Target file: `intake-note-builder/index.html` (and its copy `Intake_Note_Builder_revised.html`)

## Problem

The agent fills the Salesforce intake form first. Nearly every structured field in the note builder
repeats a Salesforce field, so the same fact is typed twice. Only the General Information note is
unique to the builder.

## Goal

Never type a fact twice. Keep the parts the agent relies on: the autofail checklist, Ask next and the
dual-case checks, Review writing, the formatted note, and flags with identifier blocking.

## Decisions (from the user)

| Topic | Decision |
|---|---|
| Order of work | Salesforce holds the facts. The builder stays open during the call and the story is typed into it live. |
| What the note needs | Only what Salesforce fields can't hold: the story, details, missing items and next steps. |
| Features to keep | Autofail checklist, Ask next and dual-case checks, Review writing, formatted note, flags and identifier blocking. |
| Not relied on | The call script. |
| What can be installed | Not answered. Assumed: a local HTML file only. |

## Design

### 1. Two modes, one file

A switch in the header: **Quick mode** (default) and **Full form**. Full form is today's page, unchanged.
Nothing is deleted. The default is set by `CONFIG.defaultMode` in SETTINGS. The mode is not remembered
between page loads, because the page saves nothing.

Switching modes keeps everything already entered.

### 2. What Quick mode shows

1. **Autofail prevention checklist**, as today.
2. **Case type**, plus "Facts also fit a second case type" and Second type. One dropdown, because it
   drives Ask next and the dual-case triggers.
3. **Salesforce facts** (chips, section 3).
4. **What happened (as PC reports)**: the story box.
5. **Details**: the existing Specific details box. Hint: "Anything the Salesforce fields can't hold,
   including injuries and treatment in the PC's own words."
6. **Call outcome and next steps**.
7. **Voicemail** and **Call disposition**, collapsed by default.
8. **Review writing**, as today.

Hidden in Quick mode: ZIP, on behalf of, relationship, lead source, Add to Dialer, PL subtype, date,
city, state, establishment, location details, injury summary boxes, injuries, treatment, the fault /
attorney / settled / insurance / company / documentation selects and their detail boxes, the call
script, and the CRM fields tab.

### 3. Salesforce facts: chips in place of fields

Each fact that already has a Salesforce field becomes a chip. No typing.

**Answer chips** carry the answer, because the consistency checks compare the story with it:

| Chip | Choices |
|---|---|
| At fault | Yes / No |
| Has attorney | Yes / No |
| Settled | Yes / No |
| PC insured | Yes / No / Unknown |
| At-fault insured | Yes / No / Unknown |
| At-fault driving for a company (MVA only) | Yes / No / Unknown |
| Police report / documentation | Yes / No / Unknown |

Tapping a choice sets the same underlying field Full form uses (`fault`, `atty`, `settled`, `ins`,
`oins`, `ocomp`, `docs`). So every existing consistency check, Ask next fact and flag keeps working
with no change to the engines. Tapping the selected choice again clears it. "Unknown" is the existing
"PC does not know" value.

**Entered chips** only record that the fact is in Salesforce:

| Chip | Shown for |
|---|---|
| Incident date | all |
| City and state | all |
| Injuries | all |
| Treatment | all |
| Establishment / employer | Premises Liability, Workers' Comp, or a dual case with either |

One tap: "In Salesforce". Second tap: "PC didn't know". Third tap: cleared. Stored in a new in-memory
map `sfMarks` (field id → "sf" or "dk"), cleared by New lead and by the idle timer.

A fact counts as answered in Ask next when its field is filled **or** marked "sf". "dk" maps to the
existing "PC didn't know" state.

### 4. The Quick note

```
CALL CHECKS
- Recording disclosed / Phone verified verbally / Age verification
WHAT HAPPENED
- Case type (and possible dual case type)
- What happened (as PC reports)
- Details
NEXT STEPS
- Call outcome and next steps
- Call disposition (only if selected)
MISSING
- Not asked (raise on callback): ...
- Asked, PC didn't know (request documents): ...
```

- No date, place, fault, attorney, settled or insurance lines. Those live in Salesforce.
- MISSING always shows in Quick mode (no Compact switch). It lists every critical fact still open,
  and every fact marked "PC didn't know".
- Identifier blocking and the ___ blank check apply as today.

### 5. Flags in Quick mode

- Kept: identifiers, ___ blanks, the autofail items, promises in Call outcome, missing critical facts,
  unreviewed writing suggestions, decline rules, case type not specified.
- Dropped in Quick mode only: date format and missing city/state (those fields are hidden), and
  "Call disposition not selected" unless the agent opens the disposition section and picks one.
  Disposition-dependent flags (transfer check, callback time, Do Not Call) still apply once a
  disposition is selected.

### 6. Consistency checks that read hidden fields

The `year` and `reldate` checks compare the story with the date field. In Quick mode the date field is
hidden, so:
- `year` is skipped.
- `reldate` ("yesterday", "last week") fires unless the Incident date chip is marked.

The `behalf` and `minor` checks read the relationship field, hidden in Quick mode. They keep firing on
story words, with the message changed to "Confirm in Salesforce".

### 7. Help

The built-in guide gets a "Quick mode" section at the top: the live-call workflow (story in the
builder, facts in Salesforce, chips as you go, one paste into General Information at the end).

## Out of scope

- Reading or filling the Salesforce page (bookmark button or extension). Possible later, needs IT approval.
- Changes inside Salesforce (required fields, layout, a button).
- Better story understanding than today's keyword rules.

## Risks

- **Chips are self-reported.** The tool can't check Salesforce. Tapping everything gives a full score
  with no real coverage. Mitigation: none in the tool; this is a habit and QA matter.
- **Keyword reading of the story.** Quick mode leans on it more. Only tested on made-up sentences.
  Mitigation: every auto-answered fact can still be overridden with "PC didn't know" or "Not relevant".
- **The note no longer stands alone.** If it is ever read outside Salesforce it lacks date and place.
  Mitigation: Full form still produces the complete note.
- **Assumed Salesforce fields.** The chip list comes from the layout .md, not from the real screen.
  The user should confirm it matches.

## Testing

Extend `intake-note-builder/tests/run.js` (made-up text only):

- The page opens in Quick mode; the duplicated fields, script and CRM tab are hidden.
- Existing 73 checks still pass with the page switched to Full form.
- An answer chip sets the underlying field; tapping it again clears it.
- Story "PC already spoke to a lawyer" with Has attorney = No raises the lawyer check; set to Yes, it clears.
- An entered chip marks its fact answered; the second tap moves it to "Asked, PC didn't know".
- The Quick note has no fault, insurance, date or place lines, and always has MISSING.
- Switching Quick → Full → Quick keeps the story, chips and case type.
- Dual-case trigger still fires in Quick mode, and Establishment / employer chip appears once Workers' Comp is the second type.
- New lead clears chips.
- No network requests; no page errors.

## Done criteria

All tests pass on both HTML files. Typed inputs in Quick mode: case type plus three text boxes.
The Help guide and `Intake_Note_Builder_revised.md` describe Quick mode.
