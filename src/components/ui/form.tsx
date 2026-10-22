"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/cn";

const INPUT =
  "block min-h-12 w-full rounded-2xl border bg-surface px-4 text-base text-fg placeholder:text-muted transition-colors focus:border-brand focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand";

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  error?: string;
  hint?: ReactNode;
}

function FieldMessages({
  errorId,
  hintId,
  error,
  hint,
}: {
  errorId: string;
  hintId: string;
  error?: string;
  hint?: ReactNode;
}) {
  return (
    <>
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-danger-text">
          <Icon name="alert" size={16} />
          {error}
        </p>
      )}
    </>
  );
}

export function TextField({ label, error, hint, className, ...props }: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={cn(INPUT, error ? "border-danger-text" : "border-line-strong")}
        {...props}
      />
      <FieldMessages errorId={errorId} hintId={hintId} error={error} hint={hint} />
    </div>
  );
}

export function PasswordField({ label, error, hint, className, ...props }: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const [visible, setVisible] = useState(false);
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cn(INPUT, "pr-14", error ? "border-danger-text" : "border-line-strong")}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          aria-controls={id}
          className="absolute inset-y-1 right-1 grid w-11 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-fg"
        >
          <Icon name={visible ? "eye-off" : "eye"} />
        </button>
      </div>
      <FieldMessages errorId={errorId} hintId={hintId} error={error} hint={hint} />
    </div>
  );
}

export function Checkbox({
  label,
  error,
  checked,
  onChange,
  name,
}: {
  label: ReactNode;
  error?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  name?: string;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="mt-0.5 size-5 shrink-0 cursor-pointer accent-brand-strong"
        />
        <span>{label}</span>
      </label>
      <FieldMessages errorId={errorId} hintId="" error={error} />
    </div>
  );
}

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

/** Choix exclusif sous forme de groupe de boutons radio. */
export function SegmentedControl<T extends string>({
  legend,
  options,
  value,
  onChange,
  name,
  hideLegend = false,
  size = "md",
}: {
  legend: string;
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  name: string;
  hideLegend?: boolean;
  size?: "sm" | "md";
}) {
  return (
    <fieldset>
      <legend className={hideLegend ? "sr-only" : "mb-2 text-sm font-semibold"}>{legend}</legend>
      <div className="flex rounded-2xl border border-line bg-surface-2 p-1">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex-1 cursor-pointer rounded-xl text-center font-semibold text-muted transition-colors has-checked:bg-surface has-checked:text-fg has-checked:shadow-card has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-brand",
              size === "sm" ? "px-3 py-1.5 text-sm" : "px-3 py-2.5 text-sm",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
