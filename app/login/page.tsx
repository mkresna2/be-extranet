import type { Metadata } from "next";
import Link from "next/link";
import { Building2, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { getSessionForPublicRoute } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Login | BE Extranet",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const session = await getSessionForPublicRoute();

  if (session) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const showResetSuccess = params.reset === "success";

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[var(--color-canvas)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(11,76,94,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(196,158,89,0.2),_transparent_26%)]" />
      <section className="relative hidden w-full max-w-xl flex-col justify-between bg-[var(--color-accent)] px-10 py-12 text-white lg:flex">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 backdrop-blur">
          <Building2 className="h-6 w-6" />
        </div>
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-sm">
            <ShieldCheck className="h-4 w-4" />
            Secure partner access
          </span>
          <div className="space-y-3">
            <h1 className="max-w-md text-4xl font-semibold tracking-tight">
              Extranet for managing inventory, rates, and booking operations.
            </h1>
            <p className="max-w-lg text-base leading-7 text-cyan-50/80">
              Sign in with your booking-engine partner account to load your live
              profile and property data.
            </p>
          </div>
        </div>
        <p className="text-sm text-cyan-50/70">
          Partner support: reservations@bali-escape.test
        </p>
      </section>

      <section className="relative flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-[32px] border border-white/60 bg-white/90 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="mb-8 space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--color-accent)]">
              BE Extranet
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
              Welcome back
            </h2>
            <p className="text-sm leading-6 text-slate-500">
              Sign in to manage availability, rates, and property updates.
            </p>
          </div>

          {showResetSuccess ? (
            <div className="mb-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Password updated successfully. Please sign in with your new
              password.
            </div>
          ) : null}

          <LoginForm />

          <div className="mt-8 text-sm leading-6 text-slate-500">
            Forgot your password?{" "}
            <Link
              href="/forgot-password"
              className="font-medium text-[var(--color-accent)] hover:text-[var(--color-accent-strong)]"
            >
              Reset it here
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
