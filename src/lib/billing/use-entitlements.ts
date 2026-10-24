"use client";

import { useSyncExternalStore } from "react";
import { getAuthState, subscribeAuth, type AuthState } from "@/lib/auth/session-store";
import type { Plan } from "@/lib/billing/plans";
import { getBrowserSupabase } from "@/lib/supabase/browser";

/**
 * Droits de la personne, lus dans la base (public.my_entitlements). Sert à
 * l'AFFICHAGE : les ressources du serveur (examens, leçons Premium, IA)
 * vérifient elles-mêmes le droit. Sans compte, l'offre est la gratuite.
 */
export interface Entitlements {
  premium: boolean;
  plan: Plan;
  status: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  startedAt: string | null;
  examsToday: number;
  freeDailyExams: number;
}

export type EntitlementState =
  | { status: "loading" }
  | { status: "sans-compte"; reason: "local" | "deconnecte" }
  | { status: "erreur" }
  | { status: "pret"; entitlements: Entitlements };

const LOADING: EntitlementState = { status: "loading" };
let state: EntitlementState = LOADING;
let forUser: string | null | undefined;
const listeners = new Set<() => void>();

function set(next: EntitlementState) {
  state = next;
  listeners.forEach((listener) => listener());
}

interface RawEntitlements {
  premium: boolean;
  plan: Plan;
  status: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  started_at: string | null;
  exams_today: number;
  free_daily_exams: number;
}

export function parseEntitlements(raw: RawEntitlements): Entitlements {
  return {
    premium: raw.premium === true,
    plan: raw.plan === "premium" ? "premium" : "free",
    status: raw.status,
    currentPeriodEnd: raw.current_period_end,
    cancelAtPeriodEnd: raw.cancel_at_period_end === true,
    startedAt: raw.started_at,
    examsToday: raw.exams_today,
    freeDailyExams: raw.free_daily_exams,
  };
}

async function load(userId: string) {
  const supabase = getBrowserSupabase();
  if (!supabase) return set({ status: "sans-compte", reason: "local" });
  const { data, error } = await supabase.rpc("my_entitlements");
  if (forUser !== userId) return;
  set(error || !data ? { status: "erreur" } : { status: "pret", entitlements: parseEntitlements(data as RawEntitlements) });
}

function sync(auth: AuthState) {
  if (auth.status === "loading") return;
  const userId = auth.status === "signed-in" ? auth.user.id : null;
  if (userId === forUser) return;
  forUser = userId;
  if (auth.status === "local") return set({ status: "sans-compte", reason: "local" });
  if (!userId) return set({ status: "sans-compte", reason: "deconnecte" });
  set(LOADING);
  void load(userId);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const unsubscribe = subscribeAuth(() => sync(getAuthState()));
  sync(getAuthState());
  return () => {
    listeners.delete(listener);
    unsubscribe();
  };
}

/** Relit les droits (après un paiement, une résiliation…). */
export function refreshEntitlements() {
  const userId = forUser;
  if (userId) void load(userId);
}

export function useEntitlements(): EntitlementState {
  return useSyncExternalStore(subscribe, () => state, () => LOADING);
}

export function isPremium(value: EntitlementState): boolean {
  return value.status === "pret" && value.entitlements.premium;
}

/** Pour les tests uniquement. */
export function resetEntitlementsForTests(next: EntitlementState = LOADING, userId: string | null = null) {
  state = next;
  forUser = next.status === "loading" ? undefined : userId;
}
