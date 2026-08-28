import { MODULE_NAV } from "@gtms/config";
import type { ModuleId } from "@gtms/types";

export function ModulePlaceholder({ moduleId }: { moduleId: ModuleId }) {
  const mod = MODULE_NAV.find((item) => item.id === moduleId);

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
        Module shell
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--color-ink)]">
        {mod?.label ?? moduleId}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-[var(--color-ink-muted)]">
        {mod?.description}. This route is reserved so navigation stays stable
        while backend and module logic are decided.
      </p>
      <p className="mt-8 text-sm font-medium text-[var(--color-ink-subtle)]">
        Coming soon
      </p>
    </div>
  );
}
