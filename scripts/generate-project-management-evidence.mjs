import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const outputDir = path.join(repoRoot, "docs", "assignment5", "project-management-evidence");

const TASKS = [
  {
    id: "bootstrap-baseline",
    taskName: "Bootstrap Shared Repository and Collaboration Baseline",
    taskDescription:
      "Stand up the working repository with workflow guidance, ignore rules, and environment scaffolding so the team could collaborate against one consistent project setup.",
    assignee: "AK29-Shay",
    attributionBasis: "Path and keyword mapping with raw-author fallback",
    attributionRationale:
      "These commits establish the shared repository baseline, Git workflow guidance, and Supabase environment template used by the rest of the team.",
    hashes: ["b968df29", "dc2051a0", "9256a5aa", "39f0862e"],
  },
  {
    id: "idea-thread-ui",
    taskName: "Implement Idea Submission and Project Thread UI",
    taskDescription:
      "Create the initial Next.js experience for the idea-sharing module, including the Dynamic Post form and base Project Thread interface that anchors student discussions.",
    assignee: "AK29-Shay",
    attributionBasis: "Feature scope and component ownership",
    attributionRationale:
      "The commit introduces the first DynamicPostForm and ProjectThread components inside the member 2 idea-discussion surface.",
    hashes: ["cfd88479"],
  },
  {
    id: "recursive-comments",
    taskName: "Implement Recursive Comments and Thread Moderation",
    taskDescription:
      "Add recursive thread loading plus comment editing and deletion so project discussions behave like a usable collaboration thread instead of a static comment list.",
    assignee: "AK29-Shay",
    attributionBasis: "Feature branch evidence plus path mapping",
    attributionRationale:
      "The supporting commits all land in the member 2 thread/comment area and include the PR merges that integrated the threaded discussion work.",
    hashes: ["bed4c3c3", "10f1c29b", "eea9c3a1", "1f829bb8", "98aefbe2", "f4f17984"],
  },
  {
    id: "supabase-foundation",
    taskName: "Finalize Canonical Supabase Schema and RLS Foundation",
    taskDescription:
      "Unify the final Supabase migration into one canonical SQL script with row-level security, triggers, and an analytics view so the full platform can be provisioned consistently.",
    assignee: "Abinayan",
    attributionBasis: "Module annotations in unified SQL",
    attributionRationale:
      "The unified migration explicitly documents cross-module database ownership and includes the member 4 analytics/database responsibilities in one canonical script.",
    hashes: ["584d3529"],
  },
  {
    id: "auth-profile-routing",
    taskName: "Deliver Auth, Profile, and Protected Dashboard Routing",
    taskDescription:
      "Implement the user-management flow with auth entry points, profile management, protected dashboards, and server-side auth helpers required for role-aware access.",
    assignee: "Sneha Dhaya",
    attributionBasis: "Feature branch evidence plus module ownership comments",
    attributionRationale:
      "These commits align to member 1 responsibilities and the auth/profile/OTP/request modules called out in the repository and unified migration comments.",
    hashes: ["1fd064d6", "ad4ae4b1", "d656877f", "e72e6719", "da835dfd", "d7c9f9c9", "699c4ebb", "59f59e95"],
  },
  {
    id: "search-discovery",
    taskName: "Build Search, Discovery, Filters, and Mentor Browsing",
    taskDescription:
      "Create the discovery surface with search, filter, trending, and mentor-browsing capabilities so students can quickly locate relevant ideas and mentors.",
    assignee: "Nethmini Chinthana",
    attributionBasis: "Feature branch evidence plus route/path keywords",
    attributionRationale:
      "The work maps directly to the member 3 branch and search-related files, including the search module merge into dev.",
    hashes: ["0b449988", "112fa6da", "a88c4dc9", "e72be4a1"],
  },
  {
    id: "analytics-dashboard",
    taskName: "Create Analytics Dashboard and Aggregated Insights",
    taskDescription:
      "Build the analytics dashboard and supporting aggregation surfaces so platform activity, requests, and top projects can be reviewed from a single reporting view.",
    assignee: "Abinayan",
    attributionBasis: "Author normalization plus analytics module evidence",
    attributionRationale:
      "The earliest analytics prototype comes from Abinayan's author identity, and later analytics/dashboard integration commits align to the member 4 module.",
    hashes: ["d1bba6b4", "38e30309", "4a7c1fa5", "ca37c9ae"],
  },
  {
    id: "integration-routing",
    taskName: "Unify Navigation, Route Wiring, and Module Integration",
    taskDescription:
      "Consolidate navigation, route structure, and cross-module wiring so the separate member features operate as one coherent application instead of isolated parts.",
    assignee: "AK29-Shay",
    attributionBasis: "Integration commit ownership",
    attributionRationale:
      "These commits are broad integration work: AppShell unification, route-domain restructuring, release merges, and a later cross-module error-fix sweep.",
    hashes: ["2c4300a6", "83395b5d", "7f85d8d8", "12a2967a", "801b03a7", "b8a5eecc"],
  },
  {
    id: "uploads-validation",
    taskName: "Add Thread Uploads and File Validation",
    taskDescription:
      "Enable attachment uploads with constrained Supabase storage rules and bucket validation so thread-related submissions can safely include files.",
    assignee: "AK29-Shay",
    attributionBasis: "Path and feature keyword mapping",
    attributionRationale:
      "Both commits modify the upload API and Supabase upload helpers tied to the idea-thread workflow owned by member 2.",
    hashes: ["99574421", "395279e6"],
  },
  {
    id: "auth-ux-polish",
    taskName: "Polish Auth UX and Stabilize Demo Login Flows",
    taskDescription:
      "Improve the login and registration experience, stabilize demo access, and script repeatable role-based login checks to make the platform presentation-ready.",
    assignee: "AK29-Shay",
    attributionBasis: "Feature keywords and auth-flow files",
    attributionRationale:
      "The supporting commits all target login/register flows, demo auth behavior, or UX stabilization around protected entry points.",
    hashes: ["86e12c43", "f3391457", "f2f2d4a6", "1f2b3a6a", "8da8bb8c", "534741bd"],
  },
  {
    id: "profile-legacy-logging",
    taskName: "Harden Profile Persistence and Add Observability Logging",
    taskDescription:
      "Improve profile persistence with legacy-field mapping and add runtime logging around key routes so debugging and profile recovery are easier during final QA.",
    assignee: "AK29-Shay",
    attributionBasis: "Path and feature keyword mapping",
    attributionRationale:
      "The April 20 changes are concentrated in profile services, auth context mapping, and explicit route/log instrumentation handled by the integration lead.",
    hashes: ["e27d8c2e", "3d308885", "789241d2", "7d5c6d63", "04446b0b", "da194a7c", "1c5b40f5", "a1f5eb54"],
  },
];

