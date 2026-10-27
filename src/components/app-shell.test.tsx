import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "@/components/app-shell";

const pathname = vi.hoisted(() => ({ value: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.value }));

describe("AppShell", () => {
  it("affiche cinq onglets et marque la page courante", () => {
    pathname.value = "/simuler";
    render(<AppShell>contenu</AppShell>);
    // Barre d'onglets mobile : la navigation qui contient exactement cinq liens
    // (la barre latérale grand écran ajoute les entrées secondaires).
    const tabBar = screen
      .getAllByRole("navigation", { name: "Navigation principale" })
      .find((nav) => within(nav).getAllByRole("link").length === 5);
    expect(tabBar).toBeDefined();
    const links = within(tabBar as HTMLElement).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "Accueil",
      "Apprendre",
      "Simuler",
      "S’entraîner",
      "Progression",
    ]);
    const current = links.filter((link) => link.getAttribute("aria-current") === "page");
    expect(current.map((link) => link.textContent)).toEqual(["Simuler"]);
  });

  it("donne accès au profil et aux révisions, sans offre payante", () => {
    pathname.value = "/";
    render(<AppShell>contenu</AppShell>);
    expect(screen.getAllByRole("link", { name: "Profil et paramètres" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /Révisions/ }).length).toBeGreaterThan(0);
    expect(screen.queryAllByRole("link", { name: /Premium/ })).toHaveLength(0);
    expect(screen.getByRole("main").textContent).toBe("contenu");
  });
});
