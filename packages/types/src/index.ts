/** Shared domain shapes used by UI and future API adapters. */

export type ModuleId = "finance" | "inventory" | "weaving" | "hr";

export type UserRole =
  | "admin"
  | "finance"
  | "inventory"
  | "weaving"
  | "hr";

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  modules: ModuleId[];
}

export interface Session {
  user: User;
  expiresAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface DashboardWidget {
  id: string;
  title: string;
  value: string;
  description: string;
  status: "ready" | "loading" | "empty" | "error";
}

export interface BranchOption {
  id: string;
  name: string;
}

export * from "./finance";