const MANUAL_EXCLUSIONS = new Map([
  ["c58095c6", "Superseded nested `ideabridge/` starter scaffold that predates the consolidated root application."],
  ["95bbb930", "Pull request bookkeeping for early member branch integration, not a standalone planned task."],
  ["9abac14f", "Release merge from `dev` into the main line; tracked as integration bookkeeping instead of a separate task."],
  ["ac73c165", "Release merge from `dev` into the main line; tracked as integration bookkeeping instead of a separate task."],
  ["134d6cc5", "Conflict-resolution bookkeeping during the early repository consolidation."],
]);

const CLICKUP_HEADERS = ["Task Name", "Task Description", "Assignee", "Status", "Start Date", "Due Date"];
const AUDIT_HEADERS = [
  "Task Name",
  "Task Description",
  "Assignee",
  "Start Date",
  "Due Date",
  "Supporting Commits",
  "Supporting Subjects",
  "Attribution Basis",
  "Attribution Rationale",
];

function runGit(args) {
  return execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20,
  });
}

function parseGitLog(rawLog) {
  return rawLog
    .split("__COMMIT__\n")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const lines = chunk.split(/\r?\n/);
      const [hash, date, author, subject, ...fileLines] = lines;
      return {
        hash,
        shortHash: hash.slice(0, 8),
        date,
        author,
        normalizedAuthor: normalizeAuthor(author),
        subject,
        files: fileLines.map((line) => line.trim()).filter(Boolean),
      };
    });
}

function normalizeAuthor(author) {
  switch (author) {
    case "Sneha-Dhaya":
      return "Sneha Dhaya";
    case "Nethmini Chinthana":
      return "Nethmini Chinthana";
    case "ASUS":
      return "Abinayan";
    default:
      return author;
  }
}

function findCommitByPrefix(prefix, commits) {
  const matches = commits.filter((commit) => commit.hash.startsWith(prefix));
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one commit for prefix "${prefix}", found ${matches.length}.`);
  }
  return matches[0];
}

function escapeCsv(value) {
  const text = String(value ?? "");
  if (/["\n,]/.test(text)) {
    return `"${text.replace(/"/g, "\"\"")}"`;
  }
  return text;
}

function toCsv(headers, rows) {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(row.map((cell) => escapeCsv(cell)).join(","));
  }
  return `${lines.join("\n")}\n`;
}

