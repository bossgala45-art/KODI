"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { PracticeSession } from "@/components/practice-session";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert, Badge, Card, EmptyState, LoadingBlock, ProgressBar, SectionTitle, type BadgeTone } from "@/components/ui/display";
import {
  COMPETENCES,
  LESSONS,
  PRACTICE_QUESTIONS,
  UNIVERSES,
  competencesOf,
  lessonHref,
  lessonOrder,
  questionById,
  toPracticeQuestion,
  type PracticeQuestion,
} from "@/content/catalog";
import { formatPercent } from "@/lib/history";
import type { PlanReason } from "@/lib/pedagogy/daily-plan";
import { answerHistoryStore } from "@/lib/pedagogy/history";
import { MASTERY_LABELS, type MasteryEstimate, type MasteryLevel } from "@/lib/pedagogy/mastery";
import { completeLesson, lessonProgressStore } from "@/lib/pedagogy/progress";
import { learnerOverview } from "@/lib/pedagogy/today";
import { profileStore } from "@/lib/profile";
import { useHydrated, useStore } from "@/lib/use-store";

const PLAN_QUESTIONS = PRACTICE_QUESTIONS.map((q) => ({ id: q.id, competenceIds: q.competenceIds }));
const PLAN_LESSONS = LESSONS.map((l) => ({ id: l.id, title: l.title, position: lessonOrder(l) }));

function useOverview() {
  const hydrated = useHydrated();
  const history = useStore(answerHistoryStore);
  const profile = useStore(profileStore);
  const completedLessons = useStore(lessonProgressStore);
  const overview = useMemo(
    () =>
      learnerOverview({
        history,
        now: new Date(),
        dailyGoal: profile.dailyGoal,
        questions: PLAN_QUESTIONS,
        lessons: PLAN_LESSONS,
        completedLessons,
      }),
    [history, profile.dailyGoal, completedLessons],
  );
  return { hydrated, history, overview, completedLessons };
}

function practiceQuestions(ids: readonly string[]): PracticeQuestion[] {
  return ids.flatMap((id) => {
    const question = questionById(id);
    return question ? [toPracticeQuestion(question)] : [];
  });
}

const LEVEL_TONES: Record<MasteryLevel, BadgeTone> = {
  "non-evaluee": "neutral",
  fragile: "danger",
  "en-cours": "brand",
  maitrisee: "success",
};

function MasteryBadge({ estimate }: { estimate: MasteryEstimate | undefined }) {
  const level = estimate?.level ?? "non-evaluee";
  return <Badge tone={LEVEL_TONES[level]}>{MASTERY_LABELS[level]}</Badge>;
}

