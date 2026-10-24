import { expect, test, type Page } from "@playwright/test";

const SCENE = "/simulations/intersection-sans-signalisation";
const BUDGET = { calls: 80, triangles: 40_000 };

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

async function time(page: Page): Promise<number> {
  return Number(await page.getByRole("slider", { name: "Position dans la scène" }).inputValue());
}

test("la leçon mène à la simulation", async ({ page }) => {
  await page.goto("/apprendre/regles-priorites/priorite-a-droite");
  await page.getByRole("link", { name: /Ouvrir la simulation/ }).click();
  await expect(page).toHaveURL(SCENE);
  await expect(page.getByRole("heading", { level: 1, name: "Intersection sans signalisation" })).toBeVisible();
});

test("3D : lecture, caméras, sélection, sous-titres et retour en 2D", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto(SCENE);
  const view = page.locator("[data-view]");
  await expect(view).toHaveAttribute("data-view", "3d");
  await expect(view.locator("canvas")).toBeVisible({ timeout: 20_000 });

  await page.getByRole("button", { name: "Lancer la scène" }).click();
  await expect.poll(() => time(page), { timeout: 10_000 }).toBeGreaterThan(5);
  await expect(page.getByTestId("sous-titre")).toContainText("La voiture verte arrive de votre droite");
  await page.getByRole("button", { name: "Pause" }).click();
  const paused = await time(page);
  await page.waitForTimeout(500);
  expect(await time(page)).toBe(paused);

  for (const camera of ["Aérienne", "Libre", "Explication", "Conducteur"]) {
    await page.getByText(camera, { exact: true }).click();
    await expect(page.getByRole("radio", { name: camera })).toBeChecked();
  }

  await page.getByRole("button", { name: "Voiture rouge" }).click();
  await expect(page.getByText(/elle doit donc vous céder le passage/)).toBeVisible();

  await page.getByRole("button", { name: /Sous-titres : activés/ }).click();
  await expect(page.getByTestId("sous-titre")).toHaveCount(0);

  await page.getByRole("button", { name: "Version 2D" }).click();
  await expect(view).toHaveAttribute("data-view", "2d");
  await expect(page.getByText("Version 2D affichée à votre demande.")).toBeVisible();
  await page.getByRole("button", { name: "Revenir à la 3D" }).click();
  await expect(view.locator("canvas")).toBeVisible({ timeout: 20_000 });
  expect(errors).toEqual([]);
});

test("caméra libre : un glissé fait tourner la vue", async ({ page, isMobile }) => {
  test.skip(isMobile, "Les gestes tactiles (pincer, tourner) ne sont pas simulables ici ; à vérifier sur iPhone.");
  await page.goto(SCENE);
  const canvas = page.locator("[data-view] canvas");
  await expect(canvas).toBeVisible({ timeout: 20_000 });
  await page.getByText("Libre", { exact: true }).click();
  await page.waitForTimeout(500);
  const before = await canvas.screenshot();
  const box = (await canvas.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2 + 20, { steps: 8 });
  await page.mouse.up();
  await page.mouse.wheel(0, -300);
  await page.waitForTimeout(500);
  expect(Buffer.compare(before, await canvas.screenshot())).not.toBe(0);
});

test("sans WebGL, la version 2D de secours prend le relais", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    // Remplacement volontaire pour simuler un appareil sans WebGL.
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      value: function (this: HTMLCanvasElement, type: string, options?: unknown) {
        if (type.startsWith("webgl") || type === "experimental-webgl") return null;
        return (original as (this: HTMLCanvasElement, t: string, o?: unknown) => unknown).call(this, type, options);
      },
    });
  });
  await page.goto(SCENE);
  await expect(page.getByText(/WebGL indisponible/)).toBeVisible();
  await expect(page.getByRole("img", { name: "Vue 2D de dessus de la scène" })).toBeVisible();
  await page.getByRole("slider", { name: "Position dans la scène" }).fill("12");
  await expect(page.getByTestId("sous-titre")).toContainText("La voiture rouge");
  await page.getByRole("button", { name: "Voiture verte" }).click();
  await expect(page.getByText(/Elle arrive par votre droite/)).toBeVisible();
});

