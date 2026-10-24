"use client";

import Link from "next/link";
import type { RefObject } from "react";
import { Icon } from "@/components/icons";
import { Badge, Card, EmptyState, ProgressBar, StatTile } from "@/components/ui/display";
import { LESSONS, competenceById, lessonHref, universeById } from "@/content/catalog";
import { cn } from "@/lib/cn";
import {
  EXAM_MODES,
  OFFICIAL_RATIO,
  examStats,
  recommendations,
  type CompetenceResult,
  type ExamSummary,
} from "@/lib/exam/modes";
import { sourceLabel, type ServerCorrection } from "@/lib/exam/server-exam";
import { formatPercent } from "@/lib/history";

const dateFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** Où réviser une compétence : sa première leçon, sinon son univers. */
function revisionLink(ref: string): { href: string; label: string } {
  const lesson = LESSONS.find((l) => l.competenceIds.includes(ref));
  if (lesson) return { href: lessonHref(lesson), label: `Leçon « ${lesson.title} »` };
  const universe = universeById(competenceById(ref)?.universeId ?? "");
  return universe ? { href: `/apprendre/${universe.slug}`, label: `Univers « ${universe.title} »` } : { href: "/revisions", label: "Mes révisions" };
}

export function CompetenceBreakdown({ lines }: { lines: readonly CompetenceResult[] }) {
  if (lines.length === 0) {
    return <p className="text-sm text-muted">Aucune compétence n’est encore rattachée à ces questions.</p>;
  }
  return (
    <ul className="space-y-3">
      {lines.map((line) => {
        const value = line.total ? line.correct / line.total : 0;
        const ok = value >= OFFICIAL_RATIO;
        return (
          <li key={line.competence_ref} className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <span className="min-w-0 flex-1 font-semibold">{line.title}</span>
              <span className="shrink-0 text-sm font-semibold tabular-nums">
                {line.correct} / {line.total}
              </span>
            </div>
            <ProgressBar
              value={value}
              tone={ok ? "success" : "brand"}
              label={`${line.title} : ${formatPercent(value)} de bonnes réponses`}
              className="mt-2 h-1.5"
            />
          </li>
        );
      })}
    </ul>
  );
}

export function RecommendationList({
  lines,
  onRevenge,
}: {
  lines: readonly CompetenceResult[];
  onRevenge?: () => void;
}) {
  const items = recommendations(lines);
  if (items.length === 0) {
    return (
      <p className="text-sm">
        Toutes les compétences évaluées atteignent le niveau demandé à l’examen (au moins 87,5 % de bonnes
        réponses). Continuez vos révisions espacées pour le garder.
      </p>
    );
  }
  return (
    <div>
      <ol className="space-y-3">
        {items.map((item) => {
          const link = revisionLink(item.competenceRef);
          return (
            <li key={item.competenceRef} className="rounded-2xl border border-line bg-surface p-4 text-sm">
              <p className="font-semibold">{item.title}</p>
              <p className="mt-1 text-muted">
                {item.correct} / {item.total} ({formatPercent(item.ratio)}) : sous les 87,5 % exigés à l’examen.
              </p>
              <Link href={link.href} className="mt-2 inline-flex items-center gap-1 font-semibold text-brand-text underline underline-offset-2">
                Réviser : {link.label}
              </Link>
            </li>
          );
        })}
      </ol>
      {onRevenge && (
        <button
          type="button"
          onClick={onRevenge}
          className="mt-3 text-sm font-semibold text-brand-text underline underline-offset-2"
        >
          Lancer le mode revanche sur les compétences ratées
        </button>
      )}
    </div>
  );
}

