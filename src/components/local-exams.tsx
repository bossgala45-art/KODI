"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { QuizRunner } from "@/components/quiz-runner";
import { Button } from "@/components/ui/button";
import { Card, ReviewBadge } from "@/components/ui/display";
import { shuffle, shuffleChoices, type QuizQuestion } from "@/lib/quiz";
import { seriesLength } from "@/lib/revision/themes";

export interface LocalExamFormat {
  id: string;
  title: string;
  summary: string;
  questionCount: number;
  passMark?: number;
}

/**
 * Examens blancs corrigés sur cet appareil (édition personnelle, D-032) :
 * aucune correction avant la fin, puis bilan détaillé. Le résultat est
 * enregistré localement, comme les séries d'entraînement.
 */
export function LocalExams({ bank, formats }: { bank: readonly QuizQuestion[]; formats: readonly LocalExamFormat[] }) {
  const [run, setRun] = useState<{ id: number; format: LocalExamFormat; questions: QuizQuestion[] } | null>(null);

  const start = (format: LocalExamFormat) =>
    setRun((previous) => ({
      id: (previous?.id ?? 0) + 1,
      format,
      questions: shuffle(bank, Math.random)
        .slice(0, format.questionCount)
        .map((question) => shuffleChoices(question, Math.random)),
    }));

  if (run) {
    return (
      <QuizRunner
        key={run.id}
        mode="simulation"
        content="non-relue"
        passMark={run.format.passMark}
        questions={run.questions}
        onExit={() => setRun(null)}
        onRestart={() => start(run.format)}
      />
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {formats.map((format) => {
        const available = seriesLength(bank.length, format.questionCount) === format.questionCount;
        return (
          <li key={format.id}>
            <Card className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-brand-strong text-on-brand">
                  <Icon name="target" size={22} />
                </span>
                <ReviewBadge />
              </div>
              <h3 className="mt-3 text-lg font-bold">{format.title}</h3>
              <p className="mt-1 flex-1 text-sm text-muted">{format.summary}</p>
              {available ? (
                <Button className="mt-4" block onClick={() => start(format)}>
                  Lancer : {format.title}
                  <Icon name="arrow-right" size={18} />
                </Button>
              ) : (
                <p className="mt-4 text-sm text-muted">
                  Pas assez de questions : {bank.length} / {format.questionCount}.
                </p>
              )}
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
