import type { HTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-line bg-surface p-5 shadow-card",
        className,
      )}
      {...props}
    />
  );
}

export type BadgeTone = "brand" | "success" | "danger" | "neutral";

const BADGE_TONES: Record<BadgeTone, string> = {
  brand: "bg-brand-soft text-brand-text",
  success: "bg-success-soft text-success-text",
  danger: "bg-danger-soft text-danger-text",
  neutral: "bg-surface-2 text-muted",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        BADGE_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Signale un contenu d'exemple. Obligatoire sur toute donnée fictive. */
export function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge tone="neutral" className={cn("border border-dashed border-line-strong", className)}>
      Données fictives
    </Badge>
  );
}

/** Signale des questions réelles mais pas encore relues par une personne compétente. */
export function ReviewBadge({ className }: { className?: string }) {
  return (
    <Badge tone="brand" className={className}>
      Non relues
    </Badge>
  );
}

export type ContentKind = "fictive" | "non-relue";

export function ContentBadge({ kind }: { kind: ContentKind }) {
  return kind === "fictive" ? <DemoBadge /> : <ReviewBadge />;
}

export type AlertTone = "info" | "success" | "danger";

const ALERT_STYLES: Record<AlertTone, { box: string; icon: IconName }> = {
  info: { box: "bg-brand-soft text-fg", icon: "info" },
  success: { box: "bg-success-soft text-fg", icon: "check" },
  danger: { box: "bg-danger-soft text-fg", icon: "alert" },
};

const ALERT_ICON_COLOR: Record<AlertTone, string> = {
  info: "text-brand-text",
  success: "text-success-text",
  danger: "text-danger-text",
};

export function Alert({
  tone = "info",
  title,
  children,
  role,
  className,
}: {
  tone?: AlertTone;
  title?: string;
  children?: ReactNode;
  /** "alert" pour une erreur à annoncer immédiatement, "status" pour un retour poli. */
  role?: "alert" | "status" | "note";
  className?: string;
}) {
  const style = ALERT_STYLES[tone];
  return (
    <div
      role={role}
      className={cn("flex gap-3 rounded-2xl p-4 text-sm animate-enter", style.box, className)}
    >
      <Icon name={style.icon} className={cn("mt-0.5 shrink-0", ALERT_ICON_COLOR[tone])} />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && "mt-1")}>{children}</div>}
      </div>
    </div>
  );
}

export function ProgressBar({
  value,
  label,
  tone = "brand",
  className,
}: {
  /** Entre 0 et 1. */
  value: number;
  label: string;
  tone?: "brand" | "success";
  className?: string;
}) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={cn("h-2.5 overflow-hidden rounded-full bg-surface-2", className)}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-500 ease-out",
          tone === "brand" ? "bg-brand" : "bg-success",
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("animate-shimmer rounded-2xl bg-surface-2", className)} />
  );
}

/** Zone en cours de chargement, annoncée aux lecteurs d'écran. */
export function LoadingBlock({
  label = "Chargement…",
  lines = 3,
}: {
  label?: string;
  lines?: number;
}) {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <span className="sr-only">{label}</span>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={i === 0 ? "h-24" : "h-14"} />
      ))}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  children,
  action,
  headingLevel = 2,
}: {
  icon: IconName;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  /** h1 lorsque l'écran vide constitue toute la page. */
  headingLevel?: 1 | 2;
}) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-line-strong px-6 py-10 text-center animate-enter">
      <span className="grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand-text">
        <Icon name={icon} size={26} />
      </span>
      <Heading className="mt-4 text-lg font-bold">{title}</Heading>
      {children && <div className="mt-2 max-w-sm text-sm text-muted">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function StatTile({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: IconName;
}) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-4 shadow-card">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Icon name={icon} size={16} className="text-brand-text" />
        <span>{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  aside,
}: {
  title: string;
  description?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4 pb-6 pt-2 animate-enter">
      <div className="min-w-0">
        <h1 className="text-3xl font-bold tracking-tight text-balance">{title}</h1>
        {description && <p className="mt-2 text-muted text-pretty">{description}</p>}
      </div>
      {aside}
    </header>
  );
}

export function SectionTitle({
  id,
  children,
  aside,
}: {
  id?: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 id={id} className="text-lg font-bold tracking-tight">
        {children}
      </h2>
      {aside}
    </div>
  );
}
