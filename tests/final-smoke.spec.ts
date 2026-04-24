import { expect, test } from "@playwright/test";

test("home page exposes the full integrated module surface", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Connect with Mentors/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Get Started/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Explore Ideas/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Find Mentors/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Notifications/i }).first()).toBeVisible();
});

test("ideas explore page renders the project and thread shell", async ({ page }) => {
  await page.goto("/ideas/explore");

  await expect(page.getByRole("heading", { name: /Explore ideas, open projects, and guidance threads/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Explore Projects/i })).toBeVisible();
  await expect(page.getByPlaceholder(/Search title, description, author, type/i)).toBeVisible();
});

test("mentors directory renders filters and mentor discovery controls", async ({ page }) => {
  await page.goto("/mentors");

  await expect(page.getByRole("heading", { name: /Find mentors by skills and availability/i })).toBeVisible();
  await expect(page.getByText(/Filter mentor matches/i)).toBeVisible();
  await expect(page.getByLabel(/Search/i)).toBeVisible();
});

test("notifications route redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/notifications");

  await expect(page).toHaveURL(/\/login$/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible({ timeout: 15_000 });
});

test("profile route redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/profile");

  await expect(page).toHaveURL(/\/login$/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible({ timeout: 15_000 });
});

test("recommendations route redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/dashboard/student/recommendations");

  await expect(page).toHaveURL(/\/login$/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible({ timeout: 15_000 });
});

test("core public APIs respond successfully", async ({ request }) => {
  const health = await request.get("/api/health/db");
  expect(health.status()).toBe(200);

  const posts = await request.get("/api/posts?limit=5");
  expect(posts.status()).toBe(200);

  const mentors = await request.get("/api/mentors/search?limit=5");
  expect(mentors.status()).toBe(200);

  const blog = await request.get("/api/blog");
  expect(blog.status()).toBe(200);
});