function buildCommitHistory(commits) {
  return commits
    .map((commit) => {
      const files = commit.files.length ? commit.files.map((file) => `- ${file}`).join("\n") : "- (none)";
      return [
        `commit ${commit.hash}`,
        `date: ${commit.date}`,
        `author: ${commit.normalizedAuthor}`,
        `subject: ${commit.subject}`,
        "files:",
        files,
      ].join("\n");
    })
    .join("\n\n");
}

function isAllArtifactFiles(files) {
  if (!files.length) {
    return false;
  }

  return files.every((file) =>
    file.startsWith(".next") ||
    file.startsWith("test-results/") ||
    file.startsWith("supabase/.temp/") ||
    file === ".next-dev.log" ||
    file === ".next-dev.err.log" ||
    file === "tsconfig.tsbuildinfo"
  );
}

function autoExcludeReason(commit) {
  if (/^merge: sync feat\/member\d/i.test(commit.subject)) {
    return "Branch synchronization merge used to refresh a feature branch before later integration.";
  }

  if (/^merge: bring dev/i.test(commit.subject) || /^merge: integrate dev/i.test(commit.subject)) {
    return "Release bookkeeping merge used to move already-planned work between branches.";
  }

  if (/^Merge pull request #/i.test(commit.subject)) {
    return "Pull request merge bookkeeping rather than a standalone implementation task.";
  }

  if (/^Merge branch /i.test(commit.subject)) {
    return "Branch merge bookkeeping captured for audit completeness but not treated as a planned ClickUp task.";
  }

  if (/^On temp-pr3:/i.test(commit.subject) || /^index on temp-pr3:/i.test(commit.subject) || /^untracked files on temp-pr3:/i.test(commit.subject)) {
    return "Temporary local stash/snapshot metadata from the temp-pr3 branch.";
  }

  if (/^Update tsconfig\.json/i.test(commit.subject) || /^fix: update \.next-dev\.log/i.test(commit.subject)) {
    return "Local configuration or log-artifact housekeeping, not a user-facing delivery task.";
  }

  if (isAllArtifactFiles(commit.files)) {
    return "Generated build, test, or runtime log artifacts that should not become ClickUp tasks.";
  }

  return null;
}

function formatMarkdownTable(headers, rows) {
  const headerLine = `| ${headers.join(" | ")} |`;
  const separatorLine = `| ${headers.map(() => "---").join(" | ")} |`;
  const bodyLines = rows.map((row) => `| ${row.join(" | ")} |`);
  return [headerLine, separatorLine, ...bodyLines].join("\n");
}

const rawLog = runGit([
  "log",
  "--all",
  "--date=short",
  "--pretty=format:__COMMIT__%n%H%n%ad%n%an%n%s",
  "--name-only",
]);

const commits = parseGitLog(rawLog);
const commitRange = [...commits].sort((left, right) => left.date.localeCompare(right.date));
const commitWindow = {
  start: commitRange[0]?.date ?? "",
  end: commitRange[commitRange.length - 1]?.date ?? "",
};

const assignedCommits = new Map();
const taskRows = TASKS.map((task) => {
  const supportingCommits = task.hashes.map((prefix) => findCommitByPrefix(prefix, commits));

  for (const commit of supportingCommits) {
    const existingTask = assignedCommits.get(commit.hash);
    if (existingTask) {
      throw new Error(`Commit ${commit.shortHash} is assigned to both "${existingTask}" and "${task.taskName}".`);
    }
    assignedCommits.set(commit.hash, task.taskName);
  }

  const sortedDates = supportingCommits.map((commit) => commit.date).sort();

  return {
    ...task,
    supportingCommits,
    startDate: sortedDates[0],
    dueDate: sortedDates[sortedDates.length - 1],
  };
});

const excludedCommits = [];
for (const commit of commits) {
  if (assignedCommits.has(commit.hash)) {
    continue;
  }

  const manualReason = [...MANUAL_EXCLUSIONS.entries()].find(([prefix]) => commit.hash.startsWith(prefix))?.[1];
  const reason = manualReason ?? autoExcludeReason(commit);

  if (!reason) {
    throw new Error(
      `Unclassified non-housekeeping commit ${commit.shortHash} (${commit.subject}). Add it to a task or the exclusion list.`
    );
  }

  excludedCommits.push({
    ...commit,
    reason,
  });
}

if (taskRows.length < 10 || taskRows.length > 14) {
  throw new Error(`Expected 10-14 reconstructed tasks, found ${taskRows.length}.`);
}

for (const task of taskRows) {
  if (task.startDate < commitWindow.start || task.dueDate > commitWindow.end) {
    throw new Error(`Task "${task.taskName}" falls outside the repo history window.`);
  }
}

