"use client";

import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { createLocalStore, isRecord, parseJson } from "@/lib/local-store";
import { historyStore } from "@/lib/history";
import { answerHistoryStore } from "@/lib/pedagogy/history";
import { lessonProgressStore } from "@/lib/pedagogy/progress";
import { profileStore, type LocalProfile } from "@/lib/profile";
import { getAuthState, subscribeAuth } from "@/lib/auth/session-store";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { isNetworkError, unwrapRow, withNetworkRetry } from "@/lib/supabase/errors";
import {
  decideFirstLink,
  decideSync,
  preferencesFromRow,
  profileFromRow,
  profileToRow,
  sameProfile,
  type PreferencesRow,
  type ProfileRow,
  type ResourceSyncState,
} from "@/lib/sync/merge";
import { syncLearning, type LearningStorage } from "@/lib/sync/learning";
import {
  motionStore,
  setMotionPreference,
  setThemePreference,
  themeStore,
} from "@/lib/theme-store";

// ---------------------------------------------------------------------------
// État de synchronisation conservé sur l'appareil
// ---------------------------------------------------------------------------
interface SyncMeta {
  /** Compte auquel cet appareil a été rattaché pour la dernière fois. */
  userId: string | null;
  profile: ResourceSyncState;
  preferences: ResourceSyncState;
  /** Dernière modification locale de la progression pas encore envoyée. */
  learningChangedAt: string | null;
}

const EMPTY_STATE: ResourceSyncState = { localChangedAt: null, remoteUpdatedAt: null };
const EMPTY_META: SyncMeta = { userId: null, profile: EMPTY_STATE, preferences: EMPTY_STATE, learningChangedAt: null };

function parseState(value: unknown): ResourceSyncState {
  if (!isRecord(value)) return EMPTY_STATE;
  const str = (v: unknown) => (typeof v === "string" ? v : null);
  return { localChangedAt: str(value.localChangedAt), remoteUpdatedAt: str(value.remoteUpdatedAt) };
}

export const syncMetaStore = createLocalStore<SyncMeta>({
  key: "kodi-sync",
  fallback: EMPTY_META,
  parse: (raw) => {
    const data = parseJson(raw);
    if (!isRecord(data)) return null;
    return {
      userId: typeof data.userId === "string" ? data.userId : null,
      profile: parseState(data.profile),
      preferences: parseState(data.preferences),
      learningChangedAt: typeof data.learningChangedAt === "string" ? data.learningChangedAt : null,
    };
  },
  serialize: (value) => JSON.stringify(value),
});

// ---------------------------------------------------------------------------
// Statut affiché dans l'interface
// ---------------------------------------------------------------------------
export type SyncStatus =
  | { state: "local" }
  | { state: "signed-out" }
  | { state: "syncing" }
  | { state: "synced"; at: string }
  | { state: "pending" }
  | { state: "offline" }
  | { state: "error" };

let status: SyncStatus = { state: "signed-out" };
const statusListeners = new Set<() => void>();

function setStatus(next: SyncStatus): void {
  status = next;
  statusListeners.forEach((listener) => listener());
}

export function getSyncStatus(): SyncStatus {
  return status;
}

export function subscribeSyncStatus(listener: () => void): () => void {
  statusListeners.add(listener);
  return () => statusListeners.delete(listener);
}

// ---------------------------------------------------------------------------
// Moteur
// ---------------------------------------------------------------------------
type Resource = "profile" | "preferences";

let supabase: SupabaseClient | null = null;
let userId: string | null = null;
let channel: RealtimeChannel | null = null;
let applyingRemote = false;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let lastProfile: LocalProfile = profileStore.fallback;
let syncing: Promise<void> | null = null;

function updateMeta(resource: Resource, patch: Partial<ResourceSyncState>): void {
  syncMetaStore.set((meta) => ({ ...meta, [resource]: { ...meta[resource], ...patch } }));
}

function hasPending(): boolean {
  const meta = syncMetaStore.get();
  return Boolean(meta.profile.localChangedAt || meta.preferences.localChangedAt || meta.learningChangedAt);
}

