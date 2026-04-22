const DEFAULTS = {
  token: process.env.CLICKUP_PAT ?? "",
  workspaceId: "90181666758",
  spaceId: "90186480893",
  targetListName: "A5 - Final Delivery",
  baseUrl: "https://api.clickup.com/api/v2",
  dryRun: false,
};

const START_DATE_MS = Date.parse("2026-04-21T18:30:00.000Z");
const DUE_DATE_MS = Date.parse("2026-04-23T18:29:00.000Z");
const DUE_DATE_HUMAN = "2026-04-23 11:59 PM Asia/Colombo";

const FINAL_FEATURE_TASKS = [
  {
    title: "Final Feature Update - Admin Portal for Mentor Approval, Moderation, and Platform Operations",
    owner: {
      fullName: "Sneha Dhaya",
      email: "snehadhaya55@gmail.com",
      aliases: ["Sneha Dhaya", "sneha-dhaya-IT", "B DHAYABARI"],
    },
    branchSlug: "admin-portal-sneha-dhaya",
    status: "to do",
    tags: ["A5", "auth-profile", "integration"],
    rationale:
      "This is a direct extension of the User and Auth ownership area because the same RBAC, mentor approval, user-state handling, and notification flows already sit inside the member 1 module.",
    scope: [
      "Build an admin portal surface for mentor approval, moderation actions, and operational visibility.",
      "Support pending mentor approval review, account suspension or reactivation, and moderation status changes.",
      "Show platform-facing operational context such as recent moderation activity, approval queues, and audit-oriented state changes.",
      "Keep the UI aligned with the current dashboard and shared component language.",
    ],
    acceptance: [
      "Admin-only navigation entry and protected route behavior are defined.",
      "Mentor approval actions are visible and understandable from the portal UI.",
      "Moderation and platform-operation flows are integrated with the current auth and profile model.",
      "The implementation is consistent with current styling, routing, and data flow patterns.",
    ],
  },
  {
    title: "Final Feature Update - Real-time Chat, Notifications, and Mentor Booking Slots",
    owner: {
      fullName: "Akshayan Ilankovan",
      email: "it23587106@my.sliit.lk",
      aliases: ["Akshayan Ilankovan", "AK29-Shay", "Akshayan"],
    },
    branchSlug: "realtime-chat-booking-akshayan-ilankovan",
    status: "to do",
    tags: ["A5", "posts-threads", "integration"],
    rationale:
      "This belongs to the existing Idea and Guidance area because the member 2 scope already owns project discussions, recursive feedback, and the guidance interaction layer.",
    scope: [
      "Extend the current communication model from threaded async feedback toward real-time-style chat and notification flows.",
      "Introduce mentor booking slot visibility and scheduling-oriented interactions that connect students with mentors.",
      "Keep the feature grounded in the existing request, comment, and notification architecture.",
      "Preserve the integrated navigation and shared UX language across the current app shell.",
    ],
    acceptance: [
      "Chat and booking flows have a clear route, interaction pattern, and data contract.",
      "Notification updates fit the current notification center and backend flow.",
      "The feature integrates cleanly with mentor requests and existing guidance features.",
      "UI and wording remain consistent with the current product language.",
    ],
  },
  {
    title: "Final Feature Update - Saved Ideas, Recommendation Feeds, and AI-assisted Idea Refinement",
    owner: {
      fullName: "Nethmini Chinthana",
      email: "Imbnethminichinth@gmail.com",
      aliases: ["Nethmini Chinthana", "NethminiChinthana101"],
    },
    branchSlug: "recommendations-ai-refinement-nethmini-chinthana",
    status: "to do",
    tags: ["A5", "search-discovery"],
    rationale:
      "This extends the Search and Discovery area because it builds directly on filtering, trending logic, surfacing relevance, and helping students discover better project ideas.",
    scope: [
      "Add saved ideas behavior so students can return to interesting posts later.",
      "Design or implement recommendation feed behavior on top of the current discovery logic.",
      "Introduce AI-assisted idea refinement, tag suggestions, or discovery helpers that improve idea quality.",
      "Keep recommendations explainable and consistent with the current search UX.",
    ],
    acceptance: [
      "Saved ideas and recommendation concepts have a visible and navigable UI entry point.",
      "Discovery logic extends the current search and trending model instead of duplicating it.",
      "AI-assisted refinement is framed as a user-facing helper and not a disconnected experiment.",
      "The feature fits the styling and information architecture of the current discovery module.",
    ],
  },
  {
    title: "Final Feature Update - Supabase-backed Student Project Tracking Records",
    owner: {
      fullName: "Abinayan",
      email: "Kesavanabinayan12@gmail.com",
      aliases: ["Abinayan", "abinayan03"],
    },
    branchSlug: "supabase-project-tracking-abinayan",
    status: "to do",
    tags: ["A5", "database-analytics"],
    rationale:
      "This belongs to the Database and Analytics area because it requires schema design, secure persistence, Supabase query work, and row-level access controls instead of local-only state.",
    scope: [
      "Replace local storage project tracking with Supabase-backed student project records.",
      "Update schema and persistence paths so students can manage tracking data remotely.",
      "Apply secure ownership boundaries so users only read or edit their own project records.",
      "Keep analytics and reporting compatibility in mind while moving data off local storage.",
    ],
    acceptance: [
      "Project tracking no longer depends on local storage as the source of truth.",
      "Supabase persistence and access rules are clearly defined.",
      "Student records remain isolated to the correct user.",
      "The change fits the current schema and analytics direction of the app.",
    ],
  },
];

