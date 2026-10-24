/**
 * Limites du professeur, tenues en mémoire du serveur.
 *
 * - Fréquence : nombre de demandes par minute et par client (toutes
 *   demandes, avec ou sans IA).
 * - Quota : nombre de réponses rédigées par l'IA par jour et par client.
 * - Budget : dépense maximale par jour (dollars), réservée AVANT chaque
 *   appel sur le pire cas (jetons d'entrée estimés + limite de sortie), puis
 *   ajustée au coût réel. Un appel qui pourrait dépasser le budget n'a pas
 *   lieu.
 *
 * Le client est identifié par une empreinte (jamais l'adresse IP en clair).
 * Limite connue : sur un hébergement à plusieurs instances, chaque instance
 * tient ses propres compteurs (le budget global serait alors multiplié par
 * le nombre d'instances). Un stockage partagé sera nécessaire avant toute
 * mise en ligne avec IA (voir docs/DECISIONS.md, D-029).
 */

const MINUTE = 60_000;

/** Jour civil UTC, clé de remise à zéro des compteurs quotidiens. */
export function dayKey(now: Date): string {
  return now.toISOString().slice(0, 10);
}

export interface RateLimits {
  perMinute: number;
  aiPerDay: number;
}

export class RateLimiter {
  private recent = new Map<string, number[]>();
  private daily = new Map<string, number>();
  private day = "";

  constructor(private readonly limits: RateLimits) {}

  get aiPerDay(): number {
    return this.limits.aiPerDay;
  }

  private roll(now: Date) {
    const key = dayKey(now);
    if (key !== this.day) {
      this.day = key;
      this.daily.clear();
    }
  }

  /** Enregistre une demande ; `false` si la limite par minute est atteinte. */
  hit(client: string, now: Date): boolean {
    const since = now.getTime() - MINUTE;
    const times = (this.recent.get(client) ?? []).filter((t) => t > since);
    if (times.length >= this.limits.perMinute) {
      this.recent.set(client, times);
      return false;
    }
    times.push(now.getTime());
    this.recent.set(client, times);
    // Nettoyage : on ne garde pas les clients inactifs.
    if (this.recent.size > 10_000) {
      for (const [key, value] of this.recent) if (value.every((t) => t <= since)) this.recent.delete(key);
    }
    return true;
  }

  /** Consomme une réponse IA du quota quotidien ; `false` si le quota est épuisé. */
  takeAi(client: string, now: Date): boolean {
    this.roll(now);
    const used = this.daily.get(client) ?? 0;
    if (used >= this.limits.aiPerDay) return false;
    this.daily.set(client, used + 1);
    return true;
  }

  aiUsed(client: string, now: Date): number {
    this.roll(now);
    return this.daily.get(client) ?? 0;
  }
}

export interface Reservation {
  id: number;
  amount: number;
  day: string;
}

export class DailyBudget {
  private spentToday = 0;
  private reserved = new Map<number, Reservation>();
  private day = "";
  private nextId = 1;

  constructor(private readonly limitUsd: number) {}

  private roll(now: Date) {
    const key = dayKey(now);
    if (key !== this.day) {
      this.day = key;
      this.spentToday = 0;
      this.reserved.clear();
    }
  }

  private committed(): number {
    let total = this.spentToday;
    for (const r of this.reserved.values()) total += r.amount;
    return total;
  }

  /** Réserve le pire cas ; `null` si le budget du jour serait dépassé. */
  reserve(amountUsd: number, now: Date): Reservation | null {
    this.roll(now);
    if (!(amountUsd > 0) || this.committed() + amountUsd > this.limitUsd) return null;
    const reservation = { id: this.nextId++, amount: amountUsd, day: this.day };
    this.reserved.set(reservation.id, reservation);
    return reservation;
  }

  /** Remplace la réservation par le coût réel (jamais négatif). */
  settle(reservation: Reservation, actualUsd: number, now: Date) {
    this.roll(now);
    if (!this.reserved.delete(reservation.id)) return;
    this.spentToday += Math.max(0, actualUsd);
  }

  spent(now: Date): number {
    this.roll(now);
    return this.committed();
  }
}
