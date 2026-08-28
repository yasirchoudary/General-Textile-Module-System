"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { PartyInput, PartyType, BalanceType } from "@gtms/types";
import { Button, Input, Label, Select, Textarea } from "@gtms/ui";
import { mockFinanceApi } from "@/lib/api/mock-finance";
import { FinancePageHeader } from "./finance-page-header";

const defaultValues: PartyInput = {
  code: "",
  name: "",
  type: "vendor",
  contactPerson: "",
  phone: "",
  address: "",
  openingBalance: 0,
  balanceType: "debit",
  notes: "",
};

export function PartyForm({ partyId }: { partyId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<PartyInput>(defaultValues);
  const [loading, setLoading] = useState(Boolean(partyId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!partyId) return;
    let active = true;
    (async () => {
      try {
        const party = await mockFinanceApi.getParty(partyId);
        if (!active) return;
        if (!party) {
          setError("Party not found.");
          return;
        }
        setForm({
          code: party.code,
          name: party.name,
          type: party.type,
          contactPerson: party.contactPerson ?? "",
          phone: party.phone ?? "",
          address: party.address ?? "",
          openingBalance: party.openingBalance,
          balanceType: party.balanceType,
          notes: party.notes ?? "",
        });
      } catch {
        if (active) setError("Could not load party.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [partyId]);

  function updateField<K extends keyof PartyInput>(key: K, value: PartyInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.code.trim()) next.code = "Code is required";
    if (!form.name.trim()) next.name = "Name is required";
    if (form.openingBalance < 0) next.openingBalance = "Balance cannot be negative";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!validate()) return;

    setSaving(true);
    try {
      const payload: PartyInput = {
        ...form,
        code: form.code.trim(),
        name: form.name.trim(),
        contactPerson: form.contactPerson?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        address: form.address?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
      };

      if (partyId) {
        await mockFinanceApi.updateParty(partyId, payload);
      } else {
        await mockFinanceApi.createParty(payload);
      }
      router.push("/dashboard/finance/parties");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save party.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-sm text-[var(--color-ink-muted)]">
        Loading party…
      </div>
    );
  }

  return (
    <div>
      <FinancePageHeader
        title={partyId ? "Edit party" : "Add party"}
        description="Capture vendor/customer details and opening balance."
      />

      <form
        onSubmit={onSubmit}
        className="grid gap-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 lg:grid-cols-2"
      >
        <div>
          <Label htmlFor="code">Party code</Label>
          <Input
            id="code"
            value={form.code}
            invalid={Boolean(fieldErrors.code)}
            onChange={(e) => updateField("code", e.target.value)}
            placeholder="e.g. V-004"
          />
          {fieldErrors.code ? (
            <p className="mt-1 text-xs text-[var(--color-danger)]">{fieldErrors.code}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="name">Party name</Label>
          <Input
            id="name"
            value={form.name}
            invalid={Boolean(fieldErrors.name)}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Business name"
          />
          {fieldErrors.name ? (
            <p className="mt-1 text-xs text-[var(--color-danger)]">{fieldErrors.name}</p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="type">Party type</Label>
          <Select
            id="type"
            value={form.type}
            onChange={(e) => updateField("type", e.target.value as PartyType)}
          >
            <option value="vendor">Vendor</option>
            <option value="customer">Customer</option>
            <option value="both">Vendor & Customer</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="contactPerson">Contact person</Label>
          <Input
            id="contactPerson"
            value={form.contactPerson}
            onChange={(e) => updateField("contactPerson", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="openingBalance">Opening balance</Label>
          <Input
            id="openingBalance"
            type="number"
            min={0}
            step="0.01"
            value={form.openingBalance}
            invalid={Boolean(fieldErrors.openingBalance)}
            onChange={(e) => updateField("openingBalance", Number(e.target.value))}
          />
          {fieldErrors.openingBalance ? (
            <p className="mt-1 text-xs text-[var(--color-danger)]">
              {fieldErrors.openingBalance}
            </p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="balanceType">Balance type</Label>
          <Select
            id="balanceType"
            value={form.balanceType}
            onChange={(e) => updateField("balanceType", e.target.value as BalanceType)}
          >
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
          </Select>
        </div>

        <div className="lg:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
          />
        </div>

        <div className="lg:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder="Optional remarks about opening balance or terms"
          />
        </div>

        {error ? (
          <div className="lg:col-span-2 rounded-md border border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]">
            {error}
          </div>
        ) : null}

        <div className="flex gap-3 lg:col-span-2">
          <Button type="submit" loading={saving}>
            {partyId ? "Save changes" : "Create party"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/dashboard/finance/parties")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
