"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { Icon } from "@/components/icons";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert, Card, DemoBadge, ProgressBar } from "@/components/ui/display";
import { cn } from "@/lib/cn";
import {
  appendSession,
  createSessionId,
  formatPercent,
  historyStore,
  type SessionMode,
} from "@/lib/history";
import {
  canSubmit,
  createQuiz,
  currentQuestion,
  goToNext,
  isAnswerCorrect,
  isLastQuestion,
  isMultipleChoice,
  isSubmitted,
  scoreQuiz,
  selectionOf,
  submitAnswer,
  toggleChoice,
  type QuizQuestion,
  type QuizState,
} from "@/lib/quiz";

interface QuizRunnerProps {
  questions: readonly QuizQuestion[];
  mode: SessionMode;
  onExit: () => void;
  onRestart: () => void;
}

/**
 * Déroulé d'une série de questions.
 * - entraînement : correction et explication après chaque réponse ;
 * - simulation : aucune correction avant la fin, puis bilan détaillé.
 */
export function QuizRunner({ questions, mode, onExit, onRestart }: QuizRunnerProps) {
  const [state, setState] = useState<QuizState>(() => createQuiz(questions));
  const headingRef = useRef<HTMLHeadingElement>(null);
  const recorded = useRef(false);
  const immediate = mode === "entrainement";

  useEffect(() => {
    headingRef.current?.focus();
  }, [state.index, state.finished]);

  useEffect(() => {
    if (!state.finished || recorded.current) return;
    recorded.current = true;
    const { correct, total } = scoreQuiz(state);
    historyStore.set((history) =>
      appendSession(history, {
        id: createSessionId(),
        mode,
        finishedAt: new Date().toISOString(),
        correct,
        total,
        demo: true,
      }),
    );
  }, [state, mode]);

  if (state.finished) {
    return (
      <QuizResult
        state={state}
        mode={mode}
        headingRef={headingRef}
        onRestart={onRestart}
      />
    );
  }

  const question = currentQuestion(state);
  const multiple = isMultipleChoice(question);
  const selection = selectionOf(state, question.id);
  const submitted = isSubmitted(state, question.id);
  const showCorrection = immediate && submitted;
  const correct = isAnswerCorrect(question, selection);
  const position = state.index + 1;

  function handleValidate() {
    if (immediate) {
      setState(submitAnswer);
    } else {
      // En simulation, la validation enchaîne directement sur la suite.
      setState((s) => goToNext(submitAnswer(s)));
    }
  }

  return (
    <div className="animate-enter">
      <div className="mb-5 flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={onExit} className="-ml-3">
          <Icon name="close" size={18} />
          Quitter
        </Button>
        <DemoBadge />
      </div>

      <p className="mb-2 text-sm font-semibold text-muted">
        Question {position} sur {state.questions.length}
      </p>
      <ProgressBar
        value={(state.index + (submitted ? 1 : 0)) / state.questions.length}
        label="Avancement de la série"
      />

      <Card className="mt-5" key={question.id}>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-xl font-bold leading-snug text-balance focus:outline-none"
        >
          {question.prompt}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {multiple ? "Plusieurs réponses possibles." : "Une seule réponse possible."}
        </p>

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
                    "flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 font-medium transition-[border-color,background-color,transform] duration-150 active:scale-[0.99] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand",
                    !showCorrection &&
                      (checked
                        ? "border-brand bg-brand-soft"
                        : "border-line bg-surface hover:border-line-strong"),
                    showCorrection && isRight && "border-success bg-success-soft animate-pop",
                    showCorrection && !isRight && checked && "border-danger bg-danger-soft",
                    showCorrection && !isRight && !checked && "border-line text-muted",
                    submitted && "cursor-default active:scale-100",
                  )}
                >
                  <input
                    type={multiple ? "checkbox" : "radio"}
                    name={`q-${question.id}`}
                    checked={checked}
                    onChange={() => setState((s) => toggleChoice(s, choice.id))}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-xl text-sm font-bold",
                      checked && !showCorrection ? "bg-brand-strong text-on-brand" : "bg-surface-2 text-muted",
                      showCorrection && isRight && "bg-success text-on-status",
                      showCorrection && !isRight && checked && "bg-danger text-on-status",
                    )}
                  >
                    {showCorrection && isRight ? (
                      <Icon name="check" size={18} />
                    ) : showCorrection && checked ? (
                      <Icon name="close" size={18} />
                    ) : (
                      String.fromCharCode(65 + i)
                    )}
                  </span>
                  <span className="flex-1">{choice.label}</span>
                  {showCorrection && isRight && <span className="sr-only">(bonne réponse)</span>}
                  {showCorrection && !isRight && checked && (
                    <span className="sr-only">(réponse incorrecte)</span>
                  )}
                </label>
              );
            })}
          </div>
        </fieldset>
      </Card>

      <div aria-live="polite" className="mt-4">
        {showCorrection && (
          <Alert
            tone={correct ? "success" : "danger"}
            title={correct ? "Bonne réponse !" : "Ce n’est pas la bonne réponse."}
          >
            {question.explanation}
          </Alert>
        )}
      </div>

      <div className="mt-5">
        {showCorrection ? (
          <Button block size="lg" onClick={() => setState(goToNext)}>
            {isLastQuestion(state) ? "Voir le résultat" : "Question suivante"}
            <Icon name="arrow-right" size={18} />
          </Button>
        ) : (
          <Button block size="lg" onClick={handleValidate} disabled={!canSubmit(state)}>
            {immediate || !isLastQuestion(state) ? "Valider" : "Valider et terminer"}
          </Button>
        )}
      </div>
    </div>
  );
}

