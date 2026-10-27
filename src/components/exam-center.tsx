"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExamHistory, ExamResult } from "@/components/exam-report";
import { Icon } from "@/components/icons";
import { LocalExams, type LocalExamFormat } from "@/components/local-exams";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert, Card, LoadingBlock, ProgressBar, SectionTitle } from "@/components/ui/display";
import { Checkbox } from "@/components/ui/form";
import { COMPETENCES, UNIVERSES } from "@/content/catalog";
import { useAuth } from "@/lib/auth/session-store";
import { cn } from "@/lib/cn";
import {
  EXAM_MODES,
  EXAM_MODE_ORDER,
  availabilityMessage,
  unseenMessage,
  type CompetenceResult,
  type ExamAvailability,
  type ExamModeId,
  type ExamSummary,
} from "@/lib/exam/modes";
import { examApi, firstUnanswered, type ExamApi, type ServerCorrection, type ServerExam } from "@/lib/exam/server-exam";
import { appendSession, createSessionId, historyStore } from "@/lib/history";
import type { QuizQuestion } from "@/lib/quiz";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { toUserFacingError, type UserFacingError } from "@/lib/supabase/errors";

const LOCAL_FORMATS: readonly LocalExamFormat[] = (["officiel", "express"] as const).map((id) => {
  const mode = EXAM_MODES[id];
  return {
    id,
    title: mode.title,
    summary: mode.summary,
    questionCount: mode.questionCount,
    passMark: mode.passMark ?? undefined,
  };
});

/**
 * Point d'entrée de l'écran Simuler.
 * - Examens blancs sur cet appareil, tirés parmi les questions réelles non
 *   relues (édition personnelle, D-032), pour tout le monde.
 * - Avec un compte : examens tirés, enregistrés et corrigés par le serveur,
 *   parmi les seules questions validées.
 */
export function ExamCenter({ validated, bank }: { validated: number; bank: readonly QuizQuestion[] }) {
  const auth = useAuth();
  const api = useMemo(() => {
    if (auth.status !== "signed-in") return null;
    const client = getBrowserSupabase();
    return client ? examApi(client) : null;
  }, [auth.status]);

  return (
    <div className="space-y-8">
      <section aria-label="Examens blancs sur cet appareil">
        <LocalExams
          bank={bank}
          formats={LOCAL_FORMATS}
          intro={
            <>
              <SectionTitle id="examens-appareil">Examens blancs sur cet appareil</SectionTitle>
              <p className="mb-4 text-sm text-muted">
                Aucune correction avant la fin, puis le bilan question par question. Questions originales, pas
                encore relues ; résultat enregistré sur cet appareil.
              </p>
            </>
          }
        />
      </section>

      {auth.status === "signed-in" && api && (
        <section aria-labelledby="examens-compte">
          <SectionTitle id="examens-compte">Examens enregistrés sur votre compte</SectionTitle>
          <p className="mb-4 text-sm text-muted">
            Corrigés par le serveur, uniquement sur des questions validées ({validated} pour l’instant).
          </p>
          <ExamWorkspace api={api} />
        </section>
      )}
    </div>
  );
}

type Phase =
  | { name: "home" }
  | { name: "loading" }
  | { name: "running"; exam: ServerExam; index: number }
  | { name: "submitting"; exam: ServerExam }
  | { name: "result"; correction: ServerCorrection };

interface HomeData {
  history: ExamSummary[];
  stats: CompetenceResult[];
  availability: Partial<Record<ExamModeId, ExamAvailability>>;
}

function hint(count: number): string {
  return count > 1 ? `${count} réponses attendues.` : "Une seule réponse attendue.";
}

