import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PremiumGate } from "@/components/billing/premium-gate";
import { SubscribeForm } from "@/components/billing/subscribe";
import { CancelFlow, SubscriptionPanel, WithdrawFlow } from "@/components/billing/subscription";
import { resetAuthStoreForTests } from "@/lib/auth/session-store";
import { resetEntitlementsForTests, type Entitlements } from "@/lib/billing/use-entitlements";

const USER = { id: "u1", email: "eleve@exemple.fr" };

function entitlements(overrides: Partial<Entitlements> = {}): Entitlements {
  return {
    premium: false,
    plan: "free",
    status: "active",
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    startedAt: null,
    examsToday: 0,
    freeDailyExams: 1,
    ...overrides,
  };
}

function signedIn(e: Entitlements) {
  resetAuthStoreForTests({ status: "signed-in", user: USER });
  resetEntitlementsForTests({ status: "pret", entitlements: e }, USER.id);
}

const PREMIUM = entitlements({
  premium: true,
  plan: "premium",
  status: "active",
  currentPeriodEnd: "2026-11-24T12:00:00Z",
  startedAt: new Date().toISOString(),
});

function mockFetch(status: number, body: unknown) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }),
  );
}

afterEach(() => {
  resetAuthStoreForTests();
  resetEntitlementsForTests();
});

describe("PremiumGate", () => {
  it("verrouille pour l’offre gratuite, sans afficher le contenu", () => {
    signedIn(entitlements());
    render(<PremiumGate title="Coach étendu" description="Réservé.">Contenu secret</PremiumGate>);
    expect(screen.getByText("Coach étendu")).toBeTruthy();
    expect(screen.queryByText("Contenu secret")).toBeNull();
    expect(screen.getByRole("link", { name: "Voir l’offre Premium" }).getAttribute("href")).toBe("/premium");
  });

  it("affiche le contenu pour un abonné", () => {
    signedIn(PREMIUM);
    render(<PremiumGate title="Coach étendu" description="Réservé.">Contenu secret</PremiumGate>);
    expect(screen.getByText("Contenu secret")).toBeTruthy();
  });

  it("sans compte (mode local) : offre gratuite", () => {
    resetAuthStoreForTests({ status: "local" });
    resetEntitlementsForTests({ status: "sans-compte", reason: "local" });
    render(<PremiumGate title="Statistiques avancées" description="Réservé.">Détail</PremiumGate>);
    expect(screen.queryByText("Détail")).toBeNull();
  });
});

describe("SubscribeForm", () => {
  it("paiement non configuré : aucun bouton de paiement", () => {
    signedIn(entitlements());
    render(<SubscribeForm mode="inactif" />);
    expect(screen.getByText(/aucun abonnement ne peut être souscrit/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Commander/ })).toBeNull();
  });

  it("exige un compte connecté", () => {
    resetAuthStoreForTests({ status: "signed-out" });
    resetEntitlementsForTests({ status: "sans-compte", reason: "deconnecte" });
    render(<SubscribeForm mode="test" />);
    expect(screen.getByRole("link", { name: "Se connecter" }).getAttribute("href")).toBe("/connexion?next=/premium");
  });

  it("mode test annoncé ; commande seulement après les deux consentements ; redirection vers Stripe", async () => {
    signedIn(entitlements());
    const fetchSpy = mockFetch(200, { url: "https://checkout.stripe.com/c/pay/cs_test" });
    const assign = vi.fn();
    vi.spyOn(window, "location", "get").mockReturnValue({ ...window.location, assign } as Location);
    render(<SubscribeForm mode="test" />);
    expect(screen.getByText("Mode test Stripe")).toBeTruthy();
    const order = screen.getByRole("button", { name: /Commander avec obligation de paiement/ });
    expect((order as HTMLButtonElement).disabled).toBe(true);
    await userEvent.click(screen.getByLabelText(/conditions générales de vente/));
    expect((order as HTMLButtonElement).disabled).toBe(true);
    await userEvent.click(screen.getByLabelText(/accès Premium commence dès le paiement/));
    await userEvent.click(order);
    expect(JSON.parse(String(fetchSpy.mock.calls[0]![1]!.body))).toEqual({ cgv: true, accesImmediat: true });
    expect(assign).toHaveBeenCalledWith("https://checkout.stripe.com/c/pay/cs_test");
  });

  it("une panne de Stripe est annoncée : rien n’est prétendu payé", async () => {
    signedIn(entitlements());
    mockFetch(502, { error: "stripe-indisponible" });
    render(<SubscribeForm mode="test" />);
    await userEvent.click(screen.getByLabelText(/conditions générales de vente/));
    await userEvent.click(screen.getByLabelText(/accès Premium commence/));
    await userEvent.click(screen.getByRole("button", { name: /Commander/ }));
    expect((await screen.findByRole("alert")).textContent).toMatch(/Aucun paiement n’a été demandé/);
  });
});

