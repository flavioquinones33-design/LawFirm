# Security Kit for a Local Note Tool

Generic, firm-free materials for securing a browser-based note builder that runs from a
local HTML file on one computer. Nothing here contains organization names, procedures,
source code, or client data.

| File | Use it to |
|---|---|
| `CHECKLIST.md` | Check computer, browser, clipboard and policy settings |
| `self-test.html` | Test your own tool with made-up values, and second-check a test note with an offline scanner |

## How to use

1. Download `self-test.html` and open it by double-clicking. It needs no internet and stores nothing.
2. Run tests T1–T7 against your tool.
3. Mark results in `CHECKLIST.md`. Every "No" or "Fail" is a gap to fix.

## Key decisions

- **No password inside the tool.** A local HTML file cannot keep a secret. Protect the computer
  instead: sign-in password, automatic screen lock, full-disk encryption.
- **Keep real data out of everything here,** including AI tools, repositories, and test runs.
  Use only the synthetic values in `self-test.html`.
- **The scanner is a second check, not a guarantee.** It cannot detect personal names.

These materials are general guidance, not legal or compliance advice.
