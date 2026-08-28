"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { AccountHead, PaidVoucher, Party } from "@gtms/types";
import { Button, Input, Label, Select, Textarea } from "@gtms/ui";
import {
  formatCurrency,
  mockFinanceApi,
  todayInputValue,
} from "@/lib/api/mock-finance";
import { FinancePageHeader } from "./finance-page-header";

export function PaidForm() {
  const [parties, setParties] = useState<Party[]>([]);
  const [heads, setHeads] = useState<AccountHead[]>([]);
  const [recent, setRecent] = useState<PaidVoucher[]>([]);
  const [date, setDate] = useState(todayInputValue());
  const [headId, setHeadId] = useState("");
  const [partyId, setPartyId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [partyList, headList, vouchers] = await Promise.all([
          mockFinanceApi.listParties(),
          mockFinanceApi.listHeads(),
          mockFinanceApi.listPaid(),
        ]);
        if (!active) return;
        setParties(partyList);
        setHeads(headList);
        setRecent(vouchers.slice(0, 5));
        if (headList[0]) setHeadId(headList[0].id);
        if (partyList[0]) setPartyId(partyList[0].id);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!date) next.date = "Date is required";
    if (!headId) next.headId = "Head is required";
    if (!partyId) next.partyId = "Party is required";
    if (!description.trim()) next.description = "Description is required";
    if (amount <= 0) next.amount = "Amount must be greater than zero";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (!validate()) return;

    setSaving(true);
    try {
      const voucher = await mockFinanceApi.createPaid({
        date,
        headId,
        partyId,
        description: description.trim(),
        amount,
      });
      setSuccess(`Saved voucher ${voucher.voucherNo} for ${formatCurrency(voucher.amount)}.`);
      setDescription("");
      setAmount(0);
      const vouchers = await mockFinanceApi.listPaid();
      setRecent(vouchers.slice(0, 5));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save voucher.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-sm text-[var(--color-ink-muted)]">
        Loading voucher form…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FinancePageHeader
        title="Paid Voucher"
        description="Date · Head · Party · Description · Amount"
      />

      <form
        onSubmit={onSubmit}
        className="grid gap-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 lg:grid-cols-2"
      >
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            invalid={Boolean(fieldErrors.date)}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="head">Head</Label>
          <Select
            id="head"
            value={headId}
            invalid={Boolean(fieldErrors.headId)}
            onChange={(e) => setHeadId(e.target.value)}
          >
            <option value="">Select head</option>
            {heads.map((head) => (
              <option key={head.id} value={head.id}>
                {head.code} — {head.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="lg:col-span-2">
          <Label htmlFor="party">Party</Label>
          <Select
            id="party"
            value={partyId}
            invalid={Boolean(fieldErrors.partyId)}
            onChange={(e) => setPartyId(e.target.value)}
          >
            <option value="">Select party</option>
            {parties.map((party) => (
              <option key={party.id} value={party.id}>
                {party.code} — {party.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="lg:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            invalid={Boolean(fieldErrors.description)}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Payment purpose / narration"
          />
        </div>

        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            min={0}
            step="0.01"
            value={amount}
            invalid={Boolean(fieldErrors.amount)}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>

        {success ? (
          <div className="lg:col-span-2 rounded-md border border-[var(--color-accent)]/30 bg-[var(--color-surface-muted)] px-3 py-2 text-sm text-[var(--color-accent)]">
            {success}
          </div>
        ) : null}

        {error ? (
          <div className="lg:col-span-2 rounded-md border border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]">
            {error}
          </div>
        ) : null}

        <div className="lg:col-span-2">
          <Button type="submit" loading={saving}>
            Save paid voucher
          </Button>
        </div>
      </form>

      <RecentPaidVouchers rows={recent} parties={parties} heads={heads} />
    </div>
  );
}

function RecentPaidVouchers({
  rows,
  parties,
  heads,
}: {
  rows: PaidVoucher[];
  parties: Party[];
  heads: AccountHead[];
}) {
  if (rows.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="border-b border-[var(--color-border)] px-4 py-3 text-sm font-medium text-[var(--color-ink)]">
        Recent paid vouchers
      </div>
      <div className="divide-y divide-[var(--color-border)]">
        {rows.map((row) => {
          const party = parties.find((p) => p.id === row.partyId);
          const head = heads.find((h) => h.id === row.headId);
          return (
            <div
              key={row.id}
              className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-[var(--color-ink)]">{row.voucherNo}</p>
                <p className="text-xs text-[var(--color-ink-muted)]">
                  {head?.name ?? "Head"} · {party?.name ?? "Party"} · {row.description}
                </p>
              </div>
              <div className="text-sm text-[var(--color-ink-muted)]">
                {row.date} · {formatCurrency(row.amount)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
