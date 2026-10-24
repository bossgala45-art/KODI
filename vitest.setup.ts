import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach } from "vitest";

// jsdom n'implémente pas matchMedia : stub par défaut (système en clair),
// que chaque test peut surcharger avec vi.spyOn(window, "matchMedia").
beforeEach(() => {
  // Tests côté serveur (environnement node) : pas de navigateur simulé.
  if (typeof window === "undefined") return;
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string): MediaQueryList =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList,
  });
});

afterEach(() => {
  if (typeof window === "undefined") return;
  cleanup();
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-motion");
  document.documentElement.style.colorScheme = "";
});
