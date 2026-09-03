import type {
  AccountHead,
  CashBookAccountFilter,
  CashBookEntry,
  CashBookFilterParams,
  CashBookStatement,
  Contract,
  LedgerEntry,
  LedgerFilterParams,
  PaidVoucher,
  PaidVoucherInput,
  Party,
  PartyInput,
  PartyLedgerStatement,
  PayableBillInput,
  PayableBillVoucher,
  ReceiveVoucher,
  ReceiveVoucherInput,
  VoucherType,
} from "@gtms/types";

const STORAGE_KEYS = {
  parties: "gtms.finance.parties",
  heads: "gtms.finance.heads",
  contracts: "gtms.finance.contracts",
  payableBills: "gtms.finance.payable-bills",
  paid: "gtms.finance.paid",
  receives: "gtms.finance.receives",
  receipts: "gtms.finance.receipts", // legacy fallback
  counters: "gtms.finance.counters",
} as const;

const SEED_HEADS: AccountHead[] = [
  { id: "head-cash", code: "1001", name: "Cash in Hand", openingBalance: 150000 },
  { id: "head-bank", code: "1002", name: "Bank Account", openingBalance: 1200000 },
  { id: "head-payables", code: "2001", name: "Trade Payables", openingBalance: 0 },
  { id: "head-expense", code: "5001", name: "Operating Expenses", openingBalance: 0 },
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

const SEED_PAYABLE_BILLS: PayableBillVoucher[] = [
  {
    id: "pb-seed-1",
    voucherNo: "PB-1001",
    date: "2026-01-15",
    partyId: "party-001", // Al-Noor Yarn Suppliers
    description: "100 bags 30/1 Cotton Carded Yarn @ Rs. 1,250",
    quantity: 100,
    rate: 1250,
    amount: 125000,
    createdAt: "2026-01-15T10:00:00.000Z",
  },
  {
    id: "pb-seed-2",
    voucherNo: "PB-1002",
    date: "2026-02-10",
    partyId: "party-001", // Al-Noor Yarn Suppliers
    description: "50 bags 40/1 Combed Compact Yarn @ Rs. 1,800",
    quantity: 50,
    rate: 1800,
    amount: 90000,
    createdAt: "2026-02-10T11:00:00.000Z",
  },
  {
    id: "pb-seed-3",
    voucherNo: "PB-1003",
    date: "2026-01-18",
    partyId: "party-003", // Green Weave Mills
    description: "Job work weaving charges for 2,000 meters grey cloth @ Rs. 45",
    quantity: 2000,
    rate: 45,
    amount: 90000,
    createdAt: "2026-01-18T14:30:00.000Z",
  },
  {
    id: "pb-seed-4",
    voucherNo: "PB-1004",
    date: "2026-03-01",
    partyId: "party-001", // Al-Noor Yarn Suppliers
    description: "40 bags 20/1 Open End Yarn @ Rs. 950",
    quantity: 40,
    rate: 950,
    amount: 38000,
    createdAt: "2026-03-01T09:15:00.000Z",
  },
];

const SEED_PAID: PaidVoucher[] = [
  {
    id: "pd-seed-1",
    voucherNo: "PD-2001",
    date: "2026-01-28",
    headId: "head-bank",
    partyId: "party-001", // Al-Noor Yarn Suppliers
    description: "Bank transfer via HBL against yarn invoice PB-1001",
    amount: 100000,
    createdAt: "2026-01-28T12:00:00.000Z",
  },
  {
    id: "pd-seed-2",
    voucherNo: "PD-2002",
    date: "2026-02-25",
    headId: "head-cash",
    partyId: "party-001", // Al-Noor Yarn Suppliers
    description: "Cash advance payment for yarn dispatch and freight",
    amount: 50000,
    createdAt: "2026-02-25T15:00:00.000Z",
  },
  {
    id: "pd-seed-3",
    voucherNo: "PD-2003",
    date: "2026-02-05",
    headId: "head-bank",
    partyId: "party-003", // Green Weave Mills
    description: "Cheque payment for weaving job contract",
    amount: 60000,
    createdAt: "2026-02-05T10:30:00.000Z",
  },
];

const SEED_RECEIVES: ReceiveVoucher[] = [
  {
    id: "rc-seed-1",
    voucherNo: "RC-3001",
    date: "2026-01-20",
    partyId: "party-002", // Metro Textiles
    contractId: "contract-001",
    headId: "head-bank",
    description: "Advance payment received for Grey fabric supply Q1",
    amount: 60000,
    createdAt: "2026-01-20T11:00:00.000Z",
  },
  {
    id: "rc-seed-2",
    voucherNo: "RC-3002",
    date: "2026-02-15",
    partyId: "party-002", // Metro Textiles
    contractId: "contract-002",
    headId: "head-bank",
    description: "Online transfer for yarn conversion bill settlement",
    amount: 40000,
    createdAt: "2026-02-15T16:00:00.000Z",
  },
  {
    id: "rc-seed-3",
    voucherNo: "RC-3003",
    date: "2026-02-20",
    partyId: "party-003", // Green Weave Mills
    contractId: "contract-003",
    headId: "head-cash",
    description: "Waste yarn recovery credit settlement received",
    amount: 15000,
    createdAt: "2026-02-20T14:00:00.000Z",
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
    write(STORAGE_KEYS.payableBills, SEED_PAYABLE_BILLS);
  }
  if (!window.localStorage.getItem(STORAGE_KEYS.paid)) {
    write(STORAGE_KEYS.paid, SEED_PAID);
  }

  // Support receive / legacy receipt key
  const hasReceives = window.localStorage.getItem(STORAGE_KEYS.receives);
  const hasLegacyReceipts = window.localStorage.getItem(STORAGE_KEYS.receipts);
  if (!hasReceives && !hasLegacyReceipts) {
    write(STORAGE_KEYS.receives, SEED_RECEIVES);
  } else if (!hasReceives && hasLegacyReceipts) {
    const legacy = read<ReceiveVoucher[]>(STORAGE_KEYS.receipts, SEED_RECEIVES);
    write(STORAGE_KEYS.receives, legacy);
  }

  if (!window.localStorage.getItem(STORAGE_KEYS.counters)) {
    write(STORAGE_KEYS.counters, {
      payableBill: 1004,
      paid: 2003,
      receive: 3003,
      receipt: 3003,
    });
  }
}

function nextVoucherNo(
  type: "payableBill" | "paid" | "receive" | "receipt",
  prefix: string,
): string {
  const normalizedType = type === "receipt" ? "receive" : type;
  const counters = read<Record<string, number>>(STORAGE_KEYS.counters, {
    payableBill: 1000,
    paid: 2000,
    receive: 3000,
  });
  counters[normalizedType] = (counters[normalizedType] ?? 1000) + 1;
  counters.receive = counters[normalizedType];
  counters.receipt = counters[normalizedType];
  write(STORAGE_KEYS.counters, counters);
  return `${prefix}-${String(counters[normalizedType]).padStart(4, "0")}`;
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
    const items = read<PayableBillVoucher[]>(STORAGE_KEYS.payableBills, SEED_PAYABLE_BILLS);
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
    return read<PayableBillVoucher[]>(STORAGE_KEYS.payableBills, SEED_PAYABLE_BILLS);
  },

  async createPaid(input: PaidVoucherInput): Promise<PaidVoucher> {
    await delay();
    ensureSeed();
    const items = read<PaidVoucher[]>(STORAGE_KEYS.paid, SEED_PAID);
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
    return read<PaidVoucher[]>(STORAGE_KEYS.paid, SEED_PAID);
  },

  async createReceive(input: ReceiveVoucherInput): Promise<ReceiveVoucher> {
    await delay();
    ensureSeed();
    const items = read<ReceiveVoucher[]>(
      STORAGE_KEYS.receives,
      read<ReceiveVoucher[]>(STORAGE_KEYS.receipts, SEED_RECEIVES),
    );
    const voucher: ReceiveVoucher = {
      id: uid("rc"),
      voucherNo: nextVoucherNo("receive", "RC"),
      ...input,
      headId: input.headId || "head-bank",
      createdAt: nowIso(),
    };
    items.unshift(voucher);
    write(STORAGE_KEYS.receives, items);
    write(STORAGE_KEYS.receipts, items); // synchronize legacy key
    return voucher;
  },

  async listReceives(): Promise<ReceiveVoucher[]> {
    await delay();
    ensureSeed();
    return read<ReceiveVoucher[]>(
      STORAGE_KEYS.receives,
      read<ReceiveVoucher[]>(STORAGE_KEYS.receipts, SEED_RECEIVES),
    );
  },

  /** Aliases for receipt backward compatibility */
  async createReceipt(input: ReceiveVoucherInput): Promise<ReceiveVoucher> {
    return this.createReceive(input);
  },

  async listReceipts(): Promise<ReceiveVoucher[]> {
    return this.listReceives();
  },

  /** Dynamic Party Ledger for textile operations */
  async getPartyLedger(params?: LedgerFilterParams): Promise<PartyLedgerStatement[]> {
    await delay();
    ensureSeed();

    const parties = read<Party[]>(STORAGE_KEYS.parties, SEED_PARTIES);
    const payableBills = read<PayableBillVoucher[]>(STORAGE_KEYS.payableBills, SEED_PAYABLE_BILLS);
    const paidList = read<PaidVoucher[]>(STORAGE_KEYS.paid, SEED_PAID);
    const receiveList = read<ReceiveVoucher[]>(
      STORAGE_KEYS.receives,
      read<ReceiveVoucher[]>(STORAGE_KEYS.receipts, SEED_RECEIVES),
    );
    const heads = read<AccountHead[]>(STORAGE_KEYS.heads, SEED_HEADS);
    const contracts = read<Contract[]>(STORAGE_KEYS.contracts, SEED_CONTRACTS);

    const filterPartyIds =
      params?.partyIds && params.partyIds.length > 0
        ? new Set(params.partyIds)
        : null;

    const targetParties = filterPartyIds
      ? parties.filter((p) => filterPartyIds.has(p.id))
      : parties;

    const startDate = params?.startDate?.trim() || "";
    const endDate = params?.endDate?.trim() || "";
    const allowedTypes = params?.voucherTypes ? new Set(params.voucherTypes) : null;

    const headMap = new Map(heads.map((h) => [h.id, h.name]));
    const contractMap = new Map(contracts.map((c) => [c.id, `${c.code} — ${c.title}`]));

    const statements: PartyLedgerStatement[] = [];

    for (const party of targetParties) {
      // Accounting convention:
      // Debit is positive (+), Credit is negative (-)
      let preNetDebit = party.balanceType === "debit"
        ? party.openingBalance
        : -party.openingBalance;

      type RawLedgerItem = {
        id: string;
        date: string;
        voucherNo: string;
        voucherType: VoucherType;
        voucherTypeLabel: string;
        description: string;
        referenceInfo?: string;
        debit: number;
        credit: number;
        createdAt: string;
      };

      const partyVouchers: RawLedgerItem[] = [];

      // Payable Bills -> Credit (Increases party credit / our payable liability)
      for (const pb of payableBills) {
        if (pb.partyId !== party.id) continue;
        partyVouchers.push({
          id: pb.id,
          date: pb.date,
          voucherNo: pb.voucherNo,
          voucherType: "payableBill",
          voucherTypeLabel: "Payable Bill",
          description: pb.description,
          referenceInfo: `Qty: ${pb.quantity.toLocaleString()} @ Rs. ${pb.rate.toLocaleString()}`,
          debit: 0,
          credit: pb.amount,
          createdAt: pb.createdAt,
        });
      }

      // Paid Vouchers -> Debit (Reduces our payable liability to party)
      for (const pd of paidList) {
        if (pd.partyId !== party.id) continue;
        const headName = headMap.get(pd.headId) || "Bank/Cash";
        partyVouchers.push({
          id: pd.id,
          date: pd.date,
          voucherNo: pd.voucherNo,
          voucherType: "paid",
          voucherTypeLabel: "Paid",
          description: pd.description,
          referenceInfo: `Account: ${headName}`,
          debit: pd.amount,
          credit: 0,
          createdAt: pd.createdAt,
        });
      }

      // Receive Vouchers -> Credit (Reduces customer receivable balance / payment received)
      for (const rc of receiveList) {
        if (rc.partyId !== party.id) continue;
        const contractInfo = contractMap.get(rc.contractId) || "Contract";
        partyVouchers.push({
          id: rc.id,
          date: rc.date,
          voucherNo: rc.voucherNo,
          voucherType: "receive",
          voucherTypeLabel: "Receive",
          description: rc.description,
          referenceInfo: contractInfo,
          debit: 0,
          credit: rc.amount,
          createdAt: rc.createdAt,
        });
      }

      // Sort chronologically
      partyVouchers.sort((a, b) => {
        const dateCmp = a.date.localeCompare(b.date);
        if (dateCmp !== 0) return dateCmp;
        return a.createdAt.localeCompare(b.createdAt);
      });

      const inPeriodItems: RawLedgerItem[] = [];

      for (const item of partyVouchers) {
        if (startDate && item.date < startDate) {
          // Pre-start: accumulates into opening balance
          preNetDebit += (item.debit - item.credit);
        } else if (endDate && item.date > endDate) {
          // Beyond period: omit
        } else {
          // Inside date range
          if (!allowedTypes || allowedTypes.has(item.voucherType)) {
            inPeriodItems.push(item);
          }
        }
      }

      const openingBalance = Math.abs(preNetDebit);
      const openingBalanceType = preNetDebit >= 0 ? "debit" : "credit";

      let runningNetDebit = preNetDebit;
      let totalDebit = 0;
      let totalCredit = 0;

      const entries: LedgerEntry[] = [];

      for (const item of inPeriodItems) {
        totalDebit += item.debit;
        totalCredit += item.credit;
        runningNetDebit += (item.debit - item.credit);

        entries.push({
          id: item.id,
          date: item.date,
          voucherNo: item.voucherNo,
          voucherType: item.voucherType,
          voucherTypeLabel: item.voucherTypeLabel,
          description: item.description,
          referenceInfo: item.referenceInfo,
          debit: item.debit,
          credit: item.credit,
          balance: Math.abs(runningNetDebit),
          balanceType: runningNetDebit >= 0 ? "debit" : "credit",
        });
      }

      const closingBalance = Math.abs(runningNetDebit);
      const closingBalanceType = runningNetDebit >= 0 ? "debit" : "credit";

      statements.push({
        party,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        openingBalance,
        openingBalanceType,
        entries,
        totalDebit,
        totalCredit,
        closingBalance,
        closingBalanceType,
      });
    }

    return statements;
  },

  /** Dynamic Cash Book / Bank Book statement */
  async getCashBook(params?: CashBookFilterParams): Promise<CashBookStatement> {
    await delay();
    ensureSeed();

    const heads = read<AccountHead[]>(STORAGE_KEYS.heads, SEED_HEADS);
    const parties = read<Party[]>(STORAGE_KEYS.parties, SEED_PARTIES);
    const paidList = read<PaidVoucher[]>(STORAGE_KEYS.paid, SEED_PAID);
    const receiveList = read<ReceiveVoucher[]>(
      STORAGE_KEYS.receives,
      read<ReceiveVoucher[]>(STORAGE_KEYS.receipts, SEED_RECEIVES),
    );

    const partyMap = new Map(parties.map((p) => [p.id, p]));
    const headMap = new Map(heads.map((h) => [h.id, h]));

    const targetHeadId = params?.headId || "all";
    const startDate = params?.startDate?.trim() || "";
    const endDate = params?.endDate?.trim() || "";

    // Base opening balance: Cash in Hand = 150,000, Bank Account = 1,200,000
    const cashHead = headMap.get("head-cash");
    const bankHead = headMap.get("head-bank");
    const baseCashOpening = cashHead?.openingBalance ?? 150000;
    const baseBankOpening = bankHead?.openingBalance ?? 1200000;

    let preCashBalance = baseCashOpening;
    let preBankBalance = baseBankOpening;

    type RawCashItem = {
      id: string;
      date: string;
      voucherNo: string;
      voucherType: "paid" | "receive";
      voucherTypeLabel: string;
      headId: string;
      headName: string;
      headCode: string;
      partyId?: string;
      partyName?: string;
      partyCode?: string;
      description: string;
      inflow: number;  // Receive (Money In / Debit to Cash/Bank)
      outflow: number; // Paid (Money Out / Credit to Cash/Bank)
      createdAt: string;
    };

    const allCashItems: RawCashItem[] = [];

    // Receive Vouchers -> Inflow to Cash/Bank
    for (const rc of receiveList) {
      const hId = rc.headId || "head-bank"; // default to bank
      const head = headMap.get(hId);
      const party = rc.partyId ? partyMap.get(rc.partyId) : undefined;

      allCashItems.push({
        id: rc.id,
        date: rc.date,
        voucherNo: rc.voucherNo,
        voucherType: "receive",
        voucherTypeLabel: "Receive (Inflow)",
        headId: hId,
        headName: head?.name || "Bank Account",
        headCode: head?.code || "1002",
        partyId: rc.partyId,
        partyName: party?.name,
        partyCode: party?.code,
        description: rc.description,
        inflow: rc.amount,
        outflow: 0,
        createdAt: rc.createdAt,
      });
    }

    // Paid Vouchers -> Outflow from Cash/Bank
    for (const pd of paidList) {
      const hId = pd.headId || "head-bank";
      const head = headMap.get(hId);
      const party = pd.partyId ? partyMap.get(pd.partyId) : undefined;

      allCashItems.push({
        id: pd.id,
        date: pd.date,
        voucherNo: pd.voucherNo,
        voucherType: "paid",
        voucherTypeLabel: "Paid (Outflow)",
        headId: hId,
        headName: head?.name || "Cash/Bank",
        headCode: head?.code || "1001",
        partyId: pd.partyId,
        partyName: party?.name,
        partyCode: party?.code,
        description: pd.description,
        inflow: 0,
        outflow: pd.amount,
        createdAt: pd.createdAt,
      });
    }

    // Sort chronologically
    allCashItems.sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return a.createdAt.localeCompare(b.createdAt);
    });

    // Accumulate pre-start vouchers into opening balances
    for (const item of allCashItems) {
      if (startDate && item.date < startDate) {
        if (item.headId === "head-cash") {
          preCashBalance += (item.inflow - item.outflow);
        } else {
          preBankBalance += (item.inflow - item.outflow);
        }
      }
    }

    // Determine initial opening balance based on target head filter
    let currentCash = preCashBalance;
    let currentBank = preBankBalance;

    let periodOpeningBalance = 0;
    if (targetHeadId === "head-cash") {
      periodOpeningBalance = preCashBalance;
    } else if (targetHeadId === "head-bank") {
      periodOpeningBalance = preBankBalance;
    } else {
      periodOpeningBalance = preCashBalance + preBankBalance;
    }

    let runningBalance = periodOpeningBalance;
    let totalInflow = 0;
    let totalOutflow = 0;

    const entries: CashBookEntry[] = [];

    for (const item of allCashItems) {
      // Check date range
      if (startDate && item.date < startDate) continue;
      if (endDate && item.date > endDate) continue;

      // Update cash / bank individual running positions
      if (item.headId === "head-cash") {
        currentCash += (item.inflow - item.outflow);
      } else {
        currentBank += (item.inflow - item.outflow);
      }

      // Check account filter
      if (targetHeadId !== "all" && item.headId !== targetHeadId) {
        continue;
      }

      totalInflow += item.inflow;
      totalOutflow += item.outflow;
      runningBalance += (item.inflow - item.outflow);

      entries.push({
        id: item.id,
        date: item.date,
        voucherNo: item.voucherNo,
        voucherType: item.voucherType,
        voucherTypeLabel: item.voucherTypeLabel,
        headId: item.headId,
        headName: item.headName,
        headCode: item.headCode,
        partyId: item.partyId,
        partyName: item.partyName,
        partyCode: item.partyCode,
        description: item.description,
        inflow: item.inflow,
        outflow: item.outflow,
        runningBalance,
      });
    }

    let accountName = "All Accounts (Cash & Bank Consolidated)";
    if (targetHeadId === "head-cash") {
      accountName = "Cash in Hand (Petty Cash Book)";
    } else if (targetHeadId === "head-bank") {
      accountName = "Bank Account (Bank Book)";
    }

    return {
      accountFilter: targetHeadId,
      accountName,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      openingBalance: periodOpeningBalance,
      entries,
      totalInflow,
      totalOutflow,
      closingBalance: runningBalance,
      cashBalance: currentCash,
      bankBalance: currentBank,
    };
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

