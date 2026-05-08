"use client";

import { useActionState } from "react";
import { updateRates, RateActionState } from "@/app/actions/rates";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: RateActionState = { status: "idle" };

export function BulkRateForm({ roomTypes }: { roomTypes: any[] }) {
  const [state, formAction] = useActionState(updateRates, initialState);

  return (
    <form action={formAction} className="rounded-3xl border border-slate-200 p-6 bg-slate-50/50">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Bulk Update Rates (BAR)</h3>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Room Type</label>
          <select name="roomTypeId" required className="h-10 rounded-xl border border-slate-200 px-3 text-sm bg-white">
            {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
          </select>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Base Price (IDR)</label>
          <input name="price" type="number" required className="h-10 rounded-xl border border-slate-200 px-3 text-sm" placeholder="e.g. 1250000" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Start Date</label>
            <input name="startDate" type="date" required className="h-10 rounded-xl border border-slate-200 px-3 text-sm" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">End Date</label>
            <input name="endDate" type="date" required className="h-10 rounded-xl border border-slate-200 px-3 text-sm" />
          </div>
        </div>
        
        <SubmitButton idleLabel="Update Rates" pendingLabel="Updating..." />
        
        {state.message && (
          <p className={`text-sm p-3 rounded-xl ${state.status === "error" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
