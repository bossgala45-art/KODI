"use client";

import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { createLocalStore, isRecord, parseJson } from "@/lib/local-store";
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
}

const EMPTY_STATE: ResourceSyncState = { localChangedAt: null, remoteUpdatedAt: null };
const EMPTY_META: SyncMeta = { userId: null, profile: EMPTY_STATE, preferences: EMPTY_STATE };

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
  return Boolean(meta.profile.localChangedAt || meta.preferences.localChangedAt);
}

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
 * compte (utile sur un appareil partagé). Les réglages d'affichage restent.
 */
export function forgetAccountDataOnDevice(): void {
  withRemote(() => profileStore.reset());
  lastProfile = profileStore.get();
  syncMetaStore.reset();
}
