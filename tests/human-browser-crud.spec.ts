import { randomUUID } from "node:crypto";

import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { expect, test, type APIRequestContext, type Browser, type Page, type TestInfo } from "@playwright/test";

loadEnvConfig(process.cwd());

const STUDENT = {
  email: "student.demo@ideabridge.dev",
  password: "Demo@123",
  expectedPath: "/dashboard/student",
};

const MENTOR = {
  email: "mentor.demo@ideabridge.dev",
  password: "Demo@123",
  expectedPath: "/dashboard/mentor",
};

const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NkYGD4DwABBAEAe0uK6QAAAABJRU5ErkJggg==",
  "base64"
);

type TempUser = {
  email: string;
  password: string;
  expectedPath: string;
  fullName: string;
  id: string;
};

type MentorSearchResult = {
  id: string;
  fullName: string;
  profile?: {
    bio?: string;
  };
};

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function createSupabaseAdminClient() {
  return createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function createTempUser(params: { role: "admin" | "student"; fullNamePrefix: string; expectedPath: string }) {
  const admin = createSupabaseAdminClient();
  const uniqueId = randomUUID().slice(0, 8);
  const email = `playwright.${params.role}.${Date.now()}.${uniqueId}@ideabridge.dev`;
  const password = `Demo@12345!${uniqueId}`;
  const fullName = `${params.fullNamePrefix} ${uniqueId}`;
  const profileRole = params.role === "admin" ? "Admin" : "Student";

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: params.role,
    },
  });

  if (error || !data.user) {
    throw new Error(error?.message || `Failed to create temporary ${params.role} user.`);
  }

  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: data.user.id,
      full_name: fullName,
      role: profileRole,
    },
    { onConflict: "id" }
  );

  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id).catch(() => undefined);
    throw new Error(profileError.message || `Failed to seed profile for temporary ${params.role} user.`);
  }

  return {
    email,
    password,
    expectedPath: params.expectedPath,
    fullName,
    id: data.user.id,
  } satisfies TempUser;
}

async function deleteTempUsers(userIds: string[]) {
  if (userIds.length === 0) return;

  const admin = createSupabaseAdminClient();
  await Promise.allSettled(userIds.map((userId) => admin.auth.admin.deleteUser(userId)));
}

function sanitizeCheckpointName(name: string) {
  return name.replace(/[^a-z0-9_-]+/gi, "_").toLowerCase();
}

async function captureCheckpoint(page: Page, testInfo: TestInfo, name: string) {
  await page.screenshot({
    path: testInfo.outputPath(`${sanitizeCheckpointName(name)}.png`),
    fullPage: true,
  });
}

async function fillInputReliably(page: Page, selector: string, value: string) {
  const field = page.locator(selector);
  await expect(field).toBeVisible({ timeout: 15_000 });
  await field.fill(value);

  await field.evaluate((element, nextValue) => {
    const input = element as HTMLInputElement;
    const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    valueSetter?.call(input, nextValue);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);

  await expect(field).toHaveValue(value);
}

function getRestorableBioValue(originalBio: string, fallbackBio: string, minLength: number) {
  const trimmedOriginalBio = originalBio.trim();
  return trimmedOriginalBio.length >= minLength ? trimmedOriginalBio : fallbackBio;
}

function buildFutureDate(daysAhead: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function buildFutureDateTimeLocal(daysAhead: number, hour: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(hour, 0, 0, 0);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

async function login(page: Page, credentials: { email: string; password: string; expectedPath: string }) {
  const expectedUrl = new RegExp(credentials.expectedPath);

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    if (expectedUrl.test(page.url())) {
      return;
    }

    try {
      await page.waitForLoadState("domcontentloaded", { timeout: 5_000 }).catch(() => undefined);
      await page.goto("/login", { waitUntil: "domcontentloaded" });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("interrupted by another navigation") || attempt === 3) {
        throw error;
      }
      await page.waitForLoadState("domcontentloaded", { timeout: 10_000 }).catch(() => undefined);
      await page.waitForTimeout(500);
      continue;
    }

    await page.waitForLoadState("domcontentloaded");

    await fillInputReliably(page, "#login-email", credentials.email);
    await fillInputReliably(page, "#login-password", credentials.password);
    await page.getByRole("button", { name: /sign in/i }).click();

    try {
      await expect(page).toHaveURL(expectedUrl, { timeout: 30_000 });
      await page
        .waitForFunction(
          () => {
            const bodyText = document.body.innerText.toLowerCase();
            return bodyText.includes("logout") || bodyText.includes("sign out") || bodyText.includes("signed in");
          },
          undefined,
          { timeout: 20_000 }
        )
        .catch(() => undefined);
      return;
    } catch (error) {
      if (attempt === 3) {
        throw error;
      }

      await page.waitForLoadState("networkidle").catch(() => undefined);
      await page.waitForTimeout(1_000 * attempt);
    }
  }
}

async function getWithRetry(
  request: APIRequestContext,
  url: string,
  options?: { expectedStatus?: number; attempts?: number }
) {
  const attempts = options?.attempts ?? 4;
  const expectedStatus = options?.expectedStatus ?? 200;
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await request.get(url);
      if (response.status() === expectedStatus) {
        return response;
      }

      lastError = new Error(`Expected ${expectedStatus} from ${url}, received ${response.status()}.`);
    } catch (error) {
      lastError = error;
    }

    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, 1_000 * attempt));
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`Request failed for ${url}.`);
}

