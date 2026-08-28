import Link from "next/link";
import { FINANCE_NAV } from "@gtms/config";
import { FinancePageHeader } from "@/components/finance/finance-page-header";

export default function FinancePage() {
  const cards = FINANCE_NAV.filter((item) => item.href !== "/dashboard/finance");

  return (
    <div>
      <FinancePageHeader
        title="Finance"
        description="Party master and basic voucher entry screens. Data is stored locally for now until backend is connected."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-colors hover:border-[var(--color-accent)]"
          >
            <p className="font-medium text-[var(--color-ink)]">{item.label}</p>
            {item.description ? (
              <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
                {item.description}
              </p>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
