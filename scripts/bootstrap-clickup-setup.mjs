import { readFileSync } from "node:fs";
import path from "node:path";

const DEFAULTS = {
  workspaceId: "90181666758",
  spaceId: "90186480893",
  evidenceListId: "901817537333",
  clickupBaseUrl: "https://api.clickup.com/api/v2",
  docsBaseUrl: "https://api.clickup.com/api/v3",
  spaceName: "IdeaBridge - IT3040",
  evidenceListName: "A5 - Project Management Evidence",
  legacyListNames: ["Project 1", "Project 2"],
  adminFolderName: "00 Admin & Evidence",
  milestoneFolderName: "01 Course Milestones",
  finalizationFolderName: "02 Finalization",
  dryRun: false,
  skipHistoricalImport: false,
  token: process.env.CLICKUP_PAT ?? "",
  csv: path.join(
    process.cwd(),
    "docs",
    "assignment5",
    "project-management-evidence",
    "clickup_import.csv"
  ),
};

const SPACE_TAGS = [
  "A3",
  "A4",
  "A5",
  "auth-profile",
  "posts-threads",
  "search-discovery",
  "database-analytics",
  "integration",
  "git",
  "clickup",
  "testing",
];

const MILESTONE_LISTS = [
  {
    name: "A3 - Progress 1",
    markdown_description: [
      "# Assignment 3 - Progress 1",
      "",
      "- All interfaces for each responsible component",
      "- Form validations",
      "- At least 35% of the responsible functionality",
    ].join("\n"),
  },
  {
    name: "A4 - Progress 2",
    markdown_description: [
      "# Assignment 4 - Progress 2",
      "",
      "- All interfaces for each responsible component",
      "- At least 70% of the responsible functionality",
      "- Integration with the other group members' components",
    ].join("\n"),
  },
  {
    name: "A5 - Final Delivery",
    markdown_description: [
      "# Assignment 5 - Final Delivery",
      "",
      "- Live demo readiness for each member's assigned component(s)",
      "- Git evidence with meaningful commits",
      "- ClickUp project management evidence showing planning and ownership",
      "- Automated testing evidence for key user journeys",
    ].join("\n"),
  },
];

const FINALIZATION_LISTS = [
  {
    name: "Final Polish & QA",
    markdown_description: [
      "# Final Polish & QA",
      "",
      "- Final integration fixes",
      "- Evidence collection and screenshot readiness",
      "- QA checks for assigned member features",
    ].join("\n"),
  },
  {
    name: "Demo & Viva Prep",
    markdown_description: [
      "# Demo & Viva Prep",
      "",
      "- Rehearse the 2 to 2.5 minute member demos",
      "- Prepare handoff between speakers",
      "- Confirm submission readiness and evidence completeness",
    ].join("\n"),
  },
];

const MEMBER_TARGETS = [
  {
    canonicalName: "Akshayan",
    emails: ["it23587106@my.sliit.lk"],
    aliases: ["Akshayan", "Akshayan Ilankovan", "AK29-Shay"],
  },
  {
    canonicalName: "Sneha Dhaya",
    emails: ["snehadhaya55@gmail.com"],
    aliases: ["Sneha Dhaya", "sneha-dhaya-IT", "B DHAYABARI"],
  },
  {
    canonicalName: "Nethmini Chinthana",
    emails: ["Imbnethminichinth@gmail.com"],
    aliases: ["Nethmini Chinthana", "NethminiChinthana101"],
  },
  {
    canonicalName: "Abinayan",
    emails: ["Kesavanabinayan12@gmail.com"],
    aliases: ["Abinayan", "abinayan03"],
  },
];

