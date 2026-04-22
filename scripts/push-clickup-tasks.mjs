import { readFileSync } from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const DEFAULT_CSV_PATH = path.join(
  process.cwd(),
  "docs",
  "assignment5",
  "project-management-evidence",
  "clickup_import.csv"
);

function parseArgs(argv) {
  const args = {
    csv: DEFAULT_CSV_PATH,
    dryRun: false,
    teamId: "",
    spaceId: "",
    listId: "",
    createListName: "",
    token: process.env.CLICKUP_PAT ?? "",
    unmappedAssignees: "prompt",
    yes: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    const next = argv[index + 1];

    switch (current) {
      case "--csv":
        args.csv = next;
        index += 1;
        break;
      case "--team-id":
        args.teamId = next;
        index += 1;
        break;
      case "--space-id":
        args.spaceId = next;
        index += 1;
        break;
      case "--list-id":
        args.listId = next;
        index += 1;
        break;
      case "--create-list":
        args.createListName = next;
        index += 1;
        break;
      case "--token":
        args.token = next;
        index += 1;
        break;
      case "--unmapped-assignees":
        args.unmappedAssignees = next;
        index += 1;
        break;
      case "--dry-run":
        args.dryRun = true;
        break;
      case "--yes":
        args.yes = true;
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

function readTasks(csvPath) {
  const raw = readFileSync(csvPath, "utf8");
  const rows = parseCsv(raw);
  if (rows.length < 2) {
    throw new Error(`CSV file ${csvPath} does not contain any task rows.`);
  }

  const headers = rows[0];
  const expectedHeaders = ["Task Name", "Task Description", "Assignee", "Status", "Start Date", "Due Date"];
  if (headers.join("|") !== expectedHeaders.join("|")) {
    throw new Error(`Unexpected CSV headers. Expected ${expectedHeaders.join(", ")}, received ${headers.join(", ")}`);
  }

  return rows.slice(1).map((columns) => ({
    name: columns[0],
    description: columns[1],
    assignee: columns[2],
    status: columns[3],
    startDate: columns[4],
    dueDate: columns[5],
  }));
}

function normalizeName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
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

  return response.json();
}

async function chooseOne(rl, label, items, itemLabel, preferredId = "") {
  if (items.length === 0) {
    throw new Error(`No ${label} found.`);
  }

  if (preferredId) {
    const preferred = items.find((item) => String(item.id) === String(preferredId));
    if (!preferred) {
      throw new Error(`Requested ${label} ID ${preferredId} was not found.`);
    }
    return preferred;
  }

  if (items.length === 1) {
    return items[0];
  }

  output.write(`\nSelect ${label}:\n`);
  items.forEach((item, index) => {
    output.write(`  ${index + 1}. ${itemLabel(item)}\n`);
  });

  while (true) {
    const answer = (await rl.question(`Enter ${label} number: `)).trim();
    const selectedIndex = Number(answer) - 1;
    if (Number.isInteger(selectedIndex) && selectedIndex >= 0 && selectedIndex < items.length) {
      return items[selectedIndex];
    }
    output.write(`Invalid ${label} selection.\n`);
  }
}

async function resolveList(rl, token, space, args) {
  const listsResponse = await apiRequest(
    token,
    "GET",
    `https://api.clickup.com/api/v2/space/${space.id}/list?archived=false`
  );
  const existingLists = listsResponse.lists ?? [];

  if (args.listId) {
    const existing = existingLists.find((item) => String(item.id) === String(args.listId));
    if (!existing) {
      throw new Error(`Requested list ID ${args.listId} was not found in space ${space.name}.`);
    }
    return existing;
  }

  if (args.createListName) {
    return apiRequest(token, "POST", `https://api.clickup.com/api/v2/space/${space.id}/list`, {
      name: args.createListName,
    });
  }

  output.write(`\nAvailable lists in ${space.name}:\n`);
  existingLists.forEach((list, index) => {
    output.write(`  ${index + 1}. ${list.name} (${list.task_count ?? 0} tasks)\n`);
  });
  output.write(`  ${existingLists.length + 1}. Create a new list\n`);

  while (true) {
    const answer = (await rl.question("Choose target list: ")).trim();
    const selectedIndex = Number(answer) - 1;

    if (Number.isInteger(selectedIndex) && selectedIndex >= 0 && selectedIndex < existingLists.length) {
      return existingLists[selectedIndex];
    }

    if (selectedIndex === existingLists.length) {
      const listName = (await rl.question("New list name: ")).trim();
      if (!listName) {
        output.write("List name cannot be empty.\n");
        continue;
      }

      return apiRequest(token, "POST", `https://api.clickup.com/api/v2/space/${space.id}/list`, {
        name: listName,
      });
    }

    output.write("Invalid list selection.\n");
  }
}

async function buildAssigneeMapping(rl, tasks, members, strategy) {
  const uniqueAssignees = [...new Set(tasks.map((task) => task.assignee).filter(Boolean))];
  const mapping = new Map();
  const normalizedMembers = members.map((member) => ({
    id: member.user.id,
    name: member.user.username,
    normalized: normalizeName(member.user.username),
  }));

  for (const assignee of uniqueAssignees) {
    const normalizedAssignee = normalizeName(assignee);
    const directMatch = normalizedMembers.find((member) => member.normalized === normalizedAssignee);
    if (directMatch) {
      mapping.set(assignee, directMatch.id);
      continue;
    }

    if (strategy === "leave-unassigned") {
      mapping.set(assignee, null);
      continue;
    }

    if (strategy === "first-member") {
      mapping.set(assignee, normalizedMembers[0]?.id ?? null);
      continue;
    }

    output.write(`\nNo direct ClickUp member match found for planned owner "${assignee}".\n`);
    output.write("  0. Leave tasks unassigned but preserve the planned owner in the description\n");
    normalizedMembers.forEach((member, index) => {
      output.write(`  ${index + 1}. Assign to ${member.name}\n`);
    });

    while (true) {
      const answer = (await rl.question(`Choose assignment handling for "${assignee}": `)).trim();
      const selectedIndex = Number(answer);
      if (selectedIndex === 0) {
        mapping.set(assignee, null);
        break;
      }

      const member = normalizedMembers[selectedIndex - 1];
      if (member) {
        mapping.set(assignee, member.id);
        break;
      }

      output.write("Invalid selection.\n");
    }
  }

  return mapping;
}

function resolveStatus(statuses, csvStatus) {
  const normalizedStatus = normalizeName(csvStatus);

  const directMatch = statuses.find((status) => normalizeName(status.status) === normalizedStatus);
  if (directMatch) {
    return directMatch.status;
  }

  if (["done", "closed", "complete", "completed"].includes(normalizedStatus)) {
    const closedStatus = statuses.find((status) => status.type === "closed");
    if (closedStatus) {
      return closedStatus.status;
    }
  }

  const openStatus = statuses.find((status) => status.type === "open");
  return openStatus?.status ?? statuses[0]?.status ?? "to do";
}

function buildMarkdownDescription(task, actualAssigneeName) {
  const lines = [
    task.description.trim(),
    "",
    "---",
    `Planned owner from Git evidence: ${task.assignee || "Unspecified"}`,
    `Imported status source: ${task.status}`,
    `Evidence date window: ${task.startDate} to ${task.dueDate}`,
    "Imported from: docs/assignment5/project-management-evidence/clickup_import.csv",
  ];

  if (actualAssigneeName) {
    lines.push(`ClickUp assignee used: ${actualAssigneeName}`);
  }

  return lines.join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const token = args.token;
  if (!token) {
    throw new Error("Missing ClickUp token. Set CLICKUP_PAT or pass --token.");
  }

  const tasks = readTasks(args.csv);
  const rl = readline.createInterface({ input, output });

  try {
    const teamResponse = await apiRequest(token, "GET", "https://api.clickup.com/api/v2/team");
    const teams = teamResponse.teams ?? [];
    const team = await chooseOne(rl, "workspace", teams, (item) => `${item.name} (${item.id})`, args.teamId);

    const spaceResponse = await apiRequest(
      token,
      "GET",
      `https://api.clickup.com/api/v2/team/${team.id}/space?archived=false`
    );
    const spaces = spaceResponse.spaces ?? [];
    const space = await chooseOne(rl, "space", spaces, (item) => `${item.name} (${item.id})`, args.spaceId);
    const list = await resolveList(rl, token, space, args);
    const assigneeMapping = await buildAssigneeMapping(rl, tasks, team.members ?? [], args.unmappedAssignees);
    const statusSummary = [...new Set(tasks.map((task) => resolveStatus(space.statuses ?? [], task.status)))];

    output.write("\nImport summary:\n");
    output.write(`  Workspace: ${team.name} (${team.id})\n`);
    output.write(`  Space: ${space.name} (${space.id})\n`);
    output.write(`  List: ${list.name} (${list.id})\n`);
    output.write(`  Tasks to create: ${tasks.length}\n`);
    output.write(`  Statuses that will be used: ${statusSummary.join(", ")}\n`);
    output.write(`  Mode: ${args.dryRun ? "dry-run" : "create tasks"}\n`);

    if (!args.yes) {
      const confirmation = (await rl.question("\nProceed? Type 'yes' to continue: ")).trim().toLowerCase();
      if (confirmation !== "yes") {
        output.write("Cancelled.\n");
        return;
      }
    }

    const createdTasks = [];

    for (const task of tasks) {
      const mappedAssigneeId = assigneeMapping.get(task.assignee) ?? null;
      const member = (team.members ?? []).find((entry) => entry.user.id === mappedAssigneeId);
      const payload = {
        name: task.name,
        markdown_content: buildMarkdownDescription(task, member?.user.username ?? ""),
        status: resolveStatus(space.statuses ?? [], task.status),
        start_date: dateToTimestamp(task.startDate),
        start_date_time: false,
        due_date: dateToTimestamp(task.dueDate),
        due_date_time: false,
        notify_all: false,
      };

      if (mappedAssigneeId) {
        payload.assignees = [mappedAssigneeId];
      }

      if (args.dryRun) {
        output.write(`DRY RUN: would create "${task.name}"\n`);
        createdTasks.push({ id: "(dry-run)", url: "", name: task.name });
        continue;
      }

      const created = await apiRequest(
        token,
        "POST",
        `https://api.clickup.com/api/v2/list/${list.id}/task`,
        payload
      );
      createdTasks.push({ id: created.id, url: created.url, name: created.name });
      output.write(`Created "${created.name}" -> ${created.url}\n`);
    }

    output.write(`\nFinished. ${createdTasks.length} task(s) processed.\n`);
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