// ---------------------------------------------------------------------------
// Compétences
// ---------------------------------------------------------------------------
export function CompetenceMastery({ universeId }: { universeId: string }) {
  const { hydrated, overview } = useOverview();
  const competences = competencesOf(universeId);
  if (!hydrated) return <LoadingBlock label="Chargement de votre maîtrise…" lines={1} />;
  return (
    <ul className="space-y-3">
      {competences.map((c) => {
        const estimate = overview.mastery.get(c.id);
        return (
          <li key={c.id} className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <span className="min-w-0 flex-1 font-semibold">{c.title}</span>
              <MasteryBadge estimate={estimate} />
            </div>
            {c.description && <p className="mt-1 text-sm text-muted">{c.description}</p>}
            {estimate && estimate.level !== "non-evaluee" ? (
              <>
                <ProgressBar
                  value={estimate.score}
                  tone={estimate.level === "maitrisee" ? "success" : "brand"}
                  label={`Maîtrise estimée, ${c.title}`}
                  className="mt-3 h-1.5"
                />
                <p className="mt-1 text-xs text-muted">
                  Maîtrise estimée {formatPercent(estimate.score)} · {estimate.attempts} réponse
                  {estimate.attempts > 1 ? "s" : ""}
                </p>
              </>
            ) : (
              <p className="mt-2 text-xs text-muted">
                {estimate ? `${estimate.attempts} réponse${estimate.attempts > 1 ? "s" : ""} : ` : ""}
                au moins 3 réponses sont nécessaires pour estimer la maîtrise.
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Leçons
// ---------------------------------------------------------------------------
export function LessonDoneMark({ lessonId }: { lessonId: string }) {
  const hydrated = useHydrated();
  const progress = useStore(lessonProgressStore);
  if (!hydrated || !progress[lessonId]) return null;
  return (
    <Badge tone="success">
      <Icon name="check" size={14} />
      Terminée
    </Badge>
  );
}

export function LessonPractice({ lessonId, questionIds }: { lessonId: string; questionIds: readonly string[] }) {
  const hydrated = useHydrated();
  const progress = useStore(lessonProgressStore);
  const [running, setRunning] = useState(false);
  const [round, setRound] = useState(0);
  const questions = useMemo(() => practiceQuestions(questionIds), [questionIds]);
  const done = hydrated ? progress[lessonId] : undefined;

  if (running) {
    return (
      <PracticeSession
        key={round}
        questions={questions}
        context="lesson"
        random={Math.random}
        label="Avancement des questions de la leçon"
        onComplete={() => completeLesson(lessonId)}
        actions={
          <>
            <Button onClick={() => setRound((r) => r + 1)}>
              <Icon name="refresh" size={18} />
              Recommencer
            </Button>
            <ButtonLink href="/revisions" variant="secondary">
              Voir mes révisions
            </ButtonLink>
          </>
        }
      />
    );
  }

  return (
    <Card>
      <h2 className="font-bold">Vérifier ce que vous avez retenu</h2>
      <p className="mt-1 text-sm text-muted">
        {questions.length > 0
          ? `${questions.length} question${questions.length > 1 ? "s" : ""}, corrigée${questions.length > 1 ? "s" : ""} une à une. La leçon est marquée terminée à la fin de la série.`
          : "Aucune question n’est encore rattachée à cette leçon."}
      </p>
      {done && (
        <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-success-text">
          <Icon name="check" size={16} />
          Leçon terminée le {new Date(done).toLocaleDateString("fr-FR")}
        </p>
      )}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        {questions.length > 0 ? (
          <Button size="lg" onClick={() => setRunning(true)}>
            Commencer les questions
            <Icon name="arrow-right" size={18} />
          </Button>
        ) : (
          !done && (
            <Button size="lg" onClick={() => completeLesson(lessonId)}>
              <Icon name="check" size={18} />
              Marquer comme terminée
            </Button>
          )
        )}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Programme du jour
// ---------------------------------------------------------------------------
const REASON_LABELS: Record<PlanReason, string> = {
  erreur: "du carnet d’erreurs",
  revision: "à réviser",
  "competence-faible": "nouvelles, sur vos points faibles",
};

function reasonCounts(reasons: readonly PlanReason[]) {
  return (Object.keys(REASON_LABELS) as PlanReason[])
    .map((reason) => ({ reason, count: reasons.filter((r) => r === reason).length }))
    .filter((r) => r.count > 0);
}

export function DailyProgramCard() {
  const { hydrated, overview } = useOverview();
  if (!hydrated) return <LoadingBlock label="Préparation du programme du jour…" lines={1} />;
  const { plan } = overview;
  const lesson = plan.lesson ? LESSONS.find((l) => l.id === plan.lesson?.id) : undefined;

  return (
    <Card className="animate-enter">
      <h2 className="flex items-center gap-2 font-bold">
        <Icon name="calendar" size={20} className="text-brand-text" />
        Programme du jour
      </h2>
      {plan.goalReached ? (
        <p className="mt-2 text-sm">Objectif du jour atteint. Vous pouvez continuer à réviser si vous le souhaitez.</p>
      ) : (
        <>
          <p className="mt-2 text-sm">
            {plan.items.length} question{plan.items.length > 1 ? "s" : ""} choisie
            {plan.items.length > 1 ? "s" : ""} pour vous :
          </p>
          <ul className="mt-1 list-disc pl-5 text-sm text-muted">
            {reasonCounts(plan.items.map((i) => i.reason)).map(({ reason, count }) => (
              <li key={reason}>
                {count} {REASON_LABELS[reason]}
              </li>
            ))}
          </ul>
        </>
      )}
      {lesson && (
        <p className="mt-3 text-sm">
          Prochaine leçon :{" "}
          <Link href={lessonHref(lesson)} className="font-semibold text-brand-text underline underline-offset-2">
            {lesson.title}
          </Link>
        </p>
      )}
      <ButtonLink href="/revisions" className="mt-4" block>
        {plan.goalReached || plan.items.length === 0 ? "Voir mes révisions" : "Commencer le programme"}
        <Icon name="arrow-right" size={18} />
      </ButtonLink>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Révisions et carnet d'erreurs
// ---------------------------------------------------------------------------
const shortDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });

export function ReviewCenter() {
  const { hydrated, overview } = useOverview();
  const [series, setSeries] = useState<{ title: string; questions: PracticeQuestion[]; round: number } | null>(null);

  if (!hydrated) return <LoadingBlock label="Chargement de vos révisions…" />;

  if (series) {
    return (
      <section aria-label={series.title}>
        <Button variant="ghost" onClick={() => setSeries(null)} className="-ml-3 mb-3">
          <Icon name="close" size={18} />
          Quitter la série
        </Button>
        <PracticeSession
          key={series.round}
          questions={series.questions}
          context="review"
          random={Math.random}
          label={`Avancement, ${series.title}`}
          actions={
            <Button onClick={() => setSeries(null)}>
              Retour aux révisions
              <Icon name="arrow-right" size={18} />
            </Button>
          }
        />
      </section>
    );
  }

  const { plan, errorLog } = overview;
  const start = (title: string, ids: readonly string[]) =>
    setSeries({ title, questions: practiceQuestions(ids), round: Date.now() });
  const planIds = plan.items.map((i) => i.questionId);
  const extraIds = overview.extraPlan.items.map((i) => i.questionId);

  return (
    <div className="space-y-8">
      <section aria-labelledby="programme">
        <SectionTitle id="programme">Programme du jour</SectionTitle>
        <Card>
          {plan.items.length > 0 ? (
            <>
              <p className="text-sm">
                {plan.items.length} question{plan.items.length > 1 ? "s" : ""}, dans cet ordre de priorité :
              </p>
              <ul className="mt-1 list-disc pl-5 text-sm text-muted">
                {reasonCounts(plan.items.map((i) => i.reason)).map(({ reason, count }) => (
                  <li key={reason}>
                    {count} {REASON_LABELS[reason]}
                  </li>
                ))}
              </ul>
              <Button size="lg" className="mt-4" block onClick={() => start("Programme du jour", planIds)}>
                Commencer le programme
                <Icon name="arrow-right" size={18} />
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm">Objectif du jour atteint : rien d’obligatoire aujourd’hui.</p>
              {extraIds.length > 0 && (
                <Button className="mt-4" variant="secondary" onClick={() => start("Série supplémentaire", extraIds)}>
                  Faire une série supplémentaire
                </Button>
              )}
            </>
          )}
          <p className="mt-3 text-xs text-muted">
            Le programme suit des règles fixes, sans intelligence artificielle : carnet d’erreurs d’abord (30 % au
            plus), puis révisions arrivées à échéance, puis nouvelles questions sur vos compétences les plus
            faibles. Sa taille dépend de votre objectif quotidien (Profil).
          </p>
        </Card>
      </section>

      <section aria-labelledby="carnet">
        <SectionTitle
          id="carnet"
          aside={
            errorLog.length > 0 ? (
              <Button variant="ghost" onClick={() => start("Carnet d’erreurs", errorLog.map((e) => e.questionId))}>
                Tout revoir
              </Button>
            ) : undefined
          }
        >
          Carnet d’erreurs
        </SectionTitle>
        {errorLog.length === 0 ? (
          <EmptyState icon="check" title="Aucune erreur à revoir">
            Une question manquée apparaît ici jusqu’à ce que vous y répondiez juste deux fois de suite.
          </EmptyState>
        ) : (
          <ul className="space-y-3">
            {errorLog.map((entry) => {
              const question = questionById(entry.questionId);
              if (!question) return null;
              return (
                <li key={entry.questionId} className="rounded-2xl border border-line bg-surface p-4">
                  <p className="font-semibold">{question.prompt}</p>
                  <p className="mt-1 text-xs text-muted">
                    {entry.wrongCount} erreur{entry.wrongCount > 1 ? "s" : ""} · dernière le{" "}
                    {shortDate.format(new Date(entry.lastWrongAt))}
                    {entry.correctSince > 0 && " · 1 bonne réponse depuis, encore 1 pour la retirer"}
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-3"
                    onClick={() => start("Question du carnet", [entry.questionId])}
                  >
                    Revoir cette question
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="text-sm text-muted">
        Révisions arrivées à échéance : {overview.dueCount}. Après une bonne réponse, l’intervalle avant la
        prochaine révision grandit (1 jour, 3 jours, puis davantage) ; il est raccourci si la compétence est
        fragile. Après une erreur, la question revient dans 10 minutes.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Progression : maîtrise par univers
// ---------------------------------------------------------------------------
export function MasteryOverview() {
  const { hydrated, history, overview } = useOverview();
  if (!hydrated) return <LoadingBlock label="Chargement de la maîtrise par compétence…" lines={2} />;

  if (history.length === 0) {
    return (
      <EmptyState
        icon="target"
        title="Maîtrise pas encore estimée"
        action={<ButtonLink href="/apprendre">Commencer une leçon</ButtonLink>}
      >
        Répondez aux questions des leçons ou du programme du jour : la maîtrise de chaque compétence sera estimée
        à partir de vos réponses.
      </EmptyState>
    );
  }

  return (
    <div className="space-y-4">
      {overview.errorLog.length > 0 && (
        <Alert tone="danger" role="note" title={`Carnet d’erreurs : ${overview.errorLog.length} question(s) à revoir`}>
          <Link href="/revisions" className="font-semibold underline underline-offset-2">
            Ouvrir mes révisions
          </Link>
        </Alert>
      )}
      <ul className="space-y-3">
        {UNIVERSES.map((u) => {
          const items = COMPETENCES.filter((c) => c.universeId === u.id);
          return (
            <li key={u.id} className="rounded-2xl border border-line bg-surface p-4">
              <Link href={`/apprendre/${u.slug}`} className="font-semibold hover:underline">
                {u.title}
              </Link>
              <ul className="mt-2 space-y-1.5">
                {items.map((c) => {
                  const estimate = overview.mastery.get(c.id);
                  return (
                    <li key={c.id} className="flex items-start justify-between gap-3 text-sm">
                      <span className="min-w-0 flex-1 pt-0.5">{c.title}</span>
                      <span className="flex shrink-0 items-center gap-2">
                        {estimate && estimate.level !== "non-evaluee" && (
                          <span className="tabular-nums text-muted">{formatPercent(estimate.score)}</span>
                        )}
                        <MasteryBadge estimate={estimate} />
                      </span>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted">
        Maîtrise estimée sans intelligence artificielle : moyenne de vos réponses où les plus récentes comptent
        davantage (une réponse perd la moitié de son poids en 30 jours). « Maîtrisée » demande au moins 80 % et
        assez de réponses récentes.
      </p>
    </div>
  );
}
