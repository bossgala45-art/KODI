import { expect, test } from "@playwright/test";

test("la navigation principale mène aux cinq onglets", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Navigation principale" });
  for (const [label, path, heading] of [
    ["Apprendre", "/apprendre", "Apprendre"],
    ["Simuler", "/simuler", "Simuler"],
    ["S’entraîner", "/entrainement", "S’entraîner"],
    ["Progression", "/progression", "Progression"],
    ["Accueil", "/", "Bonjour"],
  ] as const) {
    await nav.getByRole("link", { name: label }).click();
    await expect(page).toHaveURL(path);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    await expect(nav.getByRole("link", { name: label })).toHaveAttribute("aria-current", "page");
  }
});

test("une série d’entraînement complète alimente la progression", async ({ page }) => {
  await page.goto("/entrainement");
  await page.getByRole("button", { name: /Commencer la série/ }).click();

  for (let i = 1; i <= 5; i += 1) {
    await expect(page.getByText(`Question ${i} sur 5`)).toBeVisible();
    await page.locator("fieldset label").first().click();
    await page.getByRole("button", { name: "Valider" }).click();
    await expect(
      page.getByText(/^(Bonne réponse !|Ce n’est pas la bonne réponse\.)$/),
    ).toBeVisible();
    await page.getByRole("button", { name: i === 5 ? /Voir le résultat/ : /Question suivante/ }).click();
  }

  await expect(page.getByRole("heading", { name: "Série terminée" })).toBeVisible();
  await page.getByRole("link", { name: "Voir ma progression" }).click();
  await expect(page).toHaveURL("/progression");
  await expect(page.getByText("Sessions récentes")).toBeVisible();
  await expect(page.getByText(/\/ 5$/).first()).toBeVisible();

  await page.goto("/");
  await expect(page.getByText("5 / 20 questions")).toBeVisible();
});

test("l’examen blanc ne corrige qu’à la fin", async ({ page }) => {
  await page.goto("/simuler");
  await page.getByRole("button", { name: /Lancer l’examen blanc/ }).click();
  for (let i = 1; i <= 10; i += 1) {
    await expect(page.getByText(`Question ${i} sur 10`)).toBeVisible();
    await page.locator("fieldset label").first().click();
    await expect(page.getByText("Bonne réponse !")).toHaveCount(0);
    await page.getByRole("button", { name: i === 10 ? "Valider et terminer" : "Valider" }).click();
  }
  await expect(page.getByRole("heading", { name: "Examen blanc terminé" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Corrigé" })).toBeVisible();
});

test("l’onboarding personnalise l’accueil", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Commencer/ }).click();
  await expect(page).toHaveURL("/bienvenue");
  await page.getByRole("button", { name: /Continuer/ }).click();
  await page.getByLabel("Prénom").fill("Lou");
  await page.getByRole("button", { name: /Continuer/ }).click();
  await page.getByText("40 questions", { exact: true }).click();
  await page.getByRole("button", { name: /Continuer/ }).click();
  await page.getByRole("button", { name: /C’est parti/ }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { level: 1, name: "Bonjour, Lou" })).toBeVisible();
  await expect(page.getByText("0 / 40 questions")).toBeVisible();
  await expect(page.getByRole("link", { name: /Commencer/ })).toHaveCount(0);
});

test("thème et animations se règlent dans le profil et persistent", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "no-preference" });
  await page.goto("/profil");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-theme", "light");
  await expect(html).toHaveAttribute("data-motion", "full");

  await page.getByText("Sombre", { exact: true }).click();
  await page.getByText("Réduites", { exact: true }).click();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect(html).toHaveAttribute("data-motion", "reduce");

  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect(html).toHaveAttribute("data-motion", "reduce");
});

test("le thème se change au clavier", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/profil");
  await page.getByRole("radio", { name: "Auto" }).first().focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("radio", { name: "Sombre" })).toBeChecked();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("la préférence système « réduire les animations » est respectée", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduce");
});

test("connexion : erreurs de saisie puis message honnête", async ({ page }) => {
  await page.goto("/connexion");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByText("Saisissez votre adresse e-mail.")).toBeVisible();
  await expect(page.getByLabel("Adresse e-mail")).toBeFocused();

  await page.getByLabel("Adresse e-mail").fill("prenom@domaine.fr");
  await page.getByLabel("Mot de passe", { exact: true }).fill("secret123");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByText("Les comptes ne sont pas encore disponibles")).toBeVisible();
});

test("Premium : le bouton explique que l’offre n’est pas disponible", async ({ page }) => {
  await page.goto("/premium");
  await expect(page.getByText("Données fictives")).toBeVisible();
  await page.getByRole("button", { name: /Passer à Premium/ }).click();
  await expect(page.getByText("Premium n’est pas encore disponible")).toBeVisible();
});
