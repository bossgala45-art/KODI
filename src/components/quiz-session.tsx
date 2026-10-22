"use client";

import { useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";
import { QuizRunner } from "@/components/quiz-runner";
import { Button } from "@/components/ui/button";
import { Card, DemoBadge } from "@/components/ui/display";
import type { SessionMode } from "@/lib/history";
import { shuffle, type QuizQuestion } from "@/lib/quiz";

interface QuizSessionProps {
  mode: SessionMode;
  bank: readonly QuizQuestion[];
  length: number;
  title: string;
  icon: IconName;
  details: readonly string[];
  startLabel: string;
  notice: ReactNode;
}

/** Écran d'introduction d'une série, puis déroulé du quiz. */
export function QuizSession({
  mode,
  bank,
  length,
  title,
  icon,
  details,
  startLabel,
  notice,
}: QuizSessionProps) {
  const [run, setRun] = useState<{ id: number; questions: QuizQuestion[] } | null>(null);

  const start = () =>
    setRun((previous) => ({
      id: (previous?.id ?? 0) + 1,
      questions: shuffle(bank, Math.random).slice(0, length),
    }));

  if (run) {
    return (
      <QuizRunner
        key={run.id}
        mode={mode}
        questions={run.questions}
        onExit={() => setRun(null)}
        onRestart={start}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card className="relative overflow-hidden animate-enter">
        <div
          aria-hidden="true"
          className="absolute -right-10 -top-10 size-40 rounded-full bg-brand-soft"
        />
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-strong text-on-brand">
              <Icon name={icon} size={24} />
            </span>
            <DemoBadge />
          </div>
          <h2 className="mt-4 text-xl font-bold">{title}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {details.map((detail) => (
              <li key={detail} className="flex items-start gap-2">
                <Icon name="check" size={18} className="mt-px shrink-0 text-success-text" />
                {detail}
              </li>
            ))}
          </ul>
          <Button size="lg" block className="mt-6" onClick={start}>
            {startLabel}
            <Icon name="arrow-right" size={18} />
          </Button>
        </div>
      </Card>
      <div className="text-sm text-muted">{notice}</div>
    </div>
  );
}
