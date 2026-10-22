"use client";

import { useEffect } from "react";
import { SegmentedControl, type SegmentOption } from "@/components/ui/form";
import type { MotionPreference, ThemePreference } from "@/lib/theme";
import {
  motionStore,
  setMotionPreference,
  setThemePreference,
  themeStore,
  watchAppearance,
} from "@/lib/theme-store";
import { useStore } from "@/lib/use-store";

const THEME_OPTIONS: readonly SegmentOption<ThemePreference>[] = [
  { value: "light", label: "Clair" },
  { value: "dark", label: "Sombre" },
  { value: "system", label: "Auto" },
];

const MOTION_OPTIONS: readonly SegmentOption<MotionPreference>[] = [
  { value: "full", label: "Activées" },
  { value: "reduce", label: "Réduites" },
  { value: "system", label: "Auto" },
];

export function ThemeControl({ hideLegend = false }: { hideLegend?: boolean }) {
  const value = useStore(themeStore);
  return (
    <SegmentedControl
      legend="Thème d’affichage"
      name="theme"
      options={THEME_OPTIONS}
      value={value}
      onChange={setThemePreference}
      hideLegend={hideLegend}
    />
  );
}

export function MotionControl() {
  const value = useStore(motionStore);
  return (
    <SegmentedControl
      legend="Animations"
      name="motion"
      options={MOTION_OPTIONS}
      value={value}
      onChange={setMotionPreference}
    />
  );
}

/** Applique en continu le thème et le niveau d'animation choisis. */
export function AppearanceWatcher() {
  useEffect(() => watchAppearance(), []);
  return null;
}
