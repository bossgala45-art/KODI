import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TutorPanel } from "@/components/tutor";
import type { TutorResponse, TutorStatus } from "@/lib/tutor/types";

const SANS_IA: TutorStatus = { mode: "sans-ia", providerLabel: null, validatedContents: 0 };
const LESSONS = [{ id: "l-prio", title: "Priorité à droite" }];

const predefined = [
  {
    contentKind: "question" as const,
    contentId: "ex-001",
    title: "J’arrive à une intersection…",
    paragraphs: ["Correction : on cède le passage à droite."],
    status: "a-verifier" as const,
    demo: false,
    sources: [{ label: "Sécurité routière", url: "https://example.org" }],
  },
];

function mockFetch(status: number, body: unknown) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }),
  );
}

describe("TutorPanel", () => {
  it("annonce clairement le mode sans IA générative", () => {
    render(<TutorPanel status={SANS_IA} question={null} lessons={LESSONS} />);
    expect(screen.getByRole("note").textContent).toMatch(/Mode sans IA générative.*Aucun service d’IA n’est connecté/);
    expect(screen.queryByText(/générée par IA/)).toBeNull();
  });

  it("affiche les explications prédéfinies avec leur statut, sans prétendre à une IA", async () => {
    const response: TutorResponse = {
      mode: "sans-ia",
      reason: "aucun-fournisseur",
      notice: "Mode sans IA générative : aucun service d’IA n’est connecté à KODI.",
      predefined,
    };
    const fetchSpy = mockFetch(200, response);
    render(<TutorPanel status={SANS_IA} question={null} lessons={LESSONS} />);
    const send = screen.getByRole("button", { name: "Demander au professeur" });
    expect((send as HTMLButtonElement).disabled).toBe(true);
    await userEvent.type(screen.getByLabelText("Votre question"), "Qui passe en premier ?");
    await userEvent.click(send);

    expect(await screen.findByText("Réponse sans IA générative")).toBeTruthy();
    expect(screen.getByText("Correction : on cède le passage à droite.")).toBeTruthy();
    expect(screen.getByText("À vérifier")).toBeTruthy();
    expect(screen.queryByText(/générée par IA/)).toBeNull();
    expect(JSON.parse(String(fetchSpy.mock.calls[0]![1]!.body))).toEqual({ kind: "question", message: "Qui passe en premier ?" });
  });

  it("depuis une correction, propose de la reformuler et envoie l’identifiant de la question", async () => {
    const fetchSpy = mockFetch(200, { mode: "sans-ia", reason: "aucun-fournisseur", notice: "x", predefined: [] });
    render(
      <TutorPanel
        status={SANS_IA}
        question={{ id: "ex-001", prompt: "J’arrive à une intersection…", status: "a-verifier", demo: false }}
        lessons={LESSONS}
      />,
    );
    expect((screen.getByLabelText("Reformuler une correction") as HTMLInputElement).checked).toBe(true);
    await userEvent.click(screen.getByRole("button", { name: "Demander au professeur" }));
    expect(JSON.parse(String(fetchSpy.mock.calls[0]![1]!.body))).toEqual({
      kind: "reformuler-correction",
      message: "",
      questionId: "ex-001",
    });
    expect(await screen.findByText("Aucune explication ne correspond")).toBeTruthy();
  });

  it("explique une règle à partir de la leçon choisie", async () => {
    const fetchSpy = mockFetch(200, { mode: "sans-ia", reason: "aucun-fournisseur", notice: "x", predefined });
    render(<TutorPanel status={SANS_IA} question={null} lessons={LESSONS} />);
    await userEvent.click(screen.getByLabelText("Expliquer une règle"));
    expect(screen.getByLabelText("Règle à expliquer")).toBeTruthy();
    await userEvent.click(screen.getByRole("button", { name: "Demander au professeur" }));
    expect(JSON.parse(String(fetchSpy.mock.calls[0]![1]!.body))).toMatchObject({ kind: "expliquer-regle", lessonId: "l-prio" });
  });

  it("signale une réponse générée par IA, avec ses références", async () => {
    mockFetch(200, {
      mode: "ia",
      provider: "IA de test",
      text: "On cède le passage à droite [S1].",
      citations: [{ ref: "S1", title: "Priorité à droite", sources: [{ label: "Sécurité routière", url: "https://example.org" }] }],
      predefined,
    } satisfies TutorResponse);
    const status: TutorStatus = { mode: "ia", providerLabel: "IA de test", validatedContents: 3 };
    render(<TutorPanel status={status} question={null} lessons={LESSONS} />);
    expect(screen.getByRole("note").textContent).toMatch(/IA générative connectée : IA de test/);
    await userEvent.type(screen.getByLabelText("Votre question"), "Priorité ?");
    await userEvent.click(screen.getByRole("button", { name: "Demander au professeur" }));
    expect(await screen.findByText("Réponse générée par IA · IA de test")).toBeTruthy();
    expect(screen.getByText("[S1]")).toBeTruthy();
  });

  it.each([
    [429, "Trop de demandes en une minute"],
    [400, "La demande n’a pas pu être traitée"],
  ])("affiche une erreur compréhensible (HTTP %s)", async (status, message) => {
    mockFetch(status, { error: "x" });
    render(<TutorPanel status={SANS_IA} question={null} lessons={LESSONS} />);
    await userEvent.type(screen.getByLabelText("Votre question"), "Priorité ?");
    await userEvent.click(screen.getByRole("button", { name: "Demander au professeur" }));
    expect((await screen.findByRole("alert")).textContent).toContain(message);
  });

  it("signale l’absence de réseau", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));
    render(<TutorPanel status={SANS_IA} question={null} lessons={LESSONS} />);
    await userEvent.type(screen.getByLabelText("Votre question"), "Priorité ?");
    await userEvent.click(screen.getByRole("button", { name: "Demander au professeur" }));
    expect((await screen.findByRole("alert")).textContent).toContain("injoignable");
  });
});
