# Assignment 5 Project Management Evidence

This folder reconstructs a ClickUp-ready task board directly from the repository history and keeps the mapping auditable for Assignment 5.

## Files

- `commit_history.txt`: full Git export from all branches with hash, date, normalized author, subject, and touched files
- `task_evidence.csv`: audit trail showing how each reconstructed task maps back to supporting commits
- `clickup_import.csv`: ClickUp import file with the exact header format requested in the plan

## Regenerate

```bash
npm run evidence:pm
```

## Push to ClickUp from VS Code

From the VS Code integrated terminal, use the importer script to create the tasks directly in ClickUp:

```bash
$env:CLICKUP_PAT="your_personal_token"
npm run clickup:import:evidence -- --create-list "Assignment 5 Evidence" --unmapped-assignees leave-unassigned
```

Notes:

- The importer reads `clickup_import.csv` by default.
- If a planned owner from Git history is not a real member in the current ClickUp workspace, the task is left unassigned and the planned owner is preserved in the task description.
- Use the VS Code ClickUp extensions after import for board viewing, status changes, comments, and manual reassignment.

## Attribution Method

Ownership was reconstructed with this precedence:

1. Feature branch/member naming evidence
2. Module annotations in `supabase/unified_migration.sql`
3. Path and keyword mapping for the touched feature area
4. Raw author normalization only when stronger evidence was not available

Normalized contributor names used in the pack:

- Sneha Dhaya
- AK29-Shay
- Nethmini Chinthana
- Abinayan

## Task Summary

| Task | Assignee | Date Range | Commits |
| --- | --- | --- | --- |
| Bootstrap Shared Repository and Collaboration Baseline | AK29-Shay | 2026-04-06 to 2026-04-09 | 4 |
| Implement Idea Submission and Project Thread UI | AK29-Shay | 2026-04-07 to 2026-04-07 | 1 |
| Implement Recursive Comments and Thread Moderation | AK29-Shay | 2026-04-07 to 2026-04-09 | 6 |
| Finalize Canonical Supabase Schema and RLS Foundation | Abinayan | 2026-04-10 to 2026-04-10 | 1 |
| Deliver Auth, Profile, and Protected Dashboard Routing | Sneha Dhaya | 2026-04-06 to 2026-04-10 | 8 |
| Build Search, Discovery, Filters, and Mentor Browsing | Nethmini Chinthana | 2026-04-09 to 2026-04-10 | 4 |
| Create Analytics Dashboard and Aggregated Insights | Abinayan | 2026-04-09 to 2026-04-10 | 4 |
| Unify Navigation, Route Wiring, and Module Integration | AK29-Shay | 2026-04-09 to 2026-04-15 | 6 |
| Add Thread Uploads and File Validation | AK29-Shay | 2026-04-10 to 2026-04-10 | 2 |
| Polish Auth UX and Stabilize Demo Login Flows | AK29-Shay | 2026-04-10 to 2026-04-10 | 6 |
| Harden Profile Persistence and Add Observability Logging | AK29-Shay | 2026-04-20 to 2026-04-20 | 8 |

## Excluded Commits

These commits were intentionally kept out of the ClickUp board because they are merge bookkeeping, temporary snapshots, or generated/runtime artifacts rather than planned delivery tasks.

| Hash | Date | Author | Subject | Reason |
| --- | --- | --- | --- | --- |
| ac73c165 | 2026-04-20 | AK29-Shay | Merge pull request #10 from AK29-Shay/dev | Release merge from `dev` into the main line; tracked as integration bookkeeping instead of a separate task. |
| e773e1f6 | 2026-04-20 | AK29-Shay | fix: update .next-dev.log with new API response times and compilation details for /ideas/explore | Local configuration or log-artifact housekeeping, not a user-facing delivery task. |
| 0d3f3714 | 2026-04-20 | AK29-Shay | Update tsconfig.json to enhance compiler options and improve project structure | Local configuration or log-artifact housekeeping, not a user-facing delivery task. |
| 60377015 | 2026-04-20 | AK29-Shay | Merge branch 'member1-sneha-dhaya-IT' of https://github.com/AK29-Shay/IdeaBridge into temp-pr3 | Branch merge bookkeeping captured for audit completeness but not treated as a planned ClickUp task. |
| 3e986f56 | 2026-04-20 | AK29-Shay | Update tsconfig.json to use 'react-jsx' for JSX transformation and add log files for development errors | Local configuration or log-artifact housekeeping, not a user-facing delivery task. |
| c9139d22 | 2026-04-20 | AK29-Shay | On temp-pr3: dd | Temporary local stash/snapshot metadata from the temp-pr3 branch. |
| 158ca6e1 | 2026-04-20 | AK29-Shay | index on temp-pr3: 134d6cc5 Resolve merge conflict | Temporary local stash/snapshot metadata from the temp-pr3 branch. |
| 2311ea39 | 2026-04-20 | AK29-Shay | untracked files on temp-pr3: 134d6cc5 Resolve merge conflict | Temporary local stash/snapshot metadata from the temp-pr3 branch. |
| 9abac14f | 2026-04-10 | AK29-Shay | Merge pull request #9 from AK29-Shay/dev | Release merge from `dev` into the main line; tracked as integration bookkeeping instead of a separate task. |
| eaef4f66 | 2026-04-09 | AK29-Shay | merge: sync feat/member4 with latest dev | Branch synchronization merge used to refresh a feature branch before later integration. |
| 75939703 | 2026-04-09 | AK29-Shay | merge: sync feat/member3 with latest dev | Branch synchronization merge used to refresh a feature branch before later integration. |
| 0569ada0 | 2026-04-09 | AK29-Shay | merge: sync feat/member1 with latest dev | Branch synchronization merge used to refresh a feature branch before later integration. |
| 95bbb930 | 2026-04-07 | AK29-Shay | Merge pull request #1 from AK29-Shay/member1-sneha-dhaya-IT | Pull request bookkeeping for early member branch integration, not a standalone planned task. |
| 134d6cc5 | 2026-04-06 | Sneha Dhaya | Resolve merge conflict | Conflict-resolution bookkeeping during the early repository consolidation. |
| c58095c6 | 2026-03-24 | Sneha Dhaya | Initial Commit | Superseded nested `ideabridge/` starter scaffold that predates the consolidated root application. |

## Submission Checklist

- [x] Exported full commit history from all branches
- [x] Reconstructed a balanced set of 10-14 ClickUp tasks
- [x] Used real teammate names with evidence-based ownership mapping
- [x] Preserved commit-to-task traceability in `task_evidence.csv`
- [x] Kept all ClickUp tasks in `Done` status with `YYYY-MM-DD` dates
- [x] Recorded excluded housekeeping commits so the audit trail stays defensible

## Validation Notes

- Task count: 11
- Repo history window: 2026-03-24 to 2026-04-20
- Excluded housekeeping commits: 15
- ClickUp CSV headers: Task Name,Task Description,Assignee,Status,Start Date,Due Date

If ClickUp does not auto-resolve the assignee names during import, keep the CSV as-is and map the names manually in the import step.
