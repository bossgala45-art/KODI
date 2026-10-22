import { describe, expect, it, vi } from "vitest";
import { createLocalStore, isStorageAvailable } from "@/lib/local-store";

function makeStore() {
  return createLocalStore<{ n: number }>({
    key: "test-store",
    fallback: { n: 0 },
    parse: (raw) => {
      const value = JSON.parse(raw) as unknown;
      return typeof value === "object" && value !== null && "n" in value
        ? (value as { n: number })
        : null;
    },
    serialize: (value) => JSON.stringify(value),
  });
}

describe("createLocalStore", () => {
  it("renvoie la valeur par défaut sans donnée enregistrée", () => {
    expect(makeStore().get()).toEqual({ n: 0 });
  });

  it("renvoie la même référence tant que la donnée ne change pas", () => {
    const store = makeStore();
    store.set({ n: 1 });
    expect(store.get()).toBe(store.get());
  });

  it("enregistre, met à jour par fonction et notifie les abonnés", () => {
    const store = makeStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.set({ n: 1 });
    store.set((previous) => ({ n: previous.n + 1 }));
    expect(store.get()).toEqual({ n: 2 });
    expect(window.localStorage.getItem("test-store")).toBe('{"n":2}');
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    store.set({ n: 3 });
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("revient à la valeur par défaut si la donnée est corrompue", () => {
    window.localStorage.setItem("test-store", '"texte"');
    expect(makeStore().get()).toEqual({ n: 0 });
  });

  it("efface la donnée avec reset", () => {
    const store = makeStore();
    store.set({ n: 5 });
    store.reset();
    expect(window.localStorage.getItem("test-store")).toBeNull();
    expect(store.get()).toEqual({ n: 0 });
  });

  it("reste utilisable en mémoire si le stockage est bloqué", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    const store = makeStore();
    expect(() => store.set({ n: 7 })).not.toThrow();
    expect(store.get()).toEqual({ n: 7 });
    expect(isStorageAvailable()).toBe(false);
  });

  it("réagit aux modifications faites dans un autre onglet", () => {
    const store = makeStore();
    const listener = vi.fn();
    store.subscribe(listener);
    window.dispatchEvent(new StorageEvent("storage", { key: "test-store" }));
    window.dispatchEvent(new StorageEvent("storage", { key: "autre-cle" }));
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
