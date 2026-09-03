"use client";

import { useEffect, useMemo, useState } from "react";
import type { CashBookAccountFilter, CashBookEntry, CashBookStatement } from "@gtms/types";
import { Button, Input, Label } from "@gtms/ui";
import {
  formatCurrency,
  mockFinanceApi,
  todayInputValue,
} from "@/lib/api/mock-finance";
import { FinancePageHeader } from "./finance-page-header";

export function CashBook() {
  const [accountFilter, setAccountFilter] = useState<CashBookAccountFilter>("all");
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState(todayInputValue());
  const [viewMode, setViewMode] = useState<"running" | "twoColumn">("running");
  const [statement, setStatement] = useState<CashBookStatement | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Cash Book data whenever filters change
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await mockFinanceApi.getCashBook({
          headId: accountFilter,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });
        if (!active) return;
        setStatement(res);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [accountFilter, startDate, endDate]);

  // Date range presets
  function applyDatePreset(preset: "all" | "today" | "thisMonth" | "lastMonth" | "quarter" | "ytd") {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    if (preset === "all") {
      setStartDate("");
      setEndDate("");
      return;
    }

    if (preset === "today") {
      const t = todayInputValue();
      setStartDate(t);
      setEndDate(t);
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

  // Export CSV
  function exportCsv() {
    if (!statement) return;

    const rows: string[][] = [
      [
        "Account",
        "Date",
        "Voucher No",
        "Type",
        "Party",
        "Narration / Particulars",
        "Inflow (Receipts)",
        "Outflow (Payments)",
        "Running Balance",
      ],
      [
        statement.accountName,
        statement.startDate || "Start",
        "B/F",
        "Opening Balance",
        "—",
        "Cash & Bank Balance Brought Forward",
        statement.openingBalance.toString(),
        "0",
        statement.openingBalance.toString(),
      ],
    ];

    for (const entry of statement.entries) {
      rows.push([
        entry.headName,
        entry.date,
        entry.voucherNo,
        entry.voucherTypeLabel,
        entry.partyName ? `${entry.partyCode || ""} ${entry.partyName}`.trim() : "Direct Account",
        entry.description,
        entry.inflow > 0 ? entry.inflow.toString() : "0",
        entry.outflow > 0 ? entry.outflow.toString() : "0",
        entry.runningBalance.toString(),
      ]);
    }

    rows.push([
      statement.accountName,
      statement.endDate || "Ending",
      "C/D",
      "Closing Balance",
      "—",
      "Closing Liquid Balance Carried Down",
      "",
      "",
      statement.closingBalance.toString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((row) => row.map((cell) => `"${(cell || "").replace(/"/g, '""')}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `cash-book-${statement.accountFilter}-${startDate || "all"}-to-${endDate || "now"}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Separate receipts and payments for traditional two-column view
  const { receipts, payments } = useMemo(() => {
    if (!statement) return { receipts: [] as CashBookEntry[], payments: [] as CashBookEntry[] };
    const r: CashBookEntry[] = [];
    const p: CashBookEntry[] = [];
    for (const entry of statement.entries) {
      if (entry.voucherType === "receive") {
        r.push(entry);
      } else {
        p.push(entry);
      }
    }
    return { receipts: r, payments: p };
  }, [statement]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <FinancePageHeader
          title="Cash Book & Bank Book"
          description="Liquid cash and bank ledger tracking all inflows (Receive vouchers) and outflows (Paid vouchers)."
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

      {/* Filter Controls Card */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xs print:hidden space-y-5">
        {/* 1. Account Filter Buttons */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-ink)]">
              1. Account Filter
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setAccountFilter("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                accountFilter === "all"
                  ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-xs"
                  : "bg-[var(--color-surface-muted)] text-[var(--color-ink)] border-[var(--color-border)] hover:bg-[var(--color-surface)]"
              }`}
            >
              🏦 All Accounts (Cash & Bank Consolidated)
            </button>
            <button
              type="button"
              onClick={() => setAccountFilter("head-cash")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                accountFilter === "head-cash"
                  ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-xs"
                  : "bg-[var(--color-surface-muted)] text-[var(--color-ink)] border-[var(--color-border)] hover:bg-[var(--color-surface)]"
              }`}
            >
              💵 Cash in Hand (1001)
            </button>
            <button
              type="button"
              onClick={() => setAccountFilter("head-bank")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                accountFilter === "head-bank"
                  ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-xs"
                  : "bg-[var(--color-surface-muted)] text-[var(--color-ink)] border-[var(--color-border)] hover:bg-[var(--color-surface)]"
              }`}
            >
              🏛️ Bank Account (1002)
            </button>
          </div>
        </div>

        <hr className="border-[var(--color-border)]" />

        {/* 2. Date Range Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-ink)]">
              2. Date Range
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
                onClick={() => applyDatePreset("today")}
                className="rounded-md border border-[var(--color-border)] px-2.5 py-1 text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)] transition-colors"
              >
                Today
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="cashbook-start-date">From Date</Label>
              <Input
                id="cashbook-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <p className="mt-1 text-[11px] text-[var(--color-ink-subtle)]">
                Vouchers before this date compute the Opening Cash/Bank Balance.
              </p>
            </div>

            <div>
              <Label htmlFor="cashbook-end-date">To Date</Label>
              <Input
                id="cashbook-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <p className="mt-1 text-[11px] text-[var(--color-ink-subtle)]">
                Closing liquidity calculated as of this date.
              </p>
            </div>

            <div className="flex flex-col justify-end">
              <div className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-xs text-[var(--color-ink-muted)]">
                <span className="font-semibold text-[var(--color-ink)]">Accounting Note:</span> Receive vouchers are inflows (Dr) and Paid vouchers are outflows (Cr).
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Liquidity KPI Cards */}
      {statement ? (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 print:grid-cols-4">
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs">
            <p className="text-xs font-medium text-[var(--color-ink-muted)]">Opening Balance</p>
            <p className="text-lg font-bold text-[var(--color-ink)] mt-1">
              {formatCurrency(statement.openingBalance)}
            </p>
            <p className="text-[11px] text-[var(--color-ink-subtle)] mt-0.5">B/F at period start</p>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs">
            <p className="text-xs font-medium text-[var(--color-ink-muted)]">Total Inflows (Receive)</p>
            <p className="text-lg font-bold text-emerald-700 mt-1">
              {formatCurrency(statement.totalInflow)}
            </p>
            <p className="text-[11px] text-[var(--color-ink-subtle)] mt-0.5">Customer / other receipts</p>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs">
            <p className="text-xs font-medium text-[var(--color-ink-muted)]">Total Outflows (Paid)</p>
            <p className="text-lg font-bold text-amber-700 mt-1">
              {formatCurrency(statement.totalOutflow)}
            </p>
            <p className="text-[11px] text-[var(--color-ink-subtle)] mt-0.5">Supplier / expense payments</p>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs">
            <p className="text-xs font-medium text-[var(--color-ink-muted)]">Closing Cash in Hand</p>
            <p className="text-lg font-bold text-[var(--color-ink)] mt-1">
              {formatCurrency(statement.cashBalance)}
            </p>
            <p className="text-[11px] text-[var(--color-ink-subtle)] mt-0.5">Physical petty/office cash</p>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs">
            <p className="text-xs font-medium text-[var(--color-ink-muted)]">Closing Bank Balance</p>
            <p className="text-lg font-bold text-[var(--color-ink)] mt-1">
              {formatCurrency(statement.bankBalance)}
            </p>
            <p className="text-[11px] text-[var(--color-ink-subtle)] mt-0.5">Commercial bank account</p>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-xs bg-emerald-50/40">
            <p className="text-xs font-medium text-[var(--color-accent)]">Net Liquid Position</p>
            <p className="text-lg font-extrabold text-[var(--color-accent)] mt-1">
              {formatCurrency(statement.closingBalance)}
            </p>
            <p className="text-[11px] text-[var(--color-ink-subtle)] mt-0.5">Available liquid liquidity</p>
          </div>
        </div>
      ) : null}

      {/* Presentation Mode Toggle */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2 print:hidden">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setViewMode("running")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              viewMode === "running"
                ? "bg-[var(--color-accent)] text-white"
                : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface)]"
            }`}
          >
            📋 Running Ledger View
          </button>
          <button
            type="button"
            onClick={() => setViewMode("twoColumn")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              viewMode === "twoColumn"
                ? "bg-[var(--color-accent)] text-white"
                : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface)]"
            }`}
          >
            ⚖️ Traditional Two-Column (T-Format)
          </button>
        </div>
        <p className="text-xs text-[var(--color-ink-muted)]">
          Account: <span className="font-semibold text-[var(--color-ink)]">{statement?.accountName || "All"}</span>
        </p>
      </div>

      {/* Content Rendering */}
      {loading || !statement ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center text-sm text-[var(--color-ink-muted)]">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-[var(--color-accent)] border-r-transparent mb-2" />
          <p>Compiling cash & bank ledger entries…</p>
        </div>
      ) : viewMode === "twoColumn" ? (
        /* Traditional Two-Column Cash Book Format */
        <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs print:border print:shadow-none">
          <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 text-center">
            <h3 className="text-base font-bold text-[var(--color-ink)]">
              {statement.accountName}
            </h3>
            <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
              Period: {statement.startDate || "Start"} to {statement.endDate || "Current"}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[var(--color-border)]">
            {/* Left Side: Receipts / Inflows (Debit) */}
            <div>
              <div className="border-b border-[var(--color-border)] bg-emerald-50/60 px-4 py-2.5 flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  Receipts / Inflows (Dr)
                </span>
                <span className="text-xs font-semibold text-emerald-800">
                  Total: {formatCurrency(statement.openingBalance + statement.totalInflow)}
                </span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/50 text-[var(--color-ink-muted)]">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Vch #</th>
                    <th className="py-2 px-3">Particulars / Party</th>
                    <th className="py-2 px-3">Account</th>
                    <th className="py-2 px-3 text-right">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {/* Opening Balance Row on Receipts side */}
                  <tr className="bg-emerald-50/20 font-medium">
                    <td className="py-2 px-3 font-mono">{statement.startDate || "—"}</td>
                    <td className="py-2 px-3 font-mono text-[var(--color-ink-subtle)]">B/F</td>
                    <td className="py-2 px-3 italic">To Balance Brought Forward</td>
                    <td className="py-2 px-3">{statement.accountFilter === "head-cash" ? "Cash" : statement.accountFilter === "head-bank" ? "Bank" : "Cash & Bank"}</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-700">
                      {formatCurrency(statement.openingBalance)}
                    </td>
                  </tr>
                  {receipts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-[var(--color-ink-subtle)] italic">
                        No receipts in this period.
                      </td>
                    </tr>
                  ) : (
                    receipts.map((entry) => (
                      <tr key={entry.id} className="hover:bg-[var(--color-surface-muted)]/40">
                        <td className="py-2 px-3 font-mono">{entry.date}</td>
                        <td className="py-2 px-3 font-mono font-medium text-emerald-800">{entry.voucherNo}</td>
                        <td className="py-2 px-3">
                          <p className="font-medium text-[var(--color-ink)] truncate max-w-xs">{entry.description}</p>
                          {entry.partyName ? (
                            <p className="text-[10px] text-[var(--color-ink-muted)]">{entry.partyCode} — {entry.partyName}</p>
                          ) : null}
                        </td>
                        <td className="py-2 px-3 text-[var(--color-ink-muted)]">{entry.headName}</td>
                        <td className="py-2 px-3 text-right font-semibold text-emerald-700">
                          {formatCurrency(entry.inflow)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Right Side: Payments / Outflows (Credit) */}
            <div>
              <div className="border-b border-[var(--color-border)] bg-amber-50/60 px-4 py-2.5 flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Payments / Outflows (Cr)
                </span>
                <span className="text-xs font-semibold text-amber-800">
                  Total: {formatCurrency(statement.totalOutflow + statement.closingBalance)}
                </span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/50 text-[var(--color-ink-muted)]">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Vch #</th>
                    <th className="py-2 px-3">Particulars / Party</th>
                    <th className="py-2 px-3">Account</th>
                    <th className="py-2 px-3 text-right">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-[var(--color-ink-subtle)] italic">
                        No payments in this period.
                      </td>
                    </tr>
                  ) : (
                    payments.map((entry) => (
                      <tr key={entry.id} className="hover:bg-[var(--color-surface-muted)]/40">
                        <td className="py-2 px-3 font-mono">{entry.date}</td>
                        <td className="py-2 px-3 font-mono font-medium text-amber-800">{entry.voucherNo}</td>
                        <td className="py-2 px-3">
                          <p className="font-medium text-[var(--color-ink)] truncate max-w-xs">{entry.description}</p>
                          {entry.partyName ? (
                            <p className="text-[10px] text-[var(--color-ink-muted)]">{entry.partyCode} — {entry.partyName}</p>
                          ) : null}
                        </td>
                        <td className="py-2 px-3 text-[var(--color-ink-muted)]">{entry.headName}</td>
                        <td className="py-2 px-3 text-right font-semibold text-amber-700">
                          {formatCurrency(entry.outflow)}
                        </td>
                      </tr>
                    ))
                  )}
                  {/* Closing Balance C/D Row on Payment side to reconcile */}
                  <tr className="bg-amber-50/20 font-medium border-t border-[var(--color-border)]">
                    <td className="py-2 px-3 font-mono">{statement.endDate || "—"}</td>
                    <td className="py-2 px-3 font-mono text-[var(--color-ink-subtle)]">C/D</td>
                    <td className="py-2 px-3 italic font-semibold text-[var(--color-ink)]">By Balance Carried Down</td>
                    <td className="py-2 px-3">{statement.accountFilter === "head-cash" ? "Cash" : statement.accountFilter === "head-bank" ? "Bank" : "Cash & Bank"}</td>
                    <td className="py-2 px-3 text-right font-bold text-[var(--color-ink)]">
                      {formatCurrency(statement.closingBalance)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t-2 border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 flex justify-between text-xs font-bold text-[var(--color-ink)]">
            <span>Reconciled Grand Total:</span>
            <span>{formatCurrency(statement.openingBalance + statement.totalInflow)}</span>
          </div>
        </div>
      ) : (
        /* Running Statement View (Standard Modern ERP Layout) */
        <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xs print:border print:shadow-none">
          <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 sm:flex sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-[var(--color-ink)]">{statement.accountName}</h3>
              <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                Period: <span className="font-semibold text-[var(--color-ink)]">{statement.startDate || "Beginning"} to {statement.endDate || "Current"}</span>
              </p>
            </div>
            <div className="mt-2 sm:mt-0 text-left sm:text-right">
              <p className="text-xs text-[var(--color-ink-muted)]">Closing Liquidity</p>
              <p className="text-base font-extrabold text-[var(--color-accent)]">
                {formatCurrency(statement.closingBalance)}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]/60 font-semibold text-[var(--color-ink-muted)]">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Voucher #</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Account Head</th>
                  <th className="py-2.5 px-3">Party & Narration</th>
                  <th className="py-2.5 px-3 text-right text-emerald-700">Money In / Inflow (Dr)</th>
                  <th className="py-2.5 px-3 text-right text-amber-700">Money Out / Outflow (Cr)</th>
                  <th className="py-2.5 px-3 text-right">Running Balance (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {/* Opening Balance Row */}
                <tr className="bg-[var(--color-surface-muted)]/30 font-medium">
                  <td className="py-2.5 px-3 text-[var(--color-ink-muted)]">{statement.startDate || "—"}</td>
                  <td className="py-2.5 px-3 font-mono text-[var(--color-ink-subtle)]">B/F</td>
                  <td className="py-2.5 px-3">
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-700">
                      Opening Balance
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[var(--color-ink-muted)]">
                    {statement.accountFilter === "head-cash" ? "Cash in Hand" : statement.accountFilter === "head-bank" ? "Bank Account" : "Cash & Bank"}
                  </td>
                  <td className="py-2.5 px-3 text-[var(--color-ink)] italic">
                    Liquid Cash/Bank Balance Brought Forward
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 font-semibold">
                    {formatCurrency(statement.openingBalance)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-amber-700">—</td>
                  <td className="py-2.5 px-3 text-right font-bold">
                    {formatCurrency(statement.openingBalance)}
                  </td>
                </tr>

                {statement.entries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-xs text-[var(--color-ink-subtle)] italic">
                      No cash or bank vouchers recorded within the selected period.
                    </td>
                  </tr>
                ) : (
                  statement.entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-[var(--color-surface-muted)]/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono whitespace-nowrap">{entry.date}</td>
                      <td className="py-2.5 px-3 font-mono font-medium">{entry.voucherNo}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                            entry.voucherType === "receive"
                              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                              : "bg-amber-50 border border-amber-200 text-amber-700"
                          }`}
                        >
                          {entry.voucherTypeLabel}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-[var(--color-ink-muted)]">
                        {entry.headName}
                      </td>
                      <td className="py-2.5 px-3 max-w-xs sm:max-w-md">
                        <p className="font-medium text-[var(--color-ink)] truncate">{entry.description}</p>
                        {entry.partyName ? (
                          <p className="text-[10px] text-[var(--color-ink-muted)] truncate">
                            Party: <span className="font-mono text-[var(--color-accent)]">{entry.partyCode}</span> {entry.partyName}
                          </p>
                        ) : null}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-emerald-700 whitespace-nowrap">
                        {entry.inflow > 0 ? formatCurrency(entry.inflow) : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-amber-700 whitespace-nowrap">
                        {entry.outflow > 0 ? formatCurrency(entry.outflow) : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[var(--color-ink)] whitespace-nowrap">
                        {formatCurrency(entry.runningBalance)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="border-t-2 border-[var(--color-border)] bg-[var(--color-surface-muted)] font-semibold text-[var(--color-ink)]">
                <tr>
                  <td colSpan={5} className="py-2.5 px-3 text-right">
                    Period Totals:
                  </td>
                  <td className="py-2.5 px-3 text-right text-emerald-700">
                    {formatCurrency(statement.totalInflow)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-amber-700">
                    {formatCurrency(statement.totalOutflow)}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    Net: {formatCurrency(statement.totalInflow - statement.totalOutflow)}
                  </td>
                </tr>
                <tr className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
                  <td colSpan={5} className="py-3 px-3 text-right font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                    Closing Liquid Balance (Carried Down):
                  </td>
                  <td colSpan={3} className="py-3 px-3 text-right">
                    <span className="text-sm font-extrabold text-[var(--color-accent)]">
                      {formatCurrency(statement.closingBalance)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