async function assertCorePublicApis(request: APIRequestContext) {
  const health = await getWithRetry(request, "/api/health/db");
  expect(health.status()).toBe(200);

  const posts = await getWithRetry(request, "/api/posts?limit=5");
  expect(posts.status()).toBe(200);

  const mentors = await getWithRetry(request, "/api/mentors/search?limit=5");
  expect(mentors.status()).toBe(200);

  const blog = await getWithRetry(request, "/api/blog");
  expect(blog.status()).toBe(200);
}

async function findDemoMentor(request: APIRequestContext) {
  const response = await request.get("/api/mentors/search?limit=48");
  expect(response.status()).toBe(200);
  const mentors = (await response.json()) as MentorSearchResult[];
  return (
    mentors.find((mentor) => mentor.fullName.toLowerCase().includes("mentor demo")) ??
    mentors.find((mentor) => mentor.profile?.bio?.toLowerCase().includes("local walkthroughs")) ??
    mentors[0] ??
    null
  );
}

async function updateStudentProfileAndRestore(page: Page, runId: string) {
  await page.goto("/dashboard/student/profile");
  await expect(page).toHaveURL(/\/dashboard\/student\/profile$/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: /(?:My|Student) Profile/i })).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: /edit profile/i }).click();
  const bioField = page.getByPlaceholder(/Tell mentors about yourself/i);
  const originalBio = await bioField.inputValue();
  const updatedBio = `Playwright student profile QA ${runId}. I am validating the editable student bio flow end to end.`;
  const restoredBio = getRestorableBioValue(originalBio, updatedBio, 5);

  await bioField.fill(updatedBio);
  await page.getByRole("button", { name: /save profile/i }).click();
  await expect(page.getByRole("button", { name: /edit profile/i })).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: /edit profile/i }).click();
  const reopenedBioField = page.getByPlaceholder(/Tell mentors about yourself/i);
  await expect(reopenedBioField).toHaveValue(updatedBio, { timeout: 15_000 });
  await reopenedBioField.fill(restoredBio);
  await page.getByRole("button", { name: /save profile/i }).click();
  await expect(page.getByRole("button", { name: /edit profile/i })).toBeVisible({ timeout: 15_000 });
}

