"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { updateProperty, type PropertyActionState } from "@/app/actions/properties";
import { SubmitButton } from "@/components/auth/submit-button";
import type { AuthProperty } from "@/lib/auth";

const initialState: PropertyActionState = {
  status: "idle",
};

export function PropertyForm({ property }: { property: AuthProperty }) {
  const [state, formAction] = useActionState(updateProperty, initialState);

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="id" value={property.id} />
      <div className="grid gap-6 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Property Name</span>
          <input
            name="name"
            required
            defaultValue={property.name}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-cyan-900/10"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">City</span>
          <input
            name="city"
            required
            defaultValue={property.city}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-cyan-900/10"
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Address</span>
          <input
            name="address"
            required
            defaultValue={property.address}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-cyan-900/10"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Country</span>
          <input
            name="country"
            required
            defaultValue={property.country}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-cyan-900/10"
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <textarea
            name="description"
            rows={4}
            defaultValue={property.description || ""}
            placeholder="Property description for agents and guests..."
            className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-cyan-900/10"
          />
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
        ) : (
          <span />
        )}

        <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-white pr-4 shadow-sm transition-all hover:bg-slate-50">
          <span className="pointer-events-none inline-flex items-center pl-4 text-slate-500">
            <Save className="h-4 w-4" />
          </span>
          <SubmitButton idleLabel="Save Changes" pendingLabel="Saving..." />
        </div>
      </div>
    </form>
  );
}
