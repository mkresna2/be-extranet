"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, MailCheck } from "lucide-react";
import { recoverPasswordAction } from "@/app/actions/auth";

const initialAuthState = {
  status: "idle" as const,
};
import { SubmitButton } from "@/components/auth/submit-button";

export function RecoveryForm() {
  const [state, formAction] = useActionState(
    recoverPasswordAction,
    initialAuthState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          Account email
        </label>
        <div className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
          <MailCheck className="h-4 w-4 text-slate-400" />
          <input
            id="email"
            name="email"
            type="email"
            className="h-full w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            placeholder="admin@hotel.com"
            autoComplete="email"
          />
        </div>
      </div>

      {state.message ? (
        <p
          className={`rounded-2xl px-4 py-3 text-sm ${
            state.status === "error"
              ? "bg-rose-50 text-rose-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <div className="space-y-3">
        <SubmitButton idleLabel="Send recovery link" pendingLabel="Sending..." />
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </div>
    </form>
  );
}