async function createStudentPostAndVerifySearch(page: Page, postTitle: string, uniqueTag: string, runId: string) {
  await page.goto("/ideas/explore");
  await expect(page.getByRole("heading", { name: /Explore ideas, open projects, and guidance threads/i })).toBeVisible();

  await page.getByPlaceholder(/Next\.js App Router Monorepo/i).fill(postTitle);
  await page
    .getByPlaceholder(/# My Awesome Project/i)
    .fill(`## Playwright QA Post\nThis post was created by the automated browser walkthrough for ${postTitle}.`);
  await page.getByPlaceholder(/Comma separated/i).fill(`${uniqueTag}, nextjs, playwright`);

  await page.getByRole("button", { name: /Refine Idea/i }).click();
  await expect(page.getByText(/Idea Refinement Assistant/i)).toBeVisible({ timeout: 20_000 });

  await page.locator('input[type="file"][title="Upload project files"]').setInputFiles({
    name: `qa-evidence-${runId}.zip`,
    mimeType: "application/zip",
    buffer: Buffer.from(`IdeaBridge QA evidence ${runId}`, "utf-8"),
  });
  await expect(page.getByText(new RegExp(`qa-evidence-${runId}\\.zip`))).toBeVisible({ timeout: 60_000 });

  await page.getByRole("button", { name: /Publish Post/i }).click();
  await expect(page.getByText(postTitle).first()).toBeVisible({ timeout: 15_000 });

  const inPageSearch = page.getByPlaceholder(/Search title, description, author, type/i);
  await inPageSearch.fill(postTitle);
  await expect(page.getByText(postTitle).first()).toBeVisible({ timeout: 15_000 });

  await page.goto("/search");
  await expect(page.getByRole("heading", { name: /Explore ideas, projects, and requests/i })).toBeVisible();
  await expect(page.getByText(/Loading ideas/i)).toHaveCount(0, { timeout: 20_000 });
  await page.getByPlaceholder(/Search by title, description, author, or tech stack/i).fill(postTitle);
  await expect(page.getByText(postTitle).first()).toBeVisible({ timeout: 20_000 });

  const resultCard = page
    .locator("article")
    .filter({ hasText: postTitle })
    .filter({ has: page.getByRole("button", { name: /^Save$/ }) })
    .first();
  await expect(resultCard).toBeVisible({ timeout: 15_000 });
  await resultCard.getByRole("button", { name: /^Save$/ }).click();
  await page.waitForTimeout(750);

  await page.getByRole("button", { name: /^Filters/i }).click();
  await page.getByRole("button", { name: uniqueTag }).click();
  await expect(page.getByText(postTitle).first()).toBeVisible({ timeout: 15_000 });
}

async function verifyRecommendationHub(page: Page, postTitle: string) {
  await page.goto("/dashboard/student/recommendations");
  await expect(page.getByText(/Save strong ideas and surface the next best ones/i)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(postTitle).first()).toBeVisible({ timeout: 15_000 });
}

async function exerciseThreadCrud(page: Page, runId: string) {
  const replyText = `Playwright thread reply ${runId}`;
  const editedReplyText = `Playwright edited thread reply ${runId}`;

  await page.goto("/dashboard/student/projects");
  await expect(page.getByRole("heading", { name: /My Projects/i })).toBeVisible({ timeout: 15_000 });

  await expect(page.getByRole("button", { name: /^Reply$/ }).first()).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: /^Reply$/ }).first().click();
  await page.locator('input[placeholder^="Reply to"]').first().fill(replyText);
  await page.getByRole("button", { name: /^Post$/ }).first().click();
  await expect(page.getByText(replyText)).toBeVisible({ timeout: 15_000 });

  const findCommentCard = (text: string) =>
    page
      .getByText(text, { exact: true })
      .first()
      .locator('xpath=ancestor::*[contains(@class,"group")][1]');

  const createdReply = findCommentCard(replyText);
  await createdReply.hover();
  await createdReply.getByLabel(/Open comment actions/i).first().click({ force: true });
  await createdReply.getByRole("button", { name: /^Edit$/ }).click();
  await page.getByLabel(/Edit comment text/i).fill(editedReplyText);
  await page.getByRole("button", { name: /^Save$/ }).click();
  await expect(page.getByText(editedReplyText)).toBeVisible({ timeout: 15_000 });

  const editedReply = findCommentCard(editedReplyText);
  await editedReply.hover();
  await editedReply.getByLabel(/Open comment actions/i).first().click({ force: true });
  await editedReply.getByRole("button", { name: /^Delete$/ }).first().click();
  await editedReply.getByRole("button", { name: /^Delete$/ }).last().click();
  await expect(page.getByText(editedReplyText)).toHaveCount(0);
}

async function createMentorshipRequest(page: Page, mentorId: string, mentorName: string, requestTitle: string) {
  await page.goto("/mentors");
  await expect(page.getByRole("heading", { name: /Find mentors by skills and availability/i })).toBeVisible();

  await page.getByLabel(/^Search$/).fill(mentorName);
  await expect(page.getByText(mentorName).first()).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: /Check Availability/i }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: /^Done$/ }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.goto(`/mentors/${mentorId}`);
  await expect(page).toHaveURL(/\/mentors\//, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: mentorName })).toBeVisible({ timeout: 15_000 });

  const requestButton = page.getByRole("button", { name: /Request Mentorship/i });
  await expect(requestButton).toBeEnabled({ timeout: 20_000 });
  await requestButton.click();

  if (page.url().includes("/login")) {
    await login(page, STUDENT);
    await page.goto(`/mentors/${mentorId}`);
    await expect(page.getByRole("heading", { name: mentorName })).toBeVisible({ timeout: 15_000 });
    await expect(requestButton).toBeEnabled({ timeout: 20_000 });
    await requestButton.click();
  }

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible({ timeout: 15_000 });
  await dialog.getByLabel(/Project Title/i).fill(requestTitle);
  await dialog.getByLabel(/^Goals$/).fill("Validate the guided mentorship request flow and confirm the mentor can process the request.");
  await dialog.getByLabel(/Preferred Start Date/i).fill(buildFutureDate(5));
  await dialog.getByLabel(/^Message$/).fill("This request was submitted through the live browser QA walkthrough.");
  const responsePromise = page.waitForResponse(
    (response) => response.url().includes("/api/requests") && response.request().method() === "POST"
  );
  await dialog.getByRole("button", { name: /Submit Request/i }).click();
  const response = await responsePromise;
  expect(response.ok()).toBeTruthy();
}

