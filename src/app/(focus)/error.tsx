"use client";

import { useEffect } from "react";
import { ErrorPanel } from "@/components/error-panel";

export default function FocusError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorPanel onRetry={retry} />;
}
