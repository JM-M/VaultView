import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700",
  secondary:
    "bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]",
  ghost:
    "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({
  variant = "secondary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
