import { describe, expect, it } from "vitest";
import { BACKUP_FORMAT, buildBackup, restoreBackup, type DeviceData } from "@/lib/backup";
import { DEFAULT_PROFILE } from "@/lib/profile";

const NOW = new Date("2026-10-25T10:00:00Z");
const answer = (id: string, at: string) => ({
  id,
  questionId: "ex-001",
  competenceIds: ["c"],
  selected: ["a"],
  correct: true,
  answeredAt: at,
  context: "lesson" as const,
});
const empty: DeviceData = { profile: DEFAULT_PROFILE, answers: [], lessons: {}, sessions: [] };

describe("sauvegarde et restauration", () => {
  it("restaure une sauvegarde sur un appareil neuf, à l’identique", () => {
    const device: DeviceData = {
      profile: { firstName: "Lou", dailyGoal: 40, onboardingCompleted: true },
      answers: [answer("a1", "2026-10-20T10:00:00Z")],
      lessons: { "l-1": "2026-10-20T10:00:00Z" },
      sessions: [{ id: "s1", mode: "entrainement", finishedAt: "2026-10-20T10:05:00Z", correct: 4, total: 5, demo: true }],
    };
    const text = JSON.stringify(buildBackup(device, NOW));
    expect(restoreBackup(text, empty)).toEqual({ ok: true, restored: device, added: { answers: 1, lessons: 1, sessions: 1 } });
  });

  it("fusionne sans rien effacer ni dupliquer", () => {
    const current: DeviceData = { ...empty, answers: [answer("a1", "2026-10-20T10:00:00Z")] };
    const text = JSON.stringify(buildBackup({ ...empty, answers: [answer("a1", "2026-10-20T10:00:00Z"), answer("a2", "2026-10-21T10:00:00Z")] }, NOW));
    const result = restoreBackup(text, current);
    expect(result.ok && result.restored.answers.map((a) => a.id)).toEqual(["a1", "a2"]);
    expect(result.ok && result.added.answers).toBe(1);
  });

  it("garde le profil actuel s’il est déjà rempli", () => {
    const current: DeviceData = { ...empty, profile: { firstName: "Actuel", dailyGoal: 10, onboardingCompleted: true } };
    const text = JSON.stringify(buildBackup({ ...empty, profile: { firstName: "Ancien", dailyGoal: 40, onboardingCompleted: true } }, NOW));
    const result = restoreBackup(text, current);
    expect(result.ok && result.restored.profile.firstName).toBe("Actuel");
  });

  it("refuse un fichier illisible, inconnu ou trop gros, et ignore les entrées invalides", () => {
    expect(restoreBackup("pas du json", empty)).toEqual({ ok: false, reason: "illisible" });
    expect(restoreBackup(JSON.stringify({ format: "autre", device: {} }), empty)).toEqual({ ok: false, reason: "format-inconnu" });
    expect(restoreBackup("x".repeat(5_000_001), empty)).toEqual({ ok: false, reason: "trop-gros" });
    const text = JSON.stringify({ format: BACKUP_FORMAT, device: { answers: [{ id: 3 }, answer("ok", "2026-10-20T10:00:00Z")], lessons: "x" } });
    const result = restoreBackup(text, empty);
    expect(result.ok && result.restored.answers.map((a) => a.id)).toEqual(["ok"]);
  });
});
