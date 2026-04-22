import { expect, test, type APIRequestContext, type Browser, type Page } from "@playwright/test";

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

type MentorSearchResult = {
  id: string;
  fullName: string;
  profile?: {
    bio?: string;
  };
};

async function login(page: Page, credentials: typeof STUDENT | typeof MENTOR) {
  await page.goto("/login");
  await page.fill("#login-email", credentials.email);
  await page.fill("#login-password", credentials.password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(new RegExp(credentials.expectedPath), { timeout: 20_000 });
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
  await expect(page.getByText(/My Profile/i).first()).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: /edit profile/i }).click();
  const bioField = page.getByPlaceholder(/Tell mentors about yourself/i);
  const originalBio = await bioField.inputValue();
  const updatedBio = `Playwright student profile QA ${runId}. I am validating the editable student bio flow end to end.`;
  const restoredBioPreview = (originalBio || updatedBio).slice(0, 40);

  await bioField.fill(updatedBio);
  await page.getByRole("button", { name: /save profile/i }).click();
  await expect(page.getByText(updatedBio)).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: /edit profile/i }).click();
  await bioField.fill(originalBio);
  await page.getByRole("button", { name: /save profile/i }).click();
  await expect(page.getByText(restoredBioPreview, { exact: false })).toBeVisible({ timeout: 15_000 });
}

async function createStudentPostAndVerifySearch(page: Page, postTitle: string, uniqueTag: string) {
  await page.goto("/ideas/explore");
  await expect(page.getByRole("heading", { name: /Explore ideas, open projects, and guidance threads/i })).toBeVisible();

  await page.getByPlaceholder(/Next\.js App Router Monorepo/i).fill(postTitle);
  await page
    .getByPlaceholder(/# My Awesome Project/i)
    .fill(`## Playwright QA Post\nThis post was created by the automated browser walkthrough for ${postTitle}.`);
  await page.getByPlaceholder(/Comma separated/i).fill(`${uniqueTag}, nextjs, playwright`);
  await page.getByRole("button", { name: /Publish Post/i }).click();

  await expect(page.getByText(postTitle).first()).toBeVisible({ timeout: 15_000 });

  const inPageSearch = page.getByPlaceholder(/Search title, description, author, type/i);
  await inPageSearch.fill(postTitle);
  await expect(page.getByText(postTitle).first()).toBeVisible({ timeout: 15_000 });

  await page.goto("/search");
  await expect(page.getByRole("heading", { name: /Explore ideas, projects, and requests/i })).toBeVisible();
  await page.getByPlaceholder(/Search by title, description, author, or tech stack/i).fill(postTitle);
  await expect(page.getByText(postTitle).first()).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: /^Filters/i }).click();
  await page.getByRole("button", { name: uniqueTag }).click();
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

  const createdReply = page
    .getByText(replyText, { exact: true })
    .first()
    .locator('xpath=ancestor::*[contains(@class,"group")][1]');
  await createdReply.hover();
  await createdReply.getByLabel(/Open comment actions/i).first().click({ force: true });
  await createdReply.getByRole("button", { name: /^Edit$/ }).click();
  await createdReply.getByLabel(/Edit comment text/i).fill(editedReplyText);
  await createdReply.getByRole("button", { name: /^Save$/ }).click();
  await expect(page.getByText(editedReplyText)).toBeVisible({ timeout: 15_000 });

  await createdReply.hover();
  await createdReply.getByLabel(/Open comment actions/i).first().click({ force: true });
  await createdReply.getByRole("button", { name: /^Delete$/ }).click();
  await createdReply.getByRole("button", { name: /^Delete$/ }).click();
  await expect(page.getByText(editedReplyText)).toHaveCount(0);
}

async function createMentorshipRequest(page: Page, mentorName: string, requestTitle: string) {
  await page.goto("/mentors");
  await expect(page.getByRole("heading", { name: /Find mentors by skills and availability/i })).toBeVisible();

  await page.getByLabel(/^Search$/).fill(mentorName);
  await expect(page.getByText(mentorName).first()).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: /Check Availability/i }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: /^Done$/ }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByRole("link", { name: /View Profile/i }).first().click();
  await expect(page).toHaveURL(/\/mentors\//, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: mentorName })).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: /Request Mentorship/i }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible({ timeout: 15_000 });
  await dialog.getByLabel(/Project Title/i).fill(requestTitle);
  await dialog.getByLabel(/^Goals$/).fill("Validate the guided mentorship request flow and confirm the mentor can process the request.");
  await dialog.getByLabel(/Preferred Start Date/i).fill("2026-04-23");
  await dialog.getByLabel(/^Message$/).fill("This request was submitted through the live browser QA walkthrough.");
  await dialog.getByRole("button", { name: /Submit Request/i }).click();
  await expect(dialog).toHaveCount(0);
}

