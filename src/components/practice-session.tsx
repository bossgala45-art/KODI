"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { StatusBadge } from "@/components/content-status";
import { Icon } from "@/components/icons";
import { SourceList } from "@/components/quiz-runner";
import { Button } from "@/components/ui/button";
import { Alert, Card, ProgressBar } from "@/components/ui/display";
import type { PracticeQuestion } from "@/content/catalog";
import { cn } from "@/lib/cn";
import type { GradeResult } from "@/lib/pedagogy/grading";
import type { AnswerContext } from "@/lib/pedagogy/history";
import { recordAnswer } from "@/lib/pedagogy/progress";
import { shuffleChoices } from "@/lib/quiz";

const letter = (index: number) => String.fromCharCode(65 + index);

function hint(question: PracticeQuestion): string {
  return question.kind === "single"
    ? "Une seule réponse attendue."
    : `${question.correct.length} réponses attendues : cochez-les toutes.`;
}

/** Détail de la correction d'une réponse multiple : oublis et erreurs. */
function GradeDetail({ question, grade }: { question: PracticeQuestion; grade: GradeResult }) {
  if (grade.correct || question.kind === "single") return null;
  const labels = (ids: readonly string[]) =>
    ids.map((id) => letter(question.choices.findIndex((c) => c.id === id))).join(", ");
  return (
    <ul className="mt-2 list-disc space-y-0.5 pl-5">
      {grade.missed.length > 0 && <li>Bonne(s) réponse(s) oubliée(s) : {labels(grade.missed)}</li>}
      {grade.wrong.length > 0 && <li>Cochée(s) à tort : {labels(grade.wrong)}</li>}
      <li>Une réponse multiple n’est juste que si toutes les bonnes propositions, et elles seules, sont cochées.</li>
    </ul>
  );
}

interface PracticeSessionProps {
  questions: readonly PracticeQuestion[];
  context: AnswerContext;
  /** Libellé lu par les lecteurs d'écran pour la barre d'avancement. */
  label: string;
  /** Appelé une fois la série terminée. */
  onComplete?: (result: { correct: number; total: number }) => void;
  /** Actions affichées sous le bilan. */
  actions?: ReactNode;
  /**
   * Mélange des propositions à chaque série. Seulement pour une série montée
   * après un clic : un tirage au rendu serveur ne correspondrait pas au client.
   */
  random?: () => number;
}

/**
 * Série de questions corrigées une à une par le moteur pédagogique. Chaque
 * réponse est enregistrée dans l'historique : maîtrise, révisions et carnet
 * d'erreurs se mettent à jour aussitôt.
 */
