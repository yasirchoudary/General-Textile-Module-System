"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Checkbox, Input, Label } from "@gtms/ui";
import { APP_NAME, APP_TAGLINE } from "@gtms/config";
import { getAuthErrorMessage, useAuth } from "@/lib/auth/auth-context";

export function LoginForm() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const next: { username?: string; password?: string } = {};
    if (!username.trim()) next.username = "Username is required";
    if (!password) next.password = "Password is required";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await login({ username, password, rememberMe });
      const next = searchParams.get("next") || "/dashboard";
      const destination = next.startsWith("/") ? next : "/dashboard";
      // Hard navigation avoids soft-route races with the auth gate.
      window.location.assign(destination);
    } catch (err) {
      setError(getAuthErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8">
        <p className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--color-ink)] md:text-4xl">
          {APP_NAME}
        </p>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{APP_TAGLINE}</p>
        <h1 className="mt-6 text-xl font-semibold text-[var(--color-ink)]">
          Sign in to continue
        </h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            autoComplete="username"
            value={username}
            invalid={Boolean(fieldErrors.username)}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. admin"
          />
          {fieldErrors.username ? (
            <p className="mt-1 text-xs text-[var(--color-danger)]">
              {fieldErrors.username}
            </p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            invalid={Boolean(fieldErrors.password)}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
          {fieldErrors.password ? (
            <p className="mt-1 text-xs text-[var(--color-danger)]">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <label className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>
          <button
            type="button"
            className="text-sm text-[var(--color-accent)] hover:underline"
            disabled
            title="Coming soon"
          >
            Forgot password?
          </button>
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-md border border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]"
          >
            {error}
          </div>
        ) : null}

        <Button type="submit" className="w-full" loading={loading} size="lg">
          Sign in
        </Button>

        <div className="pt-2">
          <button
            type="button"
            className="w-full rounded-md border border-dashed border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-ink-subtle)]"
            disabled
            title="SSO not configured yet"
          >
            Continue with SSO (coming soon)
          </button>
        </div>
      </form>

      <div className="mt-8 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-3 text-xs text-[var(--color-ink-muted)]">
        <p className="font-medium text-[var(--color-ink)]">Demo accounts</p>
        <p className="mt-1">admin / admin123 · finance / finance123 · store / store123</p>
      </div>
    </div>
  );
}
