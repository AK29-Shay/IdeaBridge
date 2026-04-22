const BASE_URL = process.env.APP_BASE_URL ?? "http://localhost:3000";

const CHECKS = [
  {
    label: "DB health",
    path: "/api/health/db",
    expectStatus: 200,
  },
  {
    label: "Posts API",
    path: "/api/posts?limit=5",
    expectStatus: 200,
  },
  {
    label: "Mentors search API",
    path: "/api/mentors/search?limit=5",
    expectStatus: 200,
  },
  {
    label: "Blog API",
    path: "/api/blog",
    expectStatus: 200,
  },
];

async function runCheck(check) {
  const url = `${BASE_URL}${check.path}`;

  try {
    const response = await fetch(url, { redirect: "manual" });
    const bodyText = await response.text();

    if (response.status !== check.expectStatus) {
      console.log(`[FAIL] ${check.label}: expected ${check.expectStatus}, received ${response.status}`);
      if (bodyText) {
        console.log(`  body: ${bodyText.slice(0, 240)}`);
      }
      return false;
    }

    console.log(`[PASS] ${check.label}: ${response.status}`);
    if (bodyText) {
      console.log(`  body: ${bodyText.slice(0, 140).replace(/\s+/g, " ")}`);
    }
    return true;
  } catch (error) {
    console.log(`[FAIL] ${check.label}: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

async function main() {
  console.log(`Running API smoke checks against ${BASE_URL}`);
  let passCount = 0;

  for (const check of CHECKS) {
    const passed = await runCheck(check);
    if (passed) {
      passCount += 1;
    }
  }

  console.log("");
  console.log(`Passed ${passCount} of ${CHECKS.length} checks.`);

  if (passCount !== CHECKS.length) {
    process.exitCode = 1;
  }
}

main();
