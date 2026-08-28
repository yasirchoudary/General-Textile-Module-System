import { Suspense } from "react";
import { AuthGate } from "@/components/auth-gate";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <AuthGate mode="guest">
      <div className="relative min-h-screen overflow-hidden">
        <div
          className="absolute inset-0 bg-[linear-gradient(145deg,#102a2e_0%,#1a4549_42%,#0f766e_100%)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35), transparent 35%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.2), transparent 25%), repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 14px)",
          }}
          aria-hidden
        />

        <div className="relative grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
          <section className="hidden flex-col justify-between p-10 text-white lg:flex xl:p-14">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/60">
                Textile / Yarn ERP
              </p>
              <h2 className="mt-6 max-w-md font-[family-name:var(--font-display)] text-5xl leading-tight">
                One shell for every mill module.
              </h2>
              <p className="mt-4 max-w-md text-base text-white/70">
                Finance, inventory, weaving and HR plug into the same login and
                dashboard framework — backend can be connected later.
              </p>
            </div>
            <p className="text-sm text-white/50">
              General Textile Module System · Frontend shell v0.1
            </p>
          </section>

          <section className="flex items-center justify-center p-6 sm:p-10">
            <div className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_24px_60px_rgba(16,42,46,0.22)] sm:p-8">
              <Suspense
                fallback={
                  <div className="py-20 text-center text-sm text-[var(--color-ink-muted)]">
                    Loading…
                  </div>
                }
              >
                <LoginForm />
              </Suspense>
            </div>
          </section>
        </div>
      </div>
    </AuthGate>
  );
}