const learningStorage: LearningStorage = {
  read: () => ({ answers: answerHistoryStore.get(), lessons: lessonProgressStore.get(), sessions: historyStore.get() }),
  write: (state) =>
    withRemote(() => {
      answerHistoryStore.set(state.answers);
      lessonProgressStore.set(state.lessons);
      historyStore.set(state.sessions);
    }),
};

function withRemote(apply: () => void): void {
  applyingRemote = true;
  try {
    apply();
  } finally {
    applyingRemote = false;
  }
}

function applyProfile(row: ProfileRow): void {
  withRemote(() => profileStore.set((current) => profileFromRow(row, current)));
  lastProfile = profileStore.get();
  updateMeta("profile", { localChangedAt: null, remoteUpdatedAt: row.updated_at });
}

function applyPreferences(row: PreferencesRow): void {
  const next = preferencesFromRow(row, { theme: themeStore.get(), motion: motionStore.get() });
  withRemote(() => {
    setThemePreference(next.theme);
    setMotionPreference(next.motion);
  });
  updateMeta("preferences", { localChangedAt: null, remoteUpdatedAt: row.updated_at });
}

async function pushProfile(client: SupabaseClient, uid: string): Promise<void> {
  const row = unwrapRow(
    await client
      .from("profiles")
      .update(profileToRow(profileStore.get()))
      .eq("id", uid)
      .select("updated_at")
      .single<{ updated_at: string }>(),
  );
  updateMeta("profile", { localChangedAt: null, remoteUpdatedAt: row.updated_at });
}

async function pushPreferences(client: SupabaseClient, uid: string): Promise<void> {
  const row = unwrapRow(
    await client
      .from("preferences")
      .update({ theme: themeStore.get(), motion: motionStore.get() })
      .eq("user_id", uid)
      .select("updated_at")
      .single<{ updated_at: string }>(),
  );
  updateMeta("preferences", { localChangedAt: null, remoteUpdatedAt: row.updated_at });
}

async function runFullSync(client: SupabaseClient, uid: string): Promise<void> {
  setStatus({ state: "syncing" });
  try {
    const [profile, preferences] = await withNetworkRetry(async () =>
      Promise.all([
        client
          .from("profiles")
          .select("first_name, daily_goal, onboarding_completed, created_at, updated_at")
          .eq("id", uid)
          .single<ProfileRow>()
          .then(unwrapRow),
        client
          .from("preferences")
          .select("theme, motion, updated_at")
          .eq("user_id", uid)
          .single<PreferencesRow>()
          .then(unwrapRow),
      ]),
    );

    const meta = syncMetaStore.get();
    // Appareil déjà rattaché à un autre compte : sa progression locale n'est jamais envoyée.
    const learningMode = meta.userId !== null && meta.userId !== uid ? "replace" : "merge";
    if (meta.userId !== uid) {
      // Premier rattachement de cet appareil à ce compte. Les données locales
      // ne sont adoptées que si l'appareil n'a jamais servi à un autre compte.
      const adopt = meta.userId === null && decideFirstLink(profile) === "adopt-local";
      syncMetaStore.set({ ...EMPTY_META, userId: uid });
      if (adopt) {
        await pushProfile(client, uid);
        await pushPreferences(client, uid);
      } else {
        applyProfile(profile);
        applyPreferences(preferences);
      }
    } else {
      const profileDecision = decideSync(meta.profile, profile.updated_at);
      if (profileDecision === "push") await pushProfile(client, uid);
      if (profileDecision === "pull") applyProfile(profile);

      const prefDecision = decideSync(meta.preferences, preferences.updated_at);
      if (prefDecision === "push") await pushPreferences(client, uid);
      if (prefDecision === "pull") applyPreferences(preferences);
    }
    const learningStartedAt = syncMetaStore.get().learningChangedAt;
    await withNetworkRetry(() => syncLearning(client, uid, learningStorage, learningMode));
    // Une modification arrivée pendant l'envoi reste en attente.
    if (syncMetaStore.get().learningChangedAt === learningStartedAt) {
      syncMetaStore.set((current) => ({ ...current, learningChangedAt: null }));
    }
    setStatus({ state: "synced", at: new Date().toISOString() });
  } catch (error) {
    setStatus(isNetworkError(error) ? { state: "offline" } : { state: "error" });
  }
}