async function verifyStudentRequestHistory(page: Page, requestTitle: string, expectedStatus: "Pending" | "Accepted") {
  const accessToken = await getBrowserAccessToken(page);
  expect(accessToken).toBeTruthy();

  await page.waitForFunction(
    async ({ title, status, token }) => {
      const response = await fetch("/api/requests", {
        cache: "no-store",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) return false;

      const payload = await response.json();
      if (!Array.isArray(payload)) return false;

      return payload.some((request) => {
        if (request?.title !== title) {
          return false;
        }

        return status === "Pending" ? request?.status === "open" : request?.status === "in_progress";
      });
    },
    { title: requestTitle, status: expectedStatus, token: accessToken },
    { timeout: expectedStatus === "Accepted" ? 30_000 : 20_000 }
  );

  await page.goto("/dashboard/student/requests");
  await expect(page.getByRole("heading", { name: /Mentorship Requests/i })).toBeVisible();
  await expect(page.getByText(/Loading your requests/i)).toHaveCount(0, { timeout: 20_000 });

  const requestCard = page.locator("article").filter({ hasText: requestTitle }).first();
  await expect(requestCard).toBeVisible({ timeout: 20_000 });
  await expect(requestCard.getByText(expectedStatus)).toBeVisible({ timeout: 15_000 });
}

async function updateStudentProjectProgress(page: Page, runId: string) {
  const projectNote = `Playwright milestone update ${runId}: checked progress update modal, status, and notes persistence.`;

  await page.goto("/dashboard/student/projects");
  await expect(page.getByRole("heading", { name: /My Projects/i })).toBeVisible();

  await page.getByRole("button", { name: /^Update Progress$/ }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: /Quick fill/i }).click();
  await page.getByLabel(/Milestone notes/i).fill(projectNote);
  await page.getByRole("button", { name: /Save Update/i }).click();

  await expect(page.locator("p").filter({ hasText: projectNote }).last()).toBeVisible({ timeout: 15_000 });
}

async function updateMentorProfileAndRestore(page: Page, runId: string) {
  await page.goto("/dashboard/mentor/profile");
  await expect(page).toHaveURL(/\/dashboard\/mentor\/profile$/, { timeout: 15_000 });
  await expect(page.getByText(/My Profile/i).first()).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: /Edit Profile/i }).click();
  const bioField = page.getByPlaceholder(/Describe your expertise, teaching style/i);
  const originalBio = await bioField.inputValue();
  const updatedBio = `Playwright mentor profile QA ${runId}. This temporary bio confirms mentor profile edits save correctly.`;
  const restoredBio = getRestorableBioValue(originalBio, updatedBio, 10);
  const restoredBioPreview = restoredBio.slice(0, 40);

  await bioField.fill(updatedBio);
  await page.getByRole("button", { name: /Save Profile/i }).click();
  await expect(page.getByText(updatedBio)).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: /Edit Profile/i }).click();
  await bioField.fill(restoredBio);
  await page.getByRole("button", { name: /Save Profile/i }).click();
  await expect(page.getByText(restoredBioPreview, { exact: false })).toBeVisible({ timeout: 15_000 });
}

async function acceptMentorshipRequest(page: Page, requestTitle: string) {
  await page.goto("/dashboard/mentor/requests");
  await expect(page.getByRole("heading", { name: /Mentorship Requests/i })).toBeVisible();

  const requestTitleNode = page.getByText(requestTitle).first();
  const requestCard = requestTitleNode.locator('xpath=ancestor::div[contains(@class,"rounded-2xl")][1]');
  await expect(requestCard).toBeVisible({ timeout: 15_000 });
  await requestCard.getByRole("button", { name: /^Accept$/ }).click();
  await expect(requestCard.getByText(/Accepted/i)).toBeVisible({ timeout: 15_000 });
}

