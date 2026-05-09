"use client";

import { useActionState, useState, useEffect } from "react";
import { Plus, X, Building2 } from "lucide-react";
import { createPropertyAction, type CreatePropertyActionState } from "@/app/actions/create-property";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: CreatePropertyActionState = {
  status: "idle",
};

export function CreatePropertyDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useActionState(createPropertyAction, initialState);

  // Close dialog on success
  useEffect(() => {
    if (state.status === "success") {
      setIsOpen(false);
    }
  }, [state.status]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95"
      >
        <Plus className="h-4 w-4" />
        Add Property
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-200 rounded-[32px] border border-white bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">New Property</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={formAction} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Property Name</span>
              <input
                name="name"
                required
                placeholder="e.g. Grand Sunset Resort"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-cyan-900/10"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">City</span>
              <input
                name="city"
                required
                placeholder="Jakarta"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-cyan-900/10"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Country</span>
              <input
                name="country"
                required
                placeholder="Indonesia"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-cyan-900/10"
              />
            </label>

            <label className="space-y-1.5 sm:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Address</span>
              <input
                name="address"
                required
                placeholder="Jl. Raya Sunset No. 123"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-cyan-900/10"
              />
            </label>
          </div>

          {state.message && state.status === "error" && (
            <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-600">
              {state.message}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <div className="min-w-[120px]">
              <SubmitButton idleLabel="Create" pendingLabel="Creating..." />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
