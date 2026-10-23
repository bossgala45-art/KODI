import { describe, expect, it } from "vitest";
import { buildLock, checkTransitions, contentHash, lockKey } from "@/lib/content/lock";
import { lessonSchema, questionSchema, type Catalog, type ContentQuestion } from "@/lib/content/schema";
import { validateCatalog, type ValidationContext } from "@/lib/content/validate";

const context: ValidationContext = {
  sourceIds: new Set(["src1"]),
  assetExists: (path) => path === "/contenus/ok.svg",
};

function catalog(): Catalog {
  const universes = Array.from({ length: 10 }, (_, i) => ({
    id: `u${String(i + 1).padStart(2, "0")}`,
    status: "a-verifier" as const,
    slug: `univers-${i + 1}`,
    title: `Univers ${i + 1}`,
    description: "",
    position: i + 1,
    plannedLessons: i < 2 ? 8 : 7, // 2 × 8 + 8 × 7 = 72
    sources: ["src1"],
  }));
  return {
    universes,
    competences: [{ id: "c1", status: "a-verifier", universeId: "u01", title: "Compétence", description: "" }],
    lessons: [
      lessonSchema.parse({
        id: "l1",
        status: "brouillon",
        universeId: "u01",
        slug: "lecon",
        title: "Leçon",
        summary: "Résumé",
        position: 1,
        competenceIds: ["c1"],
        sources: ["src1"],
        blocks: [{ type: "text", paragraphs: ["Texte"] }],
      }),
    ],
    questions: [question()],
  };
}

function question(overrides: Partial<ContentQuestion> = {}): ContentQuestion {
  return questionSchema.parse({
    id: "q1",
    status: "a-verifier",
    kind: "single",
    prompt: "Quelle est la bonne réponse ?",
    choices: [
      { id: "a", label: "Oui" },
      { id: "b", label: "Non" },
    ],
    correct: ["a"],
    explanation: "Parce que.",
    sources: ["src1"],
    competenceIds: ["c1"],
    ...overrides,
  });
}

describe("validation du catalogue", () => {
  it("accepte un catalogue cohérent", () => {
    expect(validateCatalog(catalog(), context)).toEqual([]);
  });

  it("exige 10 univers et 72 leçons prévues", () => {
    const c = catalog();
    c.universes.pop();
    const errors = validateCatalog(c, context);
    expect(errors).toContain("univers : 10 univers attendus, 9 trouvés");
    expect(errors.some((e) => e.includes("72 leçons prévues au total, 65 déclarées"))).toBe(true);
  });

  it("refuse une démonstration validée ou à l’examen", () => {
    const c = catalog();
    c.questions = [question({ demo: true, status: "valide", review: { by: "X", at: "2026-10-22" }, examEligible: true })];
    c.competences[0]!.status = "valide";
    c.competences[0]!.review = { by: "X", at: "2026-10-22" };
    const errors = validateCatalog(c, context);
    expect(errors).toContain("question q1 : un contenu de démonstration ne peut pas être validé");
    expect(errors).toContain("question q1 : une question de démonstration n’entre pas dans l’examen blanc");
  });

  it("exige une relecture et une source pour valider", () => {
    const c = catalog();
    c.questions = [question({ status: "valide" })];
    const errors = validateCatalog(c, context);
    expect(errors).toContain("question q1 : un contenu validé doit indiquer sa relecture (review.by et review.at)");
    expect(errors).toContain("question q1 : validée alors que la compétence « c1 » ne l’est pas");

    c.questions = [question({ sources: [] })];
    expect(validateCatalog(c, context)).toContain(
      "question q1 : une question à vérifier ou validée cite au moins une source",
    );
  });

  it("signale références, sources et fichiers inconnus", () => {
    const c = catalog();
    c.questions = [question({ competenceIds: ["c-inconnue"], lessonId: "l-inconnue", sources: ["inconnue"] })];
    c.lessons[0]!.blocks.push({
      type: "image",
      src: "/contenus/absent.svg",
      alt: "Schéma",
      credit: "KODI",
      width: 10,
      height: 10,
    });
    const errors = validateCatalog(c, context);
    expect(errors).toContain("question q1 : compétence inconnue « c-inconnue »");
    expect(errors).toContain("question q1 : leçon inconnue « l-inconnue »");
    expect(errors).toContain("question q1 : source inconnue « inconnue »");
    expect(errors).toContain("leçon l1, bloc 2 : fichier introuvable dans public : /contenus/absent.svg");
  });

  it("vérifie la forme des questions à réponse unique et multiple", () => {
    const c = catalog();
    c.questions = [
      question({ id: "q-unique", kind: "single", correct: ["a", "b"] }),
      question({
        id: "q-multiple",
        kind: "multiple",
        correct: ["a"],
        choices: [
          { id: "a", label: "A" },
          { id: "b", label: "B" },
          { id: "c", label: "C" },
        ],
      }),
    ];
    const errors = validateCatalog(c, context);
    expect(errors.some((e) => e.startsWith("question q-unique :"))).toBe(true);
    expect(errors.some((e) => e.startsWith("question q-multiple :"))).toBe(true);
  });

  it("refuse plus de leçons actives que prévu dans un univers", () => {
    const c = catalog();
    const base = c.lessons[0]!;
    c.lessons = Array.from({ length: 9 }, (_, i) => ({ ...base, id: `l${i}`, slug: `l${i}`, position: i + 1 }));
    expect(validateCatalog(c, context)).toContain("univers u01 : 9 leçons pour 8 prévues");
  });
});

