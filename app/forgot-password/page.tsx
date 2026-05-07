import type { Metadata } from "next";
import { LifeBuoy } from "lucide-react";
import { RecoveryForm } from "@/components/auth/recovery-form";
import { getSessionForPublicRoute } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Password Recovery | BE Extranet",
};

export default async function ForgotPasswordPage() {
  const session = await getSessionForPublicRoute();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,_#f3f7f8,_#fff8ee)] px-6 py-12">
      <div className="w-full max-w-md rounded-[32px] border border-white bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
        <div className="mb-8 space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
            <LifeBuoy className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Reset access
            </h1>
            <p className="text-sm leading-6 text-slate-500">
              Enter the account email and we&apos;ll simulate the recovery flow until the real API is connected.
            </p>
          </div>
        </div>

        <RecoveryForm />
      </div>
    </main>
  );
}
