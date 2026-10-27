"use client";

import { useState } from "react";
import { QuizSession } from "@/components/quiz-session";
import { SelectField } from "@/components/ui/form";
import type { QuizQuestion } from "@/lib/quiz";
import { seriesLength, type RevisionTheme } from "@/lib/revision/themes";

const ALL = "tous";

/** Série d'entraînement sur les questions réelles, tous thèmes ou un univers. */
export function TrainingCenter({
  bank,
  themes,
  length,
}: {
  bank: readonly QuizQuestion[];
  themes: readonly RevisionTheme<QuizQuestion>[];
  length: number;
}) {
  const [themeId, setThemeId] = useState(ALL);
  const theme = themes.find((t) => t.id === themeId);
  const questions = theme?.questions ?? bank;
  const count = seriesLength(questions.length, length);

  return (
    <QuizSession
      mode="entrainement"
      content="non-relue"
      bank={questions}
      length={count}
      title="Série d’entraînement"
      icon="target"
      startLabel="Commencer la série"
      details={[
        `${count} questions tirées au hasard${theme ? ` : ${theme.title}` : ", tous thèmes"}`,
        "Correction, explication et source après chaque question",
        "Erreurs ajoutées à vos révisions, sur cet appareil",
      ]}
      setup={
        <SelectField label="Thème" value={themeId} onChange={(event) => setThemeId(event.target.value)}>
          <option value={ALL}>Tous les thèmes ({bank.length} questions)</option>
          {themes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title} ({t.questions.length})
            </option>
          ))}
        </SelectField>
      }
      notice={
        <p>
          Questions <strong>originales</strong>, rédigées pour KODI à partir des pages officielles citées sous
          chaque correction. Elles ne viennent pas de la banque officielle de l’examen et{" "}
          <strong>n’ont pas encore été relues</strong> : en cas de doute, la source officielle fait foi.
        </p>
      }
    />
  );
}
