"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { StorageNotice } from "@/components/storage-notice";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  Alert,
  Card,
  DemoBadge,
  EmptyState,
  LoadingBlock,
  ProgressBar,
  SectionTitle,
  StatTile,
} from "@/components/ui/display";
import { computeStats, formatPercent, historyStore, type SessionMode } from "@/lib/history";
import { profileStore } from "@/lib/profile";
import { useHydrated, useStore } from "@/lib/use-store";

const MODE_LABEL: Record<SessionMode, string> = {
  entrainement: "Entraînement",
  simulation: "Examen blanc",
};

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function ProgressDashboard() {
  const hydrated = useHydrated();
  const history = useStore(historyStore);
  const profile = useStore(profileStore);
  const [confirming, setConfirming] = useState(false);
  const [cleared, setCleared] = useState(false);

  if (!hydrated) return <LoadingBlock label="Chargement de votre progression…" />;

  if (history.length === 0) {
    return (
      <>
        <StorageNotice />
        {cleared && (
          <Alert tone="success" role="status" className="mb-4">
            Historique effacé.
          </Alert>
        )}
        <EmptyState
          icon="chart"
          title="Pas encore de résultats"
          action={<ButtonLink href="/entrainement">Faire une première série</ButtonLink>}
        >
          Terminez une série d’entraînement ou un examen blanc : vos
          statistiques apparaîtront ici.
        </EmptyState>
      </>
    );
  }

  const stats = computeStats(history, new Date());
  const goalRatio = Math.min(1, stats.questionsToday / profile.dailyGoal);

  return (
    <div className="space-y-8">
      <StorageNotice />
      <Alert tone="info" role="note">
        Ces statistiques sont calculées à partir de vos vraies réponses, mais
        sur des <strong>questions fictives</strong> : elles ne mesurent pas
        votre niveau au code de la route.
      </Alert>

      <Card className="animate-enter">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold">Objectif du jour</h2>
          <span className="text-sm font-semibold tabular-nums text-muted">
            {stats.questionsToday} / {profile.dailyGoal} questions
          </span>
        </div>
        <ProgressBar value={goalRatio} tone="success" label="Objectif du jour" className="mt-3" />
        <p className="mt-2 text-sm text-muted">
          {goalRatio >= 1
            ? "Objectif atteint, bravo !"
            : `Encore ${profile.dailyGoal - stats.questionsToday} questions pour l’atteindre.`}
        </p>
      </Card>

      <section aria-labelledby="chiffres">
        <SectionTitle id="chiffres" aside={<DemoBadge />}>
          Vos chiffres
        </SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile icon="target" label="Réussite" value={stats.accuracy === null ? "—" : formatPercent(stats.accuracy)} />
          <StatTile icon="check" label="Questions" value={String(stats.questions)} />
          <StatTile icon="flag" label="Sessions" value={String(stats.sessions)} />
          <StatTile
            icon="flame"
            label="Série"
            value={`${stats.streakDays} j`}
            hint={stats.streakDays > 1 ? "jours consécutifs" : "jour d’activité"}
          />
        </div>
      </section>

      <section aria-labelledby="par-mode">
        <SectionTitle id="par-mode">Par mode</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(MODE_LABEL) as SessionMode[]).map((mode) => {
            const m = stats.byMode[mode];
            const ratio = m.questions > 0 ? m.correct / m.questions : 0;
            return (
              <Card key={mode} className="p-4">
                <p className="font-semibold">{MODE_LABEL[mode]}</p>
                <p className="mt-1 text-sm text-muted">
                  {m.sessions === 0
                    ? "Aucune session"
                    : `${m.sessions} session${m.sessions > 1 ? "s" : ""} · ${formatPercent(ratio)}`}
                </p>
                <ProgressBar value={ratio} label={`Réussite, ${MODE_LABEL[mode]}`} className="mt-3" />
              </Card>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="recentes">
        <SectionTitle id="recentes">Sessions récentes</SectionTitle>
        <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
          {stats.recent.map((record) => (
            <li key={record.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-semibold">{MODE_LABEL[record.mode]}</p>
                <p className="text-sm text-muted">{dateFormat.format(new Date(record.finishedAt))}</p>
              </div>
              <span className="font-bold tabular-nums">
                {record.correct} / {record.total}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="effacer" className="rounded-3xl border border-line p-4">
        <h2 id="effacer" className="font-semibold">Effacer l’historique</h2>
        <p className="mt-1 text-sm text-muted">
          Supprime tous les résultats enregistrés sur cet appareil.
        </p>
        {confirming ? (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row" role="group" aria-label="Confirmer l’effacement">
            <Button
              variant="danger"
              onClick={() => {
                historyStore.reset();
                setConfirming(false);
                setCleared(true);
              }}
            >
              <Icon name="alert" size={18} />
              Oui, tout effacer
            </Button>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Annuler
            </Button>
          </div>
        ) : (
          <Button variant="secondary" className="mt-4" onClick={() => setConfirming(true)}>
            Effacer l’historique
          </Button>
        )}
      </section>
    </div>
  );
}
