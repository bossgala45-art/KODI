"use client";

import { useEffect } from "react";
import { startSync } from "@/lib/sync/engine";

/** Lance la synchronisation du compte (sans effet en mode local). */
export function SyncProvider() {
  useEffect(() => startSync(), []);
  return null;
}
