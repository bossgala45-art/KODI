"use client";

import { useState, type ChangeEvent } from "react";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/display";
import { TextField } from "@/components/ui/form";
import { deleteAccount, exportAccountData } from "@/lib/auth/actions";
import { useAuth } from "@/lib/auth/session-store";
import { buildBackup, restoreBackup, type DeviceData } from "@/lib/backup";
import { historyStore } from "@/lib/history";
import { answerHistoryStore } from "@/lib/pedagogy/history";
import { lessonProgressStore } from "@/lib/pedagogy/progress";
import { profileStore } from "@/lib/profile";
import { forgetAccountDataOnDevice } from "@/lib/sync/engine";

const RESTORE_ERRORS = {
  "trop-gros": "Ce fichier est trop volumineux pour être une sauvegarde KODI.",
  illisible: "Ce fichier n’est pas lisible : choisissez une sauvegarde KODI (fichier .json).",
  "format-inconnu": "Ce fichier n’est pas une sauvegarde KODI.",
} as const;

function readDevice(): DeviceData {
  return {
    profile: profileStore.get(),
    answers: answerHistoryStore.get(),
    lessons: lessonProgressStore.get(),
    sessions: historyStore.get(),
  };
}

function download(name: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

/** Export, sauvegarde, restauration et suppression du compte (droits sur ses données). */
export function DataRights() {
  const auth = useAuth();
  const signedIn = auth.status === "signed-in";
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  async function exportData() {
    setExporting(true);
    setMessage(null);
    let account: unknown;
    if (signedIn) {
      const result = await exportAccountData();
      if (!result.ok) {
        setExporting(false);
        setMessage({ tone: "danger", text: `Les données du compte n’ont pas pu être exportées : ${result.error.message}` });
        return;
      }
      account = result.value;
    }
    const now = new Date();
    download(`kodi-donnees-${now.toISOString().slice(0, 10)}.json`, JSON.stringify(buildBackup(readDevice(), now, account), null, 2));
    setExporting(false);
    setMessage({
      tone: "success",
      text: signedIn
        ? "Fichier téléchargé : données de cet appareil et de votre compte."
        : "Fichier téléchargé : données de cet appareil. Conservez-le pour pouvoir les restaurer.",
    });
  }

  async function restore(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const result = restoreBackup(await file.text(), readDevice());
    if (!result.ok) {
      setMessage({ tone: "danger", text: RESTORE_ERRORS[result.reason] });
      return;
    }
    profileStore.set(result.restored.profile);
    answerHistoryStore.set(result.restored.answers);
    lessonProgressStore.set(result.restored.lessons);
    historyStore.set(result.restored.sessions);
    const { answers, lessons, sessions } = result.added;
    setMessage({
      tone: "success",
      text: `Sauvegarde restaurée : ${answers} réponse(s), ${lessons} leçon(s) et ${sessions} série(s) ajoutées. Rien n’a été effacé.`,
    });
  }

  async function removeAccount() {
    setDeleting(true);
    setMessage(null);
    const result = await deleteAccount(confirmation.trim());
    setDeleting(false);
    if (!result.ok) {
      setMessage({ tone: "danger", text: result.error.message });
      return;
    }
    forgetAccountDataOnDevice();
    setDeleted(true);
  }

  if (deleted) {
    return (
      <Alert tone="success" role="status" title="Compte supprimé">
        Votre compte et les données qui y étaient enregistrées ont été effacés. Vous êtes déconnecté.
      </Alert>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold">Télécharger ou restaurer mes données</h3>
        <p className="mt-1 text-sm text-muted">
          Un fichier contient votre progression{signedIn ? " et toutes les données de votre compte" : " enregistrée sur cet appareil"}.
          La restauration ajoute les données du fichier sans rien effacer.
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" loading={exporting} onClick={exportData}>
            Télécharger mes données
          </Button>
          <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-line-strong px-5 font-semibold has-focus-visible:outline-2 has-focus-visible:outline-brand">
            <Icon name="refresh" size={18} />
            Restaurer une sauvegarde
            <input type="file" accept="application/json,.json" className="sr-only" onChange={restore} />
          </label>
        </div>
      </div>

      <div aria-live="polite">
        {message && (
          <Alert tone={message.tone} role={message.tone === "danger" ? "alert" : "status"}>
            {message.text}
          </Alert>
        )}
      </div>

      {signedIn && (
        <div className="border-t border-line pt-5">
          <h3 className="font-semibold">Supprimer mon compte</h3>
          <p className="mt-1 text-sm text-muted">
            Suppression définitive du compte et de ses données : profil, progression, examens, réglages. Le journal de
            sécurité est anonymisé. Un abonnement Premium en cours doit d’abord être résilié. Pensez à télécharger vos
            données avant.
          </p>
          <TextField
            className="mt-3"
            label="Saisissez SUPPRIMER pour confirmer"
            value={confirmation}
            autoComplete="off"
            onChange={(event) => setConfirmation(event.target.value)}
          />
          <Button
            className="mt-3"
            variant="danger"
            disabled={confirmation.trim() !== "SUPPRIMER"}
            loading={deleting}
            onClick={removeAccount}
          >
            Supprimer définitivement mon compte
          </Button>
        </div>
      )}
    </div>
  );
}