export function ExamResult({
  correction,
  headingRef,
}: {
  correction: ServerCorrection;
  headingRef?: RefObject<HTMLHeadingElement | null>;
}) {
  const mode = EXAM_MODES[correction.mode];
  const value = correction.score / correction.question_count;
  return (
    <div className="space-y-6">
      <Card className="text-center">
        <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold focus:outline-none">
          {mode.title} terminé
        </h2>
        <p className="mt-2 text-4xl font-extrabold tabular-nums">
          {correction.score} / {correction.question_count}
        </p>
        <p className="mt-1 text-muted">{formatPercent(value)} de bonnes réponses</p>
        {correction.pass_mark !== null && correction.passed !== null ? (
          <p
            className={cn(
              "mx-auto mt-4 w-fit rounded-full px-4 py-1.5 text-sm font-bold",
              correction.passed ? "bg-success-soft text-success-text" : "bg-danger-soft text-danger-text",
            )}
          >
            {correction.passed
              ? `Réussi : au moins ${correction.pass_mark} bonnes réponses sur ${correction.question_count}`
              : `Échoué : il faut au moins ${correction.pass_mark} bonnes réponses sur ${correction.question_count}`}
          </p>
        ) : (
          <p className="mt-4 text-sm">
            Repère : l’examen réel exige 35 bonnes réponses sur 40, soit 87,5 %.{" "}
            {value >= OFFICIAL_RATIO ? "Vous êtes à ce niveau sur cette série." : "Vous êtes en dessous sur cette série."}
          </p>
        )}
        <p className="mt-4 text-sm text-muted">
          Corrigé par le serveur et enregistré sur votre compte. {correction.unseen_count} question
          {correction.unseen_count > 1 ? "s" : ""} inédite{correction.unseen_count > 1 ? "s" : ""} pour vous.
        </p>
      </Card>

      <section aria-labelledby="bilan-competences">
        <h3 id="bilan-competences" className="mb-3 text-lg font-bold">
          Bilan par compétence
        </h3>
        <CompetenceBreakdown lines={correction.competences} />
      </section>

      <section aria-labelledby="recommandations">
        <h3 id="recommandations" className="mb-3 text-lg font-bold">
          Recommandations de révision
        </h3>
        <RecommendationList lines={correction.competences} />
      </section>

      <section aria-labelledby="corrige">
        <h3 id="corrige" className="mb-3 text-lg font-bold">
          Corrigé
        </h3>
        <ol className="space-y-3">
          {correction.items.map((c) => {
            const labels = (ids: string[] | null) =>
              c.choices.filter((choice) => ids?.includes(choice.id)).map((choice) => choice.label).join(", ");
            return (
              <li key={c.position} className="rounded-2xl border border-line bg-surface p-4 text-sm">
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-lg",
                      c.is_correct ? "bg-success text-on-status" : "bg-danger text-on-status",
                    )}
                  >
                    <Icon name={c.is_correct ? "check" : "close"} size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {c.position}. {c.prompt}
                      <span className="sr-only">{c.is_correct ? " — correct" : " — incorrect"}</span>
                    </p>
                    {!c.is_correct && (
                      <p className="mt-1 text-danger-text">Votre réponse : {labels(c.selected_choice_ids) || "aucune"}</p>
                    )}
                    <p className="mt-1 text-success-text">Bonne réponse : {labels(c.correct_choice_ids)}</p>
                    <p className="mt-1 text-muted">{c.explanation}</p>
                    <ul className="mt-2 space-y-1 text-xs">
                      {c.sources.map((source) => (
                        <li key={source.url}>
                          Source :{" "}
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-brand-text underline underline-offset-2"
                          >
                            {sourceLabel(source)}
                            <span className="sr-only"> (nouvel onglet)</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

export function ExamHistory({
  exams,
  competenceStats,
  onRevenge,
}: {
  exams: readonly ExamSummary[];
  competenceStats: readonly CompetenceResult[];
  onRevenge?: () => void;
}) {
  const stats = examStats(exams);
  if (stats.submitted === 0) {
    return (
      <EmptyState icon="chart" title="Aucun examen terminé">
        Vos résultats, vos statistiques et le bilan par compétence apparaîtront ici après votre premier examen.
      </EmptyState>
    );
  }
  const finished = exams.filter((e) => e.status !== "in_progress").slice(0, 10);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {stats.byMode.map((m) => (
          <StatTile
            key={m.mode}
            icon="flag"
            label={EXAM_MODES[m.mode].title}
            value={formatPercent(m.averageRatio)}
            hint={`${m.count} examen${m.count > 1 ? "s" : ""} · meilleur ${formatPercent(m.bestRatio)}${
              m.passedCount !== null ? ` · ${m.passedCount} réussi${m.passedCount > 1 ? "s" : ""}` : ""
            }`}
          />
        ))}
      </div>

      <div>
        <h3 className="mb-3 font-bold">Derniers examens</h3>
        <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
          {finished.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-3 p-3 text-sm">
              <span className="min-w-0">
                <span className="block font-semibold">{EXAM_MODES[e.mode].title}</span>
                <span className="text-xs text-muted">{dateFormat.format(new Date(e.submitted_at ?? e.started_at))}</span>
              </span>
              {e.status === "abandoned" ? (
                <Badge tone="neutral">Abandonné</Badge>
              ) : (
                <span className="flex shrink-0 items-center gap-2">
                  <span className="font-semibold tabular-nums">
                    {e.score} / {e.question_count}
                  </span>
                  {e.passed !== null && <Badge tone={e.passed ? "success" : "danger"}>{e.passed ? "Réussi" : "Échoué"}</Badge>}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 font-bold">Bilan par compétence, tous examens</h3>
        <CompetenceBreakdown lines={competenceStats} />
      </div>

      <div>
        <h3 className="mb-3 font-bold">Recommandations de révision</h3>
        <RecommendationList lines={competenceStats} onRevenge={onRevenge} />
      </div>
    </div>
  );
}
