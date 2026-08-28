import type {
  AccountHead,
  Contract,
  PaidVoucher,
  PaidVoucherInput,
  Party,
  PartyInput,
  PayableBillInput,
  PayableBillVoucher,
  ReceiptVoucher,
  ReceiptVoucherInput,
} from "@gtms/types";

const STORAGE_KEYS = {
  parties: "gtms.finance.parties",
  heads: "gtms.finance.heads",
  contracts: "gtms.finance.contracts",
  payableBills: "gtms.finance.payable-bills",
  paid: "gtms.finance.paid",
  receipts: "gtms.finance.receipts",
  counters: "gtms.finance.counters",
} as const;

const SEED_HEADS: AccountHead[] = [
  { id: "head-cash", code: "1001", name: "Cash in Hand" },
  { id: "head-bank", code: "1002", name: "Bank Account" },
  { id: "head-payables", code: "2001", name: "Trade Payables" },
  { id: "head-expense", code: "5001", name: "Operating Expenses" },
];

const SEED_PARTIES: Party[] = [
  {
    id: "party-001",
    code: "V-001",
    name: "Al-Noor Yarn Suppliers",
    type: "vendor",
    contactPerson: "Kamran Ali",
    phone: "0300-1112233",
    address: "Faisalabad",
    openingBalance: 85000,
    balanceType: "credit",
    notes: "Opening balance as of current period",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "party-002",
    code: "C-001",
    name: "Metro Textiles",
    type: "customer",
    contactPerson: "Sadia Hussain",
    phone: "0321-9988776",
    address: "Lahore",
    openingBalance: 120000,
    balanceType: "debit",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "party-003",
    code: "B-001",
    name: "Green Weave Mills",
    type: "both",
    contactPerson: "Usman Shah",
    phone: "0333-4455667",
    address: "Karachi",
    openingBalance: 0,
    balanceType: "debit",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

const SEED_CONTRACTS: Contract[] = [
  {
    id: "contract-001",
    code: "CNT-2026-001",
    partyId: "party-002",
    title: "Grey fabric supply — Q1",
  },
  {
    id: "contract-002",
    code: "CNT-2026-002",
    partyId: "party-002",
    title: "Yarn conversion contract",
  },
  {
    id: "contract-003",
    code: "CNT-2026-003",
    partyId: "party-003",
    title: "Weaving job work agreement",
  },
];

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function ensureSeed(): void {
  if (typeof window === "undefined") return;
  if (!window.localStorage.getItem(STORAGE_KEYS.parties)) {
    write(STORAGE_KEYS.parties, SEED_PARTIES);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.heads)) {
    write(STORAGE_KEYS.heads, SEED_HEADS);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.contracts)) {
    write(STORAGE_KEYS.contracts, SEED_CONTRACTS);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.payableBills)) {
    write(STORAGE_KEYS.payableBills, []);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.paid)) {
    write(STORAGE_KEYS.paid, []);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.receipts)) {
    write(STORAGE_KEYS.receipts, []);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.counters)) {
    write(STORAGE_KEYS.counters, {
      payableBill: 1000,
      paid: 2000,
      receipt: 3000,
    });
  }
}

