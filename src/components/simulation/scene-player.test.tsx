import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScenePlayer, resetWebGLDetection } from "@/components/simulation/scene-player";
import { INTERSECTION_SANS_SIGNALISATION as scene } from "@/content/scenes/intersection-sans-signalisation";
import { answerHistoryStore } from "@/lib/pedagogy/history";

class FakeAudioContext {
  static created = 0;
  sampleRate = 8000;
  currentTime = 0;
  destination = {};
  state = "running";
  constructor() {
    FakeAudioContext.created += 1;
  }
  private node() {
    const node = {
      connect: () => node,
      start: vi.fn(),
      gain: { value: 0, setTargetAtTime: vi.fn() },
      frequency: { value: 0, setTargetAtTime: vi.fn() },
      type: "",
      buffer: null as unknown,
      loop: false,
    };
    return node;
  }
  createGain = () => this.node();
  createOscillator = () => this.node();
  createBiquadFilter = () => this.node();
  createBufferSource = () => this.node();
  createBuffer = (_c: number, length: number) => ({ length, copyToChannel: vi.fn() });
  resume = vi.fn(() => Promise.resolve());
  suspend = vi.fn(() => Promise.resolve());
  close = vi.fn(() => Promise.resolve());
}

beforeEach(() => {
  resetWebGLDetection();
  // jsdom n'a pas de WebGL : la version 2D doit prendre le relais.
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  vi.stubGlobal("AudioContext", FakeAudioContext);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("lecteur de scène", () => {
  it("passe en 2D sans WebGL, en le disant, et signale les éléments provisoires", () => {
    render(<ScenePlayer scene={scene} />);
    expect(screen.getByText(/WebGL indisponible/)).toBeDefined();
    expect(screen.getByRole("img", { name: "Vue 2D de dessus de la scène" })).toBeDefined();
    expect(screen.getByText("Éléments provisoires")).toBeDefined();
    expect(screen.getByText(/formes géométriques simples/)).toBeDefined();
    expect(screen.queryByText("Revenir à la 3D")).toBeNull();
  });

  it("synchronise sous-titres et positions avec le temps, de façon reproductible", () => {
    const { container } = render(<ScenePlayer scene={scene} />);
    const range = screen.getByRole("slider", { name: "Position dans la scène" });
    fireEvent.change(range, { target: { value: "5" } });
    expect(screen.getByTestId("sous-titre").textContent).toMatch(/voiture verte arrive de votre droite/);
    const positions = () => [...container.querySelectorAll("svg g[transform]")].map((g) => g.getAttribute("transform"));
    const first = positions();
    fireEvent.change(range, { target: { value: "12" } });
    expect(positions()).not.toEqual(first);
    fireEvent.change(range, { target: { value: "5" } });
    expect(positions()).toEqual(first);
    expect(screen.getByText("5,0 s")).toBeDefined();
  });

  it("désactive et réactive les sous-titres", async () => {
    const user = userEvent.setup();
    render(<ScenePlayer scene={scene} />);
    expect(screen.getByTestId("sous-titre")).toBeDefined();
    await user.click(screen.getByRole("button", { name: /Sous-titres : activés/ }));
    expect(screen.queryByTestId("sous-titre")).toBeNull();
    await user.click(screen.getByRole("button", { name: /Sous-titres : désactivés/ }));
    expect(screen.getByTestId("sous-titre")).toBeDefined();
  });

  it("active les sons seulement à la demande", async () => {
    const user = userEvent.setup();
    FakeAudioContext.created = 0;
    render(<ScenePlayer scene={scene} />);
    expect(FakeAudioContext.created).toBe(0);
    const button = screen.getByRole("button", { name: /Sons : désactivés/ });
    await user.click(button);
    expect(FakeAudioContext.created).toBe(1);
    expect(screen.getByRole("button", { name: /Sons : activés/ }).getAttribute("aria-pressed")).toBe("true");
    await user.click(screen.getByRole("button", { name: /Sons : activés/ }));
    expect(screen.getByRole("button", { name: /Sons : désactivés/ })).toBeDefined();
  });

  it("explique l’élément sélectionné", async () => {
    const user = userEvent.setup();
    render(<ScenePlayer scene={scene} />);
    await user.click(screen.getByRole("button", { name: "Voiture verte" }));
    expect(screen.getByText(/Elle arrive par votre droite/)).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Plaque de rue" }));
    expect(screen.getByText(/n’indique aucune règle de priorité/)).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Plaque de rue" }));
    expect(screen.queryByText(/n’indique aucune règle de priorité/)).toBeNull();
  });

  it("pose la question, corrige, puis propose de revoir l’explication animée", async () => {
    answerHistoryStore.reset();
    const user = userEvent.setup();
    render(<ScenePlayer scene={scene} />);
    await user.click(screen.getByRole("checkbox", { name: /Céder le passage à la voiture qui vient de ma droite/ }));
    await user.click(screen.getByRole("button", { name: "Valider" }));
    expect(screen.getByText("Ce n’est pas la bonne réponse.")).toBeDefined();
    expect(screen.getByText("Bonne(s) réponse(s) oubliée(s) : B")).toBeDefined();
    expect(screen.getByText(/R415-5/)).toBeDefined();
    await user.click(screen.getByRole("button", { name: /Voir le bilan/ }));
    await user.click(screen.getByRole("button", { name: /Revoir l’explication animée/ }));
    expect(screen.getByRole("button", { name: /Pause/ })).toBeDefined();
    expect(answerHistoryStore.get().map((r) => [r.questionId, r.correct])).toEqual([["q-sim-001", false]]);
  });
});
