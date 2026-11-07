# Security Checklist: Local Intake Note Tool

Generic checklist for a browser-based note builder that runs from a local HTML file on one
computer. It contains no firm names, procedures, or client data.

Mark each item Yes / No / N/A. Anything marked No is a gap.

## 1. Access to the computer (replaces a password in the tool)

A password inside a local HTML file protects nothing: anyone can open the file in a text
editor or use view-source. Control access at the computer level instead.

| # | Check | How to verify |
|---|---|---|
| 1.1 | Computer requires a sign-in password or PIN | Sign out and back in |
| 1.2 | Screen locks automatically after 5 minutes or less | Windows: Settings > Accounts > Sign-in options. Mac: System Settings > Lock Screen |
| 1.3 | You lock the screen when leaving the desk | Windows: Win+L. Mac: Ctrl+Cmd+Q |
| 1.4 | Full-disk encryption is on | Windows: BitLocker / Device encryption. Mac: FileVault |
| 1.5 | No one else uses your user account | — |

## 2. Where the tool file lives

| # | Check | How to verify |
|---|---|---|
| 2.1 | Tool folder is not synced to a personal cloud (personal Drive, Dropbox, iCloud) | Check the folder path and sync client settings |
| 2.2 | Tool file is not committed to any personal or public code repository | — |
| 2.3 | Only the tool itself is stored; no saved notes, exports, or screenshots | Inspect the folder |

## 3. Browser leak paths

| # | Check | How to verify |
|---|---|---|
| 3.1 | Form fields turn off autofill (`autocomplete="off"` on the form and fields) | Type a test value, reload, start typing again: no suggestion should appear |
| 3.2 | Browser autofill/address sync to your account is off for this browser profile, or you use a separate profile for intake | Chrome: Settings > Autofill and passwords; Settings > You and Google > Sync |
| 3.3 | Tool does not keep data after the tab closes (no localStorage / sessionStorage / IndexedDB) | Use `self-test.html` steps T1–T2 |
| 3.4 | Tool clears the form after a period of inactivity | Use `self-test.html` step T3 |
| 3.5 | Tool makes no network requests (no external scripts, fonts, or analytics) | Use `self-test.html` step T4 |
| 3.6 | No browser extensions with "read and change all your data" access run on the tool page | Chrome: Extensions > Details > Site access |

## 4. Clipboard

| # | Check | How to verify |
|---|---|---|
| 4.1 | Windows clipboard history is off, or cleared after each session | Settings > System > Clipboard |
| 4.2 | Clipboard sync across devices is off | Same page (Windows); Universal Clipboard (Mac) |
| 4.3 | No third-party clipboard manager is running | Check startup apps |

## 5. What the note may contain

The detector should block copying when the note contains direct identifiers. Typical
categories and whether a simple pattern can catch them:

| Category | Examples | Pattern can catch it? |
|---|---|---|
| Email | name@example.com | Yes |
| Phone | (555) 010-0000 | Yes |
| Government ID | 000-00-0000 | Yes |
| Street address | 123 Example St | Mostly (number + street word) |
| Dates of birth | 01/02/1990 | Only with a label like "DOB"; plain dates are also incident dates |
| Plates, claim, policy, report, record numbers | 7XYZ000, CLM-000000 | Partly (long digit runs, mixed letter-digit codes) |
| Personal names | — | **No.** Rely on the instruction "describe roles, not names" |

Free-text fields are the main risk. Add a short instruction near each one:
"Describe roles (the other driver, the store manager), not names, numbers, or addresses."

## 6. Policy alignment

| # | Check |
|---|---|
| 6.1 | The tool shows a visible line: "Do not paste this note into AI tools or personal apps." |
| 6.2 | Notes go only into the approved system of record |
| 6.3 | Test data is synthetic (made-up values like those in `self-test.html`), never copied from real calls |
| 6.4 | Health and injury details are handled per your organization's policy; confirm with your compliance contact |

## Limits

- This checklist is general guidance, not legal or compliance advice.
- The menu paths above can change between OS and browser versions.
- A pattern detector reduces risk; it cannot guarantee a note is free of identifying details.
  A person must still read the note before it is saved.
