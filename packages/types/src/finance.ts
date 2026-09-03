/** Finance domain types — parties, lookups, and voucher shapes. */

export type PartyType = "vendor" | "customer" | "both";

export type BalanceType = "debit" | "credit";

export interface Party {
  id: string;
  code: string;
  name: string;
  type: PartyType;
  contactPerson?: string;
  phone?: string;
  address?: string;
  openingBalance: number;
  balanceType: BalanceType;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartyInput {
  code: string;
  name: string;
  type: PartyType;
  contactPerson?: string;
  phone?: string;
  address?: string;
  openingBalance: number;
  balanceType: BalanceType;
  notes?: string;
}

export interface AccountHead {
  id: string;
  code: string;
  name: string;
  openingBalance?: number;
}


export interface Contract {
  id: string;
  code: string;
  partyId: string;
  title: string;
}

export interface PayableBillVoucher {
  id: string;
  voucherNo: string;
  date: string;
  partyId: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  createdAt: string;
}

export interface PayableBillInput {
  date: string;
  partyId: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface PaidVoucher {
  id: string;
  voucherNo: string;
  date: string;
  headId: string;
  partyId: string;
  description: string;
  amount: number;
  createdAt: string;
}

export interface PaidVoucherInput {
  date: string;
  headId: string;
  partyId: string;
  description: string;
  amount: number;
}

export interface ReceiveVoucher {
  id: string;
  voucherNo: string;
  date: string;
  partyId: string;
  contractId: string;
  headId?: string;
  description: string;
  amount: number;
  createdAt: string;
}

export interface ReceiveVoucherInput {
  date: string;
  partyId: string;
  contractId: string;
  headId?: string;
  description: string;
  amount: number;
}

/** Backward compatibility aliases for receipt vouchers */
export type ReceiptVoucher = ReceiveVoucher;
export type ReceiptVoucherInput = ReceiveVoucherInput;

/** Ledger types */
export type VoucherType = "payableBill" | "paid" | "receive";

export interface LedgerEntry {
  id: string;
  date: string;
  voucherNo: string;
  voucherType: VoucherType;
  voucherTypeLabel: string;
  description: string;
  referenceInfo?: string;
  debit: number;
  credit: number;
  balance: number;
  balanceType: BalanceType;
}

export interface PartyLedgerStatement {
  party: Party;
  startDate?: string;
  endDate?: string;
  openingBalance: number;
  openingBalanceType: BalanceType;
  entries: LedgerEntry[];
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
  closingBalanceType: BalanceType;
}

export interface LedgerFilterParams {
  partyIds?: string[];
  startDate?: string;
  endDate?: string;
  voucherTypes?: VoucherType[];
}

/** Cash Book types */
export type CashBookAccountFilter = "all" | string;

export interface CashBookEntry {
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
  inflow: number; // Money In (Receive)
  outflow: number; // Money Out (Paid)
  runningBalance: number;
}

export interface CashBookStatement {
  accountFilter: CashBookAccountFilter;
  accountName: string;
  startDate?: string;
  endDate?: string;
  openingBalance: number;
  entries: CashBookEntry[];
  totalInflow: number;
  totalOutflow: number;
  closingBalance: number;
  cashBalance: number;
  bankBalance: number;
}

export interface CashBookFilterParams {
  headId?: CashBookAccountFilter;
  startDate?: string;
  endDate?: string;
}


