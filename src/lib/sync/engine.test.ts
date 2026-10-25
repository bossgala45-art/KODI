import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PreferencesRow, ProfileRow } from "@/lib/sync/merge";

const USER = "11111111-1111-1111-1111-111111111111";
const T0 = "2026-10-22T10:00:00.000Z";
const T1 = "2026-10-22T11:00:00.000Z";

interface LearningRow {
  answers: unknown[];
  lessons: Record<string, string>;
  sessions: unknown[];
  version: number;
}

interface FakeDb {
  profile: ProfileRow;
  preferences: PreferencesRow;
  learning: LearningRow | null;
  /** Écriture concurrente simulée d'un autre appareil, juste avant la prochaine sauvegarde. */
  concurrentWrite: LearningRow | null;
  offline: boolean;
  updates: { table: string; values: Record<string, unknown> }[];
}

function fakeClient(db: FakeDb) {
  const rowOf = (table: string) => (table === "profiles" ? db.profile : db.preferences);
  const channel = { on: () => channel, subscribe: () => channel };
  return {
    rpc: async (name: string, args: { p_answers: unknown[]; p_lessons: Record<string, string>; p_sessions: unknown[]; p_expected_version: number }) => {
      if (db.offline) throw new TypeError("Failed to fetch");
      if (name !== "save_learning_state") throw new Error(name);
      if (db.concurrentWrite) {
        db.learning = db.concurrentWrite;
        db.concurrentWrite = null;
      }
      if ((db.learning?.version ?? 0) !== args.p_expected_version) {
        return { data: null, error: { message: "KODI_SYNC_CONFLICT" } };
      }
      const version = args.p_expected_version + 1;
      db.learning = { answers: args.p_answers, lessons: args.p_lessons, sessions: args.p_sessions, version };
      return { data: version, error: null };
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => {
            if (db.offline) throw new TypeError("Failed to fetch");
            return { data: db.learning ? structuredClone(db.learning) : null, error: null };
          },
          single: async () => {
            if (db.offline) throw new TypeError("Failed to fetch");
            return { data: { ...rowOf(table) }, error: null };
          },
        }),
      }),
      update: (values: Record<string, unknown>) => ({
        eq: () => ({
          select: () => ({
            single: async () => {
              if (db.offline) throw new TypeError("Failed to fetch");
              const updated_at = new Date().toISOString();
              db.updates.push({ table, values });
              Object.assign(rowOf(table), values, { updated_at });
              return { data: { updated_at }, error: null };
            },
          }),
        }),
      }),
    }),
    channel: () => channel,
    removeChannel: vi.fn(),
  };
}

let db: FakeDb;

vi.mock("@/lib/supabase/browser", () => ({ getBrowserSupabase: () => fakeClient(db) }));
vi.mock("@/lib/auth/session-store", () => ({
  getAuthState: () => ({ status: "signed-in", user: { id: USER, email: "a@b.fr" } }),
  subscribeAuth: () => () => {},
}));

async function loadEngine() {
  vi.resetModules();
  const engine = await import("@/lib/sync/engine");
  const { profileStore } = await import("@/lib/profile");
  const { themeStore } = await import("@/lib/theme-store");
  return { engine, profileStore, themeStore };
}

beforeEach(() => {
  db = {
    profile: { first_name: "", daily_goal: 20, onboarding_completed: false, created_at: T0, updated_at: T0 },
    preferences: { theme: "system", motion: "system", updated_at: T0 },
    learning: null,
    concurrentWrite: null,
    offline: false,
    updates: [],
  };
});

let stop: (() => void) | undefined;
afterEach(() => {
  stop?.();
  stop = undefined;
});

