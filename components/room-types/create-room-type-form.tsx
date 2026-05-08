"use client";

import { useActionState } from "react";
import { BedDouble, Plus } from "lucide-react";
import {
  createRoomType,
  type RoomTypeActionState,
} from "@/app/actions/room-types";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: RoomTypeActionState = {
  status: "idle",
};

export function CreateRoomTypeForm() {
  const [state, formAction] = useActionState(createRoomType, initialState);

  return (
    <form action={formAction} className="rounded-[28px] border border-slate-200 p-5">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
          <BedDouble className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-950">
            Add room type
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Define the room inventory used by channel manager updates.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Name</span>
          <input
            name="name"
            required
            placeholder="Deluxe Room"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-cyan-900/10"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Bed type</span>
          <input
            name="bed_type"
            required
            placeholder="King"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-cyan-900/10"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Max occupancy</span>
          <input
            name="max_occupancy"
            type="number"
            min="1"
            required
            defaultValue="2"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-cyan-900/10"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Total rooms</span>
          <input
            name="total_rooms"
            type="number"
            min="1"
            required
            defaultValue="1"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-cyan-900/10"
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <textarea
            name="description"
            rows={4}
            placeholder="Optional room details"
            className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-cyan-900/10"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {state.message ? (
          <p
            className={`rounded-2xl px-4 py-3 text-sm ${
              state.status === "error"
                ? "bg-rose-50 text-rose-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
            role={state.status === "error" ? "alert" : "status"}
            aria-live="polite"
          >
            {state.message}
          </p>
        ) : (
          <span />
        )}

        <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-white pr-4 shadow-sm transition-all hover:bg-slate-50">
          <span className="pointer-events-none inline-flex items-center pl-4 text-slate-500">
            <Plus className="h-4 w-4" />
          </span>
          <SubmitButton idleLabel="Create Room Type" pendingLabel="Creating..." />
        </div>
      </div>
    </form>
  );
}