function parseArgs(argv) {
  const args = { ...DEFAULTS };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    const next = argv[index + 1];

    switch (current) {
      case "--token":
        args.token = next;
        index += 1;
        break;
      case "--workspace-id":
        args.workspaceId = next;
        index += 1;
        break;
      case "--space-id":
        args.spaceId = next;
        index += 1;
        break;
      case "--list-name":
        args.targetListName = next;
        index += 1;
        break;
      case "--dry-run":
        args.dryRun = true;
        break;
      default:
        if (current.startsWith("--")) {
          throw new Error(`Unknown argument: ${current}`);
        }
    }
  }

  return args;
}

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

async function apiRequest(token, method, url, body) {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${method} ${url} failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function buildAssigneeIndex(members) {
  const index = new Map();

  for (const member of members) {
    const username = member.user?.username ?? "";
    const email = member.user?.email ?? "";
    if (username) {
      index.set(normalize(username), member.user.id);
    }
    if (email) {
      index.set(normalize(email), member.user.id);
    }
  }

  for (const task of FINAL_FEATURE_TASKS) {
    const owner = task.owner;
    for (const member of members) {
      const username = normalize(member.user?.username ?? "");
      const email = normalize(member.user?.email ?? "");
      const matched =
        owner.aliases.some((alias) => normalize(alias) === username) ||
        normalize(owner.email) === email;

      if (!matched) {
        continue;
      }

      index.set(normalize(owner.fullName), member.user.id);
      index.set(normalize(owner.email), member.user.id);
      for (const alias of owner.aliases) {
        index.set(normalize(alias), member.user.id);
      }
    }
  }

  return index;
}

async function findTargetList(token, args) {
  const rootListsResponse = await apiRequest(
    token,
    "GET",
    `${args.baseUrl}/space/${args.spaceId}/list?archived=false`
  );
  const rootLists = rootListsResponse?.lists ?? [];
  const rootMatch = rootLists.find((list) => normalize(list.name) === normalize(args.targetListName));
  if (rootMatch) {
    return rootMatch;
  }

  const foldersResponse = await apiRequest(
    token,
    "GET",
    `${args.baseUrl}/space/${args.spaceId}/folder?archived=false`
  );
  const folders = foldersResponse?.folders ?? [];

  for (const folder of folders) {
    for (const list of folder.lists ?? []) {
      if (normalize(list.name) === normalize(args.targetListName)) {
        return list;
      }
    }
  }

  throw new Error(`Could not find list "${args.targetListName}" in space ${args.spaceId}.`);
}

async function listTasks(token, baseUrl, listId) {
  const response = await apiRequest(
    token,
    "GET",
    `${baseUrl}/list/${listId}/task?archived=false&include_closed=true&page=0`
  );
  return response?.tasks ?? [];
}

function buildTaskBody(definition, taskId) {
  const clickUpRef = `CU-${taskId}`;
  const branchName = `${clickUpRef}-${definition.branchSlug}`;
  const commitExample = `${clickUpRef} feat: ${definition.branchSlug.replace(/-/g, " ")}`;
  const prExample = `${clickUpRef} feat: ${definition.title.replace(/^Final Feature Update - /, "")}`;

  return [
    `# ${definition.title}`,
    "",
    `## Owner`,
    "",
    `- Real name: ${definition.owner.fullName}`,
    `- Email: ${definition.owner.email}`,
    `- Due: ${DUE_DATE_HUMAN}`,
    "",
    `## Rationale`,
    "",
    definition.rationale,
    "",
    `## Scope`,
    "",
    ...definition.scope.map((item) => `- ${item}`),
    "",
    `## Acceptance Criteria`,
    "",
    ...definition.acceptance.map((item) => `- ${item}`),
    "",
    `## Branch and Commit Rules`,
    "",
    `- Branch name: \`${branchName}\``,
    `- Always include \`${clickUpRef}\` in the branch name, commit messages, PR title, and PR description.`,
    `- Commit message pattern: \`${commitExample}\``,
    `- PR title pattern: \`${prExample}\``,
    `- Reference the ClickUp task ID in every GitHub activity so ClickUp can auto-link it after the GitHub integration is connected.`,
    "",
    `## Working Rules`,
    "",
    `- Base branch: \`final-features-update\``,
    `- Keep the current folder structure and navigation patterns from the latest \`dev\` branch.`,
    `- Reuse existing UI components and Supabase patterns where possible.`,
    `- Do not break current auth, dashboards, requests, notifications, or shared styling.`,
    "",
    `## Master Prompt`,
    "",
    `Use the shared prompt in \`docs/final-features/MASTER_PROMPT.md\` and replace the task-specific insert with this task's scope and acceptance criteria.`,
  ].join("\n");
}

async function ensureTags(token, baseUrl, taskId, desiredTags) {
  const task = await apiRequest(token, "GET", `${baseUrl}/task/${taskId}`);
  const currentTags = (task?.tags ?? []).map((tag) => normalize(tag.name));

  for (const tag of desiredTags) {
    if (currentTags.includes(normalize(tag))) {
      continue;
    }
    await apiRequest(token, "POST", `${baseUrl}/task/${taskId}/tag/${encodeURIComponent(tag)}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.token) {
    throw new Error("Missing ClickUp token. Set CLICKUP_PAT or pass --token.");
  }

  const workspaceResponse = await apiRequest(args.token, "GET", `${args.baseUrl}/team`);
  const workspace = (workspaceResponse?.teams ?? []).find(
    (team) => String(team.id) === String(args.workspaceId)
  );

  if (!workspace) {
    throw new Error(`Workspace ${args.workspaceId} was not found.`);
  }

  const assigneeIndex = buildAssigneeIndex(workspace.members ?? []);
  const targetList = await findTargetList(args.token, args);
  const existingTasks = await listTasks(args.token, args.baseUrl, targetList.id);

  console.log(`Target list: ${targetList.name} (${targetList.id})`);
  console.log(`Workspace members detected: ${(workspace.members ?? []).length}`);

  for (const definition of FINAL_FEATURE_TASKS) {
    const existing = existingTasks.find((task) => normalize(task.name) === normalize(definition.title));
    const assigneeId = assigneeIndex.get(normalize(definition.owner.fullName)) ?? null;

    if (!existing) {
      const createPayload = {
        name: definition.title,
        markdown_content: [
          `# ${definition.title}`,
          "",
          `Task is being initialized for ${definition.owner.fullName}.`,
        ].join("\n"),
        status: definition.status,
        start_date: START_DATE_MS,
        start_date_time: true,
        due_date: DUE_DATE_MS,
        due_date_time: true,
        notify_all: false,
      };

      if (assigneeId) {
        createPayload.assignees = [assigneeId];
      }

      if (args.dryRun) {
        console.log(`[DRY RUN] Would create task: ${definition.title}`);
        continue;
      }

      const created = await apiRequest(
        args.token,
        "POST",
        `${args.baseUrl}/list/${targetList.id}/task`,
        createPayload
      );
      const taskId = created.id;

      await apiRequest(args.token, "PUT", `${args.baseUrl}/task/${taskId}`, {
        name: definition.title,
        markdown_content: buildTaskBody(definition, taskId),
        start_date: START_DATE_MS,
        start_date_time: true,
        due_date: DUE_DATE_MS,
        due_date_time: true,
        assignees: {
          add: assigneeId ? [assigneeId] : [],
          rem: [],
        },
      });
      await ensureTags(args.token, args.baseUrl, taskId, definition.tags);
      console.log(`Created task: ${definition.title} -> ${created.url}`);
      continue;
    }

    const taskId = existing.id;
    const currentAssignees = (existing.assignees ?? [])
      .map((entry) => entry.id ?? entry.user?.id)
      .filter(Boolean);

    if (args.dryRun) {
      console.log(`[DRY RUN] Would update task: ${definition.title} (${taskId})`);
      continue;
    }

    await apiRequest(args.token, "PUT", `${args.baseUrl}/task/${taskId}`, {
      name: definition.title,
      markdown_content: buildTaskBody(definition, taskId),
      start_date: START_DATE_MS,
      start_date_time: true,
      due_date: DUE_DATE_MS,
      due_date_time: true,
      assignees: {
        add: assigneeId && !currentAssignees.includes(assigneeId) ? [assigneeId] : [],
        rem: currentAssignees.filter((id) => assigneeId && id !== assigneeId),
      },
    });
    await ensureTags(args.token, args.baseUrl, taskId, definition.tags);
    console.log(`Updated task: ${definition.title} (${taskId})`);
  }

  const missingMembers = FINAL_FEATURE_TASKS.filter(
    (task) => !assigneeIndex.get(normalize(task.owner.fullName))
  ).map((task) => `${task.owner.fullName} <${task.owner.email}>`);

  if (missingMembers.length > 0) {
    console.log("");
    console.log("The following owners are not currently mapped to ClickUp members:");
    for (const member of missingMembers) {
      console.log(`- ${member}`);
    }
    console.log("Invite them to the workspace and rerun this script to backfill assignments.");
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
