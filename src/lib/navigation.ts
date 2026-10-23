import type { IconName } from "@/components/icons";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

/** Les cinq onglets de la barre de navigation mobile. */
export const TABS: readonly NavItem[] = [
  { href: "/", label: "Accueil", icon: "home" },
  { href: "/apprendre", label: "Apprendre", icon: "book" },
  { href: "/simuler", label: "Simuler", icon: "flag" },
  { href: "/entrainement", label: "S’entraîner", icon: "target" },
  { href: "/progression", label: "Progression", icon: "chart" },
];

/** Entrées secondaires (barre latérale sur grand écran). */
export const SECONDARY_NAV: readonly NavItem[] = [
  { href: "/revisions", label: "Révisions", icon: "calendar" },
  { href: "/premium", label: "Premium", icon: "crown" },
  { href: "/profil", label: "Profil et paramètres", icon: "user" },
];

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
