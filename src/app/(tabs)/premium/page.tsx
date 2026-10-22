import type { Metadata } from "next";
import { Icon, type IconName } from "@/components/icons";
import { PremiumCta } from "@/components/premium-cta";
import { DemoBadge, PageHeader } from "@/components/ui/display";

export const metadata: Metadata = { title: "Premium" };

const PERKS: ReadonlyArray<{ icon: IconName; title: string; text: string }> = [
  { icon: "flag", title: "Examens blancs illimités", text: "Autant de simulations que nécessaire." },
  { icon: "sparkles", title: "Coach personnalisé", text: "Des explications adaptées à vos erreurs." },
  { icon: "target", title: "Révision adaptative avancée", text: "Vos points faibles en priorité." },
  { icon: "chart", title: "Statistiques détaillées", text: "Votre progression univers par univers." },
];

export default function PremiumPage() {
  return (
    <>
      <PageHeader title="KODI Premium" description="Aller plus loin dans la préparation." />

      <section
        aria-labelledby="offre"
        className="relative overflow-hidden rounded-3xl bg-night p-6 text-on-brand shadow-card ring-1 ring-line animate-enter"
      >
        <div aria-hidden="true" className="absolute -right-16 -top-16 size-56 rounded-full bg-brand/40 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-20 -left-10 size-48 rounded-full bg-success/25 blur-3xl" />
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-surface text-brand-text">
              <Icon name="crown" size={24} />
            </span>
            <DemoBadge />
          </div>
          <h2 id="offre" className="mt-4 text-2xl font-bold">
            Offre d’exemple
          </h2>
          <p className="mt-1">
            Contenu et prix non définis : cette offre illustre l’écran et ne
            constitue pas une proposition commerciale.
          </p>
          <p className="mt-5 text-4xl font-extrabold">
            — €<span className="text-base font-semibold"> / prix à définir</span>
          </p>
          <ul className="mt-6 space-y-4">
            {PERKS.map((perk) => (
              <li key={perk.title} className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface/15">
                  <Icon name={perk.icon} size={18} />
                </span>
                <span>
                  <span className="block font-semibold">{perk.title}</span>
                  <span className="block text-sm">{perk.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="mt-6">
        <PremiumCta />
      </div>
      <p className="mt-4 text-sm text-muted">
        La répartition entre les fonctionnalités gratuites et Premium n’est pas
        encore décidée.
      </p>
    </>
  );
}
