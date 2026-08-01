import type { InputHTMLAttributes } from "react";
import { cn } from "./cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function Input({ className, invalid, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md border bg-white px-3 text-sm text-[var(--color-ink)]",
        "placeholder:text-[var(--color-ink-subtle)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-1",
        invalid
          ? "border-[var(--color-danger)]"
          : "border-[var(--color-border)]",
        className,
      )}
      {...props}
    />
  );
}
