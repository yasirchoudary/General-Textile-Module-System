"use client";

import { useEffect, useState } from "react";
import type { DashboardWidget } from "@gtms/types";
import { fetchDashboardWidgets } from "@/lib/api/mock-dashboard";
import { useAuth } from "@/lib/auth/auth-context";

export function DashboardHome() {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await fetchDashboardWidgets();
        if (active) {
          setWidgets(data);
          setStatus("ready");
        }
      } catch {
        if (active) setStatus("error");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--color-ink)]">
          Welcome back, {user?.name.split(" ")[0]}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-ink-muted)]">
          Your dashboard shell is ready. Module pages are placeholders until
          backend and module scope are decided.
        </p>
      </div>

      {status === "loading" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)]"
            />
          ))}
        </div>
      ) : null}

      {status === "error" ? (
        <div className="rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]">
          Could not load dashboard widgets. Try refreshing.
        </div>
      ) : null}

      {status === "ready" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {widgets.map((widget) => (
            <article
              key={widget.id}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <p className="text-sm text-[var(--color-ink-muted)]">{widget.title}</p>
              <p className="mt-3 font-[family-name:var(--font-display)] text-3xl text-[var(--color-ink)]">
                {widget.status === "empty" ? "—" : widget.value}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[var(--color-ink-subtle)]">
                {widget.description}
              </p>
              {widget.status === "empty" ? (
                <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-[var(--color-accent)]">
                  Coming soon
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
