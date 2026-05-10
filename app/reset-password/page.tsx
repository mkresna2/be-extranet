import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getSessionForPublicRoute } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Reset Password | BE Extranet",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const session = await getSessionForPublicRoute();

  if (session) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const token = params.token ?? "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,_#f3f7f8,_#fff8ee)] px-6 py-12">
      <div className="w-full max-w-md rounded-[32px] border border-white bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
        <div className="mb-8 space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              New password
            </h1>
            <p className="text-sm leading-6 text-slate-500">
              {token
                ? "Choose a strong password for your account."
                : "This reset link is invalid or missing a token."}
            </p>
          </div>
        </div>

        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p className="text-sm text-rose-600">
            The link you followed is incomplete. Please request a new password
            reset.
          </p>
        )}
      </div>
    </main>
  );
}
