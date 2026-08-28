"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Party } from "@gtms/types";
import { Button } from "@gtms/ui";
import {
  formatCurrency,
  mockFinanceApi,
  partyTypeLabel,
} from "@/lib/api/mock-finance";
import { FinancePageHeader } from "./finance-page-header";

export function PartyList() {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await mockFinanceApi.listParties();
        if (active) setParties(data);
      } catch {
        if (active) setError("Could not load parties.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <FinancePageHeader
        title="Parties & Vendors"
        description="Maintain vendor/customer accounts with opening balances before posting vouchers."
        action={
          <Link href="/dashboard/finance/parties/new">
            <Button>Add party</Button>
          </Link>
        }
      />

      {loading ? (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-sm text-[var(--color-ink-muted)]">
          Loading parties…
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-ink-muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Opening balance</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {parties.map((party) => (
                  <tr
                    key={party.id}
                    className="border-b border-[var(--color-border)] last:border-b-0"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--color-ink)]">
                      {party.code}
                    </td>
                    <td className="px-4 py-3">{party.name}</td>
                    <td className="px-4 py-3">{partyTypeLabel(party.type)}</td>
                    <td className="px-4 py-3 text-[var(--color-ink-muted)]">
                      {party.contactPerson ?? "—"}
                      {party.phone ? ` · ${party.phone}` : ""}
                    </td>
                    <td className="px-4 py-3">
                      {formatCurrency(party.openingBalance)}{" "}
                      <span className="text-[var(--color-ink-subtle)]">
                        ({party.balanceType})
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/finance/parties/${party.id}/edit`}
                        className="text-[var(--color-accent)] hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {parties.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-[var(--color-ink-muted)]">
              No parties yet. Add your first vendor or customer account.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
