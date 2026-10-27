"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/cn";
import { SECONDARY_NAV, TABS, isActivePath, type NavItem } from "@/lib/navigation";
import { initials, profileStore } from "@/lib/profile";
import { useHydrated, useStore } from "@/lib/use-store";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 rounded-xl font-extrabold tracking-tight">
      <span
        aria-hidden="true"
        className="relative grid size-9 place-items-center rounded-xl bg-night text-base text-on-brand shadow-card ring-1 ring-line"
      >
        K
        <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-success" />
      </span>
      <span className="text-xl">KODI</span>
    </Link>
  );
}

function ProfileButton() {
  const profile = useStore(profileStore);
  const hydrated = useHydrated();
  const letter = hydrated ? initials(profile.firstName) : "";
  return (
    <Link
      href="/profil"
      aria-label="Profil et paramètres"
      className="grid size-11 place-items-center rounded-full border border-line bg-surface font-bold text-brand-text shadow-card transition-transform active:scale-95"
    >
      {letter || <Icon name="user" />}
    </Link>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/85 pt-[env(safe-area-inset-top)] backdrop-blur-lg lg:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-2.5">
        <Logo />
        <div className="flex items-center gap-2">
          <Link
            href="/revisions"
            className="flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-brand-text hover:bg-brand-soft"
          >
            <Icon name="calendar" size={18} />
            Révisions
          </Link>
          <ProfileButton />
        </div>
      </div>
    </header>
  );
}

function TabBar({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden"
    >
      <ul className="mx-auto grid max-w-3xl grid-cols-5">
        {TABS.map((tab) => {
          const active = isActivePath(pathname, tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold transition-colors",
                  active ? "text-brand-text" : "text-muted hover:text-fg",
                )}
              >
                <span
                  className={cn(
                    "grid h-8 w-12 place-items-center rounded-full transition-[background-color,transform] duration-200",
                    active ? "scale-100 bg-brand-soft" : "scale-90 group-active:scale-95",
                  )}
                >
                  <Icon name={tab.icon} size={22} />
                </span>
                <span className="max-w-full truncate">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function SidebarLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActivePath(pathname, item.href);
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-2xl px-3 font-semibold transition-colors",
        active ? "bg-brand-soft text-brand-text" : "text-muted hover:bg-surface-2 hover:text-fg",
      )}
    >
      <Icon name={item.icon} />
      {item.label}
    </Link>
  );
}

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface px-4 py-6 lg:flex">
      <div className="px-2">
        <Logo />
      </div>
      <nav aria-label="Navigation principale" className="mt-8 flex flex-1 flex-col">
        <ul className="space-y-1">
          {TABS.map((item) => (
            <li key={item.href}>
              <SidebarLink item={item} pathname={pathname} />
            </li>
          ))}
        </ul>
        <ul className="mt-auto space-y-1 border-t border-line pt-4">
          {SECONDARY_NAV.map((item) => (
            <li key={item.href}>
              <SidebarLink item={item} pathname={pathname} />
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-dvh">
      <Sidebar pathname={pathname} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main
          id="contenu"
          className="mx-auto w-full max-w-3xl flex-1 px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-4 lg:px-8 lg:pb-12 lg:pt-10"
        >
          {children}
        </main>
      </div>
      <TabBar pathname={pathname} />
    </div>
  );
}

/** Mise en page sans onglets pour les parcours ciblés (connexion, onboarding…). */
export function FocusShell({
  children,
  backHref = "/",
  backLabel = "Retour",
}: {
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <Link
            href={backHref}
            className="-ml-2 flex min-h-11 items-center gap-1 rounded-xl px-2 font-semibold text-muted hover:text-fg"
          >
            <Icon name="chevron-left" />
            {backLabel}
          </Link>
          <Logo />
        </div>
      </header>
      <main
        id="contenu"
        className="mx-auto w-full max-w-md flex-1 px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-2"
      >
        {children}
      </main>
    </div>
  );
}
