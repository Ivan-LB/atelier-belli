import { test, expect } from "@playwright/test";

// ── Test 1: one URL renders either language ─────────────────────────────────
// The locale is no longer in the path (localePrefix: "never"), so the SAME url
// has to serve both languages depending on the NEXT_LOCALE cookie.
test("/ renders an h1 in English by default", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("/ renders Spanish when NEXT_LOCALE=es, at the same URL", async ({ browser }) => {
  const context = await browser.newContext();
  await context.addCookies([
    { name: "NEXT_LOCALE", value: "es", url: "http://localhost:3100" },
  ]);
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  expect(new URL(page.url()).pathname).toBe("/");
  await context.close();
});

// ── Test 2: Accept-Language still negotiates, without changing the URL ───────
test("/ with Accept-Language: es serves Spanish and stays on /", async ({ browser }) => {
  const context = await browser.newContext({ locale: "es-MX" });
  const page = await context.newPage();
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  expect(new URL(page.url()).pathname).toBe("/");
  await context.close();
});

// ── Test 2b: the old prefixed URLs must keep working for inbound links ───────
test("legacy /en and /es URLs redirect to the unprefixed route", async ({ page }) => {
  await page.goto("/en/privacy/");
  expect(new URL(page.url()).pathname).toBe("/privacy/");
  await page.goto("/es/");
  expect(new URL(page.url()).pathname).toBe("/");
});

// ── Test 3: Case modal — open, focus, Escape, trigger-focus-restore ──────────
test("case modal opens, traps focus, closes on Escape, restores trigger focus", async ({
  page,
}) => {
  await page.goto("/");

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
  await page.goto("/?case=alisio");
  await expect(page.locator(".ab-case-modal.open")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".ab-case-modal.open")).toHaveCount(0);
  await expect(page.locator('button.ab-index-row[data-case="alisio"]')).toBeFocused();
});

test("closed case modal is not reachable by keyboard", async ({ page }) => {
  await page.goto("/");
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
  await page.goto("/");

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

// ── Test 5: Spanish shows all ten cases ──────────────────────────────────────
// Bump this count when an 11th case ships (also update CASE_KEYS in page.tsx).
test("Spanish shows all ten cases", async ({ browser }) => {
  const context = await browser.newContext();
  await context.addCookies([
    { name: "NEXT_LOCALE", value: "es", url: "http://localhost:3100" },
  ]);
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.locator("button.ab-index-row")).toHaveCount(10);
  await context.close();
});

// ── Test 6: deep link opens the right case ────────────────────────────────────
test("?case=blip deep link opens the BLIP modal; Escape clears the param", async ({
  page,
}) => {
  await page.goto("/?case=blip");

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
  await page.goto("/");

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
  await page.goto("/?case=notreal");

  // No open modal
  await expect(page.locator(".ab-case-modal.open")).toHaveCount(0);

  // Page still renders correctly
  await expect(page.locator("h1")).toBeVisible();
});

// ── Test 9: below 820px the nav still offers a way to reach contact ──────────
// The primary links are hidden on small screens and used to have no stand-in at
// all, so a phone visitor had to scroll to the footer to find an address.
test("at 375px the nav offers a contact affordance in place of the links", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  const chip = page.locator("header.ab-nav a.ab-chip-contact");
  await expect(chip).toBeVisible();
  await expect(chip).toHaveAttribute("href", "#contact");
  // Same label as the desktop link it stands in for (home.nav.contact).
  await expect(chip).toHaveText("Contact");

  // The anchor it points at has to exist, or the affordance is decorative.
  await expect(page.locator("#contact")).toHaveCount(1);

  // The links it replaces are hidden at this width.
  await expect(page.locator(".ab-nav-links")).toBeHidden();

  // No horizontal scroll at either narrow width. This was measured clean before
  // the chip existed; the chip must not be what regresses it.
  for (const width of [320, 375]) {
    await page.setViewportSize({ width, height: 812 });
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflows, `horizontal overflow at ${width}px`).toBe(false);
  }
});

// ── Test 10: above the breakpoint the links come back and the chip goes away ──
test("at 1280px the nav links are visible and the contact chip is not", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");

  await expect(page.locator(".ab-nav-links")).toBeVisible();
  await expect(page.locator("header.ab-nav a.ab-chip-contact")).toBeHidden();
});

// ── Test 11: the language control does not rearrange itself ──────────────────
// It used to render the active language first, so switching moved the half you
// had just clicked. The order is fixed en-then-es now, in both locales.
test("the language toggle keeps a fixed EN-then-ES order in both locales", async ({
  browser,
}) => {
  for (const [cookie, active, other] of [
    ["en", "EN", "ES"],
    ["es", "ES", "EN"],
  ] as const) {
    const context = await browser.newContext();
    await context.addCookies([
      { name: "NEXT_LOCALE", value: cookie, url: "http://localhost:3100" },
    ]);
    const page = await context.newPage();
    await page.goto("/");

    const pill = page.locator(".ab-chip-lang");
    const segments = pill.locator("button");

    // Order is positional, not by which one is active.
    await expect(segments).toHaveCount(2);
    await expect(segments.first()).toHaveText("EN");
    await expect(segments.last()).toHaveText("ES");

    // Exactly one is marked current, and it is the active locale.
    const current = pill.locator("button[aria-current]");
    await expect(current).toHaveCount(1);
    await expect(current).toHaveText(active);

    // Each segment declares its own language so it is announced correctly, and
    // the group is what names the control (the visible text is the button name,
    // so an aria-label reading "Cambiar a Español" over "ES" would break
    // WCAG 2.5.3 Label in Name).
    await expect(pill).toHaveAttribute("role", "group");
    await expect(segments.first()).toHaveAttribute("lang", "en");
    await expect(segments.last()).toHaveAttribute("lang", "es");
    await expect(pill.locator(`button[lang="${other.toLowerCase()}"]`)).not.toHaveAttribute(
      "aria-current",
      "true",
    );

    await context.close();
  }
});

