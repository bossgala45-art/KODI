import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const deleteAccount = vi.fn();
const exportAccountData = vi.fn();
vi.mock("@/lib/auth/actions", () => ({
  deleteAccount: (c: string) => deleteAccount(c),
  exportAccountData: () => exportAccountData(),
}));

const { DataRights } = await import("@/components/data-rights");
const { resetAuthStoreForTests } = await import("@/lib/auth/session-store");
const { answerHistoryStore } = await import("@/lib/pedagogy/history");
const { BACKUP_FORMAT } = await import("@/lib/backup");

afterEach(() => {
  resetAuthStoreForTests();
  deleteAccount.mockReset();
  exportAccountData.mockReset();
});

function captureDownload() {
  const blobs: Blob[] = [];
  vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
    blobs.push(blob as Blob);
    return "blob:kodi";
  });
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  return blobs;
}

const answer = { id: "a1", questionId: "ex-001", competenceIds: ["c"], selected: ["a"], correct: true, answeredAt: "2026-10-20T10:00:00Z", context: "lesson" };

describe("DataRights", () => {
  it("mode local : télécharge les données de l’appareil, sans suppression de compte", async () => {
    resetAuthStoreForTests({ status: "local" });
    answerHistoryStore.set([answer as never]);
    const blobs = captureDownload();
    render(<DataRights />);
    expect(screen.queryByText("Supprimer mon compte")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Télécharger mes données" }));
    const saved = JSON.parse(await blobs[0]!.text());
    expect(saved).toMatchObject({ format: BACKUP_FORMAT, device: { answers: [{ id: "a1" }] } });
    expect(saved.account).toBeUndefined();
    expect(exportAccountData).not.toHaveBeenCalled();
    expect(screen.getByRole("status").textContent).toMatch(/données de cet appareil/);
  });

  it("restaure une sauvegarde en ajoutant ses données", async () => {
    resetAuthStoreForTests({ status: "local" });
    render(<DataRights />);
    const file = new File([JSON.stringify({ format: BACKUP_FORMAT, device: { answers: [answer] } })], "kodi.json", { type: "application/json" });
    await userEvent.upload(screen.getByLabelText("Restaurer une sauvegarde"), file);
    expect(await screen.findByText(/1 réponse\(s\).*ajoutées\. Rien n’a été effacé/)).toBeTruthy();
    expect(answerHistoryStore.get().map((a) => a.id)).toEqual(["a1"]);
  });

  it("refuse un fichier qui n’est pas une sauvegarde KODI", async () => {
    resetAuthStoreForTests({ status: "local" });
    render(<DataRights />);
    await userEvent.upload(screen.getByLabelText("Restaurer une sauvegarde"), new File(["{}"], "x.json", { type: "application/json" }));
    expect((await screen.findByRole("alert")).textContent).toMatch(/pas une sauvegarde KODI/);
  });

  it("connecté : l’export inclut le compte ; la suppression exige SUPPRIMER", async () => {
    resetAuthStoreForTests({ status: "signed-in", user: { id: "u1", email: "a@b.fr" } });
    exportAccountData.mockResolvedValue({ ok: true, value: { format: "kodi-export-1" } });
    deleteAccount.mockResolvedValue({ ok: true, value: undefined });
    const blobs = captureDownload();
    render(<DataRights />);
    await userEvent.click(screen.getByRole("button", { name: "Télécharger mes données" }));
    expect(JSON.parse(await blobs[0]!.text()).account).toEqual({ format: "kodi-export-1" });

    const remove = screen.getByRole("button", { name: "Supprimer définitivement mon compte" });
    expect((remove as HTMLButtonElement).disabled).toBe(true);
    await userEvent.type(screen.getByLabelText("Saisissez SUPPRIMER pour confirmer"), "SUPPRIMER");
    await userEvent.click(remove);
    expect(deleteAccount).toHaveBeenCalledWith("SUPPRIMER");
    expect(await screen.findByText("Compte supprimé")).toBeTruthy();
  });

  it("affiche le refus du serveur", async () => {
    resetAuthStoreForTests({ status: "signed-in", user: { id: "u1", email: "a@b.fr" } });
    deleteAccount.mockResolvedValue({ ok: false, error: { kind: "unknown", message: "Un abonnement est encore actif sur ce compte", retryable: false } });
    render(<DataRights />);
    await userEvent.type(screen.getByLabelText("Saisissez SUPPRIMER pour confirmer"), "SUPPRIMER");
    await userEvent.click(screen.getByRole("button", { name: "Supprimer définitivement mon compte" }));
    expect((await screen.findByRole("alert")).textContent).toMatch(/encore actif/);
    expect(screen.queryByText("Compte supprimé")).toBeNull();
  });
});
