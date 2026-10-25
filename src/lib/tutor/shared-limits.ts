import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { dayKey, type Reservation } from "@/lib/tutor/limits";
import type { TutorBudget, TutorLimiter } from "@/lib/tutor/tutor";

/**
 * Compteurs du professeur partagés dans la base (migration
 * 20261026130000_tutor_quotas.sql), pour un hébergement à plusieurs
 * instances. En cas de panne de la base : la fréquence n'est pas bloquée
 * (les explications prédéfinies restent accessibles), mais aucune dépense
 * n'est engagée (quota considéré atteint, budget refusé).
 */
export function sharedLimiter(admin: SupabaseClient, limits: { perMinute: number; aiPerDay: number }): TutorLimiter {
  return {
    aiPerDay: limits.aiPerDay,
    async hit(client) {
      const { data, error } = await admin.rpc("tutor_hit", { p_client: client, p_per_minute: limits.perMinute });
      return error ? true : data === true;
    },
    async aiUsed(client) {
      const { data, error } = await admin.rpc("tutor_ai_used", { p_client: client });
      return error || typeof data !== "number" ? limits.aiPerDay : data;
    },
    async takeAi(client) {
      const { data, error } = await admin.rpc("tutor_take_ai", { p_client: client, p_per_day: limits.aiPerDay });
      return !error && data === true;
    },
  };
}

export function sharedBudget(admin: SupabaseClient, limitUsd: number): TutorBudget {
  return {
    async reserve(amountUsd, now): Promise<Reservation | null> {
      const { data, error } = await admin.rpc("tutor_reserve", { p_amount: amountUsd, p_limit: limitUsd });
      return !error && data === true ? { id: 0, amount: amountUsd, day: dayKey(now) } : null;
    },
    async settle(reservation, actualUsd) {
      await admin.rpc("tutor_settle", { p_day: reservation.day, p_reserved: reservation.amount, p_actual: actualUsd });
    },
  };
}
