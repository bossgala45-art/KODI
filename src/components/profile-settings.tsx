"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/icons";
import { MotionControl, ThemeControl } from "@/components/preferences";
import { StorageNotice } from "@/components/storage-notice";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert, Card, LoadingBlock, SectionTitle } from "@/components/ui/display";
import { SegmentedControl, TextField } from "@/components/ui/form";
import { phases } from "@/content/project";
import { historyStore } from "@/lib/history";
import {
  DAILY_GOAL_OPTIONS,
  FIRST_NAME_MAX_LENGTH,
  initials,
  normalizeFirstName,
  profileStore,
  type DailyGoal,
  type LocalProfile,
} from "@/lib/profile";
import { setMotionPreference, setThemePreference } from "@/lib/theme-store";
import { useHydrated, useStore } from "@/lib/use-store";

function ProfileForm({ profile }: { profile: LocalProfile }) {
  const [firstName, setFirstName] = useState(profile.firstName);
  const [goal, setGoal] = useState<DailyGoal>(profile.dailyGoal);
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const name = normalizeFirstName(firstName);
    profileStore.set((p) => ({ ...p, firstName: name, dailyGoal: goal }));
    setFirstName(name);
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <TextField
        label="Prénom (facultatif)"
        name="firstName"
        autoComplete="given-name"
        maxLength={FIRST_NAME_MAX_LENGTH}
        value={firstName}
        onChange={(event) => {
          setFirstName(event.target.value);
          setSaved(false);
        }}
        hint="Utilisé uniquement pour vous saluer, sur cet appareil."
      />
      <SegmentedControl
        legend="Objectif quotidien"
        name="dailyGoal"
        options={DAILY_GOAL_OPTIONS}
        value={String(goal) as `${DailyGoal}`}
        onChange={(value) => {
          setGoal(Number(value) as DailyGoal);
          setSaved(false);
        }}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit">Enregistrer</Button>
        <div aria-live="polite">
          {saved && (
            <p className="flex items-center gap-1.5 text-sm font-semibold text-success-text">
              <Icon name="check" size={18} />
              Profil enregistré
            </p>
          )}
        </div>
      </div>
    </form>
  );
}

function ResetData({ onReset }: { onReset: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  function reset() {
    profileStore.reset();
    historyStore.reset();
    setThemePreference("system");
    setMotionPreference("system");
    onReset();
    setConfirming(false);
    setDone(true);
  }

  return (
    <div>
      <p className="text-sm text-muted">
        Efface le profil, les résultats et les réglages enregistrés sur cet appareil.
      </p>
      {confirming ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row" role="group" aria-label="Confirmer la réinitialisation">
          <Button variant="danger" onClick={reset}>
            Oui, tout réinitialiser
          </Button>
          <Button variant="secondary" onClick={() => setConfirming(false)}>
            Annuler
          </Button>
        </div>
      ) : (
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => {
            setConfirming(true);
            setDone(false);
          }}
        >
          Réinitialiser les données locales
        </Button>
      )}
      <div aria-live="polite">
        {done && (
          <Alert tone="success" className="mt-4">
            Données locales réinitialisées.
          </Alert>
        )}
      </div>
    </div>
  );
}

export function ProfileSettings() {
  const hydrated = useHydrated();
  const profile = useStore(profileStore);
  // Change après une réinitialisation pour recharger le formulaire.
  const [formKey, setFormKey] = useState(0);

  if (!hydrated) return <LoadingBlock label="Chargement du profil…" />;

  const current = phases.find((phase) => phase.status === "in-progress");

  const letter = initials(profile.firstName);

  return (
    <div className="space-y-8">
      <StorageNotice />

      <Card className="flex items-center gap-4">
        <span className="grid size-16 shrink-0 place-items-center rounded-3xl bg-brand-strong text-2xl font-bold text-on-brand">
          {letter || <Icon name="user" size={28} />}
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold">{profile.firstName || "Profil local"}</p>
          <p className="text-sm text-muted">Non connecté · données sur cet appareil</p>
        </div>
      </Card>

      <section aria-labelledby="compte">
        <SectionTitle id="compte">Compte</SectionTitle>
        <Card>
          <p className="text-sm text-muted">
            Les comptes en ligne ne sont pas encore disponibles. Ils
            permettront de synchroniser votre progression entre vos appareils.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <ButtonLink href="/connexion" variant="secondary">
              Connexion
            </ButtonLink>
            <ButtonLink href="/inscription">Inscription</ButtonLink>
          </div>
        </Card>
      </section>

      <section aria-labelledby="profil-local">
        <SectionTitle id="profil-local">Profil</SectionTitle>
        <Card>
          <ProfileForm key={formKey} profile={profile} />
        </Card>
      </section>

      <section aria-labelledby="apparence">
        <SectionTitle id="apparence">Apparence</SectionTitle>
        <Card className="space-y-5">
          <ThemeControl />
          <MotionControl />
          <p className="text-sm text-muted">
            « Auto » suit les réglages de votre appareil.
          </p>
        </Card>
      </section>

      <section aria-labelledby="autres">
        <SectionTitle id="autres">Autres</SectionTitle>
        <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
          {[
            { href: "/premium", label: "KODI Premium", icon: "crown" as const },
            { href: "/bienvenue", label: "Revoir l’accueil personnalisé", icon: "sparkles" as const },
          ].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex min-h-14 items-center gap-3 px-4 font-semibold hover:bg-surface-2"
              >
                <Icon name={item.icon} className="text-brand-text" />
                <span className="flex-1">{item.label}</span>
                <Icon name="chevron-right" className="text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="donnees">
        <SectionTitle id="donnees">Données</SectionTitle>
        <Card>
          <ResetData onReset={() => setFormKey((k) => k + 1)} />
        </Card>
      </section>

      <section aria-labelledby="a-propos">
        <SectionTitle id="a-propos">À propos</SectionTitle>
        <Card className="text-sm text-muted">
          <p>
            KODI est un projet indépendant en cours de développement
            {current ? ` (phase ${current.id} : ${current.title.toLowerCase()})` : ""}.
          </p>
          <p className="mt-2">Version 0.1.0 · aucune donnée envoyée en ligne.</p>
        </Card>
      </section>
    </div>
  );
}
