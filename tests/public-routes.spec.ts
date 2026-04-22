import { test, expect } from "@playwright/test";

test("home page exposes primary navigation", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "IdeaBridge" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Explore Ideas/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Find Mentors/i }).first()).toBeVisible();
});

test("search page renders discovery shell", async ({ page }) => {
  await page.goto("/search");

  await expect(page.getByRole("heading", { name: /Explore ideas, projects, and requests/i })).toBeVisible();
  await expect(page.getByPlaceholder(/Search by title, description, author, or tech stack/i)).toBeVisible();
});

test("auth entry routes render core forms", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible();
  await expect(page.getByLabel(/Email address/i)).toBeVisible();

  await page.goto("/register");
  await expect(page.getByRole("heading", { name: /Create your account/i })).toBeVisible();
  await expect(page.getByPlaceholder(/Your full name/i)).toBeVisible();
});
