"use client";

import Link from "next/link";
import { useMemo } from "react";
import { PremiumGate } from "@/components/billing/premium-gate";
import { Icon } from "@/components/icons";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert, Badge, Card, EmptyState, LoadingBlock, ProgressBar, SectionTitle, StatTile, type BadgeTone } from "@/components/ui/display";
import { COMPETENCES, LESSONS, QUESTIONS, UNIVERSES, lessonHref, lessonOrder, questionById, universeById } from "@/content/catalog";
import { buildCoachReport, type ReadinessLevel } from "@/lib/coach/coach";
import { XP_RULES, computeRewards, type XpReason } from "@/lib/coach/rewards";
import { formatPercent, historyStore } from "@/lib/history";
import { answerHistoryStore } from "@/lib/pedagogy/history";
import { MASTERY_LABELS } from "@/lib/pedagogy/mastery";
import { lessonProgressStore } from "@/lib/pedagogy/progress";
import { profileStore } from "@/lib/profile";
import { useHydrated, useStore } from "@/lib/use-store";

const COACH_COMPETENCES = COMPETENCES.map((c) => ({ id: c.id, title: c.title, universeId: c.universeId }));
const COACH_QUESTIONS = QUESTIONS.map((q) => ({ id: q.id, competenceIds: q.competenceIds, validated: q.status === "valide" }));
const UNIVERSE_IDS = UNIVERSES.map((u) => u.id);

const READINESS_TONES: Record<ReadinessLevel, BadgeTone> = {
  "donnees-insuffisantes": "neutral",
  "a-consolider": "danger",
  "en-progres": "brand",
  proche: "brand",
  pret: "success",
};

const XP_LABELS: Record<XpReason, string> = {
  "bonne-reponse": "Bonne réponse (une fois par question et par jour)",
  "revision-reussie": "Révision réussie, arrivée à échéance",
  "erreur-corrigee": "Erreur corrigée (2 bonnes réponses de suite)",
  "competence-maitrisee": "Compétence maîtrisée",
  "lecon-terminee": "Leçon terminée",
  "examen-reussi": "Examen officiel simulé réussi (35/40 ou plus)",
  "defi-releve": "Défi du jour relevé",
};

const XP_VALUES: Record<XpReason, number> = {
  "bonne-reponse": XP_RULES.correctAnswer,
  "revision-reussie": XP_RULES.correctReview,
  "erreur-corrigee": XP_RULES.errorResolved,
  "competence-maitrisee": XP_RULES.competenceMastered,
  "lecon-terminee": XP_RULES.lessonCompleted,
  "examen-reussi": XP_RULES.officialExamPassed,
  "defi-releve": XP_RULES.challengeCompleted,
};

function useCoachData() {
  const hydrated = useHydrated();
  const history = useStore(answerHistoryStore);
  const sessions = useStore(historyStore);
  const completed = useStore(lessonProgressStore);
  const profile = useStore(profileStore);
  return useMemo(() => {
    const now = new Date();
    const exams = sessions
      .filter((s) => s.mode === "simulation" && !s.demo)
      .map((s) => ({ finishedAt: s.finishedAt, correct: s.correct, total: s.total }));
    const lessons = LESSONS.map((l) => ({
      id: l.id,
      title: l.title,
      href: lessonHref(l),
      order: lessonOrder(l),
      competenceIds: l.competenceIds,
      completed: Boolean(completed[l.id]),
    }));
    const report = buildCoachReport({
      now,
      history,
      competences: COACH_COMPETENCES,
      lessons,
      questions: COACH_QUESTIONS,
      exams,
      dailyGoal: profile.dailyGoal,
    });
    const rewards = computeRewards({
      history,
      now,
      competences: COACH_COMPETENCES,
      universeIds: UNIVERSE_IDS,
      completedLessons: completed,
      openLessonCount: lessons.filter((l) => !l.completed).length,
      exams,
    });
    return { hydrated, report, rewards, empty: history.length === 0 };
  }, [hydrated, history, sessions, completed, profile.dailyGoal]);
}

