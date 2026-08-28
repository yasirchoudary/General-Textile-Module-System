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

export interface ReceiptVoucher {
  id: string;
  voucherNo: string;
  date: string;
  partyId: string;
  contractId: string;
  description: string;
  amount: number;
  createdAt: string;
}

export interface ReceiptVoucherInput {
  date: string;
  partyId: string;
  contractId: string;
  description: string;
  amount: number;
}
