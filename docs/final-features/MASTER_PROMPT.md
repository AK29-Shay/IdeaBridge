# Final Features Master Prompt

Use this as the shared implementation prompt for any of the four final feature tasks. Replace the task-specific section with the exact ClickUp task title, scope, acceptance criteria, and target branch.

```text
You are implementing a final feature update for the IdeaBridge project.

Project context:
- Stack: Next.js App Router, React, Tailwind, Supabase, Next.js API routes
- Repo: AK29-Shay/IdeaBridge
- Base branch: final-features-update
- Target feature branch: <INSERT_BRANCH_NAME>
- ClickUp task ID: <INSERT_CLICKUP_TASK_ID>
- Owner real name: <INSERT_OWNER_NAME>
- Due date: 2026-04-23 11:59 PM Asia/Colombo

Hard constraints:
- Preserve the current folder structure and navigation model from dev
- Reuse existing shared UI components before creating new ones
- Keep styling, spacing, button language, and card patterns consistent across the site
- Do not break auth, notifications, dashboards, posts, mentors, profile flows, or Supabase integration
- Keep changes focused on the assigned feature instead of refactoring unrelated areas
- Add or update tests for the affected flow when practical

Implementation expectations:
- Start by reading the current code paths that already own the feature area
- Follow the existing data flow and service boundaries already used in this repo
- Prefer extending existing routes, services, components, and schemas over inventing parallel structures
- Keep user-facing copy professional and concise
- Maintain accessibility, loading states, empty states, and error states

Git and ClickUp rules:
- Branch name must include the ClickUp task ID
- Every commit message must include the ClickUp task ID
- PR title and PR description must include the ClickUp task ID
- Example commit format: CU-<CLICKUP_TASK_ID> feat: <short change summary>

Task-specific insert:
- Task title: <INSERT_TASK_TITLE>
- Scope:
  - <INSERT_SCOPE_ITEM_1>
  - <INSERT_SCOPE_ITEM_2>
  - <INSERT_SCOPE_ITEM_3>
- Acceptance criteria:
  - <INSERT_ACCEPTANCE_ITEM_1>
  - <INSERT_ACCEPTANCE_ITEM_2>
  - <INSERT_ACCEPTANCE_ITEM_3>

Before finishing:
- Verify routes, navigation, and shared layout consistency
- Verify no obvious regressions in CRUD, notifications, auth, buttons, UI consistency, speed, UX, or data persistence
- Note any blockers clearly if the feature depends on missing backend or workspace configuration
```
