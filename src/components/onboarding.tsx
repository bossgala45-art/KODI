"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { MotionControl, ThemeControl } from "@/components/preferences";
import { Button } from "@/components/ui/button";
import { LoadingBlock } from "@/components/ui/display";
import { SegmentedControl, TextField } from "@/components/ui/form";
import { cn } from "@/lib/cn";
import {
  DAILY_GOAL_OPTIONS,
  FIRST_NAME_MAX_LENGTH,
  normalizeFirstName,
  profileStore,
  type DailyGoal,
  type LocalProfile,
} from "@/lib/profile";
import { useHydrated, useStore } from "@/lib/use-store";

const STEPS = ["Bienvenue", "Prénom", "Objectif", "Apparence"] as const;

function OnboardingSteps({ initial }: { initial: LocalProfile }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState(initial.firstName);
  const [goal, setGoal] = useState<DailyGoal>(initial.dailyGoal);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isLast = step === STEPS.length - 1;

  useEffect(() => {
    if (step > 0) headingRef.current?.focus();
  }, [step]);

  function finish() {
    profileStore.set((p) => ({
      ...p,
      firstName: normalizeFirstName(firstName),
      dailyGoal: goal,
      onboardingCompleted: true,
    }));
    router.push("/");
  }

  return (
    <div className="flex min-h-[70dvh] flex-col">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-muted">
          Étape {step + 1} sur {STEPS.length}
        </p>
        <Button variant="ghost" onClick={finish} className="-mr-3">
          Passer
        </Button>
      </div>
      <ol aria-hidden="true" className="mt-2 flex gap-2">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-300",
              i <= step ? "bg-brand" : "bg-surface-2",
            )}
          />
        ))}
      </ol>

      <div key={step} className="mt-8 flex-1 animate-enter">
        {step === 0 && (
          <div className="text-center">
            <span className="mx-auto grid size-20 place-items-center rounded-[1.75rem] bg-night text-on-brand shadow-card ring-1 ring-line animate-pop">
              <Icon name="sparkles" size={36} />
            </span>
            <h1 ref={headingRef} tabIndex={-1} className="mt-6 text-3xl font-bold tracking-tight focus:outline-none">
              Bienvenue sur KODI
            </h1>
            <p className="mt-3 text-muted text-pretty">
              Votre compagnon pour préparer le code de la route, pensé pour le
              téléphone. Quelques réglages et c’est parti.
            </p>
            <p className="mt-6 rounded-2xl bg-surface-2 p-4 text-left text-sm">
              KODI est en développement : les leçons et questions réelles ne
              sont pas encore disponibles. Vos réglages restent sur cet appareil.
            </p>
          </div>
        )}

        {step === 1 && (
          <div>
            <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold tracking-tight focus:outline-none">
              Comment vous appeler ?
            </h1>
            <p className="mt-2 text-muted">Facultatif, pour vous saluer sur l’accueil.</p>
            <TextField
              className="mt-6"
              label="Prénom"
              name="firstName"
              autoComplete="given-name"
              maxLength={FIRST_NAME_MAX_LENGTH}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold tracking-tight focus:outline-none">
              Votre objectif quotidien
            </h1>
            <p className="mt-2 text-muted">Modifiable à tout moment dans votre profil.</p>
            <div className="mt-6">
              <SegmentedControl
                legend="Nombre de questions par jour"
                name="dailyGoal"
                options={DAILY_GOAL_OPTIONS}
                value={String(goal) as `${DailyGoal}`}
                onChange={(value) => setGoal(Number(value) as DailyGoal)}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold tracking-tight focus:outline-none">
              Apparence
            </h1>
            <p className="mt-2 text-muted">Le changement s’applique immédiatement.</p>
            <div className="mt-6 space-y-5">
              <ThemeControl />
              <MotionControl />
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <Button variant="secondary" size="lg" onClick={() => setStep((s) => s - 1)}>
            <Icon name="chevron-left" size={18} />
            Retour
          </Button>
        )}
        <Button
          size="lg"
          block
          onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
        >
          {isLast ? "C’est parti !" : "Continuer"}
          <Icon name="arrow-right" size={18} />
        </Button>
      </div>
    </div>
  );
}

export function Onboarding() {
  const hydrated = useHydrated();
  const profile = useStore(profileStore);
  if (!hydrated) return <LoadingBlock label="Chargement…" />;
  return <OnboardingSteps initial={profile} />;
}
