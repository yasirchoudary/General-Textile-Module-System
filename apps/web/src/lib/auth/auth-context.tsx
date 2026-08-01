"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { LoginCredentials, Session, User } from "@gtms/types";
import { AuthError } from "@gtms/auth-contracts";
import { mockAuthProvider } from "@/lib/auth/mock-auth-provider";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sessionRef = useRef<Session | null>(null);
  const bootstrapId = useRef(0);

  const setSessionSafe = useCallback((next: Session | null) => {
    sessionRef.current = next;
    setSession(next);
  }, []);

  const refreshSession = useCallback(async () => {
    const next = await mockAuthProvider.getSession();
    setSessionSafe(next);
  }, [setSessionSafe]);

  useEffect(() => {
    const id = ++bootstrapId.current;
    let active = true;

    (async () => {
      try {
        const next = await mockAuthProvider.getSession();
        // Ignore stale bootstrap if login/logout already changed session.
        if (!active || id !== bootstrapId.current) return;
        if (sessionRef.current) return;
        setSessionSafe(next);
      } finally {
        if (active && id === bootstrapId.current) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [setSessionSafe]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      bootstrapId.current += 1;
      const next = await mockAuthProvider.login(credentials);
      setSessionSafe(next);
      setIsLoading(false);
    },
    [setSessionSafe],
  );

  const logout = useCallback(async () => {
    bootstrapId.current += 1;
    await mockAuthProvider.logout();
    setSessionSafe(null);
    setIsLoading(false);
  }, [setSessionSafe]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      isLoading,
      isAuthenticated: Boolean(session?.user),
      login,
      logout,
      refreshSession,
    }),
    [session, isLoading, login, logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof AuthError) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return "Something went wrong. Please try again.";
}
