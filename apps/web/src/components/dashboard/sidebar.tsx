"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { modulesForUser, APP_NAME } from "@gtms/config";
import { cn } from "@gtms/ui";
import { useAuth } from "@/lib/auth/auth-context";

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const pathname = usePathname();
  const modules = user ? modulesForUser(user.modules) : [];

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[var(--color-border)] bg-[var(--color-sidebar)] text-[var(--color-sidebar-ink)] transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="border-b border-white/10 px-5 py-5">
          <Link href="/dashboard" className="block" onClick={onClose}>
            <p className="font-[family-name:var(--font-display)] text-xl tracking-tight">
              {APP_NAME}
            </p>
            <p className="mt-1 text-xs text-white/55">Module System</p>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <Link
            href="/dashboard"
            onClick={onClose}
            className={cn(
              "block rounded-md px-3 py-2.5 text-sm transition-colors",
              pathname === "/dashboard"
                ? "bg-white/12 text-white"
                : "text-white/70 hover:bg-white/8 hover:text-white",
            )}
          >
            Overview
          </Link>

          <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">
            Modules
          </p>

          {modules.map((mod) => {
            const active = pathname.startsWith(mod.href);
            return (
              <Link
                key={mod.id}
                href={mod.href}
                onClick={onClose}
                className={cn(
                  "block rounded-md px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-white/12 text-white"
                    : "text-white/70 hover:bg-white/8 hover:text-white",
                )}
              >
                <span className="block font-medium">{mod.label}</span>
                <span className="mt-0.5 block text-xs text-white/45">
                  {mod.description}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
