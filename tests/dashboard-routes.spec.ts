import { expect, test } from "@playwright/test";

test("dashboard index lists the available workspaces", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page.getByRole("heading", { name: /Open the right workspace for your role/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Student Dashboard/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Mentor Dashboard/i })).toBeVisible();
});

test("protected student dashboard redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/dashboard/student");

  await expect(page).toHaveURL(/\/login$/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: /Welcome back/i })).toBeVisible({ timeout: 15_000 });
});
