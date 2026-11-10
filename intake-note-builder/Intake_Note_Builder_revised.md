# Intake Note Builder

Follows the Salesforce intake screen. The note goes in General Information.

First name, last name, email and phone go straight into Salesforce. They are not part of this form, and the note will not copy while a phone, email, address, ID number, labeled date of birth, plate, or claim/policy/record number is detected.

In free-text fields, describe roles (the other driver, the store manager), not names or numbers.

Do not paste this note into AI tools or personal apps. The form clears after 10 minutes of inactivity and when the tab closes. Nothing is saved.

## Contact

Residence ZIP

Calling on behalf of

**Caller's relationship to PC** — Self, spouse, parent, child, other family, friend, other.

How did you hear about us?

[ ] Add to Dialer

## Incident

**Case type** — Choose from what the PC described, not the campaign.

**PL subtype** — Use Other only when the facts point to it.

[ ] Facts also fit a second case type

Second type

Dual-case check: the tool reads What happened, Specific details, Injuries and Location details. When the story suggests a second case type that isn't selected, a consistency check says so and that type's questions join **Ask next**. The message stops once the second type is selected; the questions stay. It never sets the type itself. When a second type is selected, all of that type's facts are added to Ask next too.

| Story mentions | On case type | Suggests | Adds questions |
|---|---|---|---|
| At work, was working, company vehicle, delivering, on the clock, on shift, rideshare or delivery app | MVA | Workers' Comp | Was the PC working when this happened? Who were they working for? Was it reported to the employer? |
| The same work words | Premises Liability | Workers' Comp | The same Workers' Comp questions, plus: whose property was it, the employer's or someone else's? |
| Parking lot, gas station, driveway, garage, drive-thru | MVA | Premises Liability | Who owns or manages the location? Did a condition of the property play a part (lighting, potholes, signs)? |
| Yard, porch, apartment, complex, landlord, neighbor's | Dog Bite | Premises Liability | Who owns the property? Is the dog owner a tenant? Did the landlord know about the dog? |

**Incident date** — Salesforce format is MM/DD/YYYY. Add the time after it if you have one.

Incident city

Incident state

**Name of establishment / property** — Required for Premises Liability and Workers' Comp. Name only, no street address.

**Location details** — Cross streets or a landmark only. No house number or street address.

What happened (as PC reports)

Specific details

## Injury

**Injury summary** — select all that apply.

[ ] Amputation

[ ] Brain Bleed or Coma

[ ] Death

[ ] Multiple Broken Bones

[ ] Multiple Surgeries

[ ] Neck / Back Surgery

[ ] Traumatic Brain Injury

Check only what the PC stated.

Injuries in the PC's words

Ongoing treatment

## Legal

Were you determined at fault?

Already represented by an attorney?

Claim already settled or resolved?

**Do you or At-Fault have insurance?** — The Salesforce question is one field. Say whose below.

PC has insurance

At-fault party insured

At-fault party driving for a company?

**Police report / other documentation** — Yes, No or Unknown, and the type (police report, photos, medical records). No report or claim numbers.

The note lists fault and insurance lines for every case type, matching the field sheet. For Premises Liability and Workers' Comp, the at-fault party is the property owner or employer.

Call outcome and next steps

## Ask next

Panel beside the note. Shows how many critical facts are answered (for example, 12 of 14 critical) and lists up to 5 unanswered questions: critical first (red dot), then helpful, in call order. A tag shows when a question comes from the second case type or a dual-case trigger. Each question has two buttons:

- **PC didn't know** — counts as answered. In the compact note it moves that line to "Asked, PC didn't know".
- **Not relevant** — hides the question for this lead.

A fact counts as answered when its field is filled (no ___ blanks), or, for facts without a field, when the story contains matching words. Missing critical facts show as one warning flag and are listed under "Not asked" in the compact note. They never block copying. Questions are neutral drafts; replace them with your approved wording in SETTINGS (`facts` and `triggers`).

| Case type | Critical | Helpful |
|---|---|---|
| Every type | Incident date, city and state, injuries, treatment, already represented, claim settled | — |
| MVA | PC's role (driver, passenger, pedestrian, cyclist), how the crash happened, at-fault insurance, police report, at-fault driver working for a company | PC's insurance, others in the vehicle |
| Premises Liability | What caused it, type and name of property, reported to staff, incident report | Photos or witnesses |
| Dog Bite | Dog's owner, where it happened | Animal control or police report, prior bites |
| Workers' Comp | Employer name, working at the time, reported to employer | When it was reported |

## Review writing

Checks the free-text fields (What happened, Specific details, Location details, Injuries, Ongoing treatment, the detail boxes and Call outcome) on this computer only. Nothing is sent anywhere.

- **Spelling** — words not in the built-in dictionary (about 39,000 English words from SCOWL, plus an editable allow list of medical, auto and legal terms) get up to 3 suggestions, nearest and most common first. Words with numbers, all-caps words (PC, MRI) and capitalized words mid-sentence (likely names) are skipped.
- **Grammar** — each problem comes with a fix, for example "should of" → "should have", "a accident" → "an accident", "the PC were" → "the PC was", "PC was took" → "PC was taken", "their was" → "there was", "more then" → "more than", "slammed on the breaks" → "brakes", "rear ended" → "rear-ended". Long sentences (over 40 words) get a note only.
- **Accept**, **Reject**, or **Ignore word** for each item. **Accept all safe** applies every grammar fix and spelling fixes with one clear choice. **Undo** reverses one step at a time.
- A fix is never applied if it would change a number or add a new fact; that button is greyed out and the item shows "Manual fix needed".
- **Copy note** reminds you once if suggestions haven't been reviewed; copy again to copy anyway.

**Polish (format only)** fixes spacing, capitals and punctuation. It no longer changes spelling.

[ ] Compact: hide "Not provided" lines and list them under Missing

Missing is split in two: Not asked (raise on callback) and Asked, PC didn't know (request documents).

Example (made-up data, Compact on, MVA with possible Workers' Comp):

```
CALL CHECKS
- Recording disclosed: Not confirmed
- Phone verified verbally: Not confirmed
- Age verification: Not verified
WHAT HAPPENED
- Case type: Motor Vehicle Accident (MVA)
- Possible dual case type: Motor Vehicle Accident (MVA) and Workers' Comp
- Incident date: 03/14/2026
- Incident city and state: Springfield, Illinois
- Establishment / employer: Example Delivery Co.
- What happened (as PC reports): PC reports being the driver of a company van while making a delivery when another car ran a red light and hit the driver side.
INJURY AND TREATMENT
- Injuries (as reported): Neck and lower back pain.
- Ongoing treatment: Went to the ER the same day; X-rays taken.
LEGAL
- Represented by an attorney: No
- Claim settled or resolved: No
- Police report / documentation: Yes - Police report
MISSING
- Not asked (raise on callback): Caller relationship, Lead source, Location details, Specific details, PC at fault, PC insurance, Company driver, Call outcome, Reported to employer
- Asked, PC didn't know (request documents): At-fault insurance
```

**Copy note** stays disabled while an identifier or a ___ blank is in the note.

Click Copy on a row to copy that value. First name, last name, email and phone are typed into Salesforce directly.