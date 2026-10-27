// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));


const generate = vi.fn();
vi.mock("@/lib/tutor/anthropic", () => ({
  createAnthropicProvider: () => ({ id: "anthropic", label: "IA simulée", generate }),
}));

async function loadRoute() {
  vi.resetModules();
  return import("@/app/api/professeur/route");
}

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new NextRequest("http://localhost/api/professeur", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.7", ...headers },
  });

// Le journal (une ligne JSON par demande) est vérifié dans un test dédié.
beforeEach(() => {
  vi.spyOn(process.stdout, "write").mockImplementation(() => true);
});

afterEach(() => {
  vi.unstubAllEnvs();
  generate.mockReset();
});

describe("POST /api/professeur", () => {
  it("sans fournisseur configuré, répond en mode sans IA avec les explications prédéfinies", async () => {
    const { POST } = await loadRoute();
    const response = await POST(post({ kind: "reformuler-correction", questionId: "ex-001" }));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body).toMatchObject({ mode: "sans-ia", reason: "aucun-fournisseur" });
    expect(body.predefined[0]).toMatchObject({ contentId: "ex-001", status: "a-verifier" });
  });

  it("même avec une IA configurée, aucun appel tant qu’aucun contenu n’est validé", async () => {
    vi.stubEnv("KODI_TUTOR_PROVIDER", "anthropic");
    vi.stubEnv("ANTHROPIC_API_KEY", "cle-de-test");
    vi.stubEnv("KODI_TUTOR_DAILY_BUDGET_USD", "1");
    const { POST } = await loadRoute();
    const question = { kind: "question", message: "Qui a la priorité à droite ?" };
    // Aucun appel, faute de contenu validé.
    expect(await (await POST(post(question))).json()).toMatchObject({ mode: "sans-ia", reason: "aucune-source-fiable" });
    expect(generate).not.toHaveBeenCalled();
  });

  it.each([
    ["JSON invalide", "{", 400],
    ["type inconnu", { kind: "autre", message: "x" }, 400],
    ["champ en trop", { kind: "question", message: "Priorité ?", apiKey: "x" }, 400],
    ["correction sans question", { kind: "reformuler-correction" }, 400],
    ["question vide", { kind: "question", message: " " }, 400],
    ["identifiant suspect", { kind: "reformuler-correction", questionId: "../etc" }, 400],
    ["message trop long", { kind: "question", message: "a".repeat(501) }, 400],
    ["corps trop lourd", JSON.stringify({ kind: "question", message: "a".repeat(5000) }), 413],
  ])("refuse une demande invalide : %s", async (_label, body, status) => {
    const { POST } = await loadRoute();
    expect((await POST(post(body))).status).toBe(status);
  });

  it("exige du JSON", async () => {
    const { POST } = await loadRoute();
    expect((await POST(post("{}", { "content-type": "text/plain" }))).status).toBe(415);
  });

  it("limite la fréquence par client (429 avec Retry-After)", async () => {
    vi.stubEnv("KODI_TUTOR_PER_MINUTE", "2");
    const { POST } = await loadRoute();
    const body = { kind: "question", message: "Qui a la priorité ?" };
    expect((await POST(post(body))).status).toBe(200);
    expect((await POST(post(body))).status).toBe(200);
    const limited = await POST(post(body));
    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toBe("60");
    expect(await limited.json()).toEqual({ error: "trop-de-demandes" });
    // Autre client : non concerné.
    expect((await POST(post(body, { "x-forwarded-for": "198.51.100.2" }))).status).toBe(200);
  });

  it("ne journalise ni le texte, ni l’adresse IP", async () => {
    const write = vi.mocked(process.stdout.write);
    const { POST } = await loadRoute();
    await POST(post({ kind: "question", message: "Mon e-mail : paul@exemple.fr, priorité ?" }));
    const logged = write.mock.calls.map((call) => String(call[0])).join("");
    expect(logged).toContain('"event":"professeur"');
    expect(logged).not.toMatch(/paul|exemple|priorit|203\.0\.113\.7/);
  });
});