async function exerciseMentorMentorshipSpace(page: Page, requestTitle: string, runId: string) {
  await page.goto("/dashboard/mentor/mentorships");
  await expect(page.getByText(/Live chat and booking for active mentorships/i)).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/Loading mentorship spaces/i)).toHaveCount(0, { timeout: 30_000 });
  const accessToken = await getBrowserAccessToken(page);
  expect(accessToken).toBeTruthy();

  const requestButton = page.getByRole("button").filter({ hasText: requestTitle }).first();
  if (await requestButton.count()) {
    await requestButton.click();
  }

  await page.locator('input[type="datetime-local"]').first().fill(buildFutureDateTimeLocal(6, 10));
  await page.getByRole("button", { name: /Send availability/i }).click();
  await page.waitForFunction(
    async ({ title, token }) => {
      const response = await fetch("/api/mentorships", {
        cache: "no-store",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) return false;

      const payload = await response.json();
      if (!Array.isArray(payload)) return false;

      const channel = payload.find((item) => item?.title === title);
      return Boolean(Array.isArray(channel?.booking?.slots) && channel.booking.slots.length > 0);
    },
    { title: requestTitle, token: accessToken },
    { timeout: 30_000 }
  );
  await expect(page.getByText(/Proposed by mentor/i).first()).toBeVisible({ timeout: 20_000 });

  const mentorMessage = `Mentor walkthrough message ${runId}`;
  await page.getByPlaceholder(/Send a progress update, ask a question/i).fill(mentorMessage);
  await page.getByRole("button", { name: /^Send$/ }).click();
  await expect(page.getByText(mentorMessage)).toBeVisible({ timeout: 20_000 });
}

async function getBrowserAccessToken(page: Page) {
  return page.evaluate(() => {
    const parseSessionValue = (raw: string | null) => {
      if (!raw) return null;

      const collectCandidateObjects = (value: unknown): Record<string, unknown>[] => {
        if (!value) return [];

        if (Array.isArray(value)) {
          return value.flatMap((entry) => collectCandidateObjects(entry));
        }

        if (typeof value === "object") {
          return [value as Record<string, unknown>];
        }

        if (typeof value === "string") {
          try {
            return collectCandidateObjects(JSON.parse(value));
          } catch {
            return [];
          }
        }

        return [];
      };

      try {
        const parsed = JSON.parse(raw);
        const candidates = collectCandidateObjects(parsed);

        for (const candidate of candidates) {
          const accessToken = candidate.access_token;
          if (typeof accessToken === "string" && accessToken.trim()) {
            return accessToken;
          }

          const nestedSession = candidate.currentSession;
          if (nestedSession && typeof nestedSession === "object") {
            const nestedToken = (nestedSession as Record<string, unknown>).access_token;
            if (typeof nestedToken === "string" && nestedToken.trim()) {
              return nestedToken;
            }
          }
        }
      } catch {
        return null;
      }

      return null;
    };

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key || !key.startsWith("sb-") || !key.includes("auth-token")) {
        continue;
      }

      const token = parseSessionValue(localStorage.getItem(key));
      if (token) {
        return token;
      }
    }

    return null;
  });
}

async function getMentorshipChannelSnapshot(page: Page, requestTitle: string, accessToken: string) {
  return page.evaluate(async ({ title, token }) => {
    const response = await fetch("/api/mentorships", {
      cache: "no-store",
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) return null;

    const payload = await response.json();
    if (!Array.isArray(payload)) return null;

    const channel = payload.find((item) => item?.title === title);
    if (!channel) return null;

    const slots = Array.isArray(channel?.booking?.slots) ? channel.booking.slots : [];
    return {
      requestId: typeof channel.requestId === "string" ? channel.requestId : "",
      slotIds: slots
        .map((slot: { id?: unknown }) => (typeof slot?.id === "string" ? slot.id : ""))
        .filter(Boolean),
      confirmedSlotId:
        typeof channel?.booking?.confirmedSlotId === "string" ? channel.booking.confirmedSlotId : null,
    };
  }, { title: requestTitle, token: accessToken });
}

async function confirmMentorshipSlotInBrowser(
  page: Page,
  requestId: string,
  slotId: string,
  accessToken: string
) {
  return page.evaluate(
    async ({ nextRequestId, nextSlotId, token }) => {
      const response = await fetch(`/api/mentorships/${nextRequestId}/booking`, {
        method: "PATCH",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          action: "confirm",
          slotId: nextSlotId,
        }),
      });

      return {
        ok: response.ok,
        payload: await response.json().catch(() => null),
      };
    },
    { nextRequestId: requestId, nextSlotId: slotId, token: accessToken }
  );
}

