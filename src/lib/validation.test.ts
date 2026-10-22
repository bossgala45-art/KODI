import { describe, expect, it } from "vitest";
import {
  hasErrors,
  validateEmail,
  validateLogin,
  validatePassword,
  validateSignup,
  type SignupInput,
} from "@/lib/validation";

describe("validateEmail", () => {
  it.each(["", "   "])("exige une adresse (%j)", (value) => {
    expect(validateEmail(value)).toBe("Saisissez votre adresse e-mail.");
  });

  it.each(["sans-arobase", "a@b", "a@b.c", "a b@c.fr"])("rejette %s", (value) => {
    expect(validateEmail(value)).toMatch(/invalide/);
  });

  it.each(["prenom@domaine.fr", "  x.y+z@exemple.com  "])("accepte %s", (value) => {
    expect(validateEmail(value)).toBeUndefined();
  });
});

describe("validatePassword", () => {
  it("exige au moins 8 caractères", () => {
    expect(validatePassword("abc1")).toMatch(/8 caractères/);
  });

  it("exige une lettre et un chiffre", () => {
    expect(validatePassword("abcdefgh")).toMatch(/lettre et un chiffre/);
    expect(validatePassword("12345678")).toMatch(/lettre et un chiffre/);
    expect(validatePassword("éléphant9")).toBeUndefined();
  });
});

describe("validateLogin", () => {
  it("signale les deux champs vides", () => {
    const errors = validateLogin({ email: "", password: "" });
    expect(Object.keys(errors).sort()).toEqual(["email", "password"]);
  });

  it("accepte une saisie complète", () => {
    expect(hasErrors(validateLogin({ email: "a@b.fr", password: "x" }))).toBe(false);
  });
});

describe("validateSignup", () => {
  const valid: SignupInput = {
    firstName: "",
    email: "a@b.fr",
    password: "motdepasse1",
    confirmPassword: "motdepasse1",
    acceptTerms: true,
  };

  it("accepte une saisie valide, prénom facultatif", () => {
    expect(hasErrors(validateSignup(valid))).toBe(false);
  });

  it("signale des mots de passe différents", () => {
    expect(validateSignup({ ...valid, confirmPassword: "autre1234" }).confirmPassword).toMatch(
      /ne correspondent pas/,
    );
  });

  it("exige l’acceptation des conditions", () => {
    expect(validateSignup({ ...valid, acceptTerms: false }).acceptTerms).toBeDefined();
  });

  it("limite la longueur du prénom", () => {
    expect(validateSignup({ ...valid, firstName: "x".repeat(31) }).firstName).toBeDefined();
  });
});
