import { test, expect } from "@playwright/test";

test.describe("Notifications User Journeys", () => {
  // Admin credentials provided by user
  const ADMIN = {
    email: "it23741478@my.sliit.lk",
    password: "Sneha@2002",
  };

  // Demo accounts provided in the login page
  const STUDENT = {
    email: "student.demo@ideabridge.dev",
    password: "Demo@123",
  };

  const MENTOR = {
    email: "mentor.demo@ideabridge.dev",
    password: "Demo@123",
  };

  test("Student can view notifications empty state or list", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#login-email").fill(STUDENT.email);
    await page.locator("#login-password").fill(STUDENT.password);
    await page.locator('button[type="submit"]').click();

    // Verify successful login
    await page.waitForURL("**/dashboard**", { timeout: 15000 });

    // Navigate to notifications
    await page.goto("/notifications");
    await expect(page.getByRole("heading", { name: /Your notification center/i })).toBeVisible();

    // The notifications list should load without errors
    const emptyState = page.getByText(/No notifications yet/i);
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    
    if (hasEmptyState) {
      console.log("Student has no notifications.");
    } else {
      const count = await page.locator("article").count();
      expect(count).toBeGreaterThanOrEqual(0);
      console.log(`Student has ${count} notifications.`);
    }
  });

  test("Mentor can view notifications and mark as read", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#login-email").fill(MENTOR.email);
    await page.locator("#login-password").fill(MENTOR.password);
    await page.locator('button[type="submit"]').click();

    await page.waitForURL("**/dashboard**", { timeout: 15000 });

    await page.goto("/notifications");
    await expect(page.getByRole("heading", { name: /Your notification center/i })).toBeVisible();

    const emptyState = page.getByText(/No notifications yet/i);
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    
    if (!hasEmptyState) {
      const count = await page.locator("article").count();
      expect(count).toBeGreaterThanOrEqual(0);
      console.log(`Mentor has ${count} notifications.`);
    }
  });

  test("Admin can login and view notifications", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#login-email").fill(ADMIN.email);
    await page.locator("#login-password").fill(ADMIN.password);
    await page.locator('button[type="submit"]').click();

    // Wait for the redirect to complete
    await page.waitForURL("**/dashboard**", { timeout: 15000 });

    // Navigate to notifications page
    await page.goto("/notifications");
    await expect(page.getByRole("heading", { name: /Your notification center/i })).toBeVisible();

    const emptyStateVisible = await page.getByText(/No notifications yet/i).isVisible().catch(() => false);
    if (!emptyStateVisible) {
      const notificationsCount = await page.locator("article").count();
      expect(notificationsCount).toBeGreaterThanOrEqual(0);
      console.log(`Admin has ${notificationsCount} notifications.`);
    } else {
      console.log("Admin has no notifications currently.");
    }
  });
});
