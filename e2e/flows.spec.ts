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
  await expect(page.getByRole("heading", { name: "Sessions récentes" })).toBeVisible();
  // Détail réservé à Premium : verrouillé dans l'offre gratuite (sans compte).
  await expect(page.getByRole("heading", { name: "Statistiques avancées" }).first()).toBeVisible();

  await page.goto("/");
  await expect(page.getByText("5 / 20 questions")).toBeVisible();
});

test("examens : sans serveur, aucun examen n’est créé et la raison est affichée", async ({ page }) => {
  await page.goto("/simuler");
  await expect(page.getByText("Examens pas encore disponibles")).toBeVisible();
  for (const title of ["Examen officiel simulé", "Examen express", "Examen ciblé", "Mode revanche"]) {
    await expect(page.getByText(title, { exact: true })).toBeVisible();
  }
  // Aucune question n'est encore validée : le catalogue l'indique.
  await expect(page.getByText("Questions validées dans le catalogue : 0 / 40 nécessaires")).toBeVisible();
  await expect(page.getByRole("button", { name: /Lancer/ })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Fidélité à l’examen réel" })).toBeVisible();
  await expect(page.getByText(/n’est donc pas une reproduction fidèle/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Service-Public\.gouv\.fr/ })).toHaveAttribute(
    "href",
    "https://www.service-public.gouv.fr/particuliers/vosdroits/F33694",
  );
});

test("l’onboarding personnalise l’accueil", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Commencer", exact: true }).click();
  await expect(page).toHaveURL("/bienvenue");
  await page.getByRole("button", { name: /Continuer/ }).click();
  await page.getByLabel("Prénom").fill("Lou");
  await page.getByRole("button", { name: /Continuer/ }).click();
  await page.getByText("40", { exact: true }).click();
  await page.getByRole("button", { name: /Continuer/ }).click();
  await page.getByRole("button", { name: /C’est parti/ }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { level: 1, name: "Bonjour, Lou" })).toBeVisible();
  await expect(page.getByText("0 / 40 questions")).toBeVisible();
  await expect(page.getByRole("link", { name: "Commencer", exact: true })).toHaveCount(0);
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
  await expect(page.getByText("Comptes non configurés")).toBeVisible();
});

test("mode local : un lien de confirmation mène à une explication, sans erreur", async ({ page }) => {
  await page.goto("/auth/confirm?token_hash=abc&type=email&next=https://pirate.example");
  await expect(page).toHaveURL("/auth/lien-invalide");
  await expect(page.getByRole("heading", { name: "Ce lien n’est plus valide" })).toBeVisible();
});

test("mode local : le profil l’indique et l’oubli de mot de passe ne contacte aucun serveur", async ({ page }) => {
  await page.goto("/profil");
  await expect(page.getByText(/Mode local : les comptes en ligne/)).toBeVisible();
  await page.goto("/mot-de-passe-oublie");
  await page.getByLabel("Adresse e-mail").fill("prenom@domaine.fr");
  await page.getByRole("button", { name: "Recevoir un lien" }).click();
  await expect(page.getByText("Comptes non configurés")).toBeVisible();
});

test("Premium : sans Stripe configuré, l’offre est décrite mais aucun paiement n’est possible", async ({ page, request }) => {
  await page.goto("/premium");
  await expect(page.getByText("Paiement non disponible")).toBeVisible();
  await expect(page.getByRole("table", { name: /offre gratuite et de l’offre Premium/ })).toBeVisible();
  await expect(page.getByRole("row", { name: /Examens blancs 1 par jour Illimités/ })).toBeVisible();
  await expect(page.getByText("4,99 €")).toBeVisible();
  await expect(page.getByText("Prix envisagé, à confirmer")).toBeVisible();
  await expect(page.getByRole("button", { name: /Commander avec obligation de paiement/ })).toHaveCount(0);

  await page.getByRole("link", { name: "Conditions générales de vente" }).click();
  await expect(page.getByText("Document pas encore publié")).toBeVisible();

  await page.goto("/abonnement/resilier");
  await expect(page.getByText(/il n’y a donc rien à gérer/)).toBeVisible();

  for (const path of ["/api/paiement/session", "/api/paiement/resiliation", "/api/stripe/webhook"]) {
    const response = await request.post(path, { data: {} });
    expect(response.status(), path).toBe(503);
    expect(await response.json()).toEqual({ error: "paiement-non-configure" });
  }
});

test("offre gratuite : la scène de découverte est ouverte et signalée comme gratuite", async ({ page }) => {
  await page.goto("/simulations");
  await expect(page.getByText("Découverte · gratuite")).toBeVisible();
  await page.goto("/simulations/intersection-sans-signalisation");
  await expect(page.getByRole("heading", { name: "Scène réservée à Premium" })).toHaveCount(0);
});

