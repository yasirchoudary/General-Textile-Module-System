"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BRANCH_OPTIONS } from "@gtms/config";
import { Button } from "@gtms/ui";
import { useAuth } from "@/lib/auth/auth-context";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [branch, setBranch] = useState(BRANCH_OPTIONS[0]?.id ?? "hq");
  const [loggingOut, setLoggingOut] = useState(false);

  async function onLogout() {
    setLoggingOut(true);
    try {
      await logout();
      router.replace("/login");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 px-4 backdrop-blur md:px-6">
      <button
        type="button"
        className="inline-flex size-10 items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-ink)] lg:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <span className="flex flex-col gap-1.5">
          <span className="block h-0.5 w-4 bg-current" />
          <span className="block h-0.5 w-4 bg-current" />
          <span className="block h-0.5 w-4 bg-current" />
        </span>
      </button>

      <div className="min-w-0 flex-1">
        <label className="sr-only" htmlFor="branch">
          Branch
        </label>
        <select
          id="branch"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="max-w-full rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-ink)]"
        >
          {BRANCH_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden text-right sm:block">
        <p className="truncate text-sm font-medium text-[var(--color-ink)]">
          {user?.name}
        </p>
        <p className="truncate text-xs capitalize text-[var(--color-ink-muted)]">
          {user?.role}
        </p>
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={onLogout}
        loading={loggingOut}
      >
        Logout
      </Button>
    </header>
  );
}