const FINALIZATION_TASKS = [
  {
    listName: "Final Polish & QA",
    name: "Final Demo Readiness - Akshayan (Posts, Comments, Integration)",
    intendedOwners: ["Akshayan"],
    status: "in progress",
    startDate: "2026-04-21",
    dueDate: "2026-04-24",
    tags: ["A5", "posts-threads", "integration"],
    description: [
      "Finalize the posts, comments, and integration surfaces for the final demo.",
      "",
      "- Verify the idea submission and comment thread experience",
      "- Confirm cross-module navigation and wiring",
      "- Keep the feature flow stable for the live demonstration",
    ].join("\n"),
  },
  {
    listName: "Final Polish & QA",
    name: "Final Demo Readiness - Sneha Dhaya (Auth, Profile, Mentor Workflow)",
    intendedOwners: ["Sneha Dhaya"],
    status: "in progress",
    startDate: "2026-04-21",
    dueDate: "2026-04-24",
    tags: ["A5", "auth-profile"],
    description: [
      "Finalize the auth, profile, and mentor workflow surfaces for the final demo.",
      "",
      "- Check login, registration, and profile updates",
      "- Verify mentor workflow and related protected routing",
      "- Keep screenshots and demo paths ready for presentation",
    ].join("\n"),
  },
  {
    listName: "Final Polish & QA",
    name: "Final Demo Readiness - Nethmini Chinthana (Search & Discovery)",
    intendedOwners: ["Nethmini Chinthana"],
    status: "in progress",
    startDate: "2026-04-21",
    dueDate: "2026-04-24",
    tags: ["A5", "search-discovery"],
    description: [
      "Finalize the search and discovery surface for the final demo.",
      "",
      "- Verify search, filters, trending, and mentor browsing",
      "- Keep the discovery flow concise for the live demo",
      "- Confirm UI consistency and usable demo data",
    ].join("\n"),
  },
  {
    listName: "Final Polish & QA",
    name: "Final Demo Readiness - Abinayan (Database & Analytics)",
    intendedOwners: ["Abinayan"],
    status: "in progress",
    startDate: "2026-04-21",
    dueDate: "2026-04-24",
    tags: ["A5", "database-analytics"],
    description: [
      "Finalize the database and analytics evidence for the final demo.",
      "",
      "- Verify the unified schema and data dependencies",
      "- Check analytics cards and charts",
      "- Keep dashboard screenshots ready for the viva",
    ].join("\n"),
  },
  {
    listName: "Final Polish & QA",
    name: "Collect Git evidence screenshots per member",
    intendedOwners: ["Akshayan"],
    status: "in progress",
    startDate: "2026-04-21",
    dueDate: "2026-04-23",
    tags: ["A5", "git"],
    description: [
      "Collect Git evidence for all members and keep the supporting screenshots organized.",
      "",
      "- Capture meaningful commits and branch ownership",
      "- Keep screenshots grouped by member",
      "- Cross-check the evidence against Assignment 5 expectations",
    ].join("\n"),
  },
  {
    listName: "Final Polish & QA",
    name: "Collect ClickUp evidence screenshots per member",
    intendedOwners: ["Akshayan"],
    status: "in progress",
    startDate: "2026-04-21",
    dueDate: "2026-04-23",
    tags: ["A5", "clickup"],
    description: [
      "Collect ClickUp screenshots that show task ownership, timelines, and milestone organization.",
      "",
      "- Capture the A5 evidence list",
      "- Capture the by-assignee ownership view",
      "- Capture the finalization board and calendar views",
    ].join("\n"),
  },
  {
    listName: "Final Polish & QA",
    name: "Collect automated testing evidence per member",
    intendedOwners: ["Akshayan"],
    status: "in progress",
    startDate: "2026-04-22",
    dueDate: "2026-04-24",
    tags: ["A5", "testing"],
    description: [
      "Collect automated testing evidence for each responsible component.",
      "",
      "- Use Playwright outputs and test runs as supporting material",
      "- Keep screenshots or console evidence grouped per member",
      "- Confirm the testing evidence covers key user journeys",
    ].join("\n"),
  },
  {
    listName: "Demo & Viva Prep",
    name: "Rehearse live demo timing and handoff",
    intendedOwners: ["Akshayan", "Sneha Dhaya", "Nethmini Chinthana", "Abinayan"],
    status: "to do",
    startDate: "2026-04-24",
    dueDate: "2026-04-24",
    tags: ["A5", "integration"],
    description: [
      "Rehearse the final live demo handoff so each member stays within the time limit.",
      "",
      "- Practice order and transitions",
      "- Keep the demo flow under the Assignment 5 time window",
      "- Confirm the shared setup works on presentation day",
    ].join("\n"),
  },
  {
    listName: "Demo & Viva Prep",
    name: "Final submission readiness review",
    intendedOwners: ["Akshayan"],
    status: "to do",
    startDate: "2026-04-25",
    dueDate: "2026-04-25",
    tags: ["A5", "integration", "git", "clickup", "testing"],
    description: [
      "Perform the final review before submission and presentation.",
      "",
      "- Verify Git, ClickUp, and testing evidence are complete",
      "- Confirm the course milestone structure is clean",
      "- Ensure the repo and ClickUp board tell the same story",
    ].join("\n"),
  },
];

const HISTORICAL_TASK_TAGS = new Map([
  ["Bootstrap Shared Repository and Collaboration Baseline", ["A5", "integration", "git", "clickup"]],
  ["Implement Idea Submission and Project Thread UI", ["A5", "posts-threads"]],
  ["Implement Recursive Comments and Thread Moderation", ["A5", "posts-threads"]],
  ["Finalize Canonical Supabase Schema and RLS Foundation", ["A5", "database-analytics"]],
  ["Deliver Auth, Profile, and Protected Dashboard Routing", ["A5", "auth-profile"]],
  ["Build Search, Discovery, Filters, and Mentor Browsing", ["A5", "search-discovery"]],
  ["Create Analytics Dashboard and Aggregated Insights", ["A5", "database-analytics"]],
  ["Unify Navigation, Route Wiring, and Module Integration", ["A5", "integration"]],
  ["Add Thread Uploads and File Validation", ["A5", "posts-threads"]],
  ["Polish Auth UX and Stabilize Demo Login Flows", ["A5", "auth-profile"]],
  ["Harden Profile Persistence and Add Observability Logging", ["A5", "auth-profile", "integration"]],
]);

