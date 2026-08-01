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
