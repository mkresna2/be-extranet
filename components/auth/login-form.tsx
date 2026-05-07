"use client";

import Link from "next/link";
import { useActionState } from "react";
import { KeyRound, Mail } from "lucide-react";
import {
  initialAuthState,
  loginAction,
} from "@/app/actions/auth";
import { SubmitButton } from "@/components/auth/submit-button";

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialAuthState);
  const feedbackMessage = state.error?.message ?? state.message;

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          Email
        </label>
        <div className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
          <Mail className="h-4 w-4 text-slate-400" />
          <input
            id="email"
            name="email"
            type="email"
            className="h-full w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            placeholder="ecommdr@gmail.com"
            defaultValue="ecommdr@gmail.com"
            autoComplete="email"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-[var(--color-accent)] transition hover:text-[var(--color-accent-strong)]"
          >
            Forgot password?
          </Link>
        </div>
        <div className="flex h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
          <KeyRound className="h-4 w-4 text-slate-400" />
          <input
            id="password"
            name="password"
            type="password"
            className="h-full w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            placeholder="Extranet123!"
            defaultValue="Extranet123!"
            autoComplete="current-password"
            required
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
        <SubmitButton idleLabel="Sign in" pendingLabel="Signing in..." />
        <p className="text-sm text-slate-500">
          Use your booking-engine partner account credentials. The form is
          prefilled with the current admin login.
        </p>
      </div>
    </form>
  );
}