export function ExamWorkspace({ api }: { api: ExamApi }) {
  const [phase, setPhase] = useState<Phase>({ name: "home" });
  const [home, setHome] = useState<HomeData | null>(null);
  const [homeError, setHomeError] = useState<UserFacingError | null>(null);
  const [reload, setReload] = useState(0);
  const [targets, setTargets] = useState<string[]>([]);
  const [targetState, setTargetState] = useState<{ key: string; availability: ExamAvailability | null }>({
    key: "",
    availability: null,
  });
  const [selection, setSelection] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<UserFacingError | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const running = phase.name === "running" ? phase : null;
  const item = running ? running.exam.items[running.index] : undefined;

  useEffect(() => {
    headingRef.current?.focus();
  }, [phase.name, running?.index]);

  // Données de l'accueil : historique, statistiques, disponibilité des modes.
  useEffect(() => {
    if (phase.name !== "home") return;
    let cancelled = false;
    Promise.all([
      api.history(),
      api.competenceStats(),
      api.availability("officiel"),
      api.availability("express"),
      api.availability("revanche"),
    ])
      .then(([history, stats, officiel, express, revanche]) => {
        if (cancelled) return;
        setHome({ history, stats, availability: { officiel, express, revanche } });
        setHomeError(null);
      })
      .catch((caught: unknown) => {
        if (!cancelled) setHomeError(toUserFacingError(caught));
      });
    return () => {
      cancelled = true;
    };
  }, [api, phase.name, reload]);

  // Disponibilité de l'examen ciblé selon les univers choisis.
  const targetRefs = useMemo(
    () => COMPETENCES.filter((c) => targets.includes(c.universeId)).map((c) => c.id),
    [targets],
  );
  const targetKey = targetRefs.join(",");
  useEffect(() => {
    if (targetRefs.length === 0) return;
    let cancelled = false;
    api
      .availability("cible", targetRefs)
      .then((availability) => {
        if (!cancelled) setTargetState({ key: targetRefs.join(","), availability });
      })
      .catch(() => {
        if (!cancelled) setTargetState({ key: targetRefs.join(","), availability: null });
      });
    return () => {
      cancelled = true;
    };
  }, [api, targetRefs]);
  // Tant que la réponse pour la sélection actuelle n'est pas arrivée : rien.
  const targetAvailability = targetState.key === targetKey ? targetState.availability : null;

  const goTo = useCallback((exam: ServerExam, index: number) => {
    setSelection(exam.items[index]?.selected_choice_ids ?? []);
    setPhase({ name: "running", exam, index });
  }, []);

  async function open(examId: string) {
    const exam = await api.get(examId);
    goTo(exam, firstUnanswered(exam));
  }

  async function start(mode: ExamModeId, refs: string[] | null = null) {
    setError(null);
    setPhase({ name: "loading" });
    try {
      await open(await api.start(mode, refs));
    } catch (caught) {
      setError(toUserFacingError(caught));
      setPhase({ name: "home" });
    }
  }

  async function resume(examId: string) {
    setError(null);
    setPhase({ name: "loading" });
    try {
      await open(examId);
    } catch (caught) {
      setError(toUserFacingError(caught));
      setPhase({ name: "home" });
    }
  }

  async function abandon(examId: string) {
    setError(null);
    try {
      await api.abandon(examId);
    } catch (caught) {
      setError(toUserFacingError(caught));
    }
    setPhase({ name: "home" });
    setReload((r) => r + 1);
  }

  async function submit(exam: ServerExam) {
    setPhase({ name: "submitting", exam });
    try {
      const result = await api.submit(exam.id);
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
      setPhase({ name: "result", correction: await api.correction(exam.id) });
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
      await api.answer(running.exam.id, item.position, selection);
      const items = running.exam.items.map((i) =>
        i.position === item.position ? { ...i, selected_choice_ids: selection } : i,
      );
      const exam = { ...running.exam, items };
      if (running.index === exam.items.length - 1) await submit(exam);
      else goTo(exam, running.index + 1);
    } catch (caught) {
      // La réponse reste sélectionnée : on peut réessayer.
      setError(toUserFacingError(caught));
    } finally {
      setSaving(false);
    }
  }

  const errorBox = error && (
    <Alert tone="danger" role="alert" title={error.kind === "network" ? "Problème de connexion" : undefined} className="mt-4">
      {error.message}
    </Alert>
  );

  if (phase.name === "loading") return <LoadingBlock label="Préparation de l’examen…" />;
  if (phase.name === "submitting") return <LoadingBlock label="Correction en cours…" />;

  if (phase.name === "result") {
    return (
      <div className="animate-enter">
        <ExamResult correction={phase.correction} headingRef={headingRef} />
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" block onClick={() => setPhase({ name: "home" })}>
            Retour aux examens
          </Button>
          <ButtonLink href="/revisions" variant="secondary" size="lg" block>
            Mes révisions
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
          <Button variant="ghost" onClick={() => abandon(running.exam.id)} className="-ml-3">
            <Icon name="close" size={18} />
            Abandonner
          </Button>
          <span className="text-xs font-semibold text-muted">{EXAM_MODES[running.exam.mode].title}</span>
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
        <p className="mt-3 text-center text-xs text-muted">
          Chaque réponse est enregistrée sur le serveur : vous pouvez reprendre l’examen plus tard.
        </p>
      </div>
    );
  }

  // Accueil des examens.
  if (homeError && !home) {
    return (
      <Alert tone="danger" role="alert" title="Impossible de charger vos examens">
        {homeError.message}
        <div className="mt-3">
          <Button variant="secondary" onClick={() => setReload((r) => r + 1)}>
            Réessayer
          </Button>
        </div>
      </Alert>
    );
  }
  if (!home) return <LoadingBlock label="Chargement de vos examens…" />;

  const inProgress = home.history.find((e) => e.status === "in_progress");
  const modeAction = (id: ExamModeId, availability: ExamAvailability | null, refs: string[] | null = null) => {
    const mode = EXAM_MODES[id];
    const blocked = availability ? availabilityMessage(availability) : null;
    return (
      <div className="mt-4 space-y-3">
        {availability && !blocked && <p className="text-xs text-muted">{unseenMessage(availability)}</p>}
        {blocked && (
          <p role="status" className="rounded-2xl bg-danger-soft p-3 text-sm text-fg">
            {blocked}
          </p>
        )}
        <Button
          block
          onClick={() => start(id, refs)}
          disabled={!availability || Boolean(blocked) || Boolean(inProgress)}
        >
          Lancer : {mode.title.toLowerCase()}
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div aria-live="polite">{errorBox}</div>

      {inProgress && (
        <Card className="animate-enter">
          <h2 className="font-bold">Examen en cours : {EXAM_MODES[inProgress.mode].title}</h2>
          <p className="mt-1 text-sm text-muted">Vos réponses sont enregistrées. Reprenez-le, ou abandonnez-le pour en lancer un autre.</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => resume(inProgress.id)}>Reprendre</Button>
            <Button variant="secondary" onClick={() => abandon(inProgress.id)}>
              Abandonner
            </Button>
          </div>
        </Card>
      )}

      <section aria-labelledby="modes">
        <SectionTitle id="modes">Choisir un examen</SectionTitle>
        <ul className="grid gap-3">
          {EXAM_MODE_ORDER.map((id) => (
            <li key={id}>
              <Card>
                <h3 className="font-bold">{EXAM_MODES[id].title}</h3>
                <p className="mt-1 text-sm text-muted">{EXAM_MODES[id].summary}</p>
                {id === "cible" ? (
                  <>
                    <fieldset className="mt-4">
                      <legend className="text-sm font-semibold">Univers à travailler</legend>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {UNIVERSES.map((u) => (
                          <Checkbox
                            key={u.id}
                            label={u.title}
                            checked={targets.includes(u.id)}
                            onChange={(checked) =>
                              setTargets((current) =>
                                checked ? [...current, u.id] : current.filter((t) => t !== u.id),
                              )
                            }
                          />
                        ))}
                      </div>
                    </fieldset>
                    {targetRefs.length > 0 ? (
                      modeAction("cible", targetAvailability, targetRefs)
                    ) : (
                      <p className="mt-3 text-sm text-muted">Cochez au moins un univers.</p>
                    )}
                  </>
                ) : (
                  modeAction(id, home.availability[id] ?? null)
                )}
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="historique">
        <SectionTitle id="historique">Historique et statistiques</SectionTitle>
        <ExamHistory
          exams={home.history}
          competenceStats={home.stats}
          onRevenge={
            home.availability.revanche && !availabilityMessage(home.availability.revanche) && !inProgress
              ? () => start("revanche")
              : undefined
          }
        />
      </section>
    </div>
  );
}
