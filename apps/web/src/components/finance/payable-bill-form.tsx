"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Party, PayableBillVoucher } from "@gtms/types";
import { Button, Input, Label, Select, Textarea } from "@gtms/ui";
import {
  formatCurrency,
  mockFinanceApi,
  todayInputValue,
} from "@/lib/api/mock-finance";
import { FinancePageHeader } from "./finance-page-header";

export function PayableBillForm() {
  const [parties, setParties] = useState<Party[]>([]);
  const [recent, setRecent] = useState<PayableBillVoucher[]>([]);
  const [date, setDate] = useState(todayInputValue());
  const [partyId, setPartyId] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [rate, setRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const amount = useMemo(
    () => Number((quantity * rate).toFixed(2)),
    [quantity, rate],
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [partyList, vouchers] = await Promise.all([
          mockFinanceApi.listParties(),
          mockFinanceApi.listPayableBills(),
        ]);
        if (!active) return;
        setParties(partyList);
        setRecent(vouchers.slice(0, 5));
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
    if (!partyId) next.partyId = "Party is required";
    if (!description.trim()) next.description = "Description is required";
    if (quantity <= 0) next.quantity = "Quantity must be greater than zero";
    if (rate <= 0) next.rate = "Rate must be greater than zero";
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
      const voucher = await mockFinanceApi.createPayableBill({
        date,
        partyId,
        description: description.trim(),
        quantity,
        rate,
      });
      setSuccess(`Saved voucher ${voucher.voucherNo} for ${formatCurrency(voucher.amount)}.`);
      setDescription("");
      setQuantity(1);
      setRate(0);
      const vouchers = await mockFinanceApi.listPayableBills();
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
        title="Payable Bill Voucher"
        description="Date · Party · Description · Quantity · Rate · Amount"
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
          {fieldErrors.partyId ? (
            <p className="mt-1 text-xs text-[var(--color-danger)]">{fieldErrors.partyId}</p>
          ) : null}
        </div>

        <div className="lg:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            invalid={Boolean(fieldErrors.description)}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Bill details, item/service description"
          />
        </div>

        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min={0}
            step="0.01"
            value={quantity}
            invalid={Boolean(fieldErrors.quantity)}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>

        <div>
          <Label htmlFor="rate">Rate</Label>
          <Input
            id="rate"
            type="number"
            min={0}
            step="0.01"
            value={rate}
            invalid={Boolean(fieldErrors.rate)}
            onChange={(e) => setRate(Number(e.target.value))}
          />
        </div>

        <div className="lg:col-span-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3">
          <p className="text-sm text-[var(--color-ink-muted)]">Amount</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--color-ink)]">
            {formatCurrency(amount)}
          </p>
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
            Save payable bill
          </Button>
        </div>
      </form>

      <RecentVouchers
        title="Recent payable bills"
        rows={recent.map((v) => ({
          id: v.id,
          voucherNo: v.voucherNo,
          date: v.date,
          amount: formatCurrency(v.amount),
          detail: v.description,
        }))}
      />
    </div>
  );
}

function RecentVouchers({
  title,
  rows,
}: {
  title: string;
  rows: Array<{
    id: string;
    voucherNo: string;
    date: string;
    amount: string;
    detail: string;
  }>;
}) {
  if (rows.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="border-b border-[var(--color-border)] px-4 py-3 text-sm font-medium text-[var(--color-ink)]">
        {title}
      </div>
      <div className="divide-y divide-[var(--color-border)]">
        {rows.map((row) => (
          <div key={row.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-ink)]">{row.voucherNo}</p>
              <p className="text-xs text-[var(--color-ink-muted)]">{row.detail}</p>
            </div>
            <div className="text-sm text-[var(--color-ink-muted)]">
              {row.date} · {row.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
