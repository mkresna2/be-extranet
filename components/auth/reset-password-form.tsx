"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import { resetPasswordAction } from "@/app/actions/auth";

const initialAuthState = {
  status: "idle" as const,
};
import { SubmitButton } from "@/components/auth/submit-button";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(
    resetPasswordAction,
    initialAuthState,
  );

  const feedbackMessage = state.error?.message ?? state.message;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="token" value={token} />

      <div className="space-y-2">
        <label
          htmlFor="new_password"
          className="text-sm font-medium text-slate-700"
        >
          New password
        </label>
        <div className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
          <Lock className="h-4 w-4 text-slate-400" />
          <input
            id="new_password"
            name="new_password"
            type="password"
            className="h-full w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirm_password"
          className="text-sm font-medium text-slate-700"
        >
          Confirm new password
        </label>
        <div className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
          <Lock className="h-4 w-4 text-slate-400" />
          <input
            id="confirm_password"
            name="confirm_password"
            type="password"
            className="h-full w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>
      </div>

      {feedbackMessage ? (
        <p
          className={`rounded-2xl px-4 py-3 text-sm ${
            state.status === "error"
              ? "bg-rose-50 text-rose-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
          role={state.status === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          {feedbackMessage}
        </p>
      ) : null}

      <div className="space-y-3">
        <SubmitButton idleLabel="Reset password" pendingLabel="Resetting..." />
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
