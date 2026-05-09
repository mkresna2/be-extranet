"use client";

import { useActionState, useMemo, useState } from "react";
import { CalendarDays, Info, Layers3, Wallet } from "lucide-react";
import { updateRates, RateActionState } from "@/app/actions/rates";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: RateActionState = { status: "idle" };

export function BulkRateForm({
  roomTypes,
  ratePlans,
}: {
  roomTypes: any[];
  ratePlans: any[];
}) {
  const [state, formAction] = useActionState(updateRates, initialState);
  const defaultRoomTypeId = roomTypes[0]?.id ?? "";
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState(defaultRoomTypeId);

  const filteredRatePlans = useMemo(
    () =>
      ratePlans.filter(
        (ratePlan) => ratePlan.room_type_id === selectedRoomTypeId,
      ),
    [ratePlans, selectedRoomTypeId],
  );

  return (
    <form
      action={formAction}
      className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
            Bulk Update
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950">
            Bulk Update Rates
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Choose a room, optional rate plan, and date window to update many prices at once.
          </p>
        </div>
        <div className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
          <Wallet className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-xs leading-5 text-slate-600">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent)]" />
          <p>
            If you leave rate plan empty, the update will apply to the Base BAR for the selected room type.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700">Room Type</label>
          <div className="relative">
            <Layers3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              name="roomTypeId"
              required
              value={selectedRoomTypeId}
              onChange={(event) => setSelectedRoomTypeId(event.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10"
            >
              {roomTypes.map((roomType) => (
                <option key={roomType.id} value={roomType.id}>
                  {roomType.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700">Rate Plan</label>
          <div className="relative">
            <Wallet className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              name="ratePlanId"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10"
            >
              <option value="">Base BAR (No Plan)</option>
              {filteredRatePlans.map((ratePlan) => (
                <option key={ratePlan.id} value={ratePlan.id}>
                  {ratePlan.name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-slate-500">
            Showing plans linked to the selected room type.
          </p>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-700">Base Price (IDR)</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
              Rp
            </span>
            <input
              name="price"
              type="number"
              required
              min="1"
              inputMode="numeric"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10"
              placeholder="e.g. 1250000"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">Start Date</label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                name="startDate"
                type="date"
                required
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">End Date</label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                name="endDate"
                type="date"
                required
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10"
              />
            </div>
          </div>
        </div>

        <div className="pt-1">
          <SubmitButton idleLabel="Update Rates" pendingLabel="Updating..." />
        </div>

        {state.message ? (
          <p
            className={`rounded-2xl p-3 text-sm ${
              state.status === "error"
                ? "bg-rose-50 text-rose-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
