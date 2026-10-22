import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LoginForm, SignupForm } from "@/components/auth-forms";

describe("LoginForm", () => {
  it("affiche les erreurs et place le focus sur le premier champ invalide", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    const email = screen.getByLabelText("Adresse e-mail");
    expect(email.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("Saisissez votre adresse e-mail.")).toBeDefined();
    expect(screen.getByText("Saisissez votre mot de passe.")).toBeDefined();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(document.activeElement).toBe(email);
  });

  it("efface l’erreur d’un champ dès qu’il est modifié", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.click(screen.getByRole("button", { name: "Se connecter" }));
    await user.type(screen.getByLabelText("Adresse e-mail"), "a");
    expect(screen.queryByText("Saisissez votre adresse e-mail.")).toBeNull();
  });

  it("indique honnêtement que les comptes ne sont pas disponibles", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText("Adresse e-mail"), "prenom@domaine.fr");
    await user.type(screen.getByLabelText("Mot de passe"), "secret123");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));
    expect(screen.getByText("Les comptes ne sont pas encore disponibles")).toBeDefined();
  });

  it("affiche et masque le mot de passe", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    const input = screen.getByLabelText("Mot de passe");
    expect(input.getAttribute("type")).toBe("password");
    await user.click(screen.getByRole("button", { name: "Afficher le mot de passe" }));
    expect(input.getAttribute("type")).toBe("text");
    await user.click(screen.getByRole("button", { name: "Masquer le mot de passe" }));
    expect(input.getAttribute("type")).toBe("password");
  });
});

describe("SignupForm", () => {
  it("valide tous les champs requis", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);
    await user.click(screen.getByRole("button", { name: "Créer mon compte" }));
    expect(screen.getByText("Saisissez votre adresse e-mail.")).toBeDefined();
    expect(screen.getByText("Saisissez un mot de passe.")).toBeDefined();
    expect(screen.getByText("Confirmez votre mot de passe.")).toBeDefined();
    expect(screen.getByText("Vous devez accepter les conditions pour continuer.")).toBeDefined();
  });

  it("accepte une saisie valide sans rien envoyer", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);
    await user.type(screen.getByLabelText("Adresse e-mail"), "prenom@domaine.fr");
    await user.type(screen.getByLabelText("Mot de passe"), "motdepasse1");
    await user.type(screen.getByLabelText("Confirmer le mot de passe"), "motdepasse1");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Créer mon compte" }));
    expect(screen.getByText(/Rien n’a été envoyé/)).toBeDefined();
  });
});