describe("schéma des blocs de leçon", () => {
  const lesson = (blocks: unknown[]) =>
    lessonSchema.safeParse({
      id: "l1",
      status: "brouillon",
      universeId: "u01",
      slug: "l",
      title: "L",
      summary: "R",
      position: 1,
      competenceIds: ["c1"],
      blocks,
    });

  it("accepte texte, image, vidéo à produire et simulation", () => {
    expect(
      lesson([
        { type: "text", paragraphs: ["Bonjour"] },
        { type: "image", src: "/contenus/a.svg", alt: "A", credit: "KODI", width: 1, height: 1 },
        { type: "video", title: "V", transcript: "Transcription", toProduce: true },
        { type: "simulation", sceneSlug: "scene", camera: "aerienne", instructions: "Observez." },
      ]).success,
    ).toBe(true);
  });

  it("exige l’origine des images et la transcription des vidéos", () => {
    expect(lesson([{ type: "image", src: "/contenus/a.svg", alt: "A", width: 1, height: 1 }]).success).toBe(false);
    expect(lesson([{ type: "video", title: "V", toProduce: true }]).success).toBe(false);
    expect(lesson([{ type: "video", title: "V", transcript: "T", src: "/contenus/v.mp4" }]).success).toBe(false);
    expect(lesson([{ type: "video", title: "V", transcript: "T" }]).success).toBe(false);
  });
});

describe("statuts et transitions", () => {
  const withStatus = (status: ContentQuestion["status"], prompt = "Quelle est la bonne réponse ?") => {
    const c = catalog();
    c.questions = [
      question({ status, prompt, ...(status === "valide" ? { review: { by: "Relecteur", at: "2026-10-22" } } : {}) }),
    ];
    return c;
  };
  const key = lockKey("question", "q1");

  it("un nouveau contenu commence en brouillon ou à vérifier", () => {
    expect(checkTransitions({}, withStatus("brouillon"))).toEqual([]);
    expect(checkTransitions({}, withStatus("a-verifier"))).toEqual([]);
    expect(checkTransitions({}, withStatus("valide"))[0]).toContain(key);
  });

  it("n’autorise que les transitions prévues", () => {
    const lockOf = (status: ContentQuestion["status"]) => buildLock(withStatus(status));
    expect(checkTransitions(lockOf("a-verifier"), withStatus("valide"))).toEqual([]);
    expect(checkTransitions(lockOf("valide"), withStatus("retire"))).toEqual([]);
    expect(checkTransitions(lockOf("retire"), withStatus("brouillon"))).toEqual([]);
    expect(checkTransitions(lockOf("brouillon"), withStatus("valide"))).toEqual([
      `${key} : passage de « brouillon » à « valide » interdit`,
    ]);
    expect(checkTransitions(lockOf("retire"), withStatus("valide"))).toHaveLength(1);
  });

  it("un contenu validé modifié doit repasser en relecture", () => {
    const lock = buildLock(withStatus("valide"));
    expect(checkTransitions(lock, withStatus("valide", "Énoncé corrigé sans relecture ?"))[0]).toContain(
      "repassez-le « a-verifier »",
    );
    expect(checkTransitions(lock, withStatus("a-verifier", "Énoncé corrigé sans relecture ?"))).toEqual([]);
  });

  it("un contenu validé ne se supprime pas", () => {
    const lock = buildLock(withStatus("valide"));
    const c = catalog();
    c.questions = [];
    expect(checkTransitions(lock, c)).toContain(`${key} : un contenu validé ne se supprime pas, il se retire (statut « retire »)`);
  });

  it("l’empreinte ignore le statut et la relecture, pas le contenu", () => {
    const a = question();
    expect(contentHash({ ...a, status: "valide", review: { by: "X", at: "2026-10-22" } })).toBe(contentHash(a));
    expect(contentHash({ ...a, explanation: "Autre." })).not.toBe(contentHash(a));
  });
});
