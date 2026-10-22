"use client";

import type { Session } from "@supabase/supabase-js";
import { useSyncExternalStore } from "react";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export interface AuthUser {
  id: string;
  email: string;
}

export type AuthState =
  | { status: "local" } // Supabase non configuré : mode local
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "signed-in"; user: AuthUser };

const LOADING: AuthState = { status: "loading" };
let state: AuthState = LOADING;
let started = false;
const listeners = new Set<() => void>();

function set(next: AuthState): void {
  state = next;
  listeners.forEach((listener) => listener());
}

function fromSession(session: Session | null): AuthState {
  if (!session?.user) return { status: "signed-out" };
  return { status: "signed-in", user: { id: session.user.id, email: session.user.email ?? "" } };
}

function stateKey(value: AuthState): string {
  return value.status === "signed-in" ? `signed-in:${value.user.id}` : value.status;
}

function start(): void {
  if (started) return;
  started = true;
  const supabase = getBrowserSupabase();
  if (!supabase) {
    set({ status: "local" });
    return;
  }
  supabase.auth.onAuthStateChange((_event, session) => {
    const next = fromSession(session);
    // Un simple rafraîchissement de jeton ne change pas l'état affiché.
    if (stateKey(next) !== stateKey(state)) set(next);
  });
  supabase.auth.getSession().then(
    ({ data }) => set(fromSession(data.session)),
    () => set({ status: "signed-out" }),
  );
}

function subscribe(listener: () => void): () => void {
  start();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Abonnement à l'état d'authentification (hors React). */
export const subscribeAuth = subscribe;

export function getAuthState(): AuthState {
  return state;
}

export function useAuth(): AuthState {
  return useSyncExternalStore(subscribe, getAuthState, () => LOADING);
}

/** Pour les tests uniquement. */
export function resetAuthStoreForTests(next: AuthState = LOADING): void {
  state = next;
  started = next.status !== "loading";
}
