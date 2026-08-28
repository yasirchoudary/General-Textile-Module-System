import type { AuthProvider } from "@gtms/auth-contracts";
import { AuthError } from "@gtms/auth-contracts";
import type { LoginCredentials, Session, User } from "@gtms/types";

const SESSION_KEY = "gtms.session";

const MOCK_USERS: Array<User & { password: string }> = [
  {
    id: "u-admin",
    name: "Ayesha Khan",
    username: "admin",
    password: "admin123",
    role: "admin",
    modules: ["finance", "inventory", "weaving", "hr"],
  },
  {
    id: "u-finance",
    name: "Bilal Ahmed",
    username: "finance",
    password: "finance123",
    role: "finance",
    modules: ["finance"],
  },
  {
    id: "u-store",
    name: "Sana Malik",
    username: "store",
    password: "store123",
    role: "inventory",
    modules: ["inventory"],
  },
  {
    id: "u-weaving",
    name: "Imran Raza",
    username: "weaving",
    password: "weaving123",
    role: "weaving",
    modules: ["weaving"],
  },
  {
    id: "u-hr",
    name: "Nida Farooq",
    username: "hr",
    password: "hr123",
    role: "hr",
    modules: ["hr"],
  },
];

function delay(ms = 650): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readStoredSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function writeStoredSession(session: Session | null): void {
  if (typeof window === "undefined") return;
  if (!session) {
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/** Drop-in AuthProvider. Swap this file for a real API client later. */
export const mockAuthProvider: AuthProvider = {
  async login(credentials: LoginCredentials): Promise<Session> {
    await delay();

    const username = credentials.username.trim().toLowerCase();
    const match = MOCK_USERS.find(
      (user) =>
        user.username === username && user.password === credentials.password,
    );

    if (!match) {
      throw new AuthError("Invalid username or password.", "invalid_credentials");
    }

    const { password: _password, ...user } = match;
    const ttlMs = credentials.rememberMe
      ? 1000 * 60 * 60 * 24 * 14
      : 1000 * 60 * 60 * 8;

    const session: Session = {
      user,
      expiresAt: new Date(Date.now() + ttlMs).toISOString(),
    };

    writeStoredSession(session);
    return session;
  },

  async logout(): Promise<void> {
    await delay(200);
    writeStoredSession(null);
  },

  async getSession(): Promise<Session | null> {
    // Keep bootstrap fast so it doesn't race with a quick login.
    await delay(40);
    return readStoredSession();
  },
};