test("question de la scène : correction pédagogique et explication animée", async ({ page }) => {
  await page.goto(SCENE);
  await page.getByRole("checkbox", { name: /Céder le passage à la voiture qui vient de ma droite/ }).check({ force: true });
  await page.getByRole("checkbox", { name: /Passer avant la voiture qui vient de ma gauche/ }).check({ force: true });
  await page.getByRole("button", { name: "Valider" }).click();
  await expect(page.getByText("Bonne réponse !")).toBeVisible();
  await expect(page.getByText(/R415-5/).first()).toBeVisible();
  await page.getByRole("button", { name: /Voir le bilan/ }).click();
  await page.getByRole("button", { name: /Revoir l’explication animée/ }).click();
  await expect(page.getByRole("radio", { name: "Explication" })).toBeChecked();
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
});

test("contrôles de performance : budget de rendu et chargement différé de la 3D", async ({ browser, baseURL }, testInfo) => {
  // Chaque mesure dans un contexte neuf : aucun cache partagé.
  const scriptsOf = async (path: string) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const scripts: Array<{ url: string; bytes: number; transferred: number; three: boolean }> = [];
    page.on("response", async (response) => {
      if (!response.url().endsWith(".js")) return;
      const body = await response.body().catch(() => Buffer.alloc(0));
      const sizes = await response.request().sizes().catch(() => ({ responseBodySize: 0 }));
      scripts.push({
        url: response.url(),
        bytes: body.length,
        transferred: sizes.responseBodySize,
        three: body.includes("WebGLRenderer"),
      });
    });
    await page.goto(new URL(path, baseURL).toString());
    await page.waitForLoadState("networkidle");
    return { context, page, scripts };
  };

  // Accueil : aucun code 3D chargé.
  const home = await scriptsOf("/");
  expect(home.scripts.length).toBeGreaterThan(0);
  expect(home.scripts.some((s) => s.three)).toBe(false);
  await home.context.close();

  // Scène : la 3D est chargée à part, puis on mesure le rendu.
  const { context, page, scripts } = await scriptsOf(SCENE);
  await expect(page.locator("[data-view] canvas")).toBeVisible({ timeout: 20_000 });
  await page.waitForLoadState("networkidle");
  const threeBytes = scripts.filter((s) => s.three).reduce((sum, s) => sum + s.bytes, 0);
  const totalBytes = scripts.reduce((sum, s) => sum + s.bytes, 0);
  const transferred = scripts.reduce((sum, s) => sum + s.transferred, 0);
  expect(threeBytes).toBeGreaterThan(0);
  // Garde-fou contre une régression du poids du moteur 3D (valeur actuelle mesurée : environ 920 Kio décodés).
  expect(threeBytes).toBeLessThanOrEqual(1100 * 1024);

  await page.getByRole("button", { name: "Afficher les mesures de performance" }).click();
  await page.getByRole("button", { name: "Lancer la scène" }).click();
  const metrics = page.getByTestId("mesures").locator("dl");
  await expect(metrics).toBeVisible({ timeout: 10_000 });
  await page.waitForTimeout(3000);
  const calls = Number(await metrics.getAttribute("data-calls"));
  const triangles = Number(await metrics.getAttribute("data-triangles"));
  const fps = await metrics.getAttribute("data-fps");
  const dpr = await metrics.getAttribute("data-dpr");
  expect(calls).toBeGreaterThan(0);
  expect(calls).toBeLessThanOrEqual(BUDGET.calls);
  expect(triangles).toBeLessThanOrEqual(BUDGET.triangles);
  await context.close();

  // Mesures consignées dans le rapport (Chromium sans GPU : non représentatif d'un iPhone).
  const description = `${testInfo.project.name} : ${calls} appels de dessin, ${triangles} triangles, ${fps} images/s (rendu logiciel), densité ${dpr} ; JavaScript : ${Math.round(totalBytes / 1024)} Kio décodés (${Math.round(transferred / 1024)} Kio transférés) dont ${Math.round(threeBytes / 1024)} Kio pour la 3D`;
  testInfo.annotations.push({ type: "mesure", description });
});