describe("synchronisation du compte", () => {
  it("un compte neuf adopte le profil créé sur l’appareil", async () => {
    const { engine, profileStore } = await loadEngine();
    profileStore.set({ firstName: "Lou", dailyGoal: 40, onboardingCompleted: true });
    stop = engine.startSync();
    await engine.syncNow();

    expect(db.updates.find((u) => u.table === "profiles")?.values).toEqual({
      first_name: "Lou",
      daily_goal: 40,
      onboarding_completed: true,
    });
    expect(engine.syncMetaStore.get().userId).toBe(USER);
    expect(engine.getSyncStatus().state).toBe("synced");
  });

  it("un compte déjà utilisé fait foi sur l’appareil", async () => {
    db.profile = { ...db.profile, first_name: "Sam", daily_goal: 10, updated_at: T1 };
    db.preferences = { theme: "dark", motion: "reduce", updated_at: T1 };
    const { engine, profileStore, themeStore } = await loadEngine();
    profileStore.set({ firstName: "Autre", dailyGoal: 40, onboardingCompleted: false });
    stop = engine.startSync();
    await engine.syncNow();

    expect(profileStore.get()).toMatchObject({ firstName: "Sam", dailyGoal: 10 });
    expect(themeStore.get()).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(db.updates).toEqual([]);
  });

  it("n’adopte jamais les données locales d’un autre compte", async () => {
    const { engine, profileStore } = await loadEngine();
    engine.syncMetaStore.set({
      userId: "22222222-2222-2222-2222-222222222222",
      profile: { localChangedAt: null, remoteUpdatedAt: null },
      preferences: { localChangedAt: null, remoteUpdatedAt: null },
      learningChangedAt: null,
    });
    profileStore.set({ firstName: "Ancien compte", dailyGoal: 40, onboardingCompleted: true });
    stop = engine.startSync();
    await engine.syncNow();

    expect(db.updates).toEqual([]);
    expect(profileStore.get().firstName).toBe("");
  });

  it("envoie une modification locale peu après", async () => {
    const { engine, profileStore } = await loadEngine();
    stop = engine.startSync();
    await engine.syncNow();
    db.updates = [];

    profileStore.set((p) => ({ ...p, firstName: "Inès" }));
    expect(engine.getSyncStatus().state).toBe("pending");
    await new Promise((resolve) => setTimeout(resolve, 900));
    await engine.syncNow();

    expect(db.profile.first_name).toBe("Inès");
    expect(engine.syncMetaStore.get().profile.localChangedAt).toBeNull();
  });

  it("hors ligne : conserve la modification en attente puis l’envoie au retour du réseau", async () => {
    const { engine, profileStore } = await loadEngine();
    stop = engine.startSync();
    await engine.syncNow();

    db.offline = true;
    profileStore.set((p) => ({ ...p, firstName: "Hors ligne" }));
    await new Promise((resolve) => setTimeout(resolve, 900));
    await engine.syncNow();
    expect(engine.getSyncStatus().state).toBe("offline");
    expect(engine.syncMetaStore.get().profile.localChangedAt).not.toBeNull();

    db.offline = false;
    window.dispatchEvent(new Event("online"));
    await engine.syncNow();
    expect(db.profile.first_name).toBe("Hors ligne");
    expect(engine.getSyncStatus().state).toBe("synced");
  });

  it("à la déconnexion, retire le profil du compte de l’appareil", async () => {
    const { engine, profileStore } = await loadEngine();
    profileStore.set({ firstName: "Privé", dailyGoal: 40, onboardingCompleted: true });
    engine.forgetAccountDataOnDevice();
    expect(profileStore.get().firstName).toBe("");
    expect(engine.syncMetaStore.get().userId).toBeNull();
  });

});

const answer = (id: string, answeredAt: string) => ({
  id,
  questionId: "ex-001",
  competenceIds: ["c-priorite-intersection"],
  selected: ["a"],
  correct: true,
  answeredAt,
  context: "lesson" as const,
});

async function loadLearning() {
  const loaded = await loadEngine();
  const { answerHistoryStore } = await import("@/lib/pedagogy/history");
  const { lessonProgressStore } = await import("@/lib/pedagogy/progress");
  return { ...loaded, answerHistoryStore, lessonProgressStore };
}

