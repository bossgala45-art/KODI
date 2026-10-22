import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";
import { features, phases } from "@/content/project";

describe("Page d’accueil", () => {
  it("affiche un titre principal unique", () => {
    render(<Home />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("indique clairement qu’aucun contenu n’est encore disponible", () => {
    render(<Home />);
    expect(screen.getByRole("note").textContent).toContain(
      "aucune leçon ni question n’est disponible",
    );
  });

  it("n’annonce aucune fonctionnalité comme disponible tant qu’elle ne l’est pas", () => {
    render(<Home />);
    expect(features.every((feature) => feature.status === "planned")).toBe(true);
    expect(screen.queryByText("Disponible")).toBeNull();
    expect(screen.getAllByText("Prévu")).toHaveLength(features.length);
  });

  it("liste toutes les phases et signale la phase en cours", () => {
    render(<Home />);
    const roadmap = screen.getByRole("region", { name: "Avancement" });
    expect(within(roadmap).getAllByRole("listitem")).toHaveLength(phases.length);
    const current = roadmap.querySelectorAll('[aria-current="step"]');
    expect(current).toHaveLength(1);
    expect(within(current[0] as HTMLElement).getByText("En cours")).toBeDefined();
  });

  it("propose des liens d’ancrage vers des sections existantes", () => {
    render(<Home />);
    for (const name of ["Découvrir le programme", "Suivre l’avancement"]) {
      const href = screen.getByRole("link", { name }).getAttribute("href");
      expect(href).toMatch(/^#/);
      expect(document.getElementById(href!.slice(1))).not.toBeNull();
    }
  });
});
