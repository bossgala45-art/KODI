"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert, Card, LoadingBlock, ProgressBar } from "@/components/ui/display";
import { cn } from "@/lib/cn";
import {
  examApi,
  firstUnanswered,
  sourceLabel,
  type ExamApi,
  type ServerCorrection,
  type ServerExam,
} from "@/lib/exam/server-exam";
import { appendSession, createSessionId, formatPercent, historyStore } from "@/lib/history";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { toUserFacingError, type UserFacingError } from "@/lib/supabase/errors";

type Phase =
  | { name: "intro" }
  | { name: "loading" }
  | { name: "running"; exam: ServerExam; index: number }
  | { name: "submitting"; exam: ServerExam }
  | { name: "result"; correction: ServerCorrection }
  | { name: "not-enough" };

function hint(count: number): string {
  return count > 1 ? `${count} réponses attendues.` : "Une seule réponse attendue.";
}

/**
 * Examen blanc côté serveur (compte connecté) : tirage, enregistrement des
 * réponses et correction sont faits par la base. Les bonnes réponses ne sont
 * reçues qu'après la remise.
 */
export function ServerExamRunner({
  onUseLocal,
  api: injectedApi,
}: {
  /** Repli sur l'examen local (questions non relues) si la base n'a pas assez de questions validées. */
  onUseLocal: () => void;
  api?: ExamApi;
}) {
  const api = useMemo(() => {
    if (injectedApi) return injectedApi;
    const client = getBrowserSupabase();
    return client ? examApi(client) : null;
  }, [injectedApi]);
  const [phase, setPhase] = useState<Phase>({ name: "intro" });
  const [selection, setSelection] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<UserFacingError | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const running = phase.name === "running" ? phase : null;
  const item = running ? running.exam.items[running.index] : undefined;

  useEffect(() => {
    headingRef.current?.focus();
  }, [phase.name, running?.index]);

  if (!api) return null;
  const examApiClient = api;

  /** Affiche une question en reprenant la réponse déjà enregistrée. */
  function goTo(exam: ServerExam, index: number) {
    setSelection(exam.items[index]?.selected_choice_ids ?? []);
    setPhase({ name: "running", exam, index });
  }

  async function start() {
    setError(null);
    setPhase({ name: "loading" });
    try {
      const id = await examApiClient.start();
      const exam = await examApiClient.get(id);
      goTo(exam, firstUnanswered(exam));
    } catch (caught) {
      const facing = toUserFacingError(caught);
      if (String((caught as { message?: unknown })?.message).includes("KODI_NOT_ENOUGH_QUESTIONS")) {
        setPhase({ name: "not-enough" });
      } else {
        setError(facing);
        setPhase({ name: "intro" });
      }
    }
  }

  async function submit(exam: ServerExam) {
    setPhase({ name: "submitting", exam });
    try {
      const result = await examApiClient.submit(exam.id);
      historyStore.set((history) =>
        appendSession(history, {
          id: createSessionId(),
          mode: "simulation",
          finishedAt: new Date().toISOString(),
          correct: result.score,
          total: result.question_count,
          demo: false,
        }),
      );
      const correction = await examApiClient.correction(exam.id);
      setPhase({ name: "result", correction });
    } catch (caught) {
      setError(toUserFacingError(caught));
      goTo(exam, exam.items.length - 1);
    }
  }

  async function validate() {
    if (!running || !item || selection.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      await examApiClient.answer(running.exam.id, item.position, selection);
      const items = running.exam.items.map((i) =>
        i.position === item.position ? { ...i, selected_choice_ids: selection } : i,
      );
      const exam = { ...running.exam, items };
      if (running.index === exam.items.length - 1) await submit(exam);
      else goTo(exam, running.index + 1);
    } catch (caught) {
      // La réponse n'est pas perdue : elle reste sélectionnée, on peut réessayer.
      setError(toUserFacingError(caught));
    } finally {
      setSaving(false);
    }
  }

  async function abandon() {
    if (!running) return;
    try {
      await examApiClient.abandon(running.exam.id);
    } catch {
      // Sans réseau, l'examen restera « en cours » et sera repris au prochain lancement.
    }
    setPhase({ name: "intro" });
  }

  const errorBox = error && (
    <Alert tone="danger" role="alert" title={error.kind === "network" ? "Problème de connexion" : undefined} className="mt-4">
      {error.message}
    </Alert>
  );

  if (phase.name === "loading") return <LoadingBlock label="Préparation de l’examen…" />;
  if (phase.name === "submitting") return <LoadingBlock label="Correction en cours…" />;

  if (phase.name === "not-enough") {
    return (
      <Card className="animate-enter">
        <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold focus:outline-none">
          Pas encore assez de questions validées
        </h2>
        <p className="mt-2 text-sm text-muted">
          La base ne contient pas encore 40 questions relues et publiées. Les
          questions en cours de relecture restent non publiques.
        </p>
        <div className="mt-5 flex flex-col gap-3">
          <Button onClick={onUseLocal}>Faire l’examen sur cet appareil (questions non relues)</Button>
          <Button variant="secondary" onClick={() => setPhase({ name: "intro" })}>
            Retour
          </Button>
        </div>
      </Card>
    );
  }

  if (phase.name === "result") {
    const { correction } = phase;
    return (
      <div className="animate-enter">
        <Card className="text-center">
          <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold focus:outline-none">
            Examen blanc terminé
          </h2>
          <p className="mt-2 text-4xl font-extrabold tabular-nums">
            {correction.score} / {correction.question_count}
          </p>
          <p className="mt-1 text-muted">{formatPercent(correction.score / correction.question_count)} de bonnes réponses</p>
          <p
            className={cn(
              "mx-auto mt-4 w-fit rounded-full px-4 py-1.5 text-sm font-bold",
              correction.passed ? "bg-success-soft text-success-text" : "bg-danger-soft text-danger-text",
            )}
          >
            {correction.passed
              ? `Réussi : au moins ${correction.pass_mark} bonnes réponses`
              : `Échoué : il faut au moins ${correction.pass_mark} bonnes réponses`}
          </p>
          <p className="mt-4 text-sm text-muted">Résultat enregistré sur votre compte.</p>
        </Card>
        <section aria-labelledby="corrige-serveur" className="mt-6">
          <h3 id="corrige-serveur" className="mb-3 text-lg font-bold">
            Corrigé
          </h3>
          <ol className="space-y-3">
            {correction.items.map((c) => {
              const labels = (ids: string[] | null) =>
                c.choices.filter((choice) => ids?.includes(choice.id)).map((choice) => choice.label).join(", ");
              return (
                <li key={c.position} className="rounded-2xl border border-line bg-surface p-4 text-sm">
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
                        <a href={source.url} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-text underline underline-offset-2">
                          {sourceLabel(source)}
                          <span className="sr-only"> (nouvel onglet)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        </section>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" block onClick={() => setPhase({ name: "intro" })}>
            Nouvel examen
          </Button>
          <ButtonLink href="/progression" variant="secondary" size="lg" block>
            Voir ma progression
          </ButtonLink>
        </div>
      </div>
    );
  }

  if (running && item) {
    const multiple = item.answer_count > 1;
    const total = running.exam.items.length;
    const isLast = running.index === total - 1;
    return (
      <div className="animate-enter">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={abandon} className="-ml-3">
            <Icon name="close" size={18} />
            Abandonner
          </Button>
          <span className="text-xs font-semibold text-muted">Questions validées</span>
        </div>
        <p className="mb-2 text-sm font-semibold text-muted">
          Question {running.index + 1} sur {total}
        </p>
        <ProgressBar value={running.index / total} label="Avancement de l’examen" />
        <Card className="mt-5" key={item.position}>
          <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold leading-snug text-balance focus:outline-none">
            {item.prompt}
          </h2>
          <p className="mt-2 text-sm text-muted">{hint(item.answer_count)}</p>
          <fieldset className="mt-5" disabled={saving}>
            <legend className="sr-only">Propositions</legend>
            <div className="space-y-3">
              {item.choices.map((choice, i) => {
                const checked = selection.includes(choice.id);
                return (
                  <label
                    key={choice.id}
                    className={cn(
                      "flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 font-medium transition-[border-color,background-color] duration-150 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand",
                      checked ? "border-brand bg-brand-soft" : "border-line bg-surface hover:border-line-strong",
                    )}
                  >
                    <input
                      type={multiple ? "checkbox" : "radio"}
                      name={`exam-${item.position}`}
                      checked={checked}
                      onChange={() =>
                        setSelection((current) =>
                          multiple
                            ? current.includes(choice.id)
                              ? current.filter((id) => id !== choice.id)
                              : [...current, choice.id]
                            : [choice.id],
                        )
                      }
                      className="sr-only"
                    />
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-xl text-sm font-bold",
                        checked ? "bg-brand-strong text-on-brand" : "bg-surface-2 text-muted",
                      )}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{choice.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </Card>
        <div aria-live="polite">{errorBox}</div>
        <Button block size="lg" className="mt-5" onClick={validate} disabled={selection.length === 0} loading={saving}>
          {isLast ? "Valider et terminer" : "Valider"}
        </Button>
      </div>
    );
  }

  return (
    <Card className="animate-enter">
      <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold focus:outline-none">
        Examen blanc
      </h2>
      <ul className="mt-3 space-y-2 text-sm">
        {[
          "40 questions validées, tirées au hasard par le serveur",
          "Réussi à partir de 35 bonnes réponses",
          "Corrigé révélé uniquement après la remise",
          "Résultat enregistré sur votre compte",
        ].map((line) => (
          <li key={line} className="flex items-start gap-2">
            <Icon name="check" size={18} className="mt-px shrink-0 text-success-text" />
            {line}
          </li>
        ))}
      </ul>
      <Button size="lg" block className="mt-6" onClick={start}>
        Lancer l’examen blanc
        <Icon name="arrow-right" size={18} />
      </Button>
      <div aria-live="polite">{errorBox}</div>
    </Card>
  );
}