mkdirSync(outputDir, { recursive: true });

writeFileSync(path.join(outputDir, "commit_history.txt"), `${buildCommitHistory(commits)}\n`, "utf8");

const clickupRows = taskRows.map((task) => [
  task.taskName,
  task.taskDescription,
  task.assignee,
  "Done",
  task.startDate,
  task.dueDate,
]);

writeFileSync(path.join(outputDir, "clickup_import.csv"), toCsv(CLICKUP_HEADERS, clickupRows), "utf8");

const auditRows = taskRows.map((task) => [
  task.taskName,
  task.taskDescription,
  task.assignee,
  task.startDate,
  task.dueDate,
  task.supportingCommits.map((commit) => commit.shortHash).join(" "),
  task.supportingCommits.map((commit) => commit.subject).join(" | "),
  task.attributionBasis,
  task.attributionRationale,
]);

writeFileSync(path.join(outputDir, "task_evidence.csv"), toCsv(AUDIT_HEADERS, auditRows), "utf8");

const taskSummaryTable = formatMarkdownTable(
  ["Task", "Assignee", "Date Range", "Commits"],
  taskRows.map((task) => [
    task.taskName,
    task.assignee,
    `${task.startDate} to ${task.dueDate}`,
    String(task.supportingCommits.length),
  ])
);

const excludedSummaryTable = formatMarkdownTable(
  ["Hash", "Date", "Author", "Subject", "Reason"],
  excludedCommits.map((commit) => [
    commit.shortHash,
    commit.date,
    commit.normalizedAuthor,
    commit.subject.replace(/\|/g, "\\|"),
    commit.reason.replace(/\|/g, "\\|"),
  ])
);

const readme = `# Assignment 5 Project Management Evidence

This folder reconstructs a ClickUp-ready task board directly from the repository history and keeps the mapping auditable for Assignment 5.

## Files

- \`commit_history.txt\`: full Git export from all branches with hash, date, normalized author, subject, and touched files
- \`task_evidence.csv\`: audit trail showing how each reconstructed task maps back to supporting commits
- \`clickup_import.csv\`: ClickUp import file with the exact header format requested in the plan

## Regenerate

\`\`\`bash
npm run evidence:pm
\`\`\`

## Push to ClickUp from VS Code

From the VS Code integrated terminal, use the importer script to create the tasks directly in ClickUp:

\`\`\`bash
$env:CLICKUP_PAT="your_personal_token"
npm run clickup:import:evidence -- --create-list "Assignment 5 Evidence" --unmapped-assignees leave-unassigned
\`\`\`

Notes:

- The importer reads \`clickup_import.csv\` by default.
- If a planned owner from Git history is not a real member in the current ClickUp workspace, the task is left unassigned and the planned owner is preserved in the task description.
- Use the VS Code ClickUp extensions after import for board viewing, status changes, comments, and manual reassignment.

## Attribution Method

Ownership was reconstructed with this precedence:

1. Feature branch/member naming evidence
2. Module annotations in \`supabase/unified_migration.sql\`
3. Path and keyword mapping for the touched feature area
4. Raw author normalization only when stronger evidence was not available

Normalized contributor names used in the pack:

- Sneha Dhaya
- AK29-Shay
- Nethmini Chinthana
- Abinayan

## Task Summary

${taskSummaryTable}

## Excluded Commits

These commits were intentionally kept out of the ClickUp board because they are merge bookkeeping, temporary snapshots, or generated/runtime artifacts rather than planned delivery tasks.

${excludedSummaryTable}

## Submission Checklist

- [x] Exported full commit history from all branches
- [x] Reconstructed a balanced set of 10-14 ClickUp tasks
- [x] Used real teammate names with evidence-based ownership mapping
- [x] Preserved commit-to-task traceability in \`task_evidence.csv\`
- [x] Kept all ClickUp tasks in \`Done\` status with \`YYYY-MM-DD\` dates
- [x] Recorded excluded housekeeping commits so the audit trail stays defensible

## Validation Notes

- Task count: ${taskRows.length}
- Repo history window: ${commitWindow.start} to ${commitWindow.end}
- Excluded housekeeping commits: ${excludedCommits.length}
- ClickUp CSV headers: ${CLICKUP_HEADERS.join(",")}

If ClickUp does not auto-resolve the assignee names during import, keep the CSV as-is and map the names manually in the import step.
`;

writeFileSync(path.join(outputDir, "README.md"), readme, "utf8");

console.log(`Generated project-management evidence pack in ${outputDir}`);
