"use client";

import { useSyncExternalStore } from "react";
import type { LocalStore } from "@/lib/local-store";

/** Lit un magasin local ; renvoie sa valeur par défaut pendant le rendu serveur. */
export function useStore<T>(store: LocalStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, () => store.fallback);
}

const noopSubscribe = () => () => {};

/**
 * Faux pendant le rendu serveur et l'hydratation, vrai ensuite. Permet
 * d'afficher un état de chargement à la place des données locales tant
 * qu'elles ne sont pas lisibles.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