async function verifyStudentRequestHistory(page: Page, requestTitle: string, expectedStatus: "Pending" | "Accepted") {
  await page.goto("/dashboard/student/requests");
  await expect(page.getByRole("heading", { name: /Mentorship Requests/i })).toBeVisible();

  const requestCard = page.locator("article").filter({ hasText: requestTitle }).first();
  await expect(requestCard).toBeVisible({ timeout: 15_000 });
  await expect(requestCard.getByText(expectedStatus)).toBeVisible({ timeout: 15_000 });
}

async function updateStudentProjectProgress(page: Page, runId: string) {
  const projectNote = `Playwright milestone update ${runId}: checked progress update modal, status, and notes persistence.`;

  await page.goto("/dashboard/student/projects");
  await expect(page.getByRole("heading", { name: /My Projects/i })).toBeVisible();

  await page.getByRole("button", { name: /Update Progress/i }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: /Quick fill/i }).click();
  await page.getByLabel(/Milestone notes/i).fill(projectNote);
  await page.getByRole("button", { name: /Save Update/i }).click();

  await expect(page.getByText(projectNote)).toBeVisible({ timeout: 15_000 });
}

async function updateMentorProfileAndRestore(page: Page, runId: string) {
  await page.goto("/dashboard/mentor/profile");
  await expect(page).toHaveURL(/\/dashboard\/mentor\/profile$/, { timeout: 15_000 });
  await expect(page.getByText(/My Profile/i).first()).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: /Edit Profile/i }).click();
  const bioField = page.getByPlaceholder(/Describe your expertise, teaching style/i);
  const originalBio = await bioField.inputValue();
  const updatedBio = `Playwright mentor profile QA ${runId}. This temporary bio confirms mentor profile edits save correctly.`;
  const restoredBioPreview = (originalBio || updatedBio).slice(0, 40);

  await bioField.fill(updatedBio);
  await page.getByRole("button", { name: /Save Profile/i }).click();
  await expect(page.getByText(updatedBio)).toBeVisible({ timeout: 15_000 });

  await page.getByRole("button", { name: /Edit Profile/i }).click();
  await bioField.fill(originalBio);
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

async function verifyMentorNotifications(page: Page, requestTitle: string) {
  await page.goto("/notifications");
  await expect(page.getByRole("heading", { name: /Your notification center/i })).toBeVisible();
  await expect(page.getByText(requestTitle)).toBeVisible({ timeout: 15_000 });
}

async function exerciseMentorBlogCrud(page: Page, runId: string) {
  const blogTitle = `Playwright Mentor Blog ${runId}`;
  const updatedBlogTitle = `${blogTitle} Updated`;

  await page.goto("/dashboard/mentor/blog");
  await expect(page.getByRole("heading", { name: /Blog/i })).toBeVisible();

  await page.getByRole("button", { name: /Create Blog/i }).click();
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

test.describe.configure({ mode: "serial" });

test("human browser walkthrough covers live auth, CRUD, requests, notifications, and analytics", async ({ browser, request }) => {
  test.setTimeout(360_000);

  const runId = `${Date.now()}`;
  const postTitle = `Playwright Human Post ${runId}`;
  const requestTitle = `Playwright Mentorship Request ${runId}`;
  const uniqueTag = `pw-${runId}`;

  const mentor = await findDemoMentor(request);
  expect(mentor, "Expected a demo mentor to be present in the public mentors directory.").not.toBeNull();

  const studentContext = await browser.newContext();
  const mentorContext = await browser.newContext();
  const studentPage = await studentContext.newPage();
  const mentorPage = await mentorContext.newPage();

  try {
    await test.step("student login, profile update, idea creation, thread CRUD, request creation, and project update", async () => {
      await login(studentPage, STUDENT);
      await updateStudentProfileAndRestore(studentPage, runId);
      await createStudentPostAndVerifySearch(studentPage, postTitle, uniqueTag);
      await exerciseThreadCrud(studentPage, runId);
      await createMentorshipRequest(studentPage, mentor!.fullName, requestTitle);
      await verifyStudentRequestHistory(studentPage, requestTitle, "Pending");
      await updateStudentProjectProgress(studentPage, runId);
      await verifyAnalyticsPage(studentPage);
    });

    await test.step("mentor login, profile update, request handling, notifications, and blog CRUD", async () => {
      await login(mentorPage, MENTOR);
      await updateMentorProfileAndRestore(mentorPage, runId);
      await acceptMentorshipRequest(mentorPage, requestTitle);
      await verifyMentorNotifications(mentorPage, requestTitle);
      await exerciseMentorBlogCrud(mentorPage, runId);
      await verifyAnalyticsPage(mentorPage);
    });

    await test.step("student sees accepted request after mentor action", async () => {
      await verifyStudentRequestHistory(studentPage, requestTitle, "Accepted");
    });
  } finally {
    await studentContext.close();
    await mentorContext.close();
  }
});