describe("abonnement", () => {
  it("propose portail, résiliation et rétractation pendant le délai", () => {
    signedIn(PREMIUM);
    render(<SubscriptionPanel mode="test" justPaid={false} />);
    expect(screen.getByText("Mode test : aucun paiement réel")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Résilier votre contrat" }).getAttribute("href")).toBe("/abonnement/resilier");
    expect(screen.getByRole("link", { name: "Renoncer au contrat ici" }).getAttribute("href")).toBe("/abonnement/retractation");
  });

  it("après le délai de rétractation, seule la résiliation reste proposée", () => {
    signedIn({ ...PREMIUM, startedAt: "2026-01-01T10:00:00Z" });
    render(<SubscriptionPanel mode="test" justPaid={false} />);
    expect(screen.queryByRole("link", { name: "Renoncer au contrat ici" })).toBeNull();
    expect(screen.getByRole("link", { name: "Résilier votre contrat" })).toBeTruthy();
  });

  it("résiliation : récapitulatif puis « Notifier la résiliation » et accusé de réception", async () => {
    signedIn(PREMIUM);
    const fetchSpy = mockFetch(200, { endsAt: "2026-11-24T12:00:00.000Z", notifiedAt: "2026-10-24T12:00:00.000Z" });
    render(<CancelFlow mode="test" />);
    expect(screen.getByText("Récapitulatif de la résiliation")).toBeTruthy();
    expect(screen.getByText(USER.email)).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Notifier la résiliation" }));
    expect(fetchSpy.mock.calls[0]![0]).toBe("/api/paiement/resiliation");
    expect((await screen.findByRole("status")).textContent).toMatch(/Votre contrat prend fin le 24 novembre 2026/);
  });

  it("résiliation refusée par une panne : rien n’est annoncé comme fait", async () => {
    signedIn(PREMIUM);
    mockFetch(502, { error: "stripe-indisponible" });
    render(<CancelFlow mode="test" />);
    await userEvent.click(screen.getByRole("button", { name: "Notifier la résiliation" }));
    expect((await screen.findByRole("alert")).textContent).toMatch(/rien n’a été modifié/);
  });

  it("rétractation : confirmation et remboursement, échec du remboursement signalé", async () => {
    signedIn(PREMIUM);
    mockFetch(200, { refundedCents: 0, refundFailed: true, requestedAt: "2026-10-24T12:00:00.000Z" });
    render(<WithdrawFlow mode="test" />);
    await act(async () => {
      await userEvent.click(screen.getByRole("button", { name: "Confirmer la rétractation" }));
    });
    expect((await screen.findByRole("status")).textContent).toMatch(/n’a PAS été effectué/);
  });

  it("sans paiement configuré : rien à gérer", () => {
    signedIn(entitlements());
    render(<CancelFlow mode="inactif" />);
    expect(screen.getByText(/il n’y a donc rien à gérer/)).toBeTruthy();
  });
});
