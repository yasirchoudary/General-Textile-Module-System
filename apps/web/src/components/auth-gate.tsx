"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";

export function AuthGate({
  children,
  mode,
}: {
  children: React.ReactNode;
  mode: "protected" | "guest";
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (mode === "protected" && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
    if (mode === "guest" && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, mode, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-canvas)]">
        <div className="flex flex-col items-center gap-3">
          <span className="size-8 animate-spin rounded-full border-2 border-[var(--color-accent)] border-r-transparent" />
          <p className="text-sm text-[var(--color-ink-muted)]">Loading session…</p>
        </div>
      </div>
    );
  }

  if (mode === "protected" && !isAuthenticated) return null;
  if (mode === "guest" && isAuthenticated) return null;

  return <>{children}</>;
}
