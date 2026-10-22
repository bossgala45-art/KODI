import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "md" | "lg";

const BASE =
  "inline-flex select-none items-center justify-center gap-2 rounded-2xl font-semibold transition-[transform,background-color,opacity,box-shadow] duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-strong text-on-brand shadow-[0_6px_16px_-6px_rgb(40_124_255/0.6)] hover:-translate-y-px hover:shadow-[0_10px_20px_-8px_rgb(40_124_255/0.7)]",
  secondary:
    "border border-line bg-surface text-fg hover:border-line-strong hover:bg-surface-2",
  ghost: "text-brand-text hover:bg-brand-soft",
  danger: "bg-danger text-on-status hover:-translate-y-px",
};

const SIZES: Record<ButtonSize, string> = {
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-13 px-6 text-base",
};

interface StyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
}

export function buttonClasses({
  variant = "primary",
  size = "md",
  block = false,
}: StyleProps = {}): string {
  return cn(BASE, VARIANTS[variant], SIZES[size], block && "w-full");
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & StyleProps;

export function Button({
  variant,
  size,
  block,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonClasses({ variant, size, block }), className)}
      {...props}
    />
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & StyleProps;

export function ButtonLink({
  variant,
  size,
  block,
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(buttonClasses({ variant, size, block }), className)}
      {...props}
    />
  );
}