function QuizResult({
  state,
  mode,
  headingRef,
  onRestart,
}: {
  state: QuizState;
  mode: SessionMode;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onRestart: () => void;
}) {
  const { correct, total } = scoreQuiz(state);
  const ratio = correct / total;

  return (
    <div className="animate-enter">
      <div className="mb-5 flex justify-end">
        <DemoBadge />
      </div>
      <Card className="text-center">
        <span
          className={cn(
            "mx-auto grid size-16 place-items-center rounded-3xl animate-pop",
            ratio >= 0.5 ? "bg-success text-on-status" : "bg-brand-soft text-brand-text",
          )}
        >
          <Icon name={ratio >= 0.5 ? "sparkles" : "target"} size={30} />
        </span>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="mt-4 text-2xl font-bold focus:outline-none"
        >
          {mode === "simulation" ? "Examen blanc terminé" : "Série terminée"}
        </h2>
        <p className="mt-2 text-4xl font-extrabold tabular-nums">
          {correct} / {total}
        </p>
        <p className="mt-1 text-muted">{formatPercent(ratio)} de bonnes réponses</p>
        <p className="mt-4 text-sm text-muted">
          Résultat enregistré sur cet appareil. Il porte sur des questions
          fictives et n’indique pas votre niveau réel.
        </p>
      </Card>

      {mode === "simulation" && (
        <section aria-labelledby="corrige" className="mt-6">
          <h3 id="corrige" className="mb-3 text-lg font-bold">
            Corrigé
          </h3>
          <ol className="space-y-3">
            {state.questions.map((question, i) => {
              const selection = selectionOf(state, question.id);
              const ok = isAnswerCorrect(question, selection);
              const labels = (ids: readonly string[]) =>
                question.choices
                  .filter((choice) => ids.includes(choice.id))
                  .map((choice) => choice.label)
                  .join(", ");
              return (
                <li key={question.id} className="rounded-2xl border border-line bg-surface p-4">
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "grid size-7 shrink-0 place-items-center rounded-lg",
                        ok ? "bg-success text-on-status" : "bg-danger text-on-status",
                      )}
                    >
                      <Icon name={ok ? "check" : "close"} size={16} />
                    </span>
                    <div className="min-w-0 text-sm">
                      <p className="font-semibold">
                        {i + 1}. {question.prompt}
                        <span className="sr-only">{ok ? " — correct" : " — incorrect"}</span>
                      </p>
                      {!ok && (
                        <p className="mt-1 text-danger-text">
                          Votre réponse : {labels(selection) || "aucune"}
                        </p>
                      )}
                      <p className="mt-1 text-success-text">
                        Bonne réponse : {labels(question.correct)}
                      </p>
                      <p className="mt-1 text-muted">{question.explanation}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" block onClick={onRestart}>
          <Icon name="refresh" size={18} />
          Recommencer
        </Button>
        <ButtonLink href="/progression" variant="secondary" size="lg" block>
          Voir ma progression
        </ButtonLink>
      </div>
    </div>
  );
}