export function PracticeSession({
  questions: original,
  context,
  label,
  onComplete,
  actions,
  random,
}: PracticeSessionProps) {
  const [questions] = useState(() =>
    random ? original.map((question) => shuffleChoices(question, random)) : original,
  );
  const [index, setIndex] = useState(0);
  const [selection, setSelection] = useState<string[]>([]);
  const [grade, setGrade] = useState<GradeResult | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const finished = results.length === questions.length && grade === null;

  useEffect(() => {
    headingRef.current?.focus();
  }, [index, finished]);

  if (questions.length === 0) return null;

  if (finished) {
    const correct = results.filter(Boolean).length;
    return (
      <Card className="text-center animate-enter">
        <span className="mx-auto grid size-14 place-items-center rounded-3xl bg-success text-on-status animate-pop">
          <Icon name="sparkles" size={26} />
        </span>
        <h2 ref={headingRef} tabIndex={-1} className="mt-4 text-2xl font-bold focus:outline-none">
          Série terminée
        </h2>
        <p className="mt-2 text-4xl font-extrabold tabular-nums">
          {correct} / {questions.length}
        </p>
        <p className="mt-3 text-sm text-muted">
          Vos réponses sont enregistrées sur cet appareil : les erreurs rejoignent le carnet d’erreurs et
          les prochaines révisions sont planifiées.
        </p>
        {actions && <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">{actions}</div>}
      </Card>
    );
  }

  const question = questions[index]!;
  const multiple = question.kind === "multiple";
  const submitted = grade !== null;
  const last = index === questions.length - 1;

  function toggle(choiceId: string) {
    setSelection((current) =>
      multiple
        ? current.includes(choiceId)
          ? current.filter((id) => id !== choiceId)
          : [...current, choiceId]
        : [choiceId],
    );
  }

  function validate() {
    const result = recordAnswer(question, selection, context);
    setGrade(result);
    setResults((r) => [...r, result.correct]);
  }

  function next() {
    setGrade(null);
    setSelection([]);
    if (last) {
      onComplete?.({ correct: [...results].filter(Boolean).length, total: questions.length });
    } else {
      setIndex((i) => i + 1);
    }
  }

  return (
    <div className="animate-enter">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-muted">
          Question {index + 1} sur {questions.length}
        </p>
        <StatusBadge status={question.status} demo={question.demo} />
      </div>
      <ProgressBar value={(index + (submitted ? 1 : 0)) / questions.length} label={label} />

      <Card className="mt-4" key={question.id}>
        <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold leading-snug text-balance focus:outline-none">
          {question.prompt}
        </h2>
        <p className="mt-2 text-sm text-muted">{hint(question)}</p>

        <fieldset className="mt-5" disabled={submitted}>
          <legend className="sr-only">Propositions</legend>
          <div className="space-y-3">
            {question.choices.map((choice, i) => {
              const checked = selection.includes(choice.id);
              const isRight = question.correct.includes(choice.id);
              return (
                <label
                  key={choice.id}
                  className={cn(
                    "flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 font-medium transition-[border-color,background-color] duration-150 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand",
                    !submitted &&
                      (checked ? "border-brand bg-brand-soft" : "border-line bg-surface hover:border-line-strong"),
                    submitted && isRight && "border-success bg-success-soft",
                    submitted && !isRight && checked && "border-danger bg-danger-soft",
                    submitted && !isRight && !checked && "border-line text-muted",
                    submitted && "cursor-default",
                  )}
                >
                  <input
                    type={multiple ? "checkbox" : "radio"}
                    name={`p-${question.id}`}
                    checked={checked}
                    onChange={() => toggle(choice.id)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-xl text-sm font-bold",
                      checked && !submitted ? "bg-brand-strong text-on-brand" : "bg-surface-2 text-muted",
                      submitted && isRight && "bg-success text-on-status",
                      submitted && !isRight && checked && "bg-danger text-on-status",
                    )}
                  >
                    {letter(i)}
                  </span>
                  <span className="flex-1">{choice.label}</span>
                  {submitted && isRight && <span className="sr-only">(bonne réponse)</span>}
                  {submitted && !isRight && checked && <span className="sr-only">(cochée à tort)</span>}
                </label>
              );
            })}
          </div>
        </fieldset>
      </Card>

      <div aria-live="polite" className="mt-4">
        {grade && (
          <Alert
            tone={grade.correct ? "success" : "danger"}
            title={grade.correct ? "Bonne réponse !" : "Ce n’est pas la bonne réponse."}
          >
            {question.explanation}
            <GradeDetail question={question} grade={grade} />
            {question.sources.length > 0 && <SourceList sources={question.sources} />}
            <Link
              href={`/professeur?question=${encodeURIComponent(question.id)}`}
              className="mt-3 inline-flex items-center gap-1 font-semibold text-brand-text underline underline-offset-2"
            >
              <Icon name="chat" size={16} />
              Demander au professeur
            </Link>
          </Alert>
        )}
      </div>

      <div className="mt-5">
        {submitted ? (
          <Button block size="lg" onClick={next}>
            {last ? "Voir le bilan" : "Question suivante"}
            <Icon name="arrow-right" size={18} />
          </Button>
        ) : (
          <Button block size="lg" onClick={validate} disabled={selection.length === 0}>
            Valider
          </Button>
        )}
      </div>
    </div>
  );
}
