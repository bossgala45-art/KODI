"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { StatusBadge } from "@/components/content-status";
import { Icon } from "@/components/icons";
import { SourceList } from "@/components/quiz-runner";
import { Button } from "@/components/ui/button";
import { Alert, Badge, Card, EmptyState } from "@/components/ui/display";
import { SegmentedControl, SelectField, TextAreaField } from "@/components/ui/form";
import type { ContentStatus } from "@/lib/content/schema";
import {
  MAX_MESSAGE_LENGTH,
  TUTOR_KIND_LABELS,
  type PredefinedExplanation,
  type TutorKind,
  type TutorResponse,
  type TutorStatus,
} from "@/lib/tutor/types";

export interface TutorQuestionContext {
  id: string;
  prompt: string;
  status: ContentStatus;
  demo: boolean;
}

export interface TutorLessonOption {
  id: string;
  title: string;
}

type Failure = "trop-de-demandes" | "demande-invalide" | "reseau";

const FAILURES: Record<Failure, string> = {
  "trop-de-demandes": "Trop de demandes en une minute. Réessayez dans un instant.",
  "demande-invalide": "La demande n’a pas pu être traitée. Vérifiez le texte et réessayez.",
  reseau: "Le professeur est injoignable. Vérifiez votre connexion et réessayez.",
};

/** Bandeau toujours visible : dit sans ambiguïté si une IA générative est utilisée. */
export function TutorModeBanner({ status }: { status: TutorStatus }) {
  if (status.mode === "sans-ia") {
    return (
      <Alert tone="info" role="note" title="Mode sans IA générative">
        <p>
          Aucun service d’IA n’est connecté à KODI. Le professeur répond avec les explications prédéfinies du
          programme, affichées telles qu’elles ont été écrites, avec leur statut de relecture. Aucun texte n’est
          généré.
        </p>
      </Alert>
    );
  }
  return (
    <Alert tone="info" role="note" title={`IA générative connectée : ${status.providerLabel}`}>
      <p>
        Les réponses sont rédigées par une IA, uniquement à partir des contenus validés du programme (
        {status.validatedContents} aujourd’hui), puis vérifiées avant affichage. Sans source fiable, ce sont les
        explications prédéfinies qui s’affichent. Une réponse d’IA peut contenir des erreurs : les sources font foi.
      </p>
      {status.validatedContents === 0 && (
        <p className="mt-2 font-semibold">
          Aucun contenu n’est encore validé : l’IA n’est donc jamais appelée pour l’instant.
        </p>
      )}
    </Alert>
  );
}

function Predefined({ items }: { items: PredefinedExplanation[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon="book"
        title="Aucune explication ne correspond"
        action={
          <Link href="/apprendre" className="font-semibold text-brand-text underline underline-offset-2">
            Voir les leçons
          </Link>
        }
      >
        Essayez avec d’autres mots, ou parcourez les leçons du programme.
      </EmptyState>
    );
  }
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={`${item.contentKind}-${item.contentId}`}>
          <Card>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="neutral">{item.contentKind === "lecon" ? "Leçon" : "Question corrigée"}</Badge>
              <StatusBadge status={item.status} demo={item.demo} />
            </div>
            <h3 className="mt-2 font-bold">{item.title}</h3>
            <div className="mt-2 space-y-2 text-sm">
              {item.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            {item.sources.length > 0 && <SourceList sources={item.sources} />}
            {item.href && (
              <Link
                href={item.href}
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-text underline underline-offset-2"
              >
                Ouvrir la leçon <Icon name="arrow-right" size={16} />
              </Link>
            )}
          </Card>
        </li>
      ))}
    </ul>
  );
}