/** Synchronisation complète (sans exécutions concurrentes). */
export function syncNow(): Promise<void> {
  if (!supabase || !userId) return Promise.resolve();
  const client = supabase;
  const uid = userId;
  syncing ??= runFullSync(client, uid).finally(() => {
    syncing = null;
  });
  return syncing;
}

function schedulePush(): void {
  if (!userId) return;
  setStatus({ state: "pending" });
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setStatus({ state: "offline" });
      return;
    }
    void syncNow();
  }, 800);
}

function onLocalProfileChange(): void {
  const current = profileStore.get();
  if (applyingRemote || sameProfile(current, lastProfile)) return;
  lastProfile = current;
  updateMeta("profile", { localChangedAt: new Date().toISOString() });
  schedulePush();
}

function onLocalLearningChange(): void {
  if (applyingRemote) return;
  syncMetaStore.set((meta) => ({ ...meta, learningChangedAt: new Date().toISOString() }));
  schedulePush();
}

function onLocalPreferencesChange(): void {
  if (applyingRemote) return;
  updateMeta("preferences", { localChangedAt: new Date().toISOString() });
  schedulePush();
}

function subscribeRealtime(client: SupabaseClient, uid: string): void {
  channel = client
    .channel(`kodi-sync-${uid}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${uid}` },
      (payload) => {
        const row = payload.new as ProfileRow;
        if (decideSync(syncMetaStore.get().profile, row.updated_at) === "pull") applyProfile(row);
      },
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "preferences", filter: `user_id=eq.${uid}` },
      (payload) => {
        const row = payload.new as PreferencesRow;
        if (decideSync(syncMetaStore.get().preferences, row.updated_at) === "pull") applyPreferences(row);
      },
    )
    .subscribe();
}

function onAuthChange(): void {
  const auth = getAuthState();
  const nextUser = auth.status === "signed-in" ? auth.user.id : null;
  if (nextUser === userId) return;

  if (channel && supabase) void supabase.removeChannel(channel);
  channel = null;
  userId = nextUser;

  if (auth.status === "local") return setStatus({ state: "local" });
  if (!userId || !supabase) return setStatus({ state: "signed-out" });

  subscribeRealtime(supabase, userId);
  void syncNow();
}

function onOnline(): void {
  if (userId && hasPending()) void syncNow();
}

function onVisible(): void {
  // Rattrape d'éventuels changements manqués pendant la mise en veille.
  if (document.visibilityState === "visible" && userId) void syncNow();
}

let started = false;

/** Démarre la synchronisation (une seule fois, côté navigateur). */
export function startSync(): () => void {
  if (started) return () => {};
  started = true;
  supabase = getBrowserSupabase();
  if (!supabase) {
    setStatus({ state: "local" });
    return () => {};
  }
  lastProfile = profileStore.get();
  const unsubscribers = [
    subscribeAuth(onAuthChange),
    profileStore.subscribe(onLocalProfileChange),
    themeStore.subscribe(onLocalPreferencesChange),
    motionStore.subscribe(onLocalPreferencesChange),
    answerHistoryStore.subscribe(onLocalLearningChange),
    lessonProgressStore.subscribe(onLocalLearningChange),
    historyStore.subscribe(onLocalLearningChange),
  ];
  window.addEventListener("online", onOnline);
  document.addEventListener("visibilitychange", onVisible);
  onAuthChange();

  return () => {
    unsubscribers.forEach((unsubscribe) => unsubscribe());
    window.removeEventListener("online", onOnline);
    document.removeEventListener("visibilitychange", onVisible);
    if (channel && supabase) void supabase.removeChannel(channel);
    channel = null;
    userId = null;
    started = false;
  };
}

/**
 * À la déconnexion volontaire : retire de cet appareil le profil lié au
 * compte (utile sur un appareil partagé), ainsi que la progression si elle
 * est entièrement enregistrée sur le compte. Les réglages d'affichage
 * restent. Une progression pas encore envoyée (hors ligne) est conservée.
 */
export function forgetAccountDataOnDevice(): void {
  const learningSaved = syncMetaStore.get().learningChangedAt === null;
  withRemote(() => {
    profileStore.reset();
    if (learningSaved) {
      answerHistoryStore.reset();
      lessonProgressStore.reset();
      historyStore.reset();
    }
  });
  lastProfile = profileStore.get();
  syncMetaStore.reset();
}
