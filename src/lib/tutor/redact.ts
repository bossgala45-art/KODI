/**
 * Retire les données personnelles reconnaissables d'un message avant tout
 * traitement (et avant tout envoi à un fournisseur d'IA). Le texte n'est
 * jamais journalisé, ni avant ni après ce masquage.
 */

export const REDACTION_KINDS = ["email", "telephone", "iban", "plaque", "numero", "url"] as const;
export type RedactionKind = (typeof REDACTION_KINDS)[number];

const PATTERNS: { kind: RedactionKind; pattern: RegExp; label: string }[] = [
  { kind: "email", pattern: /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,}/gu, label: "[e-mail retiré]" },
  { kind: "url", pattern: /\bhttps?:\/\/\S+|\bwww\.\S+/gi, label: "[lien retiré]" },
  { kind: "iban", pattern: /\b[A-Z]{2}\d{2}(?:[ ]?[A-Z0-9]{4}){3,7}(?:[ ]?[A-Z0-9]{1,3})?\b/g, label: "[IBAN retiré]" },
  {
    kind: "telephone",
    pattern: /(?:\+|00)\s?\d{2,3}(?:[\s.-]?\d){8,10}\b|\b0[1-9](?:[\s.-]?\d{2}){4}\b/g,
    label: "[téléphone retiré]",
  },
  // Plaque d'immatriculation au format AA-123-AA.
  { kind: "plaque", pattern: /\b[A-Z]{2}[\s-]?\d{3}[\s-]?[A-Z]{2}\b/gi, label: "[immatriculation retirée]" },
  // Suites de 8 chiffres ou plus (numéro de dossier, de carte, de sécurité sociale…).
  { kind: "numero", pattern: /\b\d(?:[\s.-]?\d){7,}\b/g, label: "[numéro retiré]" },
];

export interface Redacted {
  text: string;
  removed: Partial<Record<RedactionKind, number>>;
}

export function redactPersonalData(input: string): Redacted {
  const removed: Partial<Record<RedactionKind, number>> = {};
  let text = input;
  for (const { kind, pattern, label } of PATTERNS) {
    text = text.replace(pattern, () => {
      removed[kind] = (removed[kind] ?? 0) + 1;
      return label;
    });
  }
  return { text, removed };
}