async function createMentorshipMessageInBrowser(
  page: Page,
  requestId: string,
  content: string,
  accessToken: string
) {
  return page.evaluate(
    async ({ nextRequestId, nextContent, token }) => {
      const response = await fetch(`/api/mentorships/${nextRequestId}/messages`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          content: nextContent,
        }),
      });

      return {
        ok: response.ok,
        payload: await response.json().catch(() => null),
      };
    },
    { nextRequestId: requestId, nextContent: content, token: accessToken }
  );
}

async function exerciseStudentMentorshipSpace(page: Page, requestTitle: string, runId: string) {
  await page.goto("/dashboard/student/mentorships");
  await expect(page.getByText(/Live chat and booking for active mentorships/i)).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/Loading mentorship spaces/i)).toHaveCount(0, { timeout: 30_000 });
  const accessToken = await getBrowserAccessToken(page);
  expect(accessToken).toBeTruthy();
  await page.waitForFunction(
    async ({ title, token }) => {
      const response = await fetch("/api/mentorships", {
        cache: "no-store",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) return false;

      const payload = await response.json();
      return Array.isArray(payload)
        ? payload.some(
            (channel) =>
              channel?.title === title &&
              Array.isArray(channel?.booking?.slots) &&
              channel.booking.slots.length > 0
          )
        : false;
    },
    { title: requestTitle, token: accessToken },
    { timeout: 60_000 }
  );
  await page.reload();
  await expect(page.getByText(/Loading mentorship spaces/i)).toHaveCount(0, { timeout: 30_000 });

  const emptyState = page.getByText(/No accepted mentorship requests yet/i);
  const hasEmptyState = await emptyState.isVisible().catch(() => false);
  if (hasEmptyState) {
    await page.reload();
    await expect(page.getByText(/Loading mentorship spaces/i)).toHaveCount(0, { timeout: 30_000 });
  }

  const requestButton = page.getByRole("button").filter({ hasText: requestTitle }).first();
  if (await requestButton.count()) {
    await requestButton.click();
  }

  const channel = await getMentorshipChannelSnapshot(page, requestTitle, accessToken!);
  expect(channel).not.toBeNull();
  expect(channel?.requestId).toBeTruthy();
  expect(channel?.slotIds.length).toBeGreaterThan(0);

  const confirmResult = await confirmMentorshipSlotInBrowser(
    page,
    channel!.requestId,
    channel!.slotIds[0] as string,
    accessToken!
  );
  expect(confirmResult.ok).toBeTruthy();

  await page.waitForFunction(
    async ({ title, token }) => {
      const response = await fetch("/api/mentorships", {
        cache: "no-store",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) return false;

      const payload = await response.json();
      if (!Array.isArray(payload)) return false;

      const channel = payload.find((item) => item?.title === title);
      return Boolean(channel?.booking?.confirmedSlotId);
    },
    { title: requestTitle, token: accessToken },
    { timeout: 30_000 }
  );
  await page.reload();
  await expect(page.getByText(/Loading mentorship spaces/i)).toHaveCount(0, { timeout: 30_000 });
  await expect(page.getByText(requestTitle).first()).toBeVisible({ timeout: 20_000 });

  const studentMessage = `Student walkthrough message ${runId}`;
  const messageResult = await createMentorshipMessageInBrowser(
    page,
    channel!.requestId,
    studentMessage,
    accessToken!
  );
  expect(messageResult.ok).toBeTruthy();
  await page.waitForFunction(
    async ({ title, content, token }) => {
      const mentorshipsResponse = await fetch("/api/mentorships", {
        cache: "no-store",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      if (!mentorshipsResponse.ok) return false;

      const mentorships = await mentorshipsResponse.json();
      if (!Array.isArray(mentorships)) return false;

      const channel = mentorships.find((item) => item?.title === title);
      if (!channel?.requestId) return false;

      const messagesResponse = await fetch(`/api/mentorships/${channel.requestId}/messages`, {
        cache: "no-store",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      if (!messagesResponse.ok) return false;

      const messages = await messagesResponse.json();
      return Array.isArray(messages)
        ? messages.some((message) => message?.content === content)
        : false;
    },
    { title: requestTitle, content: studentMessage, token: accessToken },
    { timeout: 30_000 }
  );
}

async function verifyMentorNotifications(page: Page, requestTitle: string) {
  await page.goto("/notifications");
  await expect(page.getByRole("heading", { name: /Your notification center/i })).toBeVisible();
  await expect(page.getByText(requestTitle)).toBeVisible({ timeout: 15_000 });
}

async function exerciseMentorBlogCrud(page: Page, runId: string) {
  const blogTitle = `Playwright Mentor Blog ${runId}`;
  const updatedBlogTitle = `${blogTitle} Updated`;

  await page.goto("/dashboard/mentor/blog");
  await page.waitForURL(/\/dashboard\/mentor\/blog$/, { timeout: 20_000 });
  await expect(page.getByRole("heading", { name: /Blog/i })).toBeVisible();
  await page.waitForLoadState("networkidle");

  await page.getByRole("button", { name: /Create Blog/i }).click();
  await expect(page.getByText(/New Blog Post/i)).toBeVisible({ timeout: 15_000 });

  const imageUploadInput = page.locator('input[type="file"][title="Upload image"]').first();
  await expect(imageUploadInput).toBeVisible({ timeout: 15_000 });
  await imageUploadInput.setInputFiles({
    name: `mentor-blog-${runId}.png`,
    mimeType: "image/png",
    buffer: TINY_PNG,
  });
  await expect(page.getByAltText(/preview/i)).toBeVisible({ timeout: 20_000 });

  await page.getByPlaceholder(/How to Conduct Effective/i).fill(blogTitle);
  await page
    .getByPlaceholder(/Write your blog content here/i)
    .fill(`This mentor blog entry was created by the Playwright human walkthrough to validate create, edit, and delete behavior for ${runId}.`);
  await page.getByRole("button", { name: /Publish Blog/i }).click();

  await expect(page.getByText(blogTitle).first()).toBeVisible({ timeout: 15_000 });

  const createdCard = page.locator(".group").filter({ hasText: blogTitle }).first();
  await createdCard.getByLabel(/Edit blog/i).click();
  await page.getByPlaceholder(/How to Conduct Effective/i).fill(updatedBlogTitle);
  await page.getByRole("button", { name: /Save Changes/i }).click();
  await expect(page.getByText(updatedBlogTitle).first()).toBeVisible({ timeout: 15_000 });

  const updatedCard = page.locator(".group").filter({ hasText: updatedBlogTitle }).first();
  await updatedCard.getByLabel(/Delete blog/i).click();
  await expect(page.getByText(updatedBlogTitle)).toHaveCount(0);
}

async function verifyAnalyticsPage(page: Page) {
  await page.goto("/dashboard/analytics");
  await expect(page.getByText(/Analytics Component/i)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/Total Projects/i)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/Open Requests/i)).toBeVisible({ timeout: 15_000 });
}

async function submitMentorApplication(page: Page, candidate: TempUser, runId: string) {
  await login(page, candidate);

  await page.goto("/profile");
  await expect(page.getByRole("heading", { name: /Profile/i })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/Mentor Application/i).first()).toBeVisible({ timeout: 15_000 });

  await page.getByPlaceholder(/AI, Product Strategy, Supabase, UX Research/i).fill("Playwright QA, Architecture Reviews, Supabase");
  await page
    .getByPlaceholder(/Summarize your strengths, the type of students you can guide/i)
    .fill(`I want to mentor students through a repeatable delivery process and validate the admin approval flow for ${runId}.`);
  await page.getByPlaceholder(/https:\/\/github.com\/your-profile/i).fill(`https://example.com/${runId}`);
  await page.getByRole("button", { name: /Apply for mentor review/i }).click();

  await expect(page.getByText(/Pending review/i)).toBeVisible({ timeout: 20_000 });
}

async function approveMentorApplication(page: Page, adminUser: TempUser, candidate: TempUser, requestTitle: string) {
  await login(page, adminUser);

  await page.goto("/dashboard/admin");
  await expect(page.getByRole("heading", { name: /Admin Portal/i })).toBeVisible({ timeout: 20_000 });

  const applicationCard = page.locator("article").filter({ hasText: candidate.fullName }).first();
  await expect(applicationCard).toBeVisible({ timeout: 20_000 });
  await applicationCard.getByRole("button", { name: /^Approve$/ }).click();
  await expect(applicationCard.getByText(/Approved/i)).toBeVisible({ timeout: 20_000 });

  await expect(page.getByText(requestTitle).first()).toBeVisible({ timeout: 20_000 });
}

async function verifyCandidateMentorAccess(page: Page, candidate: TempUser) {
  await page.goto("/profile");
  await expect(page.getByText(/Role: Mentor/i)).toBeVisible({ timeout: 20_000 });

  await page.goto("/dashboard/mentor");
  await expect(page).toHaveURL(/\/dashboard\/mentor$/, { timeout: 20_000 });
  await expect(page.getByText(candidate.fullName).first()).toBeVisible({ timeout: 20_000 });
}

test.describe.configure({ mode: "serial" });

test("human browser walkthrough covers auth, APIs, CRUD, uploads, admin, mentorships, recommendations, and analytics", async ({
  browser,
  request,
}, testInfo) => {
  test.setTimeout(720_000);

  const runId = `${Date.now()}`;
  const postTitle = `Playwright Human Post ${runId}`;
  const requestTitle = `Playwright Mentorship Request ${runId}`;
  const uniqueTag = `pw-${runId}`;

  const mentor = await findDemoMentor(request);
  expect(mentor, "Expected a demo mentor to be present in the public mentors directory.").not.toBeNull();

  const [adminUser, candidateUser] = await Promise.all([
    createTempUser({ role: "admin", fullNamePrefix: "Playwright Admin", expectedPath: "/dashboard/admin" }),
    createTempUser({ role: "student", fullNamePrefix: "Playwright Candidate", expectedPath: "/dashboard/student" }),
  ]);

  const studentContext = await browser.newContext();
  const mentorContext = await browser.newContext();
  const adminContext = await browser.newContext();
  const candidateContext = await browser.newContext();
  const studentPage = await studentContext.newPage();
  const mentorPage = await mentorContext.newPage();
  const adminPage = await adminContext.newPage();
  const candidatePage = await candidateContext.newPage();

  try {
    await test.step("public APIs respond successfully", async () => {
      await assertCorePublicApis(request);
    });

    await test.step("student flow covers profile, refinement, uploads, search, recommendations, thread CRUD, requests, tracking, and analytics", async () => {
      await login(studentPage, STUDENT);
      await captureCheckpoint(studentPage, testInfo, "student_dashboard");

      await updateStudentProfileAndRestore(studentPage, runId);
      await createStudentPostAndVerifySearch(studentPage, postTitle, uniqueTag, runId);
      await captureCheckpoint(studentPage, testInfo, "student_search_saved_post");

      await verifyRecommendationHub(studentPage, postTitle);
      await captureCheckpoint(studentPage, testInfo, "student_recommendation_hub");

      await login(studentPage, STUDENT);
      await exerciseThreadCrud(studentPage, runId);
      await createMentorshipRequest(studentPage, mentor!.id, mentor!.fullName, requestTitle);
      await verifyStudentRequestHistory(studentPage, requestTitle, "Pending");
      await login(studentPage, STUDENT);
      await updateStudentProjectProgress(studentPage, runId);
      await verifyAnalyticsPage(studentPage);
    });

    await test.step("temporary candidate submits a mentor application for the admin workflow", async () => {
      await submitMentorApplication(candidatePage, candidateUser, runId);
      await captureCheckpoint(candidatePage, testInfo, "candidate_mentor_application_pending");
    });

    await test.step("mentor flow covers profile, request handling, mentorship space, notifications, blog uploads, CRUD, and analytics", async () => {
      await login(mentorPage, MENTOR);
      await updateMentorProfileAndRestore(mentorPage, runId);
      await acceptMentorshipRequest(mentorPage, requestTitle);
      await exerciseMentorMentorshipSpace(mentorPage, requestTitle, runId);
      await captureCheckpoint(mentorPage, testInfo, "mentor_mentorship_space");

      await verifyMentorNotifications(mentorPage, requestTitle);
      await exerciseMentorBlogCrud(mentorPage, runId);
      await verifyAnalyticsPage(mentorPage);
    });

    await test.step("student sees accepted request and can confirm booking in the shared mentorship space", async () => {
      await login(studentPage, STUDENT);
      await verifyStudentRequestHistory(studentPage, requestTitle, "Accepted");
      await exerciseStudentMentorshipSpace(studentPage, requestTitle, runId);
      await captureCheckpoint(studentPage, testInfo, "student_confirmed_mentorship_space");
    });

    await test.step("admin approves the mentor application and can see platform moderation data", async () => {
      await approveMentorApplication(adminPage, adminUser, candidateUser, requestTitle);
      await captureCheckpoint(adminPage, testInfo, "admin_portal_approved_application");
    });

    await test.step("candidate receives mentor access after admin approval", async () => {
      await candidatePage.reload();
      await verifyCandidateMentorAccess(candidatePage, candidateUser);
      await captureCheckpoint(candidatePage, testInfo, "candidate_promoted_to_mentor");
    });
  } finally {
    await Promise.allSettled([
      studentContext.close(),
      mentorContext.close(),
      adminContext.close(),
      candidateContext.close(),
    ]);
    await deleteTempUsers([adminUser.id, candidateUser.id]);
  }
});
