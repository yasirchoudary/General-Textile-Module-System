import type { LoginCredentials, Session } from "@gtms/types";

/** Swappable auth surface — mock today, real provider later. */
export interface AuthProvider {
  login(credentials: LoginCredentials): Promise<Session>;
  logout(): Promise<void>;
  getSession(): Promise<Session | null>;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: "invalid_credentials" | "network" | "expired" | "unknown" = "unknown",
  ) {
    super(message);
    this.name = "AuthError";
  }
}
