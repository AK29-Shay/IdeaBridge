import { chromium } from "playwright";

const BASE_URL = "http://localhost:3000";

const scenarios = [
  {
    label: "student",
    email: "student.demo@ideabridge.dev",
    password: "Demo@123",
    expectedPath: "/dashboard/student",
  },
  {
    label: "mentor",
    email: "mentor.demo@ideabridge.dev",
    password: "Demo@123",
    expectedPath: "/dashboard/mentor",
  },
];

async function runScenario(browser, scenario) {
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log(`[console:${scenario.label}] ${msg.text()}`);
    }
  });

  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);

  const usersBefore = await page.evaluate(() => localStorage.getItem("ideabridge_users_v1"));
  console.log(`[debug:${scenario.label}] users in storage before submit: ${usersBefore ? "yes" : "no"}`);

  await page.fill("#login-email", scenario.email);
  await page.fill("#login-password", scenario.password);
  await page.click("button[type='submit']");

  try {
    await page.waitForURL(
      (url) => url.pathname.startsWith(scenario.expectedPath),
      { timeout: 15000 }
    );
  } catch (error) {
    const urlNow = page.url();
    const authState = await page.evaluate(() => localStorage.getItem("ideabridge_auth_v1"));
    const bodyText = await page.locator("body").innerText();
    console.log(`[debug:${scenario.label}] url after submit: ${urlNow}`);
    console.log(`[debug:${scenario.label}] auth state: ${authState}`);
    console.log(`[debug:${scenario.label}] body contains 'Incorrect password': ${bodyText.includes("Incorrect password")}`);
    console.log(`[debug:${scenario.label}] body contains 'No account found': ${bodyText.includes("No account found")}`);
    throw error;
  }

  const url = page.url();
  await context.close();
  return url;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const scenario of scenarios) {
      const finalUrl = await runScenario(browser, scenario);
      console.log(`[PASS] ${scenario.label} login -> ${finalUrl}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error("[FAIL] Login QA failed:");
  console.error(error);
  process.exit(1);
});
