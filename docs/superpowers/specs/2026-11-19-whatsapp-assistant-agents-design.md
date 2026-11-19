# WhatsApp Business Assistant Agents: Design

Status: draft for review. No code, credentials, or client data are in this repository.

## Goal

Agents that read WhatsApp Business messages (client chats included) and keep the owner organized:
pending tasks, pending schedules, meetings, daily summaries, calendar upkeep, and strategy/next-step
help for current projects (RAG AP, Tech Beyond, others).

## Blockers before any real message is processed (owner actions)

| # | Item | Why |
|---|---|---|
| B1 | Written approval from the firm (ethics/compliance) for sending client messages to Meta's API, the hosting provider, and an AI model provider | Confidentiality duty (e.g., ABA Model Rule 1.6(c); ABA Formal Opinion 512 on generative AI). Not re-checked in this session; jurisdiction rules may differ. |
| B2 | Review the AI provider's data terms (retention, training use, zero-retention options) and sign any needed agreement | Client data leaves the firm |
| B3 | Meta Business account verified; WhatsApp Business Platform (Cloud API) app created | Only official access path |
| B4 | Decide the number: keep the current WhatsApp Business app number via Meta "coexistence", or a new API-only number | Coexistence availability/limits not verified here (medium confidence it exists) |
| B5 | Firm-controlled hosting (cloud account in the firm's name) and secret storage | Webhook server and encrypted store must not run on personal accounts |

## Key facts and limits

- Cloud API delivers messages by webhook as they arrive; past chat history is not retrievable. (Fact, high confidence.)
- Business-initiated messages outside the 24-hour customer window need approved templates. (Fact, high confidence.)
- Pricing and rate limits: not verified; check Meta's current pricing page before launch.

## Architecture

```
WhatsApp Cloud API ──webhook──▶ Ingest service ──▶ Encrypted store (messages, 30-day retention)
                               (signature check)          │
                                                          ▼
                                    Agent runner (scheduled + on new message)
                     ┌──────────────┬───────────────┬──────────────────┐
                     ▼              ▼               ▼                  ▼
                 Triage agent   Scheduler agent  Briefing agent   Project strategist
                 (tasks,        (proposes         (daily/weekly    (RAG AP, Tech Beyond;
                 deadlines)     calendar items)   summary)         project notes only)
                     └──────────────┴───────┬───────┴──────────────────┘
                                            ▼
                         Review queue (owner approves) ──▶ Google Calendar / task tracker
```

### Agents

| Agent | Input | Output | Can act without approval? |
|---|---|---|---|
| Triage | New messages | Tasks with due date, owner, source chat link, confidence | Creates draft tasks only |
| Scheduler | Tasks, calendar | Proposed events, conflicts, reschedule suggestions | No. Owner approves every event; never invites others automatically |
| Briefing | Tasks, calendar, open threads | Morning brief + end-of-day recap, sent only to the owner | Yes (owner-only delivery) |
| Project strategist | Project tracker (no client chats) | Status, risks, next steps, strategy options per project | Drafts only |

No agent sends messages to clients. Replies are drafted for the owner to send.

### Controls

1. Verify `X-Hub-Signature-256` on every webhook; reject unsigned requests.
2. Encrypt stored messages; delete after 30 days (configurable); keep extracted tasks, not raw text, longer.
3. Minimize what reaches the model: send only the message window needed; strip phone numbers and IDs where possible.
4. Isolate client chats from the project strategist; projects use a separate tracker.
5. Secrets (Meta token, model API key, Google OAuth) in the host's secret manager, never in code or this repo.
6. Audit log of every model call and every calendar/task change (who, what, when; no message text).
7. Kill switch: one setting stops ingestion and agent runs.
8. All outputs are suggestions that need human review.

## Build order and done criteria

| Phase | Deliverable | Done when |
|---|---|---|
| 0 | B1–B5 complete | Owner confirms in writing |
| 1 | Ingest service + store, tested with synthetic webhook payloads | Signature check, encryption, retention tests pass |
| 2 | Triage + review queue | Synthetic chats produce correct draft tasks; nothing auto-acts |
| 3 | Scheduler + Google Calendar (approve-to-create) | Approved items appear; conflicts flagged |
| 4 | Briefing agent | Brief arrives daily to the owner only |
| 5 | Project tracker + strategist for RAG AP, Tech Beyond | Each project has status, next steps, risks; owner supplies non-confidential project descriptions |
| 6 | Pilot on real messages | Only after phase 0; one-week pilot, then review |

## Decisions (from owner, 2026-11-19)

| Topic | Decision |
|---|---|
| Hosting | Firm's existing Google Cloud |
| WhatsApp number | Current Business number, via Meta coexistence (availability to be confirmed) |
| Task/project tracker | Google Sheets |
| Summaries and approvals | WhatsApp to the owner |
| Users | Small team |
| Chat visibility | Everyone sees all chats (to be reconfirmed, see below) |
| Calendar | Google Calendar |
| Extracted as drafts | Tasks, meeting requests, deadlines/hearings, unanswered chats |
| Briefs | Morning brief |
| Strategist output | Next steps, risks and blockers, strategy options, weekly status |
| Projects | "This will be for another law firm" (meaning to be clarified) |

## Open questions

- Is the whole system, or only RAG AP and Tech Beyond, for another law firm? Who owns the WhatsApp number, Google Cloud account and calendar?
- Keep "everyone sees all", or allow some chats to be marked restricted (conflicts, sensitive matters)?
- Time and time zone for the morning brief.
- Short, non-confidential descriptions of RAG AP, Tech Beyond and other projects (goals, stage, deadlines).
