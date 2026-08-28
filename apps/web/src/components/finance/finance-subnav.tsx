"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FINANCE_NAV } from "@gtms/config";
import { cn } from "@gtms/ui";

export function FinanceSubnav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
      <ul className="flex min-w-max gap-1">
        {FINANCE_NAV.map((item) => {
          const active =
            item.href === "/dashboard/finance"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-[var(--color-accent)] text-white"
                    : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
