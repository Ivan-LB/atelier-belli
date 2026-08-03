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

  // Focus must STAY inside the dialog. This used to be only implied by the test
  // name while nothing pressed Tab — and it was false: focus escaped on the
  // third press and the page behind stayed tabbable.
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    const insideModal = await page.evaluate(
      () => !!document.activeElement?.closest(".ab-case-modal"),
    );
    expect(insideModal, `focus left the modal on Tab #${i + 1}`).toBe(true);
  }

  // The page behind the backdrop must be inert while the dialog is open,
  // otherwise aria-modal="true" is a lie to screen readers.
  await expect(page.locator("main#main-content")).toHaveAttribute("inert", "");
  await expect(page.locator("header.ab-nav")).toHaveAttribute("inert", "");

  // Press Escape to close
  await page.keyboard.press("Escape");

  // Modal should disappear
  await expect(page.locator(".ab-case-modal.open")).toHaveCount(0);

  // Focus should return to the trigger row that was clicked
  await expect(firstRow).toBeFocused();

  // ...and the background must be interactive again
  await expect(page.locator("main#main-content")).not.toHaveAttribute("inert", "");
});

test("deep-linked modal restores focus to its Selected Work row on close", async ({
  page,
}) => {
  // The click path seeds lastFocusRef; a ?case= deep link does not, so closing
  // used to strand focus on the hidden close button inside aria-hidden="true".
  await page.goto("/en?case=alisio");
  await expect(page.locator(".ab-case-modal.open")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".ab-case-modal.open")).toHaveCount(0);
  await expect(page.locator('button.ab-index-row[data-case="alisio"]')).toBeFocused();
});

test("closed case modal is not reachable by keyboard", async ({ page }) => {
  await page.goto("/en/");
  // `opacity: 0` alone left the close button in the tab order as the last stop
  // on every homepage load.
  await expect(page.locator(".ab-case-modal")).toHaveCSS("visibility", "hidden");
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    const onClose = await page.evaluate(
      () => !!document.activeElement?.classList.contains("ab-case-close"),
    );
    expect(onClose, `reached the closed modal's close button on Tab #${i + 1}`).toBe(
      false,
    );
  }
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

// ── Test 5: /es/ shows all nine cases ────────────────────────────────────────
// Bump this count when a 10th case ships (also update CASE_KEYS in page.tsx).
test("/es/ shows all nine cases", async ({ page }) => {
  await page.goto("/es/");
  await expect(page.locator("button.ab-index-row")).toHaveCount(9);
});

// ── Test 6: deep link opens the right case ────────────────────────────────────
test("?case=blip deep link opens the BLIP modal; Escape clears the param", async ({
  page,
}) => {
  await page.goto("/en/?case=blip");

  // Modal should be visible and contain the case title
  const modal = page.locator(".ab-case-modal.open");
  await expect(modal).toBeVisible();
  await expect(modal).toContainText("BLIP");

  // Escape closes the modal and removes the param
  await page.keyboard.press("Escape");
  await expect(page.locator(".ab-case-modal.open")).toHaveCount(0);
  expect(page.url()).not.toContain("case=");
});

// ── Test 7: opening a case writes the ?case= param ───────────────────────────
test("clicking a case row adds ?case=alisio to the URL", async ({ page }) => {
  await page.goto("/en/");

  const firstRow = page.locator("button.ab-index-row").first();
  await firstRow.click();

  // URL should now contain ?case=alisio (alisio is the first case)
  await expect(page).toHaveURL(/[?&]case=alisio/);

  // Escape removes the param
  await page.keyboard.press("Escape");
  await expect(async () => {
    expect(page.url()).not.toContain("case=");
  }).toPass();
});

// ── Test 8: invalid ?case= key is silently ignored ───────────────────────────
test("?case=notreal does not open any modal", async ({ page }) => {
  await page.goto("/en/?case=notreal");

  // No open modal
  await expect(page.locator(".ab-case-modal.open")).toHaveCount(0);

  // Page still renders correctly
  await expect(page.locator("h1")).toBeVisible();
});
