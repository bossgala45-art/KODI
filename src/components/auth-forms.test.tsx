import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForgotPasswordForm, LoginForm, SignupForm } from "@/components/auth-forms";
import * as actions from "@/lib/auth/actions";
import * as config from "@/lib/supabase/config";

const push = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const networkError = {
  ok: false as const,
  error: {
    kind: "network" as const,
    message: "Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.",
    retryable: true,
  },
};

async function fillLogin(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Adresse e-mail"), "prenom@domaine.fr");
  await user.type(screen.getByLabelText("Mot de passe"), "secret123");
  await user.click(screen.getByRole("button", { name: "Se connecter" }));
}

describe("mode local (Supabase non configuré)", () => {
  it("le signale et ne contacte aucun serveur", async () => {
    const spy = vi.spyOn(actions, "signIn");
    const user = userEvent.setup();
    render(<LoginForm />);
    expect(screen.getByText("Mode local")).toBeDefined();
    await fillLogin(user);
    expect(screen.getByText("Comptes non configurés")).toBeDefined();
    expect(spy).not.toHaveBeenCalled();
  });

  it("valide la saisie et place le focus sur le premier champ invalide", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.click(screen.getByRole("button", { name: "Se connecter" }));
    const email = screen.getByLabelText("Adresse e-mail");
    expect(email.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("Saisissez votre mot de passe.")).toBeDefined();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(document.activeElement).toBe(email);
  });

  it("affiche et masque le mot de passe", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    const input = screen.getByLabelText("Mot de passe");
    await user.click(screen.getByRole("button", { name: "Afficher le mot de passe" }));
    expect(input.getAttribute("type")).toBe("text");
  });

  it("l’inscription valide tous les champs requis", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);
    await user.click(screen.getByRole("button", { name: "Créer mon compte" }));
    expect(screen.getByText("Saisissez votre adresse e-mail.")).toBeDefined();
    expect(screen.getByText("Vous devez accepter les conditions pour continuer.")).toBeDefined();
  });
});

describe("Supabase configuré", () => {
  beforeEach(() => {
    vi.spyOn(config, "isSupabaseConfigured").mockReturnValue(true);
  });

  it("connecte puis redirige vers le profil", async () => {
    vi.spyOn(actions, "signIn").mockResolvedValue({ ok: true, value: undefined });
    const user = userEvent.setup();
    render(<LoginForm />);
    await fillLogin(user);
    expect(actions.signIn).toHaveBeenCalledWith("prenom@domaine.fr", "secret123");
    expect(push).toHaveBeenCalledWith("/profil");
  });

  it("affiche l’erreur d’identifiants", async () => {
    vi.spyOn(actions, "signIn").mockResolvedValue({
      ok: false,
      error: { kind: "auth", message: "Adresse e-mail ou mot de passe incorrect.", retryable: false, code: "invalid_credentials" },
    });
    const user = userEvent.setup();
    render(<LoginForm />);
    await fillLogin(user);
    expect(screen.getByRole("alert").textContent).toContain("Adresse e-mail ou mot de passe incorrect.");
  });

  it("propose de renvoyer l’e-mail si l’adresse n’est pas confirmée", async () => {
    vi.spyOn(actions, "signIn").mockResolvedValue({
      ok: false,
      error: { kind: "auth", message: "Adresse non confirmée.", retryable: false, code: "email_not_confirmed" },
    });
    const resend = vi.spyOn(actions, "resendConfirmation").mockResolvedValue({ ok: true, value: undefined });
    const user = userEvent.setup();
    render(<LoginForm />);
    await fillLogin(user);
    await user.click(screen.getByRole("button", { name: "Renvoyer l’e-mail de confirmation" }));
    expect(resend).toHaveBeenCalledWith("prenom@domaine.fr");
    expect(screen.getByText(/E-mail de confirmation renvoyé/)).toBeDefined();
  });

  it("gère une coupure réseau sans perdre la saisie", async () => {
    vi.spyOn(actions, "signIn").mockResolvedValue(networkError);
    const user = userEvent.setup();
    render(<LoginForm />);
    await fillLogin(user);
    expect(screen.getByText("Problème de connexion")).toBeDefined();
    expect(screen.getByLabelText("Adresse e-mail")).toHaveProperty("value", "prenom@domaine.fr");
    expect(screen.getByRole("button", { name: "Se connecter" })).toHaveProperty("disabled", false);
  });

  it("après inscription, demande de confirmer l’adresse", async () => {
    vi.spyOn(actions, "signUp").mockResolvedValue({ ok: true, value: undefined });
    const user = userEvent.setup();
    render(<SignupForm />);
    await user.type(screen.getByLabelText("Adresse e-mail"), "prenom@domaine.fr");
    await user.type(screen.getByLabelText("Mot de passe"), "motdepasse1");
    await user.type(screen.getByLabelText("Confirmer le mot de passe"), "motdepasse1");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Créer mon compte" }));
    expect(screen.getByText("Vérifiez votre boîte de réception")).toBeDefined();
    expect(screen.getByText("prenom@domaine.fr")).toBeDefined();
  });

  it("mot de passe oublié : même message que le compte existe ou non", async () => {
    vi.spyOn(actions, "requestPasswordReset").mockResolvedValue({ ok: true, value: undefined });
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);
    await user.type(screen.getByLabelText("Adresse e-mail"), "inconnu@domaine.fr");
    await user.click(screen.getByRole("button", { name: "Recevoir un lien" }));
    expect(screen.getByText(/Si un compte existe pour cette adresse/)).toBeDefined();
  });
});