const dayName = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric" });
const shortDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });
const parseDay = (key: string) => {
  const [y, m, d] = key.split("-").map(Number) as [number, number, number];
  return new Date(y, m - 1, d);
};

// ---------------------------------------------------------------------------
// Carte de l'accueil
// ---------------------------------------------------------------------------
export function CoachSummaryCard() {
  const { hydrated, report, rewards } = useCoachData();
  if (!hydrated) return <LoadingBlock label="Chargement du coach…" lines={1} />;
  const done = rewards.challenges.filter((c) => c.done).length;
  return (
    <Link
      href="/coach"
      className="block rounded-3xl border border-line bg-surface p-5 shadow-card transition-colors hover:border-line-strong"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 font-bold">
          <Icon name="sparkles" size={20} className="text-brand-text" />
          Votre coach
        </h2>
        <Icon name="chevron-right" className="shrink-0 text-muted" />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Badge tone={READINESS_TONES[report.readiness.level]} className="max-w-full shrink">
          Préparation : {report.readiness.label}
        </Badge>
      </div>
      <p className="mt-3 text-sm text-muted">
        Niveau {rewards.level.level} · {rewards.totalXp} XP · série de révisions : {rewards.streak.current} j · défis : {done}/
        {rewards.challenges.length}
      </p>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Page du coach
// ---------------------------------------------------------------------------
export function CoachDashboard() {
  const { hydrated, report, rewards, empty } = useCoachData();
  const profile = useStore(profileStore);
  if (!hydrated) return <LoadingBlock label="Analyse de vos réponses…" />;

  const { readiness, goal } = report;

  return (
    <div className="space-y-8">
      <section aria-labelledby="preparation">
        <SectionTitle id="preparation">Préparation à l’examen</SectionTitle>
        <Card>
          <Badge tone={READINESS_TONES[readiness.level]} className="max-w-full shrink text-sm">
            {readiness.label}
          </Badge>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            {readiness.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">
            Estimation volontairement prudente, calculée sur cet appareil à partir de vos réponses récentes (borne basse
            du taux de bonnes réponses), de la couverture des compétences et des examens officiels simulés. Elle ne
            garantit pas la réussite à l’examen.
          </p>
        </Card>
      </section>

      {empty && (
        <EmptyState icon="sparkles" title="Votre coach attend vos premières réponses" action={<ButtonLink href="/apprendre">Commencer une leçon</ButtonLink>}>
          Répondez aux questions des leçons ou du programme du jour : le coach repère alors vos points faibles et vous
          propose la suite.
        </EmptyState>
      )}

      <section aria-labelledby="objectif">
        <SectionTitle id="objectif">Objectif quotidien</SectionTitle>
        <Card>
          <p className="text-sm">
            Objectif actuel : <strong>{goal.current} questions</strong>
            {goal.suggested !== goal.current && (
              <>
                {" "}
                · proposé : <strong>{goal.suggested} questions</strong>
              </>
            )}
          </p>
          <p className="mt-1 text-sm text-muted">{goal.reason}</p>
          {goal.suggested !== profile.dailyGoal && (
            <Button className="mt-3" variant="secondary" onClick={() => profileStore.set((p) => ({ ...p, dailyGoal: goal.suggested }))}>
              Passer à {goal.suggested} questions par jour
            </Button>
          )}
        </Card>
      </section>

      <section aria-labelledby="faiblesses">
        <SectionTitle id="faiblesses">Compétences à renforcer</SectionTitle>
        {report.weak.length === 0 ? (
          <p className="text-sm text-muted">
            Aucune compétence évaluée n’est fragile ou en cours. {report.undiscovered} compétence
            {report.undiscovered > 1 ? "s" : ""} pas encore évaluée{report.undiscovered > 1 ? "s" : ""} (au moins 3 réponses
            nécessaires).
          </p>
        ) : (
          <ul className="space-y-2">
            {report.weak.slice(0, 5).map(({ competence, estimate }) => {
              const universe = universeById(competence.universeId);
              return (
                <li key={competence.id} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-3 text-sm">
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{competence.title}</span>
                    {universe && (
                      <Link href={`/apprendre/${universe.slug}`} className="text-xs text-brand-text underline underline-offset-2">
                        {universe.title}
                      </Link>
                    )}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="tabular-nums text-muted">{formatPercent(estimate.score)}</span>
                    <Badge tone={estimate.level === "fragile" ? "danger" : "brand"}>{MASTERY_LABELS[estimate.level]}</Badge>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="lecons-conseillees">
        <SectionTitle id="lecons-conseillees">Prochaines leçons conseillées</SectionTitle>
        {report.lessons.length === 0 ? (
          <p className="text-sm text-muted">Toutes les leçons disponibles sont terminées.</p>
        ) : (
          <ol className="space-y-2">
            {report.lessons.map(({ lesson, reason }) => (
              <li key={lesson.id}>
                <Link href={lesson.href} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 text-sm hover:border-line-strong">
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{lesson.title}</span>
                    <span className="text-muted">{reason}</span>
                  </span>
                  <Icon name="chevron-right" className="shrink-0 text-muted" />
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="revisions-planifiees">
        <SectionTitle id="revisions-planifiees">Révisions planifiées</SectionTitle>
        <PremiumGate
          title="Coach étendu"
          description="Le planning des révisions sur 7 jours fait partie du coach étendu de l’offre Premium. Vos révisions du jour restent accessibles dans « Révisions »."
        >
        <Card>
          <p className="text-sm">
            <strong>{report.reviews.dueNow}</strong> révision{report.reviews.dueNow > 1 ? "s" : ""} à faire aujourd’hui.
          </p>
          <ul className="mt-3 grid grid-cols-7 gap-1 text-center text-xs" aria-label="Révisions des 7 prochains jours">
            {report.reviews.upcoming.map((d) => (
              <li key={d.day} className="rounded-xl bg-surface-2 px-1 py-2">
                <span className="block text-muted">{dayName.format(parseDay(d.day))}</span>
                <span className="mt-1 block text-base font-bold tabular-nums">{d.count}</span>
              </li>
            ))}
          </ul>
          <ButtonLink href="/revisions" className="mt-4" variant="secondary">
            Ouvrir mes révisions
          </ButtonLink>
        </Card>
        </PremiumGate>
      </section>

      <section aria-labelledby="erreurs-repetees">
        <SectionTitle id="erreurs-repetees">Erreurs répétées</SectionTitle>
        {report.repeatedErrors.length === 0 ? (
          <p className="text-sm text-muted">Aucune question manquée deux fois ou plus et encore à corriger.</p>
        ) : (
          <ul className="space-y-2">
            {report.repeatedErrors.slice(0, 5).map((e) => (
              <li key={e.questionId} className="rounded-2xl border border-line bg-surface p-3 text-sm">
                <p className="font-semibold">{questionById(e.questionId)?.prompt}</p>
                <p className="mt-1 text-xs text-muted">
                  Manquée {e.wrongCount} fois · dernière fois le {shortDate.format(new Date(e.lastWrongAt))}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="examens-recents">
        <SectionTitle id="examens-recents">Examens récents</SectionTitle>
        <PremiumGate
          title="Coach étendu"
          description="Le suivi des examens récents et leur tendance font partie du coach étendu de l’offre Premium."
        >
        {report.exams.recent.length === 0 ? (
          <p className="text-sm text-muted">Aucun examen terminé pour le moment.</p>
        ) : (
          <Card className="text-sm">
            <ul className="divide-y divide-line">
              {report.exams.recent.map((e) => (
                <li key={e.finishedAt} className="flex justify-between gap-3 py-2">
                  <span className="text-muted">{shortDate.format(new Date(e.finishedAt))}</span>
                  <span className="font-semibold tabular-nums">
                    {e.correct} / {e.total}
                  </span>
                </li>
              ))}
            </ul>
            {report.exams.trend && (
              <p className="mt-2 text-muted">
                Tendance : {report.exams.trend === "hausse" ? "en hausse" : report.exams.trend === "baisse" ? "en baisse" : "stable"}.
              </p>
            )}
          </Card>
        )}
        </PremiumGate>
      </section>

      <section aria-labelledby="progression-ludique">
        <SectionTitle id="progression-ludique">Progression ludique</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <StatTile icon="sparkles" label="Niveau" value={String(rewards.level.level)} hint={`${rewards.totalXp} XP`} />
          <StatTile
            icon="flame"
            label="Série de révisions"
            value={`${rewards.streak.current} j`}
            hint={`Record : ${rewards.streak.best} j${rewards.streak.today ? " · faite aujourd’hui" : ""}`}
          />
        </div>
        <ProgressBar
          value={rewards.level.progress}
          label={`Niveau ${rewards.level.level} : ${rewards.totalXp} XP sur ${rewards.level.next}`}
          className="mt-3"
        />
        <p className="mt-1 text-xs text-muted">
          {rewards.level.next - rewards.totalXp} XP avant le niveau {rewards.level.level + 1}.
        </p>
        {rewards.guessing && (
          <Alert tone="info" role="status" className="mt-3" title="XP de réponse en pause">
            Moins de 4 de vos 10 dernières réponses sont justes : prenez le temps de lire l’énoncé et l’explication. Les
            XP de réponse reprennent dès que la précision remonte.
          </Alert>
        )}

        <h3 className="mb-2 mt-6 font-bold">Défis du jour</h3>
        <ul className="space-y-2">
          {rewards.challenges.map((c) => (
            <li key={c.id} className="rounded-2xl border border-line bg-surface p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 flex-1 font-semibold">{c.title}</span>
                {c.done ? <Badge tone="success">Relevé · +{XP_RULES.challengeCompleted} XP</Badge> : <span className="tabular-nums text-muted">{c.progress} / {c.target}</span>}
              </div>
              <ProgressBar value={c.progress / c.target} tone={c.done ? "success" : "brand"} label={`Avancement : ${c.title}`} className="mt-2 h-1.5" />
            </li>
          ))}
        </ul>

        <h3 className="mb-2 mt-6 font-bold">Badges</h3>
        <ul className="grid gap-2 sm:grid-cols-2">
          {rewards.badges.map((b) => (
            <li key={b.id} className={b.earned ? "rounded-2xl border border-success bg-success-soft p-3 text-sm" : "rounded-2xl border border-dashed border-line-strong p-3 text-sm"}>
              <p className="flex items-center gap-2 font-semibold">
                <Icon name={b.earned ? "check" : "lock"} size={16} className={b.earned ? "text-success-text" : "text-muted"} />
                {b.title}
                <span className="sr-only">{b.earned ? " (obtenu)" : " (à obtenir)"}</span>
              </p>
              <p className="mt-1 text-muted">{b.criteria}</p>
              {!b.earned && b.target > 1 && (
                <p className="mt-1 text-xs tabular-nums text-muted">
                  {b.progress} / {b.target}
                </p>
              )}
            </li>
          ))}
        </ul>

        <details className="mt-6 rounded-2xl border border-line bg-surface p-4 text-sm">
          <summary className="cursor-pointer font-semibold">Comment gagner des XP ?</summary>
          <ul className="mt-3 space-y-1">
            {(Object.keys(XP_LABELS) as XpReason[]).map((reason) => (
              <li key={reason} className="flex justify-between gap-3">
                <span>{XP_LABELS[reason]}</span>
                <span className="shrink-0 font-semibold tabular-nums">+{XP_VALUES[reason]}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-muted">
            Une mauvaise réponse ne rapporte rien et ne retire rien. Les XP de réponse sont plafonnés à{" "}
            {XP_RULES.dailyAnswerCap} par jour et suspendus si moins de 4 des 10 dernières réponses sont justes :
            répondre au hasard ne paie pas. Niveaux et badges mesurent votre activité ; ils ne remplacent ni la
            maîtrise des compétences ni l’indicateur de préparation.
          </p>
        </details>
      </section>
    </div>
  );
}
