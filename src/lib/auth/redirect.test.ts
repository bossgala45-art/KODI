import { describe, expect, it } from "vitest";
import { isConfirmType, safeNextPath } from "@/lib/auth/redirect";

describe("redirection après confirmation", () => {
  it("n’accepte que des chemins internes connus", () => {
    expect(safeNextPath("/reinitialiser-mot-de-passe")).toBe("/reinitialiser-mot-de-passe");
    expect(safeNextPath("/profil")).toBe("/profil");
  });

  it.each(["https://pirate.example", "//pirate.example", "/\\pirate.example", "/admin", "javascript:alert(1)", ""])(
    "bloque la redirection ouverte (%s)",
    (next) => {
      expect(safeNextPath(next)).toBe("/profil");
    },
  );

  it("valide le type de lien", () => {
    expect(isConfirmType("recovery")).toBe(true);
    expect(isConfirmType("email")).toBe(true);
    expect(isConfirmType("magiclink")).toBe(false);
    expect(isConfirmType(null)).toBe(false);
  });
});
