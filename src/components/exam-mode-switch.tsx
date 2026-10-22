"use client";

import { useState, type ReactNode } from "react";
import { ServerExamRunner } from "@/components/server-exam";
import { LoadingBlock } from "@/components/ui/display";
import { useAuth } from "@/lib/auth/session-store";

/**
 * Connecté : examen blanc côté serveur (questions validées, corrigé après
 * remise). Sinon, ou en mode local : examen sur l'appareil (`children`).
 */
export function ExamModeSwitch({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [forceLocal, setForceLocal] = useState(false);
  if (auth.status === "loading") return <LoadingBlock label="Chargement…" />;
  if (auth.status === "signed-in" && !forceLocal) {
    return <ServerExamRunner onUseLocal={() => setForceLocal(true)} />;
  }
  return <>{children}</>;
}
