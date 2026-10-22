import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { THEME_STORAGE_KEY } from "@/lib/theme";

describe("ThemeSwitcher", () => {
  it("propose les trois thèmes, « Auto » par défaut", () => {
    render(<ThemeSwitcher />);
    expect(screen.getByRole("group", { name: "Thème d’affichage" })).toBeDefined();
    expect(screen.getByRole("radio", { name: "Auto" })).toHaveProperty("checked", true);
    expect(screen.getByRole("radio", { name: "Clair" })).toHaveProperty("checked", false);
    expect(screen.getByRole("radio", { name: "Sombre" })).toHaveProperty("checked", false);
  });

  it("applique et mémorise le thème sombre", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    await user.click(screen.getByRole("radio", { name: "Sombre" }));

    expect(screen.getByRole("radio", { name: "Sombre" })).toHaveProperty("checked", true);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("revient au mode auto en effaçant le choix enregistré", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");
    render(<ThemeSwitcher />);
    expect(screen.getByRole("radio", { name: "Sombre" })).toHaveProperty("checked", true);

    await user.click(screen.getByRole("radio", { name: "Auto" }));

    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
    expect(document.documentElement.dataset.theme).toBe("light");
  });
});
