import { test, expect } from "@playwright/test";

// ── Test 1: /en/ and /es/ both render an h1 ──────────────────────────────────
test("/en/ renders h1", async ({ page }) => {
  await page.goto("/en/");
  await expect(page.locator("h1")).toBeVisible();
});

test("/es/ renders h1", async ({ page }) => {
  await page.goto("/es/");
  await expect(page.locator("h1")).toBeVisible();
});

// ── Test 2: Root redirect honours Accept-Language ────────────────────────────
// Use Playwright's locale option — it sets the browser's Accept-Language header.
// next-intl middleware reads that header and redirects / → /es/.
test("/ with Accept-Language: es redirects to /es/", async ({ browser }) => {
  const context = await browser.newContext({
    locale: "es-MX",
  });
  const page = await context.newPage();
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(page.url()).toContain("/es");
  await context.close();
});

// ── Test 3: Case modal — open, focus, Escape, trigger-focus-restore ──────────
test("case modal opens, traps focus, closes on Escape, restores trigger focus", async ({
  page,
}) => {
  await page.goto("/en/");

  // Click the first case row
  const firstRow = page.locator("button.ab-index-row").first();
  await firstRow.click();

  // Modal should become visible
  const modal = page.locator(".ab-case-modal.open");
  await expect(modal).toBeVisible();

  // Close button should receive focus (app sets it after 50 ms — auto-retry covers this)
  const closeBtn = page.locator("button.ab-case-close");
  await expect(closeBtn).toBeFocused();

  // Press Escape to close
  await page.keyboard.press("Escape");

  // Modal should disappear
  await expect(page.locator(".ab-case-modal.open")).toHaveCount(0);

  // Focus should return to the trigger row that was clicked
  await expect(firstRow).toBeFocused();
});

// ── Test 4: Theme toggle flips data-theme and persists to localStorage ───────
test("theme toggle flips data-theme and persists to localStorage", async ({
  page,
}) => {
  await page.goto("/en/");

  const root = page.locator(".ab-root");
  const initialTheme = await root.getAttribute("data-theme");

  // The aria-label value comes from messages/en.json home.theme.toggleAria
  const toggleBtn = page.getByRole("button", { name: "Toggle theme" });
  await toggleBtn.click();

  const flippedTheme = initialTheme === "light" ? "dark" : "light";
  await expect(root).toHaveAttribute("data-theme", flippedTheme);

  const stored = await page.evaluate(() => localStorage.getItem("ab_theme"));
  expect(stored).toBe(flippedTheme);
});

// ── Test 5: /es/ shows all six cases ─────────────────────────────────────────
// Bump this count when a 7th case ships.
test("/es/ shows all six cases", async ({ page }) => {
  await page.goto("/es/");
  await expect(page.locator("button.ab-index-row")).toHaveCount(6);
});
