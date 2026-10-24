import { z } from "zod";
import { MAX_MESSAGE_LENGTH, TUTOR_KINDS, type TutorRequest } from "@/lib/tutor/types";

/** Taille maximale du corps de la requête (octets). */
export const MAX_BODY_BYTES = 4096;

const contentId = z.string().regex(/^[a-z0-9-]{1,80}$/);

const bodySchema = z
  .object({
    kind: z.enum(TUTOR_KINDS),
    questionId: contentId.optional(),
    lessonId: contentId.optional(),
    message: z.string().max(MAX_MESSAGE_LENGTH).default(""),
  })
  .strict()
  .refine((body) => body.kind !== "reformuler-correction" || Boolean(body.questionId), {
    message: "questionId requis pour reformuler une correction",
  })
  .refine((body) => body.kind !== "question" || body.message.trim().length >= 3, {
    message: "question vide",
  })
  .refine((body) => body.kind !== "expliquer-regle" || Boolean(body.lessonId) || body.message.trim().length >= 3, {
    message: "leçon ou règle à expliquer requise",
  });

export function parseTutorRequest(raw: unknown): TutorRequest | null {
  const parsed = bodySchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}