function nextVoucherNo(type: "payableBill" | "paid" | "receipt", prefix: string): string {
  const counters = read<Record<string, number>>(STORAGE_KEYS.counters, {
    payableBill: 1000,
    paid: 2000,
    receipt: 3000,
  });
  counters[type] = (counters[type] ?? 1000) + 1;
  write(STORAGE_KEYS.counters, counters);
  return `${prefix}-${String(counters[type]).padStart(4, "0")}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Mock finance API — swap for real backend later. */
export const mockFinanceApi = {
  async listParties(): Promise<Party[]> {
    await delay();
    ensureSeed();
    return read<Party[]>(STORAGE_KEYS.parties, SEED_PARTIES);
  },

  async getParty(id: string): Promise<Party | null> {
    await delay();
    ensureSeed();
    const parties = read<Party[]>(STORAGE_KEYS.parties, SEED_PARTIES);
    return parties.find((p) => p.id === id) ?? null;
  },

  async createParty(input: PartyInput): Promise<Party> {
    await delay();
    ensureSeed();
    const parties = read<Party[]>(STORAGE_KEYS.parties, SEED_PARTIES);
    const party: Party = {
      id: uid("party"),
      ...input,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    parties.unshift(party);
    write(STORAGE_KEYS.parties, parties);
    return party;
  },

  async updateParty(id: string, input: PartyInput): Promise<Party> {
    await delay();
    ensureSeed();
    const parties = read<Party[]>(STORAGE_KEYS.parties, SEED_PARTIES);
    const index = parties.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Party not found");
    parties[index] = {
      ...parties[index],
      ...input,
      updatedAt: nowIso(),
    };
    write(STORAGE_KEYS.parties, parties);
    return parties[index];
  },

  async listHeads(): Promise<AccountHead[]> {
    await delay();
    ensureSeed();
    return read<AccountHead[]>(STORAGE_KEYS.heads, SEED_HEADS);
  },

  async listContracts(partyId?: string): Promise<Contract[]> {
    await delay();
    ensureSeed();
    const contracts = read<Contract[]>(STORAGE_KEYS.contracts, SEED_CONTRACTS);
    return partyId
      ? contracts.filter((c) => c.partyId === partyId)
      : contracts;
  },

  async createPayableBill(input: PayableBillInput): Promise<PayableBillVoucher> {
    await delay();
    ensureSeed();
    const items = read<PayableBillVoucher[]>(STORAGE_KEYS.payableBills, []);
    const voucher: PayableBillVoucher = {
      id: uid("pb"),
      voucherNo: nextVoucherNo("payableBill", "PB"),
      ...input,
      amount: Number((input.quantity * input.rate).toFixed(2)),
      createdAt: nowIso(),
    };
    items.unshift(voucher);
    write(STORAGE_KEYS.payableBills, items);
    return voucher;
  },

  async listPayableBills(): Promise<PayableBillVoucher[]> {
    await delay();
    ensureSeed();
    return read<PayableBillVoucher[]>(STORAGE_KEYS.payableBills, []);
  },

  async createPaid(input: PaidVoucherInput): Promise<PaidVoucher> {
    await delay();
    ensureSeed();
    const items = read<PaidVoucher[]>(STORAGE_KEYS.paid, []);
    const voucher: PaidVoucher = {
      id: uid("pd"),
      voucherNo: nextVoucherNo("paid", "PD"),
      ...input,
      createdAt: nowIso(),
    };
    items.unshift(voucher);
    write(STORAGE_KEYS.paid, items);
    return voucher;
  },

  async listPaid(): Promise<PaidVoucher[]> {
    await delay();
    ensureSeed();
    return read<PaidVoucher[]>(STORAGE_KEYS.paid, []);
  },

  async createReceipt(input: ReceiptVoucherInput): Promise<ReceiptVoucher> {
    await delay();
    ensureSeed();
    const items = read<ReceiptVoucher[]>(STORAGE_KEYS.receipts, []);
    const voucher: ReceiptVoucher = {
      id: uid("rc"),
      voucherNo: nextVoucherNo("receipt", "RC"),
      ...input,
      createdAt: nowIso(),
    };
    items.unshift(voucher);
    write(STORAGE_KEYS.receipts, items);
    return voucher;
  },

  async listReceipts(): Promise<ReceiptVoucher[]> {
    await delay();
    ensureSeed();
    return read<ReceiptVoucher[]>(STORAGE_KEYS.receipts, []);
  },
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

export function partyTypeLabel(type: Party["type"]): string {
  if (type === "vendor") return "Vendor";
  if (type === "customer") return "Customer";
  return "Vendor & Customer";
}
