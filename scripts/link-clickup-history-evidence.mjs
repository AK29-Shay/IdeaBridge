import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const DEFAULTS = {
  token: process.env.CLICKUP_PAT ?? "",
  baseUrl: "https://api.clickup.com/api/v2",
  listId: "901817537333",
  csv: path.join(
    process.cwd(),
    "docs",
    "assignment5",
    "project-management-evidence",
    "task_evidence.csv"
  ),
  remoteUrl: "https://github.com/AK29-Shay/IdeaBridge",
  dryRun: false,
};

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
      case "--list-id":
        args.listId = next;
        index += 1;
        break;
      case "--csv":
        args.csv = next;
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

function readEvidenceRows(csvPath) {
  const rows = parseCsv(readFileSync(csvPath, "utf8"));
  const headers = rows[0] ?? [];
  const expectedHeaders = [
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

  if (headers.join("|") !== expectedHeaders.join("|")) {
    throw new Error(`Unexpected headers in ${csvPath}`);
  }

  return rows.slice(1).map((columns) => ({
    taskName: columns[0],
    taskDescription: columns[1],
    assignee: columns[2],
    startDate: columns[3],
    dueDate: columns[4],
    supportingCommits: columns[5].split(" ").filter(Boolean),
    supportingSubjects: columns[6]
      .split("|")
      .map((value) => value.trim())
      .filter(Boolean),
    attributionBasis: columns[7],
    attributionRationale: columns[8],
  }));
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

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function resolveFullHash(prefix) {
  return execFileSync("git", ["rev-parse", prefix], { encoding: "utf8" }).trim();
}

function extractPullRequests(subjects) {
  const prNumbers = new Set();

  for (const subject of subjects) {
    const matches = subject.matchAll(/(?:Merge pull request #|PR#)(\d+)/gi);
    for (const match of matches) {
      prNumbers.add(match[1]);
    }
  }

  return [...prNumbers];
}

function injectEvidenceSection(markdown, evidenceSection) {
  const marker = "## Supporting Git Evidence";
  if (!markdown.includes(marker)) {
    return `${markdown.trim()}\n\n${evidenceSection}`;
  }

  return `${markdown.split(marker)[0].trim()}\n\n${evidenceSection}`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.token) {
    throw new Error("Missing ClickUp token. Set CLICKUP_PAT or pass --token.");
  }

  const evidenceRows = readEvidenceRows(args.csv);
  const taskResponse = await apiRequest(
    args.token,
    "GET",
    `${args.baseUrl}/list/${args.listId}/task?archived=false&include_closed=true&page=0`
  );
  const clickUpTasks = taskResponse?.tasks ?? [];

  for (const row of evidenceRows) {
    const task = clickUpTasks.find((item) => normalize(item.name) === normalize(row.taskName));
    if (!task) {
      console.log(`Skipping missing ClickUp task: ${row.taskName}`);
      continue;
    }

    const fullHashes = row.supportingCommits.map(resolveFullHash);
    const commitLines = fullHashes.map((hash, index) => {
      const subject = row.supportingSubjects[index] ?? "Supporting commit";
      return `- [\`${hash.slice(0, 8)}\`](${args.remoteUrl}/commit/${hash}) - ${subject}`;
    });
    const pullRequests = extractPullRequests(row.supportingSubjects);
    const prLines = pullRequests.map((number) => `- [PR #${number}](${args.remoteUrl}/pull/${number})`);

    const evidenceSection = [
      "## Supporting Git Evidence",
      "",
      ...commitLines,
      "",
      "## Supporting Pull Requests",
      "",
      ...(prLines.length > 0 ? prLines : ["- No explicit pull request reference was reconstructed for this task."]),
      "",
      "## Attribution Notes",
      "",
      `- Attribution basis: ${row.attributionBasis}`,
      `- Attribution rationale: ${row.attributionRationale}`,
    ].join("\n");

    const taskDetails = await apiRequest(args.token, "GET", `${args.baseUrl}/task/${task.id}`);
    const currentMarkdown = String(taskDetails?.markdown_content ?? "");
    const nextMarkdown = injectEvidenceSection(currentMarkdown, evidenceSection);

    if (args.dryRun) {
      console.log(`[DRY RUN] Would update evidence links for: ${row.taskName}`);
      continue;
    }

    await apiRequest(args.token, "PUT", `${args.baseUrl}/task/${task.id}`, {
      markdown_content: nextMarkdown,
    });
    console.log(`Updated evidence links for: ${row.taskName}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
