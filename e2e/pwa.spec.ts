import { expect, test } from "@playwright/test";

test("manifeste et icônes de la PWA", async ({ page, request }) => {
  await page.goto("/");
  const href = await page.locator('link[rel="manifest"]').getAttribute("href");
  expect(href).toBeTruthy();
  const manifest = await (await request.get(href!)).json();
  expect(manifest).toMatchObject({ name: "KODI — Code de la route", short_name: "KODI", display: "standalone", start_url: "/", lang: "fr" });
  for (const icon of manifest.icons as { src: string; sizes: string }[]) {
    const response = await request.get(icon.src);
    expect(response.status(), icon.src).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
  }
  expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === "maskable")).toBe(true);
  const apple = await page.locator('link[rel="apple-touch-icon"]').getAttribute("href");
  expect((await request.get(apple!)).status()).toBe(200);
});

test("service worker : contrôle la page et garde en cache les pages consultées et la page « Hors ligne »", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) => navigator.serviceWorker.addEventListener("controllerchange", resolve, { once: true }));
    }
  });
  await page.goto("/apprendre");
  await expect(page.getByRole("heading", { level: 1, name: "Apprendre" })).toBeVisible();
  // Le comportement sans réseau est vérifié par src/lib/sw.test.ts : la simulation « hors ligne »
  // de Playwright ne s'applique pas aux requêtes du service worker.
  await expect
    .poll(() =>
      page.evaluate(async () => {
        const hasPage = Boolean(await caches.match("/apprendre"));
        const hasOffline = Boolean(await caches.match("/hors-ligne"));
        const keys = await caches.keys();
        return { hasPage, hasOffline, versioned: keys.every((k) => k.startsWith("kodi-v")) };
      }),
    )
    .toEqual({ hasPage: true, hasOffline: true, versioned: true });
  const cachedApi = await page.evaluate(async () => {
    for (const key of await caches.keys()) {
      const requests = await (await caches.open(key)).keys();
      if (requests.some((r) => new URL(r.url).pathname.startsWith("/api/"))) return true;
    }
    return false;
  });
  expect(cachedApi).toBe(false);
});

test("en-têtes de sécurité présents", async ({ request }) => {
  const response = await request.get("/");
  const headers = response.headers();
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  const sw = await request.get("/sw.js");
  expect(sw.headers()["cache-control"]).toContain("no-cache");
});