// ── Test 12: pressing the language you are already in does nothing ───────────
// The old control was a single toggle, so clicking the active half switched you
// away from it.
test("clicking the active language segment is a no-op", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await page.locator(".ab-chip-lang button[aria-current]").click();

  // Give a refresh the chance to happen, then prove it did not.
  await page.waitForTimeout(600);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator(".ab-chip-lang button[aria-current]")).toHaveText("EN");
});

// ── Test 13: switching moves the indicator and lands on the other language ───
test("the other language segment switches the page and carries the indicator", async ({
  page,
}) => {
  await page.goto("/");
  const pill = page.locator(".ab-chip-lang");
  await expect(pill).toHaveAttribute("data-active", "en");

  await pill.locator('button[lang="es"]').click();

  // data-active flips immediately, before the refresh lands, so the indicator
  // starts travelling on the click rather than on the response.
  await expect(pill).toHaveAttribute("data-active", "es");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.locator(".ab-chip-lang button[aria-current]")).toHaveText("ES");
});

// ── Test 14: the pill renders as a pill at every width ───────────────────────
// `.ab-root button` used to outrank `.ab-chip` and strip the border off this
// control above 820px. The wrapper is a <div> now, so the chrome survives.
test("the language toggle is a bordered pill on desktop and on mobile", async ({
  page,
}) => {
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    const box = page.locator(".ab-chip-lang");
    await expect(box).toBeVisible();
    const style = await box.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { border: cs.borderTopWidth, radius: cs.borderTopLeftRadius, size: cs.fontSize };
    });
    expect(style, `language pill chrome at ${width}px`).toEqual({
      border: "1px",
      radius: "999px",
      size: "11px",
    });
    // Both segments are the same width, which is what lets the indicator be a
    // plain 50% translate.
    const widths = await box.locator("button").evaluateAll((els) =>
      els.map((e) => Math.round(e.getBoundingClientRect().width * 100) / 100),
    );
    expect(widths[0], `segment widths at ${width}px`).toBe(widths[1]);
  }
});

// ── Test 15: the custom 404 renders, with the real brand mark ────────────────
// It had no coverage at all, which is how its inline copy of the monogram lost
// two of its four paths and had the ink and accent roles swapped without anyone
// noticing. The mark comes from the shared <BrandLogo> now.
test("the 404 renders the editorial chrome and the full brand mark", async ({
  page,
}) => {
  const res = await page.goto("/definitely-not-a-real-page");
  expect(res?.status()).toBe(404);

  // Ours, not Next's default.
  await expect(page.locator(".ab-nf-root")).toBeVisible();
  await expect(page.locator("main#main-content")).toHaveCount(1);

  const logo = page.locator(".ab-nf-mark .ab-logo");
  await expect(logo).toBeVisible();
  await expect(logo.locator("path.ab-dark")).toHaveCount(2);
  await expect(logo.locator("path.ab-accent")).toHaveCount(2);
});

// ── Test 16: the 404's controls speak the same language as the nav ───────────
test("the 404 language control is fixed-order, marked with aria-current, and the active one is a no-op", async ({
  page,
}) => {
  await page.goto("/definitely-not-a-real-page");

  const langs = page.locator(".ab-nf-controls button.ab-nf-ctrl");
  await expect(langs).toHaveCount(2);
  await expect(langs.first()).toHaveText("EN");
  await expect(langs.last()).toHaveText("ES");
  await expect(langs.first()).toHaveAttribute("lang", "en");
  await expect(langs.last()).toHaveAttribute("lang", "es");

  // aria-current, not aria-pressed: one convention across the site.
  const current = page.locator(".ab-nf-controls button[aria-current]");
  await expect(current).toHaveCount(1);
  await expect(current).toHaveText("EN");
  await expect(page.locator(".ab-nf-controls [aria-pressed]")).toHaveCount(0);

  // Pressing the language you are already in does nothing.
  await current.click();
  await page.waitForTimeout(500);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  // Pressing the other one switches, and stays on the 404.
  await langs.last().click();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.locator(".ab-nf-root")).toBeVisible();
});

// ── Test 17: the theme control is the same icon button everywhere ────────────
// The 404 used to render a text button reading "Light"/"Dark" while the header
// used a 34px sun/moon. `.ab-root button` also stripped the ring off both.
test("the theme toggle is a 34px ringed icon button on the homepage and the 404", async ({
  page,
}) => {
  for (const path of ["/", "/definitely-not-a-real-page"]) {
    await page.goto(path);
    const toggle = page.locator("button.ab-theme-toggle");
    await expect(toggle).toHaveCount(1);
    await expect(toggle.locator("svg.sun")).toHaveCount(1);
    await expect(toggle.locator("svg.moon")).toHaveCount(1);
    await expect(toggle).toHaveText("");

    const chrome = await toggle.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { w: cs.width, h: cs.height, border: cs.borderTopWidth };
    });
    expect(chrome, `theme toggle chrome on ${path}`).toEqual({
      w: "34px",
      h: "34px",
      border: "1px",
    });
  }
});
