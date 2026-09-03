"use client";

import { useEffect, useMemo, useState } from "react";
import type { BalanceType, Party, PartyLedgerStatement, VoucherType } from "@gtms/types";
import { Button, Checkbox, Input, Label } from "@gtms/ui";
import {
  formatCurrency,
  mockFinanceApi,
  partyTypeLabel,
  todayInputValue,
} from "@/lib/api/mock-finance";
import { FinancePageHeader } from "./finance-page-header";

export function PartyLedger() {
  const [parties, setParties] = useState<Party[]>([]);
  const [selectedPartyIds, setSelectedPartyIds] = useState<string[]>([]);
  const [allPartiesSelected, setAllPartiesSelected] = useState(true);

  // Date Range state
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState(todayInputValue());

  // Voucher type filters
  const [selectedVoucherTypes, setSelectedVoucherTypes] = useState<VoucherType[]>([
    "payableBill",
    "paid",
    "receive",
  ]);

  // View mode
  const [viewMode, setViewMode] = useState<"detailed" | "summary">("detailed");

  // Party search filter in selector
  const [partySearch, setPartySearch] = useState("");

  // Statements data
  const [statements, setStatements] = useState<PartyLedgerStatement[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial load: fetch parties
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const partyList = await mockFinanceApi.listParties();
        if (!active) return;
        setParties(partyList);
        // Default to all parties
        setSelectedPartyIds(partyList.map((p) => p.id));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Fetch / Compute ledger statements whenever filters change
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const partyIdsToFetch = allPartiesSelected ? undefined : selectedPartyIds;
        const res = await mockFinanceApi.getPartyLedger({
          partyIds: partyIdsToFetch,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          voucherTypes: selectedVoucherTypes,
        });
        if (!active) return;
        setStatements(res);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [allPartiesSelected, selectedPartyIds, startDate, endDate, selectedVoucherTypes]);

  // Toggle all parties
  function handleToggleAllParties(checked: boolean) {
    setAllPartiesSelected(checked);
    if (checked) {
      setSelectedPartyIds(parties.map((p) => p.id));
    } else {
      setSelectedPartyIds([]);
    }
  }

  // Toggle single party selection
  function handleToggleParty(partyId: string) {
    if (allPartiesSelected) {
      // Switching from all to a specific party
      setAllPartiesSelected(false);
      setSelectedPartyIds([partyId]);
      return;
    }

    if (selectedPartyIds.includes(partyId)) {
      const next = selectedPartyIds.filter((id) => id !== partyId);
      setSelectedPartyIds(next);
      if (next.length === 0) {
        // none selected
      }
    } else {
      const next = [...selectedPartyIds, partyId];
      setSelectedPartyIds(next);
      if (next.length === parties.length) {
        setAllPartiesSelected(true);
      }
    }
  }

  // Date range presets
  function applyDatePreset(preset: "all" | "thisMonth" | "lastMonth" | "quarter" | "ytd") {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    if (preset === "all") {
      setStartDate("");
      setEndDate("");
      return;
    }

    if (preset === "thisMonth") {
      const start = new Date(currentYear, currentMonth, 1);
      const end = new Date(currentYear, currentMonth + 1, 0);
      setStartDate(start.toISOString().slice(0, 10));
      setEndDate(end.toISOString().slice(0, 10));
      return;
    }

    if (preset === "lastMonth") {
      const start = new Date(currentYear, currentMonth - 1, 1);
      const end = new Date(currentYear, currentMonth, 0);
      setStartDate(start.toISOString().slice(0, 10));
      setEndDate(end.toISOString().slice(0, 10));
      return;
    }

    if (preset === "quarter") {
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
      const start = new Date(currentYear, quarterStartMonth, 1);
      const end = new Date(currentYear, quarterStartMonth + 3, 0);
      setStartDate(start.toISOString().slice(0, 10));
      setEndDate(end.toISOString().slice(0, 10));
      return;
    }

    if (preset === "ytd") {
      const start = new Date(currentYear, 0, 1);
      setStartDate(start.toISOString().slice(0, 10));
      setEndDate(todayInputValue());
      return;
    }
  }

  // Toggle voucher type filter
  function handleToggleVoucherType(type: VoucherType) {
    if (selectedVoucherTypes.includes(type)) {
      if (selectedVoucherTypes.length === 1) return; // keep at least one
      setSelectedVoucherTypes(selectedVoucherTypes.filter((t) => t !== type));
    } else {
      setSelectedVoucherTypes([...selectedVoucherTypes, type]);
    }
  }

  // Filtered parties list for selector
  const filteredParties = useMemo(() => {
    if (!partySearch.trim()) return parties;
    const q = partySearch.toLowerCase();
    return parties.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q),
    );
  }, [parties, partySearch]);

  // Aggregate stats across all rendered statements
  const aggregateStats = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;
    let totalNetDebit = 0;
    let totalNetReceivable = 0;
    let totalNetPayable = 0;

    for (const stmt of statements) {
      totalDebit += stmt.totalDebit;
      totalCredit += stmt.totalCredit;

      if (stmt.closingBalanceType === "debit") {
        totalNetReceivable += stmt.closingBalance;
        totalNetDebit += stmt.closingBalance;
      } else {
        totalNetPayable += stmt.closingBalance;
        totalNetDebit -= stmt.closingBalance;
      }
    }

    return {
      partiesCount: statements.length,
      totalDebit,
      totalCredit,
      totalNetReceivable,
      totalNetPayable,
      netPosition: totalNetDebit,
    };
  }, [statements]);

  // Export CSV
  function exportCsv() {
    if (statements.length === 0) return;

    const rows: string[][] = [
      [
        "Party Code",
        "Party Name",
        "Party Type",
        "Date",
        "Voucher No",
        "Voucher Type",
        "Narration / Details",
        "Debit (PKR)",
        "Credit (PKR)",
        "Running Balance (PKR)",
        "Balance Type (Dr/Cr)",
      ],
    ];

    for (const stmt of statements) {
      // Opening Balance Row
      rows.push([
        stmt.party.code,
        stmt.party.name,
        stmt.party.type,
        stmt.startDate || "Beginning",
        "B/F",
        "Opening Balance",
        "Balance Brought Forward",
        stmt.openingBalanceType === "debit" ? stmt.openingBalance.toString() : "0",
        stmt.openingBalanceType === "credit" ? stmt.openingBalance.toString() : "0",
        stmt.openingBalance.toString(),
        stmt.openingBalanceType.toUpperCase(),
      ]);

      // Transactions
      for (const entry of stmt.entries) {
        rows.push([
          stmt.party.code,
          stmt.party.name,
          stmt.party.type,
          entry.date,
          entry.voucherNo,
          entry.voucherTypeLabel,
          `${entry.description} ${entry.referenceInfo ? `(${entry.referenceInfo})` : ""}`,
          entry.debit.toString(),
          entry.credit.toString(),
          entry.balance.toString(),
          entry.balanceType.toUpperCase(),
        ]);
      }

      // Closing Row
      rows.push([
        stmt.party.code,
        stmt.party.name,
        stmt.party.type,
        stmt.endDate || "Ending",
        "C/D",
        "Closing Balance",
        "Balance Carried Down",
        "",
        "",
        stmt.closingBalance.toString(),
        stmt.closingBalanceType.toUpperCase(),
      ]);

      rows.push([]); // blank separator
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((row) => row.map((cell) => `"${(cell || "").replace(/"/g, '""')}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `textile-party-ledger-${startDate || "all"}-to-${endDate || "now"}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <FinancePageHeader
          title="Party Ledger"
          description="Dynamic statement of accounts derived from Payable Bills, Paid vouchers, and Receive vouchers."
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
            className="text-xs"
          >
            🖨️ Print / PDF
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={exportCsv}
            className="text-xs"
          >
            📥 Export CSV
          </Button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs print:hidden space-y-5">
        {/* 1. Date Range Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-ink)]">
              1. Date Range
            </h3>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => applyDatePreset("all")}
                className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)] transition-colors"
              >
                All Time
              </button>
              <button
                type="button"
                onClick={() => applyDatePreset("thisMonth")}
                className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)] transition-colors"
              >
                This Month
              </button>
              <button
                type="button"
                onClick={() => applyDatePreset("lastMonth")}
                className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)] transition-colors"
              >
                Last Month
              </button>
              <button
                type="button"
                onClick={() => applyDatePreset("quarter")}
                className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)] transition-colors"
              >
                This Quarter
              </button>
              <button
                type="button"
                onClick={() => applyDatePreset("ytd")}
                className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)] transition-colors"
              >
                Year to Date
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="ledger-start-date">From Date</Label>
              <Input
                id="ledger-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
              />
              <p className="mt-1 text-[11px] text-[var(--color-ink-subtle)]">
                Vouchers prior to this form the Opening Balance.
              </p>
            </div>

            <div>
              <Label htmlFor="ledger-end-date">To Date</Label>
              <Input
                id="ledger-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
              />
              <p className="mt-1 text-[11px] text-[var(--color-ink-subtle)]">
                Closing balance calculated as of this date.
              </p>
            </div>

            <div className="sm:col-span-2">
              <Label>Voucher Types Included</Label>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--color-ink)] cursor-pointer">
                  <Checkbox
                    checked={selectedVoucherTypes.includes("payableBill")}
                    onChange={() => handleToggleVoucherType("payableBill")}
                  />
                  <span>Payable Bills (PB)</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--color-ink)] cursor-pointer">
                  <Checkbox
                    checked={selectedVoucherTypes.includes("paid")}
                    onChange={() => handleToggleVoucherType("paid")}
                  />
                  <span>Paid Disbursements (PD)</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--color-ink)] cursor-pointer">
                  <Checkbox
                    checked={selectedVoucherTypes.includes("receive")}
                    onChange={() => handleToggleVoucherType("receive")}
                  />
                  <span>Receive Payments (RC)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-[var(--color-border)]" />

        {/* 2. Dynamic Party Selection Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-ink)]">
                2. Party Selection
              </h3>
              <label className="inline-flex items-center gap-2 text-xs font-medium text-[var(--color-accent)] cursor-pointer bg-[var(--color-accent)]/10 px-2.5 py-1 rounded-full">
                <Checkbox
                  checked={allPartiesSelected}
                  onChange={(e) => handleToggleAllParties(e.target.checked)}
                />
                <span>All Parties ({parties.length})</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="search"
                value={partySearch}
                onChange={(e) => setPartySearch(e.target.value)}
                placeholder="Search party code, name..."
                className="h-8 text-xs max-w-xs"
              />
            </div>
          </div>

          {/* Party Badges / Multiselect Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface-muted)]">
            {filteredParties.map((party) => {
              const isChecked = allPartiesSelected || selectedPartyIds.includes(party.id);
              return (
                <div
                  key={party.id}
                  onClick={() => handleToggleParty(party.id)}
                  className={`flex items-center justify-between p-2.5 rounded-md border text-xs cursor-pointer transition-all ${
                    isChecked
                      ? "border-[var(--color-accent)] bg-[var(--color-surface)] shadow-xs"
                      : "border-transparent hover:border-[var(--color-border)] bg-transparent opacity-65"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Checkbox
                      checked={isChecked}
                      onChange={() => handleToggleParty(party.id)}
                    />
                    <div className="truncate">
                      <p className="font-semibold text-[var(--color-ink)] truncate">
                        <span className="text-[var(--color-accent)] font-mono mr-1">
                          {party.code}
                        </span>
                        {party.name}
                      </p>
                      <p className="text-[10px] text-[var(--color-ink-muted)]">
                        {partyTypeLabel(party.type)} · {party.address || "Pakistan"}
                      </p>
                    </div>
                  </div>
                  <PartyTypeBadge type={party.type} />
                </div>
              );
            })}
          </div>

          {/* Selected Parties Summary Pill */}
          <div className="mt-2 flex flex-wrap items-center justify-between text-xs text-[var(--color-ink-muted)]">
            <span>
              {allPartiesSelected
                ? "Showing ledger for all registered parties"
                : `${selectedPartyIds.length} of ${parties.length} parties selected`}
            </span>
            {!allPartiesSelected && selectedPartyIds.length > 0 ? (
              <button
                type="button"
                onClick={() => handleToggleAllParties(true)}
                className="text-[var(--color-accent)] hover:underline"
              >
                Select All
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:grid-cols-4">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs">
          <p className="text-xs font-medium text-[var(--color-ink-muted)]">Parties Evaluated</p>
          <p className="text-xl font-bold text-[var(--color-ink)] mt-1">
            {aggregateStats.partiesCount}
          </p>
          <p className="text-[11px] text-[var(--color-ink-subtle)] mt-0.5">
            {allPartiesSelected ? "All mill accounts" : "Filtered selection"}
          </p>
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs">
          <p className="text-xs font-medium text-[var(--color-ink-muted)]">Period Debits (Paid)</p>
          <p className="text-xl font-bold text-emerald-700 mt-1">
            {formatCurrency(aggregateStats.totalDebit)}
          </p>
          <p className="text-[11px] text-[var(--color-ink-subtle)] mt-0.5">
            Payments made & debited
          </p>
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs">
          <p className="text-xs font-medium text-[var(--color-ink-muted)]">Period Credits (Bills/Receives)</p>
          <p className="text-xl font-bold text-indigo-700 mt-1">
            {formatCurrency(aggregateStats.totalCredit)}
          </p>
          <p className="text-[11px] text-[var(--color-ink-subtle)] mt-0.5">
            Invoiced bills & receipts
          </p>
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs">
          <p className="text-xs font-medium text-[var(--color-ink-muted)]">Net Closing Balance</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-bold text-[var(--color-ink)]">
              {formatCurrency(Math.abs(aggregateStats.netPosition))}
            </span>
            <span
              className={`rounded-sm px-1.5 py-0.5 text-[11px] font-bold ${
                aggregateStats.netPosition >= 0
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {aggregateStats.netPosition >= 0 ? "Dr (Receivable)" : "Cr (Payable)"}
            </span>
          </div>
          <p className="text-[11px] text-[var(--color-ink-subtle)] mt-0.5">
            Total net ledger balance
          </p>
        </div>
      </div>

      {/* View Mode Tabs (Detailed Statements vs Consolidated Summary) */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2 print:hidden">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setViewMode("detailed")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              viewMode === "detailed"
                ? "bg-[var(--color-accent)] text-white"
                : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface)]"
            }`}
          >
            📋 Detailed Ledger Statements
          </button>
          <button
            type="button"
            onClick={() => setViewMode("summary")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              viewMode === "summary"
                ? "bg-[var(--color-accent)] text-white"
                : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface)]"
            }`}
          >
            📊 Consolidated Party Summary
          </button>
        </div>
        <p className="text-xs text-[var(--color-ink-muted)]">
          Period: <span className="font-medium text-[var(--color-ink)]">{startDate || "Start"}</span> to{" "}
          <span className="font-medium text-[var(--color-ink)]">{endDate || "Current"}</span>
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center text-sm text-[var(--color-ink-muted)]">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-[var(--color-accent)] border-r-transparent mb-2" />
          <p>Compiling party ledger accounts and calculating running balances…</p>
        </div>
      ) : statements.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center text-sm text-[var(--color-ink-muted)]">
          <p className="text-base font-semibold text-[var(--color-ink)]">No Parties Selected</p>
          <p className="mt-1 text-xs">Please select at least one party or check &quot;All Parties&quot; above.</p>
        </div>
      ) : viewMode === "summary" ? (
        /* Consolidated Summary Table View */
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs">
          <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3">
            <h4 className="text-sm font-semibold text-[var(--color-ink)]">
              Consolidated Party Ledger Summary
            </h4>
            <p className="text-xs text-[var(--color-ink-muted)]">
              Net opening balances, period debits/credits, and closing position across all selected accounts.
            </p>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--color-surface-muted)]/50 border-b border-[var(--color-border)] font-semibold text-[var(--color-ink-muted)]">
              <tr>
                <th className="py-3 px-4">Party Code</th>
                <th className="py-3 px-4">Party Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Opening Balance</th>
                <th className="py-3 px-4 text-right text-emerald-700">Total Debit (Dr)</th>
                <th className="py-3 px-4 text-right text-indigo-700">Total Credit (Cr)</th>
                <th className="py-3 px-4 text-right">Closing Balance</th>
                <th className="py-3 px-4 text-center print:hidden">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {statements.map((stmt) => (
                <tr key={stmt.party.id} className="hover:bg-[var(--color-surface-muted)]/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-[var(--color-accent)]">
                    {stmt.party.code}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-[var(--color-ink)]">{stmt.party.name}</p>
                    <p className="text-[10px] text-[var(--color-ink-muted)]">{stmt.party.phone || stmt.party.address || "—"}</p>
                  </td>
                  <td className="py-3 px-4">
                    <PartyTypeBadge type={stmt.party.type} />
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {formatCurrency(stmt.openingBalance)}{" "}
                    <span className="text-[10px] font-bold text-[var(--color-ink-subtle)]">
                      {stmt.openingBalanceType.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-emerald-700">
                    {formatCurrency(stmt.totalDebit)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-indigo-700">
                    {formatCurrency(stmt.totalCredit)}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">
                    <span>{formatCurrency(stmt.closingBalance)} </span>
                    <span
                      className={`inline-block text-[10px] px-1 rounded font-bold ${
                        stmt.closingBalanceType === "debit"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {stmt.closingBalanceType.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center print:hidden">
                    <button
                      type="button"
                      onClick={() => {
                        setAllPartiesSelected(false);
                        setSelectedPartyIds([stmt.party.id]);
                        setViewMode("detailed");
                      }}
                      className="text-xs text-[var(--color-accent)] hover:underline font-medium"
                    >
                      View Statement →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-[var(--color-border)] bg-[var(--color-surface-muted)] font-semibold text-[var(--color-ink)]">
              <tr>
                <td colSpan={4} className="py-3 px-4 text-right">
                  Aggregate Period Totals:
                </td>
                <td className="py-3 px-4 text-right text-emerald-700">
                  {formatCurrency(aggregateStats.totalDebit)}
                </td>
                <td className="py-3 px-4 text-right text-indigo-700">
                  {formatCurrency(aggregateStats.totalCredit)}
                </td>
                <td className="py-3 px-4 text-right">
                  {formatCurrency(Math.abs(aggregateStats.netPosition))}{" "}
                  <span className="text-[10px] font-bold">
                    {aggregateStats.netPosition >= 0 ? "DR" : "CR"}
                  </span>
                </td>
                <td className="print:hidden"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        /* Detailed Statement View (One per selected party) */
        <div className="space-y-8">
          {statements.map((stmt) => (
            <SinglePartyStatement key={stmt.party.id} statement={stmt} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Individual party ledger statement component with standard accounting columns */
function SinglePartyStatement({ statement }: { statement: PartyLedgerStatement }) {
  const { party, openingBalance, openingBalanceType, entries, totalDebit, totalCredit, closingBalance, closingBalanceType } = statement;

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs print:border print:shadow-none print:break-inside-avoid">
      {/* Statement Header */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] p-5 sm:flex sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-[var(--color-accent)]/10 px-2 py-0.5 font-mono text-xs font-bold text-[var(--color-accent)]">
              {party.code}
            </span>
            <h3 className="text-base font-bold text-[var(--color-ink)]">{party.name}</h3>
            <PartyTypeBadge type={party.type} />
          </div>
          <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
            {party.contactPerson ? `Contact: ${party.contactPerson} · ` : ""}
            {party.phone ? `Phone: ${party.phone} · ` : ""}
            {party.address ? `Address: ${party.address}` : ""}
          </p>
        </div>

        <div className="mt-3 sm:mt-0 text-left sm:text-right">
          <p className="text-xs text-[var(--color-ink-muted)]">
            Statement Period:{" "}
            <span className="font-semibold text-[var(--color-ink)]">
              {statement.startDate || "Beginning"} to {statement.endDate || "Current"}
            </span>
          </p>
          <p className="mt-1 text-xs">
            Net Closing Balance:{" "}
            <span className="font-bold text-[var(--color-ink)]">
              {formatCurrency(closingBalance)}
            </span>{" "}
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                closingBalanceType === "debit"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {closingBalanceType.toUpperCase()} (
              {closingBalanceType === "debit" ? "Receivable" : "Payable"})
            </span>
          </p>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/60 font-semibold text-[var(--color-ink-muted)]">
            <tr>
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Voucher #</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Narration / Particulars</th>
              <th className="py-2.5 px-3 text-right text-emerald-700">Debit (PKR)</th>
              <th className="py-2.5 px-3 text-right text-indigo-700">Credit (PKR)</th>
              <th className="py-2.5 px-3 text-right">Running Balance (PKR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {/* Opening Balance Row */}
            <tr className="bg-[var(--color-surface-muted)]/30 font-medium">
              <td className="py-2.5 px-3 text-[var(--color-ink-muted)]">
                {statement.startDate || "—"}
              </td>
              <td className="py-2.5 px-3 font-mono text-[var(--color-ink-subtle)]">B/F</td>
              <td className="py-2.5 px-3">
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-700">
                  Opening Balance
                </span>
              </td>
              <td className="py-2.5 px-3 text-[var(--color-ink)] italic">
                Balance Brought Forward as of period start
              </td>
              <td className="py-2.5 px-3 text-right text-emerald-700">
                {openingBalanceType === "debit" ? formatCurrency(openingBalance) : "—"}
              </td>
              <td className="py-2.5 px-3 text-right text-indigo-700">
                {openingBalanceType === "credit" ? formatCurrency(openingBalance) : "—"}
              </td>
              <td className="py-2.5 px-3 text-right font-semibold">
                {formatCurrency(openingBalance)}{" "}
                <span className="text-[10px] font-bold text-[var(--color-ink-subtle)]">
                  {openingBalanceType.toUpperCase()}
                </span>
              </td>
            </tr>

            {/* In-Period Vouchers */}
            {entries.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-6 text-center text-xs text-[var(--color-ink-subtle)] italic"
                >
                  No voucher activity recorded for this party within the selected date range.
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-[var(--color-surface-muted)]/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[var(--color-ink)] whitespace-nowrap">
                    {entry.date}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium text-[var(--color-ink)]">
                    {entry.voucherNo}
                  </td>
                  <td className="py-2.5 px-3">
                    <VoucherTypeTag type={entry.voucherType} label={entry.voucherTypeLabel} />
                  </td>
                  <td className="py-2.5 px-3 text-[var(--color-ink)] max-w-xs sm:max-w-md">
                    <p className="truncate font-medium">{entry.description}</p>
                    {entry.referenceInfo ? (
                      <p className="text-[10px] text-[var(--color-ink-muted)] truncate">
                        {entry.referenceInfo}
                      </p>
                    ) : null}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-emerald-700 whitespace-nowrap">
                    {entry.debit > 0 ? formatCurrency(entry.debit) : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-indigo-700 whitespace-nowrap">
                    {entry.credit > 0 ? formatCurrency(entry.credit) : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold whitespace-nowrap">
                    <span>{formatCurrency(entry.balance)} </span>
                    <span
                      className={`inline-block text-[10px] px-1 rounded font-bold ${
                        entry.balanceType === "debit"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {entry.balanceType.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {/* Statement Summary Footer */}
          <tfoot className="border-t-2 border-[var(--color-border)] bg-[var(--color-surface-muted)] font-semibold text-[var(--color-ink)]">
            <tr>
              <td colSpan={4} className="py-2.5 px-3 text-right">
                Period Totals:
              </td>
              <td className="py-2.5 px-3 text-right text-emerald-700">
                {formatCurrency(totalDebit)}
              </td>
              <td className="py-2.5 px-3 text-right text-indigo-700">
                {formatCurrency(totalCredit)}
              </td>
              <td className="py-2.5 px-3 text-right">
                Net Change: {formatCurrency(Math.abs(totalDebit - totalCredit))}{" "}
                <span className="text-[10px]">
                  {totalDebit >= totalCredit ? "DR" : "CR"}
                </span>
              </td>
            </tr>
            <tr className="border-t border-[var(--color-border)] bg-[var(--color-surface)] text-xs">
              <td colSpan={4} className="py-3 px-3 text-right font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                Closing Balance (Carried Down):
              </td>
              <td colSpan={3} className="py-3 px-3 text-right">
                <span className="text-sm font-bold text-[var(--color-ink)]">
                  {formatCurrency(closingBalance)}
                </span>{" "}
                <span
                  className={`rounded px-2 py-0.5 text-xs font-bold ${
                    closingBalanceType === "debit"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {closingBalanceType.toUpperCase()} (
                  {closingBalanceType === "debit" ? "Debit / Receivable" : "Credit / Payable"})
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function PartyTypeBadge({ type }: { type: Party["type"] }) {
  if (type === "vendor") {
    return (
      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-800">
        Vendor
      </span>
    );
  }
  if (type === "customer") {
    return (
      <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-800">
        Customer
      </span>
    );
  }
  return (
    <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-semibold text-teal-800">
      Vendor & Customer
    </span>
  );
}

function VoucherTypeTag({ type, label }: { type: VoucherType; label: string }) {
  if (type === "payableBill") {
    return (
      <span className="rounded bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
        {label}
      </span>
    );
  }
  if (type === "paid") {
    return (
      <span className="rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
        {label}
      </span>
    );
  }
  return (
    <span className="rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
      {label}
    </span>
  );
}
