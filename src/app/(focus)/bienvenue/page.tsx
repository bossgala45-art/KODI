import type { Metadata } from "next";
import { FocusShell } from "@/components/app-shell";
import { Onboarding } from "@/components/onboarding";

export const metadata: Metadata = { title: "Bienvenue" };

export default function OnboardingPage() {
  return (
    <FocusShell backHref="/" backLabel="Accueil">
      <Onboarding />
    </FocusShell>
  );
}
