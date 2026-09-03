import type { BranchOption, ModuleId } from "@gtms/types";

export interface ModuleNavItem {
  id: ModuleId;
  label: string;
  href: string;
  description: string;
}

export const APP_NAME = "General Textile";
export const APP_TAGLINE = "Yarn & textile operations";

export const MODULE_NAV: ModuleNavItem[] = [
  {
    id: "finance",
    label: "Finance",
    href: "/dashboard/finance",
    description: "GL, AP, AR and financial reporting",
  },
  {
    id: "inventory",
    label: "Inventory",
    href: "/dashboard/inventory",
    description: "Store, gate and stock movements",
  },
  {
    id: "weaving",
    label: "Weaving",
    href: "/dashboard/weaving",
    description: "Production planning and loom status",
  },
  {
    id: "hr",
    label: "HR & Payroll",
    href: "/dashboard/hr",
    description: "People, attendance and payroll",
  },
];

export const BRANCH_OPTIONS: BranchOption[] = [
  { id: "hq", name: "Head Office" },
  { id: "mill-a", name: "Mill A — Spinning" },
  { id: "mill-b", name: "Mill B — Weaving" },
];

export function modulesForUser(moduleIds: ModuleId[]): ModuleNavItem[] {
  const allowed = new Set(moduleIds);
  return MODULE_NAV.filter((item) => allowed.has(item.id));
}

export interface FinanceNavItem {
  label: string;
  href: string;
  description?: string;
}

export const FINANCE_NAV: FinanceNavItem[] = [
  { label: "Overview", href: "/dashboard/finance" },
  { label: "Parties", href: "/dashboard/finance/parties", description: "Vendors & customers" },
  {
    label: "Payable Bill",
    href: "/dashboard/finance/vouchers/payable-bill",
    description: "Date · Party · Qty · Rate · Amount",
  },
  {
    label: "Paid",
    href: "/dashboard/finance/vouchers/paid",
    description: "Date · Head · Party · Amount",
  },
  {
    label: "Receive",
    href: "/dashboard/finance/vouchers/receive",
    description: "Date · Party · Contract · Amount",
  },
  {
    label: "Party Ledger",
    href: "/dashboard/finance/ledger",
    description: "Party statement · Date range · Multi-party",
  },
  {
    label: "Cash Book",
    href: "/dashboard/finance/cashbook",
    description: "Cash & bank book · Inflows · Outflows · Liquidity",
  },
];