const DOC_DEFINITIONS = [
  {
    name: "Responsibility Matrix",
    buildContent: () => [
      "# IdeaBridge Responsibility Matrix",
      "",
      "| Member | Email | Primary ownership | Supporting evidence |",
      "| --- | --- | --- | --- |",
      "| Akshayan | it23587106@my.sliit.lk | Posts, comments, thread uploads, integration, final orchestration | Git history, ClickUp A5 evidence tasks, finalization tasks |",
      "| Sneha Dhaya | snehadhaya55@gmail.com | Auth, profile, mentor workflow, protected dashboards | Repository evidence pack and Assignment 5 task mapping |",
      "| Nethmini Chinthana | Imbnethminichinth@gmail.com | Search, discovery, filters, trending, mentor browsing | Repository evidence pack and Assignment 5 task mapping |",
      "| Abinayan | Kesavanabinayan12@gmail.com | Database schema, analytics, reporting | Repository evidence pack and Assignment 5 task mapping |",
      "",
      "## Source of truth",
      "",
      "- Repository: `AK29-Shay/IdeaBridge`",
      "- ClickUp workspace: `akshayan`",
      "- Space: `IdeaBridge - IT3040`",
      "- Assignment evidence source: `docs/assignment5/project-management-evidence/`",
    ].join("\n"),
  },
  {
    name: "Evidence Index",
    buildContent: () => [
      "# Assignment 5 Evidence Index",
      "",
      "## Evidence buckets",
      "",
      "- Git evidence: branch history, commits, and merge traceability in the GitHub repo",
      "- Project management evidence: ClickUp lists, views, ownership, and date ranges",
      "- Automated testing evidence: Playwright tests and captured results",
      "",
      "## Local files",
      "",
      "- `docs/assignment5/project-management-evidence/README.md`",
      "- `docs/assignment5/project-management-evidence/clickup_import.csv`",
      "- `docs/assignment5/project-management-evidence/task_evidence.csv`",
      "- `scripts/push-clickup-tasks.mjs`",
      "- `scripts/bootstrap-clickup-setup.mjs`",
      "",
      "## Manual follow-up",
      "",
      "- Invite the remaining three members through the ClickUp UI",
      "- Link the GitHub repo to the Space from the ClickUp UI",
      "- Re-run the bootstrap script after the members join to backfill direct task assignments",
    ].join("\n"),
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
      case "--evidence-list-id":
        args.evidenceListId = next;
        index += 1;
        break;
      case "--space-name":
        args.spaceName = next;
        index += 1;
        break;
      case "--csv":
        args.csv = next;
        index += 1;
        break;
      case "--skip-historical-import":
        args.skipHistoricalImport = true;
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

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const current = text[index];
    const next = text[index + 1];

    if (inQuotes) {
      if (current === '"' && next === '"') {
        value += '"';
        index += 1;
      } else if (current === '"') {
        inQuotes = false;
      } else {
        value += current;
      }
      continue;
    }

    if (current === '"') {
      inQuotes = true;
      continue;
    }

    if (current === ",") {
      row.push(value);
      value = "";
      continue;
    }

    if (current === "\n") {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    if (current === "\r") {
      continue;
    }

    value += current;
  }

  if (value.length || row.length) {
    row.push(value);
    rows.push(row);
  }

  return rows;
}

function readHistoricalTasks(csvPath) {
  const raw = readFileSync(csvPath, "utf8");
  const rows = parseCsv(raw);
  const headers = rows[0] ?? [];
  const expectedHeaders = ["Task Name", "Task Description", "Assignee", "Status", "Start Date", "Due Date"];

  if (headers.join("|") !== expectedHeaders.join("|")) {
    throw new Error(`Unexpected CSV headers in ${csvPath}`);
  }

  return rows.slice(1).map((columns) => ({
    name: columns[0],
    description: columns[1],
    assignee: columns[2],
    status: columns[3],
    startDate: columns[4],
    dueDate: columns[5],
    tags: HISTORICAL_TASK_TAGS.get(columns[0]) ?? ["A5"],
  }));
}

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function dateToTimestamp(date) {
  return Date.parse(`${date}T12:00:00Z`);
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

function logAction(args, message) {
  if (args.dryRun) {
    console.log(`DRY RUN: ${message}`);
    return;
  }
  console.log(message);
}

function buildSpaceUpdatePayload(space, newName) {
  return {
    name: newName,
  };
}

async function listDocs(token, args) {
  const response = await apiRequest(
    token,
    "GET",
    `${args.docsBaseUrl}/workspaces/${args.workspaceId}/docs`
  );
  return response?.docs ?? [];
}

async function getSpace(token, args) {
  const response = await apiRequest(
    token,
    "GET",
    `${args.clickupBaseUrl}/team/${args.workspaceId}/space?archived=false`
  );
  const spaces = response?.spaces ?? [];
  const match = spaces.find((space) => String(space.id) === String(args.spaceId));
  if (!match) {
    throw new Error(`Space ${args.spaceId} was not found in workspace ${args.workspaceId}.`);
  }
  return match;
}

async function listSpaceRootLists(token, spaceId, baseUrl) {
  const response = await apiRequest(token, "GET", `${baseUrl}/space/${spaceId}/list?archived=false`);
  return response?.lists ?? [];
}

async function listFolders(token, spaceId, baseUrl) {
  const response = await apiRequest(token, "GET", `${baseUrl}/space/${spaceId}/folder?archived=false`);
  return response?.folders ?? [];
}

async function getFolder(token, folderId, baseUrl) {
  return apiRequest(token, "GET", `${baseUrl}/folder/${folderId}`);
}

async function ensureFolder(token, args, existingFolders, name) {
  const current = existingFolders.find((folder) => normalize(folder.name) === normalize(name));
  if (current) {
    return current;
  }

  logAction(args, `Create folder "${name}"`);
  if (args.dryRun) {
    const dryRunFolder = { id: `dry-run-${normalize(name)}`, name, lists: [] };
    existingFolders.push(dryRunFolder);
    return dryRunFolder;
  }

  const created = await apiRequest(
    token,
    "POST",
    `${args.clickupBaseUrl}/space/${args.spaceId}/folder`,
    { name }
  );
  const hydrated = await getFolder(token, created.id, args.clickupBaseUrl);
  existingFolders.push(hydrated);
  return hydrated;
}

async function ensureFolderList(token, args, folder, definition) {
  const folderDetails =
    folder.lists && Array.isArray(folder.lists) ? folder : await getFolder(token, folder.id, args.clickupBaseUrl);
  const existing = (folderDetails.lists ?? []).find(
    (list) => normalize(list.name) === normalize(definition.name)
  );

  if (existing) {
    if (existing.name !== definition.name || (definition.markdown_description && existing.content !== definition.markdown_description)) {
      logAction(args, `Update list "${existing.name}" -> "${definition.name}"`);
      if (!args.dryRun) {
        await apiRequest(token, "PUT", `${args.clickupBaseUrl}/list/${existing.id}`, {
          name: definition.name,
          markdown_content: definition.markdown_description,
        });
      }
    }
    return existing;
  }

  logAction(args, `Create list "${definition.name}" in folder "${folder.name}"`);
  if (args.dryRun) {
    return { id: `dry-run-${normalize(definition.name)}`, name: definition.name };
  }

  const created = await apiRequest(
    token,
    "POST",
    `${args.clickupBaseUrl}/folder/${folder.id}/list`,
    {
      name: definition.name,
      markdown_content: definition.markdown_description,
    }
  );
  return created;
}

async function ensureSpaceTag(token, args, existingTags, tagName) {
  if (existingTags.some((tag) => normalize(tag.name) === normalize(tagName))) {
    return;
  }

  logAction(args, `Create space tag "${tagName}"`);
  if (args.dryRun) {
    existingTags.push({ name: tagName });
    return;
  }

  const created = await apiRequest(
    token,
    "POST",
    `${args.clickupBaseUrl}/space/${args.spaceId}/tag`,
    {
      tag: {
        name: tagName,
        tag_fg: "#ffffff",
        tag_bg: "#1f7ae0",
      },
    }
  );
  existingTags.push(created);
}

async function ensureDoc(token, args, existingDocs, name, parent, markdown) {
  let current = existingDocs.find((doc) => normalize(doc.name) === normalize(name));

  if (!current) {
    logAction(args, `Create doc "${name}"`);
    if (args.dryRun) {
      current = { id: `dry-run-${normalize(name)}`, name, parent };
      existingDocs.push(current);
      return current;
    }

    const createPayloads = [
      { name, parent, create_page: false },
      { name, parent: { id: args.spaceId, type: 4 }, create_page: false },
      { name, create_page: false },
    ];

    let lastError;
    for (const payload of createPayloads) {
      try {
        current = await apiRequest(
          token,
          "POST",
          `${args.docsBaseUrl}/workspaces/${args.workspaceId}/docs`,
          payload
        );
        break;
      } catch (error) {
        lastError = error;
      }
    }

    if (!current) {
      throw lastError;
    }

    existingDocs.push(current);
  }

  if (args.dryRun) {
    return current;
  }

  const pagesResponse = await apiRequest(
    token,
    "GET",
    `${args.docsBaseUrl}/workspaces/${args.workspaceId}/docs/${current.id}/pages?max_page_depth=-1&content_format=text%2Fmd`
  );
  const currentPages = Array.isArray(pagesResponse) ? pagesResponse : pagesResponse?.pages ?? [];
  const page =
    [...currentPages].reverse().find((entry) => normalize(entry.name) === normalize(name)) ??
    [...currentPages].reverse().find((entry) => String(entry.content ?? "").trim().length > 0) ??
    currentPages[0];

  if (page) {
    logAction(args, `Update doc page for "${name}"`);
    await apiRequest(
      token,
      "PUT",
      `${args.docsBaseUrl}/workspaces/${args.workspaceId}/docs/${current.id}/pages/${page.id}`,
      {
        name,
        content: markdown,
        content_edit_mode: "replace",
        content_format: "text/md",
      }
    );
  } else {
    logAction(args, `Create doc page for "${name}"`);
    await apiRequest(
      token,
      "POST",
      `${args.docsBaseUrl}/workspaces/${args.workspaceId}/docs/${current.id}/pages`,
      {
        name,
        content: markdown,
        content_format: "text/md",
      }
    );
  }

  return current;
}

async function listSpaceViews(token, args) {
  const response = await apiRequest(token, "GET", `${args.clickupBaseUrl}/space/${args.spaceId}/view`);
  return [
    ...(response?.views ?? []),
    ...Object.values(response?.required_views ?? {}),
  ].filter(Boolean);
}

async function listFolderViews(token, baseUrl, folderId) {
  const response = await apiRequest(token, "GET", `${baseUrl}/folder/${folderId}/view`);
  return [
    ...(response?.views ?? []),
    ...Object.values(response?.required_views ?? {}),
  ].filter(Boolean);
}

async function listListViews(token, baseUrl, listId) {
  const response = await apiRequest(token, "GET", `${baseUrl}/list/${listId}/view`);
  return [
    ...(response?.views ?? []),
    ...Object.values(response?.required_views ?? {}),
  ].filter(Boolean);
}

async function ensureView(token, args, locationType, locationId, viewDefinition, existingViews) {
  if (existingViews.some((view) => normalize(view.name) === normalize(viewDefinition.name))) {
    return;
  }

  logAction(args, `Create ${locationType} view "${viewDefinition.name}"`);
  if (args.dryRun) {
    existingViews.push({ id: `dry-run-${normalize(viewDefinition.name)}`, name: viewDefinition.name });
    return;
  }

  await apiRequest(
    token,
    "POST",
    `${args.clickupBaseUrl}/${locationType}/${locationId}/view`,
    viewDefinition.payload
  );
}

function createAssigneeIndex(members) {
  const index = new Map();

  for (const member of members) {
    const username = member.user?.username ?? "";
    const email = member.user?.email ?? "";
    index.set(normalize(username), member.user.id);
    index.set(normalize(email), member.user.id);
  }

  for (const target of MEMBER_TARGETS) {
    for (const member of members) {
      const username = normalize(member.user?.username ?? "");
      const email = normalize(member.user?.email ?? "");
      const matched =
        target.aliases.some((alias) => normalize(alias) === username) ||
        target.emails.some((targetEmail) => normalize(targetEmail) === email);

      if (matched) {
        index.set(normalize(target.canonicalName), member.user.id);
        for (const alias of target.aliases) {
          index.set(normalize(alias), member.user.id);
        }
        for (const targetEmail of target.emails) {
          index.set(normalize(targetEmail), member.user.id);
        }
      }
    }
  }

  return index;
}

function resolveOwnerIds(memberIndex, intendedOwners) {
  return [...new Set(intendedOwners.map((owner) => memberIndex.get(normalize(owner))).filter(Boolean))];
}

function resolveHistoricalAssigneeIds(memberIndex, assigneeLabel) {
  const direct = memberIndex.get(normalize(assigneeLabel));
  return direct ? [direct] : [];
}

function buildHistoricalDescription(task) {
  return [
    task.description.trim(),
    "",
    "---",
    `Planned owner from Git evidence: ${task.assignee || "Unspecified"}`,
    `Imported status source: ${task.status}`,
    `Evidence date window: ${task.startDate} to ${task.dueDate}`,
    "Imported from: docs/assignment5/project-management-evidence/clickup_import.csv",
  ].join("\n");
}

function buildCurrentTaskDescription(task) {
  return [
    task.description.trim(),
    "",
    "---",
    `Intended owner(s): ${task.intendedOwners.join(", ")}`,
    "Created by: scripts/bootstrap-clickup-setup.mjs",
  ].join("\n");
}

function resolveSpaceStatus(space, statusName) {
  const match = (space.statuses ?? []).find((status) => normalize(status.status) === normalize(statusName));
  if (match) {
    return match.status;
  }
  return statusName;
}

async function listTasks(token, baseUrl, listId) {
  if (String(listId).startsWith("dry-run-")) {
    return [];
  }

  const response = await apiRequest(
    token,
    "GET",
    `${baseUrl}/list/${listId}/task?archived=false&include_closed=true&page=0`
  );
  return response?.tasks ?? [];
}

function buildTaskPayload(task, assigneeIds, status) {
  return {
    name: task.name,
    markdown_content: task.markdown_content,
    status,
    start_date: dateToTimestamp(task.startDate),
    start_date_time: false,
    due_date: dateToTimestamp(task.dueDate),
    due_date_time: false,
    notify_all: false,
    assignees: assigneeIds,
    tags: task.tags,
  };
}

async function syncTask(token, args, listId, currentTasks, taskDefinition, assigneeIds, status) {
  const existing = currentTasks.find((task) => normalize(task.name) === normalize(taskDefinition.name));
  const payload = buildTaskPayload(
    {
      ...taskDefinition,
      markdown_content: taskDefinition.markdown_content,
    },
    assigneeIds,
    status
  );

  if (!existing) {
    logAction(args, `Create task "${taskDefinition.name}" in list ${listId}`);
    if (args.dryRun) {
      currentTasks.push({ id: `dry-run-${normalize(taskDefinition.name)}`, name: taskDefinition.name, assignees: [] });
      return;
    }

    const created = await apiRequest(
      token,
      "POST",
      `${args.clickupBaseUrl}/list/${listId}/task`,
      payload
    );
    currentTasks.push(created);
    return;
  }

  const existingAssigneeIds = (existing.assignees ?? []).map((entry) => entry.id ?? entry.user?.id).filter(Boolean);
  const assigneesToAdd = assigneeIds.filter((id) => !existingAssigneeIds.includes(id));
  const assigneesToRemove = existingAssigneeIds.filter((id) => !assigneeIds.includes(id));

  logAction(args, `Update task "${taskDefinition.name}" in list ${listId}`);
  if (args.dryRun) {
    return;
  }

  await apiRequest(
    token,
    "PUT",
    `${args.clickupBaseUrl}/task/${existing.id}`,
    {
      name: taskDefinition.name,
      markdown_content: taskDefinition.markdown_content,
      start_date: dateToTimestamp(taskDefinition.startDate),
      start_date_time: false,
      due_date: dateToTimestamp(taskDefinition.dueDate),
      due_date_time: false,
      assignees: {
        add: assigneesToAdd,
        rem: assigneesToRemove,
      },
    }
  );
}

async function syncTaskTags(token, args, taskId, desiredTags) {
  if (!taskId || args.dryRun) {
    return;
  }

  const task = await apiRequest(token, "GET", `${args.clickupBaseUrl}/task/${taskId}`);
  const existingTags = (task?.tags ?? []).map((tag) => tag.name);

  for (const tag of desiredTags) {
    if (existingTags.some((existingTag) => normalize(existingTag) === normalize(tag))) {
      continue;
    }

    logAction(args, `Attach tag "${tag}" to task ${taskId}`);
    await apiRequest(
      token,
      "POST",
      `${args.clickupBaseUrl}/task/${taskId}/tag/${encodeURIComponent(tag)}`
    );
  }
}

function findListByName(listsByName, name) {
  const direct = listsByName.get(normalize(name));
  if (!direct) {
    throw new Error(`Required list "${name}" was not found.`);
  }
  return direct;
}

function createFolderBoardViewPayload(name) {
  return {
    name,
    type: "board",
    grouping: {
      field: "status",
      dir: 1,
      collapsed: [],
      ignore: false,
      single: false,
    },
    divide: {
      field: null,
      dir: null,
      by_subcategory: null,
      collapsed: [],
    },
    sorting: {
      fields: [],
    },
    filters: {
      op: "AND",
      fields: [],
      search: "",
      search_custom_fields: null,
      search_description: false,
      search_name: false,
      show_closed: false,
    },
    columns: {
      fields: [
        { field: "assignee", idx: 0, width: null, hidden: false, name: null, display: null },
        { field: "dueDate", idx: 1, width: null, hidden: false, name: null, display: null },
        { field: "priority", idx: 2, width: null, hidden: false, name: null, display: null },
      ],
    },
    team_sidebar: {
      assignees: [],
      group_assignees: [],
      assigned_comments: false,
      unassigned_tasks: false,
    },
    settings: {
      show_task_locations: false,
      show_subtasks: 1,
      show_subtask_parent_names: true,
      show_closed_subtasks: false,
      show_assignees: true,
      show_images: true,
      show_timer: false,
      collapse_empty_columns: false,
      me_comments: true,
      me_subtasks: true,
      me_checklists: true,
      show_empty_statuses: false,
      auto_wrap: false,
      time_in_status_view: 1,
      is_description_pinned: false,
      override_parent_hierarchy_filter: false,
      fast_load_mode: false,
      show_task_ids: false,
      task_cover: 2,
      field_rendering: 1,
      colored_columns: true,
      card_size: 2,
      show_empty_fields: true,
      show_task_properties: true,
    },
  };
}

function createCalendarViewPayload(name, showClosed) {
  return {
    name,
    type: "calendar",
    grouping: {
      field: "none",
      dir: null,
      collapsed: [],
      ignore: false,
      single: false,
    },
    divide: {
      field: null,
      dir: null,
      by_subcategory: null,
      collapsed: [],
    },
    sorting: {
      fields: [],
    },
    filters: {
      op: "AND",
      fields: [],
      search: null,
      search_custom_fields: null,
      search_description: false,
      search_name: false,
      show_closed: showClosed,
    },
    columns: {
      fields: [],
    },
    team_sidebar: {
      assignees: [],
      group_assignees: [],
      assigned_comments: false,
      unassigned_tasks: false,
    },
    settings: {
      show_task_locations: false,
      show_subtasks: 1,
      show_subtask_parent_names: false,
      show_closed_subtasks: false,
      show_assignees: true,
      show_images: true,
      show_timer: false,
      collapse_empty_columns: null,
      me_comments: true,
      me_subtasks: true,
      me_checklists: true,
      show_empty_statuses: false,
      auto_wrap: false,
      time_in_status_view: 1,
      is_description_pinned: false,
      override_parent_hierarchy_filter: false,
      fast_load_mode: false,
    },
  };
}

function createTableViewPayload(name, showClosed) {
  return {
    name,
    type: "table",
    grouping: {
      field: "none",
      dir: null,
      collapsed: [],
      ignore: false,
      single: false,
    },
    divide: {
      field: null,
      dir: null,
      by_subcategory: null,
      collapsed: [],
    },
    sorting: {
      fields: [],
    },
    filters: {
      op: "AND",
      fields: [],
      search: null,
      search_custom_fields: null,
      search_description: false,
      search_name: false,
      show_closed: showClosed,
    },
    columns: {
      fields: [
        { field: "name", idx: 0, width: null, hidden: false, name: null, display: null, pinned: null },
        { field: "assignee", idx: 1, width: null, hidden: false, name: null, display: null, pinned: null },
        { field: "status", idx: 2, width: null, hidden: false, name: null, display: null, pinned: null },
        { field: "startDate", idx: 3, width: null, hidden: false, name: null, display: null, pinned: null },
        { field: "dueDate", idx: 4, width: null, hidden: false, name: null, display: null, pinned: null },
        { field: "tag", idx: 5, width: null, hidden: false, name: null, display: null, pinned: null },
      ],
    },
    team_sidebar: {
      assignees: [],
      group_assignees: [],
      assigned_comments: false,
      unassigned_tasks: false,
    },
    settings: {
      show_task_locations: false,
      show_subtasks: 3,
      show_subtask_parent_names: false,
      show_closed_subtasks: false,
      show_assignees: true,
      show_images: true,
      show_timer: false,
      collapse_empty_columns: null,
      me_comments: true,
      me_subtasks: true,
      me_checklists: true,
      show_empty_statuses: false,
      auto_wrap: false,
      time_in_status_view: 1,
      is_description_pinned: false,
      override_parent_hierarchy_filter: false,
      fast_load_mode: false,
    },
  };
}

function createByAssigneeViewPayload() {
  return {
    name: "By Assignee",
    type: "table",
    grouping: {
      field: "assignee",
      dir: 1,
      collapsed: [],
      ignore: false,
      single: false,
    },
    divide: {
      field: null,
      dir: null,
      by_subcategory: null,
      collapsed: [],
    },
    sorting: {
      fields: [],
    },
    filters: {
      op: "AND",
      fields: [],
      search: null,
      search_custom_fields: null,
      search_description: false,
      search_name: false,
      show_closed: true,
    },
    columns: {
      fields: [
        { field: "name", idx: 0, width: null, hidden: false, name: null, display: null, pinned: null },
        { field: "assignee", idx: 1, width: null, hidden: false, name: null, display: null, pinned: null },
        { field: "status", idx: 2, width: null, hidden: false, name: null, display: null, pinned: null },
        { field: "startDate", idx: 3, width: null, hidden: false, name: null, display: null, pinned: null },
        { field: "dueDate", idx: 4, width: null, hidden: false, name: null, display: null, pinned: null },
      ],
    },
    team_sidebar: {
      assignees: [],
      group_assignees: [],
      assigned_comments: false,
      unassigned_tasks: false,
    },
    settings: {
      show_task_locations: true,
      show_subtasks: 3,
      show_subtask_parent_names: true,
      show_closed_subtasks: false,
      show_assignees: true,
      show_images: true,
      show_timer: false,
      collapse_empty_columns: null,
      me_comments: true,
      me_subtasks: true,
      me_checklists: true,
      show_empty_statuses: false,
      auto_wrap: false,
      time_in_status_view: 1,
      is_description_pinned: false,
      override_parent_hierarchy_filter: false,
      fast_load_mode: false,
    },
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.token) {
    throw new Error("Missing ClickUp token. Set CLICKUP_PAT or pass --token.");
  }

  const teamResponse = await apiRequest(args.token, "GET", `${args.clickupBaseUrl}/team`);
  const workspace = (teamResponse?.teams ?? []).find((team) => String(team.id) === String(args.workspaceId));
  if (!workspace) {
    throw new Error(`Workspace ${args.workspaceId} was not found.`);
  }

  const memberIndex = createAssigneeIndex(workspace.members ?? []);
  const space = await getSpace(args.token, args);

  if (space.name !== args.spaceName) {
    logAction(args, `Rename space "${space.name}" -> "${args.spaceName}"`);
    if (!args.dryRun) {
      await apiRequest(
        args.token,
        "PUT",
        `${args.clickupBaseUrl}/space/${args.spaceId}`,
        buildSpaceUpdatePayload(space, args.spaceName)
      );
    }
  }

  const rootLists = await listSpaceRootLists(args.token, args.spaceId, args.clickupBaseUrl);
  const evidenceList = rootLists.find((list) => String(list.id) === String(args.evidenceListId));
  if (!evidenceList) {
    throw new Error(`Evidence list ${args.evidenceListId} was not found.`);
  }

  if (evidenceList.name !== args.evidenceListName) {
    logAction(args, `Rename evidence list "${evidenceList.name}" -> "${args.evidenceListName}"`);
    if (!args.dryRun) {
      await apiRequest(args.token, "PUT", `${args.clickupBaseUrl}/list/${args.evidenceListId}`, {
        name: args.evidenceListName,
        markdown_content: [
          "# Assignment 5 Evidence",
          "",
          "- Historical work reconstructed from Git history",
          "- Completed tasks use the original evidence-backed date range",
          "- Ownership is preserved in assignees when members exist and in task descriptions otherwise",
        ].join("\n"),
      });
    }
  }

  for (const legacyName of args.legacyListNames) {
    const legacyList = rootLists.find((list) => normalize(list.name) === normalize(legacyName));
    if (!legacyList) {
      continue;
    }

    const renamed = `Legacy Placeholder - ${legacyName}`;
    if (legacyList.name === renamed) {
      continue;
    }

    // ClickUp's public API does not expose a list archive endpoint, so the setup marks
    // the placeholders clearly instead of silently deleting them.
    logAction(args, `Rename legacy list "${legacyList.name}" -> "${renamed}"`);
    if (!args.dryRun) {
      await apiRequest(args.token, "PUT", `${args.clickupBaseUrl}/list/${legacyList.id}`, {
        name: renamed,
        markdown_content: [
          "# Legacy placeholder",
          "",
          "- This list predates the course-specific ClickUp structure",
          "- Keep for audit safety only",
        ].join("\n"),
      });
    }
  }

  const existingTagsResponse = await apiRequest(
    args.token,
    "GET",
    `${args.clickupBaseUrl}/space/${args.spaceId}/tag`
  );
  const existingTags = existingTagsResponse?.tags ?? [];
  for (const tagName of SPACE_TAGS) {
    await ensureSpaceTag(args.token, args, existingTags, tagName);
  }

  const folders = await listFolders(args.token, args.spaceId, args.clickupBaseUrl);
  const adminFolder = await ensureFolder(args.token, args, folders, args.adminFolderName);
  const milestoneFolder = await ensureFolder(args.token, args, folders, args.milestoneFolderName);
  const finalizationFolder = await ensureFolder(args.token, args, folders, args.finalizationFolderName);

  const milestoneLists = [];
  for (const definition of MILESTONE_LISTS) {
    milestoneLists.push(await ensureFolderList(args.token, args, milestoneFolder, definition));
  }

  const finalizationLists = [];
  for (const definition of FINALIZATION_LISTS) {
    finalizationLists.push(await ensureFolderList(args.token, args, finalizationFolder, definition));
  }

  const docs = await listDocs(args.token, args);
  const adminParent = { id: adminFolder.id, type: 5 };
  for (const definition of DOC_DEFINITIONS) {
    await ensureDoc(args.token, args, docs, definition.name, adminParent, definition.buildContent());
  }

  const spaceViews = await listSpaceViews(args.token, args);
  await ensureView(args.token, args, "space", args.spaceId, {
    name: "By Assignee",
    payload: createByAssigneeViewPayload(),
  }, spaceViews);

  const finalizationViews =
    args.dryRun && String(finalizationFolder.id).startsWith("dry-run-")
      ? []
      : await listFolderViews(args.token, args.clickupBaseUrl, finalizationFolder.id);
  await ensureView(args.token, args, "folder", finalizationFolder.id, {
    name: "Board - Active Work",
    payload: createFolderBoardViewPayload("Board - Active Work"),
  }, finalizationViews);
  await ensureView(args.token, args, "folder", finalizationFolder.id, {
    name: "Calendar - Final Dates",
    payload: createCalendarViewPayload("Calendar - Final Dates", false),
  }, finalizationViews);

  const evidenceViews = await listListViews(args.token, args.clickupBaseUrl, args.evidenceListId);
  await ensureView(args.token, args, "list", args.evidenceListId, {
    name: "Table - A5 Evidence",
    payload: createTableViewPayload("Table - A5 Evidence", true),
  }, evidenceViews);

  const listsByName = new Map();
  listsByName.set(normalize(args.evidenceListName), { id: args.evidenceListId, name: args.evidenceListName });
  for (const list of milestoneLists) {
    listsByName.set(normalize(list.name), list);
  }
  for (const list of finalizationLists) {
    listsByName.set(normalize(list.name), list);
  }

  const evidenceTasks = await listTasks(args.token, args.clickupBaseUrl, args.evidenceListId);
  if (!args.skipHistoricalImport) {
    const historicalTasks = readHistoricalTasks(args.csv);
    for (const task of historicalTasks) {
      const assigneeIds = resolveHistoricalAssigneeIds(memberIndex, task.assignee);
      await syncTask(
        args.token,
        args,
        args.evidenceListId,
        evidenceTasks,
        {
          ...task,
          markdown_content: buildHistoricalDescription(task),
        },
        assigneeIds,
        resolveSpaceStatus(space, task.status)
      );
    }

    if (!args.dryRun) {
      const refreshedEvidenceTasks = await listTasks(args.token, args.clickupBaseUrl, args.evidenceListId);
      for (const task of historicalTasks) {
        const current = refreshedEvidenceTasks.find((item) => normalize(item.name) === normalize(task.name));
        if (current) {
          await syncTaskTags(args.token, args, current.id, task.tags);
        }
      }
    }
  }

  const finalizationListTaskCache = new Map();
  for (const task of FINALIZATION_TASKS) {
    const targetList = findListByName(listsByName, task.listName);
    if (!finalizationListTaskCache.has(targetList.id)) {
      finalizationListTaskCache.set(
        targetList.id,
        await listTasks(args.token, args.clickupBaseUrl, targetList.id)
      );
    }

    const assigneeIds = resolveOwnerIds(memberIndex, task.intendedOwners);
    await syncTask(
      args.token,
      args,
      targetList.id,
      finalizationListTaskCache.get(targetList.id),
      {
        ...task,
        markdown_content: buildCurrentTaskDescription(task),
      },
      assigneeIds,
      resolveSpaceStatus(space, task.status)
    );
  }

  if (!args.dryRun) {
    for (const task of FINALIZATION_TASKS) {
      const targetList = findListByName(listsByName, task.listName);
      const tasks = await listTasks(args.token, args.clickupBaseUrl, targetList.id);
      const current = tasks.find((item) => normalize(item.name) === normalize(task.name));
      if (current) {
        await syncTaskTags(args.token, args, current.id, task.tags);
      }
    }
  }

  console.log("");
  console.log("ClickUp setup completed.");
  console.log(`Workspace: ${workspace.name} (${workspace.id})`);
  console.log(`Space: ${args.spaceName} (${args.spaceId})`);
  console.log(`Evidence list: ${args.evidenceListName} (${args.evidenceListId})`);
  console.log(`Workspace members currently detected: ${(workspace.members ?? []).length}`);

  const missingMembers = MEMBER_TARGETS.filter(
    (target) => !memberIndex.get(normalize(target.canonicalName))
  ).map((target) => `${target.canonicalName} <${target.emails[0]}>`);

  if (missingMembers.length > 0) {
    console.log("");
    console.log("Manual follow-up still required:");
    console.log(`- Invite these members in ClickUp UI: ${missingMembers.join(", ")}`);
    console.log("- Link GitHub repo AK29-Shay/IdeaBridge to the Space in the ClickUp UI");
    console.log("- Re-run this script after the members accept their invites to backfill direct assignees");
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