describe("synchronisation de la progression", () => {
  it("fusionne l’appareil et le compte sans rien perdre", async () => {
    db.learning = { answers: [answer("distant", T0)], lessons: { "l-a": T1 }, sessions: [], version: 3 };
    const { engine, answerHistoryStore, lessonProgressStore } = await loadLearning();
    answerHistoryStore.set([answer("local", T1)]);
    lessonProgressStore.set({ "l-a": T0, "l-b": T1 });
    stop = engine.startSync();
    await engine.syncNow();

    expect(answerHistoryStore.get().map((a) => a.id)).toEqual(["distant", "local"]);
    // Leçon terminée sur les deux : la date la plus ancienne est gardée.
    expect(lessonProgressStore.get()).toEqual({ "l-a": T0, "l-b": T1 });
    expect(db.learning).toMatchObject({ version: 4, lessons: { "l-a": T0, "l-b": T1 } });
    expect((db.learning!.answers as { id: string }[]).map((a) => a.id)).toEqual(["distant", "local"]);
    expect(engine.syncMetaStore.get().learningChangedAt).toBeNull();
  });

  it("refusionne si un autre appareil a écrit entre-temps", async () => {
    const { engine, answerHistoryStore } = await loadLearning();
    answerHistoryStore.set([answer("ici", T0)]);
    db.concurrentWrite = { answers: [answer("ailleurs", T1)], lessons: {}, sessions: [], version: 1 };
    stop = engine.startSync();
    await engine.syncNow();
    expect((db.learning!.answers as { id: string }[]).map((a) => a.id)).toEqual(["ici", "ailleurs"]);
    expect(engine.getSyncStatus().state).toBe("synced");
  });

  it("n’envoie jamais la progression locale d’un autre compte", async () => {
    db.learning = { answers: [answer("du-compte", T0)], lessons: {}, sessions: [], version: 1 };
    const { engine, answerHistoryStore } = await loadLearning();
    engine.syncMetaStore.set({
      userId: "22222222-2222-2222-2222-222222222222",
      profile: { localChangedAt: null, remoteUpdatedAt: null },
      preferences: { localChangedAt: null, remoteUpdatedAt: null },
      learningChangedAt: null,
    });
    answerHistoryStore.set([answer("autre-compte", T1)]);
    stop = engine.startSync();
    await engine.syncNow();
    expect(answerHistoryStore.get().map((a) => a.id)).toEqual(["du-compte"]);
    expect(JSON.stringify(db.learning)).not.toContain("autre-compte");
  });

  it("une réponse donnée hors ligne est envoyée au retour du réseau", async () => {
    const { engine, answerHistoryStore } = await loadLearning();
    stop = engine.startSync();
    await engine.syncNow();
    db.offline = true;
    answerHistoryStore.set((h) => [...h, answer("hors-ligne", T1)]);
    expect(engine.syncMetaStore.get().learningChangedAt).not.toBeNull();
    await new Promise((resolve) => setTimeout(resolve, 900));
    await engine.syncNow();
    expect(engine.getSyncStatus().state).toBe("offline");

    db.offline = false;
    await engine.syncNow();
    expect((db.learning!.answers as { id: string }[]).map((a) => a.id)).toEqual(["hors-ligne"]);
    expect(engine.syncMetaStore.get().learningChangedAt).toBeNull();
  });

  it("à la déconnexion, retire la progression déjà enregistrée, garde celle en attente", async () => {
    const { engine, answerHistoryStore } = await loadLearning();
    answerHistoryStore.set([answer("enregistree", T0)]);
    engine.forgetAccountDataOnDevice();
    expect(answerHistoryStore.get()).toEqual([]);

    engine.syncMetaStore.set((m) => ({ ...m, learningChangedAt: T1 }));
    answerHistoryStore.set([answer("en-attente", T1)]);
    engine.forgetAccountDataOnDevice();
    expect(answerHistoryStore.get().map((a) => a.id)).toEqual(["en-attente"]);
  });
});
