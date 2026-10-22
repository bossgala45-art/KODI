"use client";

import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { Card, DemoBadge, ProgressBar, Skeleton } from "@/components/ui/display";
import { computeStats, historyStore } from "@/lib/history";
import { profileStore } from "@/lib/profile";
import { useHydrated, useStore } from "@/lib/use-store";

export function Greeting() {
  const hydrated = useHydrated();
  const profile = useStore(profileStore);
  const name = hydrated ? profile.firstName : "";
  return (
    <h1 className="text-3xl font-bold tracking-tight">
      Bonjour{name ? `, ${name}` : ""}
    </h1>
  );
}

export function OnboardingPrompt() {
  const hydrated = useHydrated();
  const profile = useStore(profileStore);
  if (!hydrated || profile.onboardingCompleted) return null;
  return (
    <div className="relative overflow-hidden rounded-3xl bg-night p-5 text-on-brand shadow-card ring-1 ring-line animate-enter">
      <div aria-hidden="true" className="absolute -right-8 -top-12 size-40 rounded-full bg-brand/40 blur-2xl" />
      <div aria-hidden="true" className="absolute -bottom-14 right-16 size-32 rounded-full bg-success/30 blur-2xl" />
      <div className="relative">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Icon name="sparkles" size={18} />
          Première visite
        </p>
        <h2 className="mt-2 text-xl font-bold">Personnalisez KODI en 1 minute</h2>
        <p className="mt-1 text-sm">Prénom, objectif quotidien et apparence.</p>
        <ButtonLink href="/bienvenue" className="mt-4 bg-surface! text-fg! shadow-none">
          Commencer
          <Icon name="arrow-right" size={18} />
        </ButtonLink>
      </div>
    </div>
  );
}

export function DailyGoalCard() {
  const hydrated = useHydrated();
  const history = useStore(historyStore);
  const profile = useStore(profileStore);

  if (!hydrated) {
    return (
      <div role="status" aria-live="polite">
        <span className="sr-only">Chargement de votre objectif…</span>
        <Skeleton className="h-36" />
      </div>
    );
  }

  const stats = computeStats(history, new Date());
  const ratio = Math.min(1, stats.questionsToday / profile.dailyGoal);

  return (
    <Card className="animate-enter">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold">Objectif du jour</h2>
          <p className="mt-1 text-sm text-muted">
            {stats.questionsToday} / {profile.dailyGoal} questions
          </p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-surface-2 px-3 py-1 text-sm font-semibold">
          <Icon name="flame" size={16} className="text-danger-text" />
          {stats.streakDays} j
          <span className="sr-only">d’activité consécutifs</span>
        </span>
      </div>
      <ProgressBar value={ratio} tone="success" label="Objectif du jour" className="mt-4" />
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted">Compté sur les séries de démonstration.</p>
        <DemoBadge />
      </div>
    </Card>
  );
}

const SHORTCUTS: ReadonlyArray<{
  href: string;
  title: string;
  text: string;
  icon: IconName;
}> = [
  { href: "/entrainement", title: "S’entraîner", text: "Série de 5 questions", icon: "target" },
  { href: "/simuler", title: "Simuler", text: "Examen blanc", icon: "flag" },
  { href: "/apprendre", title: "Apprendre", text: "Univers et leçons", icon: "book" },
  { href: "/progression", title: "Progression", text: "Vos statistiques", icon: "chart" },
];

export function Shortcuts() {
  return (
    <ul className="grid grid-cols-2 gap-3">
      {SHORTCUTS.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="flex h-full flex-col rounded-3xl border border-line bg-surface p-4 shadow-card transition-[transform,border-color] duration-150 hover:-translate-y-0.5 hover:border-line-strong active:scale-[0.98]"
          >
            <span className="grid size-10 place-items-center rounded-2xl bg-brand-soft text-brand-text">
              <Icon name={item.icon} />
            </span>
            <span className="mt-3 font-semibold">{item.title}</span>
            <span className="text-sm text-muted">{item.text}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
