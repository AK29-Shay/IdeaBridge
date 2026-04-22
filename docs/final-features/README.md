# Final Features Update Guide

This folder captures the final feature handoff for the four-member team and the supporting automation for ClickUp and verification.

## Branches

Git branch names cannot contain spaces, so the requested branch `Final features update` was created as:

- `final-features-update`

The four implementation branches created from it are:

- `feat/final-admin-portal-member1`
- `feat/final-realtime-chat-booking-member2`
- `feat/final-recommendations-ai-member3`
- `feat/final-supabase-project-tracking-member4`

All five branches point to the current `dev` head, which already includes the latest integrated work from the last three days.

## Real-name ownership

- Sneha Dhaya: Admin portal for mentor approval, moderation, and platform operations
- Akshayan Ilankovan: Real-time chat, notifications, and mentor booking slots
- Nethmini Chinthana: Saved ideas, recommendation feeds, and AI-assisted idea refinement
- Abinayan: Supabase-backed student project tracking records

## Deadline

Use the explicit deadline:

- Due date: `2026-04-23 11:59 PM Asia/Colombo`

## ClickUp automation

Create or update the four final feature tasks in ClickUp:

```powershell
$env:CLICKUP_PAT="your_rotated_clickup_token"
npm run clickup:final-features
```

This script:

- Finds the `A5 - Final Delivery` list
- Creates or updates the four tasks
- Assigns them to real members when the members exist in the ClickUp workspace
- Writes task-specific branch and commit instructions using the real ClickUp task ID
- Applies module tags

If the members have not yet joined ClickUp, the tasks are created but remain unassigned until the script is re-run after the invites are accepted.

## Historical evidence linking

Attach GitHub commit and PR links to the completed Assignment 5 evidence tasks:

```powershell
$env:CLICKUP_PAT="your_rotated_clickup_token"
npm run clickup:link-history
```

This reads `docs/assignment5/project-management-evidence/task_evidence.csv` and appends direct GitHub commit and PR links to the matching completed ClickUp tasks.

## Verification

Run the terminal API smoke checks against the local app:

```powershell
npm run smoke:api
```

Run the browser smoke checks:

```powershell
npm run test:e2e:smoke
```

Run the full Playwright suite:

```powershell
npm run test:e2e
```

Use the shared AI prompt here:

- `docs/final-features/MASTER_PROMPT.md`