test("leçon : correction des réponses, carnet d’erreurs, maîtrise et programme du jour", async ({ page }) => {
  await page.goto("/apprendre");
  await expect(page.getByRole("link", { name: /Règles de priorités/ })).toBeVisible();
  await expect(page.locator("main li a[href^='/apprendre/']")).toHaveCount(10);
  await page.getByRole("link", { name: /Règles de priorités/ }).click();
  await page.getByRole("link", { name: /Priorité à droite et intersections/ }).click();
  await expect(page.getByText("Démonstration · non validé").first()).toBeVisible();
  await expect(page.getByRole("img", { name: /Schéma vu de dessus/ })).toBeVisible();

  await page.getByRole("button", { name: "Commencer les questions" }).click();
  // Répond toujours la dernière proposition : certaines réponses seront fausses.
  for (let i = 0; i < 20; i += 1) {
    await page.locator("main fieldset label").last().click();
    await page.getByRole("button", { name: "Valider" }).click();
    await expect(page.getByText(/Bonne réponse !|Ce n’est pas la bonne réponse/)).toBeVisible();
    const next = page.getByRole("button", { name: /Question suivante|Voir le bilan/ });
    const last = (await next.textContent())?.includes("bilan");
    await next.click();
    if (last) break;
  }
  await expect(page.getByRole("heading", { name: "Série terminée" })).toBeVisible();

  await page.goto("/apprendre/regles-priorites");
  await expect(page.getByText("Terminée")).toBeVisible();
  await expect(page.getByText(/Maîtrise estimée \d+ %|En cours|Fragile|Maîtrisée/).first()).toBeVisible();

  await page.goto("/revisions");
  await expect(page.getByRole("heading", { name: "Carnet d’erreurs" })).toBeVisible();
  const reviews = page.getByRole("button", { name: "Revoir cette question" });
  expect(await reviews.count()).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Commencer le programme" }).click();
  await expect(page.getByText(/Question 1 sur \d+/)).toBeVisible();

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Programme du jour" })).toBeVisible();
  await expect(page.getByText(/du carnet d’erreurs/)).toBeVisible();
});

test("coach : les réponses d’une leçon alimentent conseils, XP et défis", async ({ page }) => {
  await page.goto("/coach");
  await expect(page.getByText("Pas assez de réponses pour estimer")).toBeVisible();
  await expect(page.getByText("Votre coach attend vos premières réponses")).toBeVisible();

  await page.goto("/apprendre/regles-priorites/priorite-a-droite");
  await page.getByRole("button", { name: "Commencer les questions" }).click();
  for (let i = 0; i < 20; i += 1) {
    await page.locator("main fieldset label").first().click();
    await page.getByRole("button", { name: "Valider" }).click();
    const next = page.getByRole("button", { name: /Question suivante|Voir le bilan/ });
    const last = (await next.textContent())?.includes("bilan");
    await next.click();
    if (last) break;
  }
  await expect(page.getByRole("heading", { name: "Série terminée" })).toBeVisible();

  await page.goto("/");
  await expect(page.getByRole("link", { name: /Votre coach/ })).toContainText(/Niveau \d+ · \d+ XP/);
  await page.getByRole("link", { name: /Votre coach/ }).click();
  await expect(page).toHaveURL("/coach");
  await expect(page.getByRole("heading", { name: "Défis du jour" })).toBeVisible();
  await expect(page.getByText(/^Première leçon \(obtenu\)$/)).toBeVisible();
  const xp = await page.getByText(/^\d+ XP$/).first().textContent();
  expect(Number(xp?.replace(" XP", ""))).toBeGreaterThanOrEqual(30);
  await page.getByText("Comment gagner des XP ?").click();
  await expect(page.getByText(/répondre au hasard ne paie pas/)).toBeVisible();
  // Coach étendu (planning sur 7 jours, examens) : réservé à Premium.
  await expect(page.getByRole("heading", { name: "Coach étendu" })).toHaveCount(2);
});

test("professeur : depuis une correction, mode sans IA clairement indiqué et explications prédéfinies", async ({ page }) => {
  await page.goto("/apprendre/regles-priorites/priorite-a-droite");
  await page.getByRole("button", { name: "Commencer les questions" }).click();
  await page.locator("main fieldset label").first().click();
  await page.getByRole("button", { name: "Valider" }).click();
  await page.getByRole("link", { name: "Demander au professeur" }).click();

  await expect(page).toHaveURL(/\/professeur\?question=/);
  await expect(page.getByRole("heading", { level: 1, name: "Professeur" })).toBeVisible();
  await expect(page.getByRole("note")).toContainText("Mode sans IA générative");
  await expect(page.getByText("Question corrigée", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Reformuler une correction")).toBeChecked();

  await page.getByRole("button", { name: "Demander au professeur" }).click();
  await expect(page.getByText("Réponse sans IA générative")).toBeVisible();
  await expect(page.getByText(/aucun service d’IA n’est connecté à KODI/).first()).toBeVisible();
  await expect(page.getByText(/^Correction : /).first()).toBeVisible();
  await expect(page.getByText(/générée par IA/)).toHaveCount(0);

  // Question libre sans rapport : rien n'est inventé.
  await page.getByText("Poser une question", { exact: true }).click();
  await expect(page.getByLabel("Poser une question")).toBeChecked();
  await page.getByLabel("Votre question").fill("Quelle est la recette de la tarte aux pommes ?");
  await page.getByRole("button", { name: "Demander au professeur" }).click();
  await expect(page.getByRole("heading", { name: "Aucune explication ne correspond" })).toBeVisible();
});

test("professeur : l’API répond sans IA et refuse les demandes invalides", async ({ request }) => {
  const ok = await request.post("/api/professeur", { data: { kind: "question", message: "Qui a la priorité à droite ?" } });
  expect(ok.status()).toBe(200);
  expect(await ok.json()).toMatchObject({ mode: "sans-ia", reason: "aucun-fournisseur" });
  const invalid = await request.post("/api/professeur", { data: { kind: "question", message: "", secret: "x" } });
  expect(invalid.status()).toBe(400);
});
