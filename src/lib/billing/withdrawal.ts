/**
 * Délai de rétractation d'un abonnement souscrit en ligne : 14 jours à
 * compter du lendemain de la conclusion du contrat, prolongé au jour ouvrable
 * suivant s'il expire un samedi ou un dimanche (fiche Service-Public
 * « Achat à distance : droit de rétractation du consommateur », F10485,
 * vérifiée le 01/01/2026, relue le 24/10/2026).
 *
 * Les jours fériés ne sont pas calculés : KODI ajoute 2 jours de marge, ce
 * qui ne peut que prolonger le délai offert (un délai plus long est permis).
 */

export const WITHDRAWAL_DAYS = 14;
export const COURTESY_DAYS = 2;

/** Date (à minuit, heure locale du serveur) à partir de laquelle la rétractation n'est plus proposée. */
export function withdrawalDeadline(startedAt: Date): Date {
  const start = new Date(startedAt.getFullYear(), startedAt.getMonth(), startedAt.getDate());
  // Dernier jour du délai : J + 14 (le décompte commence le lendemain).
  const last = new Date(start);
  last.setDate(last.getDate() + WITHDRAWAL_DAYS);
  if (last.getDay() === 6) last.setDate(last.getDate() + 2);
  else if (last.getDay() === 0) last.setDate(last.getDate() + 1);
  last.setDate(last.getDate() + COURTESY_DAYS + 1);
  return last;
}

export function withdrawalOpen(startedAt: Date | null, now: Date): boolean {
  return startedAt !== null && now.getTime() < withdrawalDeadline(startedAt).getTime();
}
