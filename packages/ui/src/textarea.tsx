import type { TextareaHTMLAttributes } from "react";
import { cn } from "./cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ className, invalid, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-md border bg-white px-3 py-2 text-sm text-[var(--color-ink)]",
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
