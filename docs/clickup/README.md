# ClickUp Workspace Setup

This folder contains the local assets used to bootstrap and verify the ClickUp workspace for IdeaBridge / IT3040.

## Files

- `postman/IdeaBridge ClickUp.postman_environment.json`: Postman environment with the ClickUp workspace, space, and evidence list IDs
- `postman/IdeaBridge ClickUp.postman_collection.json`: Postman collection for the core verification and task endpoints
- `../../scripts/bootstrap-clickup-setup.mjs`: idempotent workspace bootstrap for the course-specific structure

## Bootstrap the workspace

Use a rotated ClickUp personal access token in the terminal instead of storing it in the repo:

```powershell
$env:CLICKUP_PAT="your_rotated_token"
node scripts/bootstrap-clickup-setup.mjs
```

Optional dry-run:

```powershell
$env:CLICKUP_PAT="your_rotated_token"
node scripts/bootstrap-clickup-setup.mjs --dry-run
```

## What the bootstrap does

- Renames the Space to `IdeaBridge - IT3040`
- Renames the legacy placeholder root lists so they are clearly marked
- Ensures the hybrid course structure exists with:
  - `00 Admin & Evidence`
  - `01 Course Milestones`
  - `02 Finalization`
- Renames the reused evidence list to `A5 - Project Management Evidence`
- Creates ClickUp tags for assignment, module, and evidence tracking
- Creates the `Responsibility Matrix` and `Evidence Index` docs
- Creates the required board, calendar, and table views
- Imports or updates the Assignment 5 evidence tasks from `docs/assignment5/project-management-evidence/clickup_import.csv`
- Creates or updates the current/future finalization tasks

## Manual follow-up

Two parts of the plan still need the ClickUp UI:

1. Invite the remaining members as Workspace members:
   - `snehadhaya55@gmail.com`
   - `Imbnethminichinth@gmail.com`
   - `Kesavanabinayan12@gmail.com`
2. Link the GitHub repo `AK29-Shay/IdeaBridge` to the Space

Official references:

- ClickUp invite guide: <https://help.clickup.com/hc/en-us/articles/6310498173079-Invite-people-to-join-your-Workspace>
- ClickUp GitHub integration guide: <https://help.clickup.com/hc/en-us/articles/6305771568791-GitHub-integration>
- ClickUp task API docs: <https://developer.clickup.com/docs/tasks>

## Re-run after members join

After the members accept their ClickUp invites, run the bootstrap again. It will reuse the existing structure and backfill assignees where member matching becomes possible.
