"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Contract, Party, ReceiptVoucher } from "@gtms/types";
import { Button, Input, Label, Select, Textarea } from "@gtms/ui";
import {
  formatCurrency,
  mockFinanceApi,
  todayInputValue,
} from "@/lib/api/mock-finance";
import { FinancePageHeader } from "./finance-page-header";

export function ReceiptForm() {
  const [parties, setParties] = useState<Party[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [recent, setRecent] = useState<ReceiptVoucher[]>([]);
  const [date, setDate] = useState(todayInputValue());
  const [partyId, setPartyId] = useState("");
  const [contractId, setContractId] = useState("");
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
        const [partyList, contractList, vouchers] = await Promise.all([
          mockFinanceApi.listParties(),
          mockFinanceApi.listContracts(),
          mockFinanceApi.listReceipts(),
        ]);
        if (!active) return;
        setParties(partyList);
        setContracts(contractList);
        setRecent(vouchers.slice(0, 5));
        if (partyList[0]) {
          setPartyId(partyList[0].id);
          const partyContracts = contractList.filter(
            (c) => c.partyId === partyList[0].id,
          );
          setFilteredContracts(partyContracts);
          if (partyContracts[0]) setContractId(partyContracts[0].id);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const next = contracts.filter((c) => c.partyId === partyId);
    setFilteredContracts(next);
    setContractId(next[0]?.id ?? "");
  }, [partyId, contracts]);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!date) next.date = "Date is required";
    if (!partyId) next.partyId = "Party is required";
    if (!contractId) next.contractId = "Contract is required";
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
      const voucher = await mockFinanceApi.createReceipt({
        date,
        partyId,
        contractId,
        description: description.trim(),
        amount,
      });
      setSuccess(`Saved voucher ${voucher.voucherNo} for ${formatCurrency(voucher.amount)}.`);
      setDescription("");
      setAmount(0);
      const vouchers = await mockFinanceApi.listReceipts();
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
        title="Receipt Voucher"
        description="Date · Party · Contract · Description · Amount"
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
        </div>

        <div className="lg:col-span-2">
          <Label htmlFor="contract">Contract</Label>
          <Select
            id="contract"
            value={contractId}
            invalid={Boolean(fieldErrors.contractId)}
            onChange={(e) => setContractId(e.target.value)}
          >
            <option value="">Select contract</option>
            {filteredContracts.map((contract) => (
              <option key={contract.id} value={contract.id}>
                {contract.code} — {contract.title}
              </option>
            ))}
          </Select>
          {filteredContracts.length === 0 ? (
            <p className="mt-1 text-xs text-[var(--color-ink-subtle)]">
              No contracts for this party yet. Contract master will be added later.
            </p>
          ) : null}
        </div>

        <div className="lg:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            invalid={Boolean(fieldErrors.description)}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Receipt narration"
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
            Save receipt voucher
          </Button>
        </div>
      </form>

      <RecentReceiptVouchers rows={recent} parties={parties} contracts={contracts} />
    </div>
  );
}

function RecentReceiptVouchers({
  rows,
  parties,
  contracts,
}: {
  rows: ReceiptVoucher[];
  parties: Party[];
  contracts: Contract[];
}) {
  if (rows.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="border-b border-[var(--color-border)] px-4 py-3 text-sm font-medium text-[var(--color-ink)]">
        Recent receipt vouchers
      </div>
      <div className="divide-y divide-[var(--color-border)]">
        {rows.map((row) => {
          const party = parties.find((p) => p.id === row.partyId);
          const contract = contracts.find((c) => c.id === row.contractId);
          return (
            <div
              key={row.id}
              className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-[var(--color-ink)]">{row.voucherNo}</p>
                <p className="text-xs text-[var(--color-ink-muted)]">
                  {party?.name ?? "Party"} · {contract?.code ?? "Contract"} · {row.description}
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