function Answer({ response }: { response: TutorResponse }) {
  if (response.mode === "sans-ia") {
    return (
      <div className="space-y-4">
        <Alert tone="info" role="status" title="Réponse sans IA générative">
          {response.notice}
        </Alert>
        <Predefined items={response.predefined} />
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <Card>
        <Badge tone="brand">Réponse générée par IA · {response.provider}</Badge>
        <p className="mt-3 whitespace-pre-line">{response.text}</p>
        <ul className="mt-3 space-y-2 text-sm">
          {response.citations.map((citation) => (
            <li key={citation.ref}>
              <span className="font-semibold">[{citation.ref}]</span> {citation.title}
              {citation.sources.length > 0 && <SourceList sources={citation.sources} />}
            </li>
          ))}
        </ul>
      </Card>
      <h3 className="font-bold">Explications prédéfinies du programme</h3>
      <Predefined items={response.predefined} />
    </div>
  );
}

export function TutorPanel({
  status,
  question,
  lessons,
}: {
  status: TutorStatus;
  question: TutorQuestionContext | null;
  lessons: readonly TutorLessonOption[];
}) {
  const kinds: TutorKind[] = question
    ? ["reformuler-correction", "expliquer-regle", "question"]
    : ["question", "expliquer-regle"];
  const [kind, setKind] = useState<TutorKind>(kinds[0]!);
  const [message, setMessage] = useState("");
  const [lessonId, setLessonId] = useState(lessons[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<TutorResponse | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);

  const needsMessage = kind === "question";
  const canSubmit = !loading && (!needsMessage || message.trim().length >= 3);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setFailure(null);
    setResponse(null);
    const body = {
      kind,
      message: message.trim(),
      ...(question && kind === "reformuler-correction" ? { questionId: question.id } : {}),
      ...(kind === "expliquer-regle" && lessonId ? { lessonId } : {}),
    };
    try {
      const result = await fetch("/api/professeur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (result.status === 429) setFailure("trop-de-demandes");
      else if (!result.ok) setFailure("demande-invalide");
      else setResponse((await result.json()) as TutorResponse);
    } catch {
      setFailure("reseau");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <TutorModeBanner status={status} />

      {question && (
        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-muted">Question corrigée</p>
            <StatusBadge status={question.status} demo={question.demo} />
          </div>
          <p className="mt-2">{question.prompt}</p>
        </Card>
      )}

      <form onSubmit={submit} className="space-y-4" noValidate>
        <SegmentedControl
          legend="Votre demande"
          name="tutor-kind"
          layout={kinds.length > 2 ? "grid" : "row"}
          options={kinds.map((value) => ({ value, label: TUTOR_KIND_LABELS[value] }))}
          value={kind}
          onChange={(value) => {
            setKind(value);
            setResponse(null);
          }}
        />

        {kind === "expliquer-regle" && lessons.length > 0 && (
          <SelectField label="Règle à expliquer" value={lessonId} onChange={(event) => setLessonId(event.target.value)}>
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.title}
              </option>
            ))}
          </SelectField>
        )}

        <TextAreaField
          label={needsMessage ? "Votre question" : "Précision (facultatif)"}
          value={message}
          maxLength={MAX_MESSAGE_LENGTH}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={needsMessage ? "Ex. : qui passe en premier à une intersection sans panneau ?" : undefined}
          hint={
            <>
              {message.length}/{MAX_MESSAGE_LENGTH} caractères. N’indiquez aucune donnée personnelle : e-mails,
              téléphones, plaques et numéros sont retirés automatiquement. KODI n’enregistre pas votre texte
              {status.mode === "ia" ? " ; il est transmis au service d’IA après ce masquage." : "."}
            </>
          }
        />

        <Button type="submit" block size="lg" loading={loading} disabled={!canSubmit}>
          Demander au professeur
        </Button>
      </form>

      <div aria-live="polite">
        {failure && (
          <Alert tone="danger" role="alert" title="Pas de réponse">
            {FAILURES[failure]}
          </Alert>
        )}
        {response && <Answer response={response} />}
      </div>
    </div>
  );
}
