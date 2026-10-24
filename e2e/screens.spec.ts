import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const SCREENS = [
  { path: "/", title: "Bonjour" },
  { path: "/apprendre", title: "Apprendre" },
  { path: "/apprendre/regles-priorites", title: "Règles de priorités" },
  { path: "/apprendre/regles-priorites/priorite-a-droite", title: "Priorité à droite et intersections" },
  { path: "/apprendre/tunnels-passages-niveau/passage-a-niveau", title: "Franchir un passage à niveau" },
  { path: "/revisions", title: "Révisions" },
  { path: "/coach", title: "Coach" },
  { path: "/professeur", title: "Professeur" },
  { path: "/professeur?question=ex-001", title: "Professeur" },
  { path: "/simulations", title: "Simulations" },
  { path: "/simulations/intersection-sans-signalisation", title: "Intersection sans signalisation" },
  { path: "/simuler", title: "Simuler" },
  { path: "/entrainement", title: "S’entraîner" },
  { path: "/progression", title: "Progression" },
  { path: "/connexion", title: "Connexion" },
  { path: "/inscription", title: "Créer un compte" },
  { path: "/bienvenue", title: "Bienvenue sur KODI" },
  { path: "/profil", title: "Profil et paramètres" },
  { path: "/premium", title: "KODI Premium" },
  { path: "/mot-de-passe-oublie", title: "Mot de passe oublié" },
  { path: "/reinitialiser-mot-de-passe", title: "Nouveau mot de passe" },
  { path: "/auth/lien-invalide", title: "Ce lien n’est plus valide" },
] as const;

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

/** Attend la fin des chargements locaux (squelettes) avant de mesurer. */
async function waitForContent(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
  await expect(page.locator('[role="status"]', { hasText: "Chargement" })).toHaveCount(0);
}

async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

for (const screen of SCREENS) {
  test.describe(`écran ${screen.path}`, () => {
    for (const scheme of ["light", "dark"] as const) {
      test(`s’affiche sans erreur et passe l’audit d’accessibilité (${scheme})`, async ({ page }) => {
        const errors = collectErrors(page);
        await page.emulateMedia({ colorScheme: scheme });
        await page.goto(screen.path);
        await expect(page.getByRole("heading", { level: 1, name: screen.title })).toBeVisible();
        await expect(page.locator("html")).toHaveAttribute("data-theme", scheme);
        await expect(page.locator("html")).toHaveAttribute("lang", "fr");
        await waitForContent(page);

        const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
        expect(
          results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`),
        ).toEqual([]);
        expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
        expect(errors).toEqual([]);
      });
    }

    test("aucun défilement horizontal sur un petit écran (320 px)", async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 });
      await page.goto(screen.path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await waitForContent(page);
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
    });
  });
}

test("aucun débordement à 320 px, même avec une police de repli plus large", async ({ page }) => {
  // Simule un appareil où la police Geist n'est pas chargée et où la police
  // de repli est plus large (cas des serveurs Ubuntu de la CI).
  await page.route(/\.woff2$/, (route) => route.abort());
  await page.setViewportSize({ width: 320, height: 640 });
  for (const { path } of SCREENS) {
    await page.goto(path);
    await page.addStyleTag({ content: '*{font-family:"DejaVu Sans",Verdana,sans-serif !important}' });
    await waitForContent(page);
    expect(await horizontalOverflow(page), path).toBeLessThanOrEqual(0);
  }
});

test("une adresse inconnue affiche la page introuvable", async ({ page }) => {
  const response = await page.goto("/adresse-inexistante");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page introuvable" })).toBeVisible();
  await page.getByRole("link", { name: "Retour à l’accueil" }).click();
  await expect(page).toHaveURL("/");
});
