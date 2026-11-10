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

Dual-case check: the tool reads What happened, Specific details, Injuries and Location details. When the story suggests a second case type that isn't selected, it says so and adds that type's questions to **Ask next**. It never sets the type itself.

| Story mentions | On case type | Suggests | Adds questions |
|---|---|---|---|
| Working, company vehicle, delivering, on the clock, rideshare or delivery app | MVA | Workers' Comp | Was the PC working when this happened? Who were they working for? Was it reported to the employer? |
| Working, on shift, job site | Premises Liability | Workers' Comp | The same Workers' Comp questions, plus: whose property was it, the employer's or someone else's? |
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

Shows how many critical facts are answered (for example, 6 of 9 critical) and lists up to 5 unanswered questions, critical first, in call order. Each question has two buttons:

- **PC didn't know** — counts as answered and goes under "Asked, PC didn't know".
- **Not relevant** — hides the question for this lead.

Critical facts for every case type: incident date, city and state, injuries, treatment, already represented, claim settled.

| Case type | Also critical |
|---|---|
| MVA | PC's role (driver, passenger, pedestrian, cyclist), how the crash happened, at-fault insurance, police report, at-fault driver working for a company |
| Premises Liability | What caused the injury, type of property, reported to staff, incident report |
| Dog Bite | Who owns the dog, where it happened, treatment for the bite |
| Workers' Comp | Employer name, working at the time, reported to employer |

Missing critical facts show as a warning flag. They never block copying. Questions are neutral drafts; replace them with your approved wording in SETTINGS.

## Review writing

Checks the free-text fields for spelling and grammar on this computer only. Nothing is sent anywhere.

- **Spelling** — words not in the built-in dictionary (about 25,000 words plus medical, auto and legal terms) get up to 3 suggestions. Words with numbers, all-caps words and capitalized words mid-sentence are skipped.
- **Grammar** — each problem comes with a fix, for example "should of" → "should have", "a accident" → "an accident", "the PC were" → "the PC was", "their was" → "there was", "more then" → "more than".
- **Accept**, **Reject**, or **Ignore word** for each item; **Accept all safe** and **Undo** for the lot.
- A fix is never applied if it would change a number or add a new fact. Those items show "manual fix needed".

**Polish** still fixes spacing, capitals and punctuation only.

[ ] Compact: hide "Not provided" lines and list them under Missing

Missing is split in two: Not asked (raise on callback) and Asked, PC didn't know (request documents).

```
(Note preview appears here.)
```

Click Copy on a row to copy that value. First name, last name, email and phone are typed into Salesforce directly.