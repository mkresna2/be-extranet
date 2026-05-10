"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { createRatePlan, type RatePlanPayload } from "@/app/actions/rate-plans";

interface RoomType {
  id: string;
  name: string;
}

export function CreateRatePlanForm({ roomTypes }: { roomTypes: RoomType[] }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const roomTypeId = formData.get("room_type_id") as string;
    const data: RatePlanPayload = {
      room_type_ids: roomTypeId ? [roomTypeId] : [],
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      cancellation_policy: formData.get("cancellation_policy") as string,
      meal_plan: formData.get("meal_plan") as string,
      pricing_strategy: "manual",
    };

    try {
      await createRatePlan(data);
      router.refresh();
      (event.target as HTMLFormElement).reset();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create rate plan");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-slate-50/50 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-950">Add Rate Plan</h3>
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--color-accent)] shadow-sm">
          <Plus className="h-5 w-5" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Room Type
          </label>
          <select
            name="room_type_id"
            required
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-[var(--color-accent)] focus:outline-none"
          >
            <option value="">Select a room type</option>
            {roomTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>
                {rt.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Plan Name
          </label>
          <input
            name="name"
            placeholder="e.g. Non-Refundable"
            required
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Description
          </label>
          <textarea
            name="description"
            placeholder="What's included in this rate?"
            className="min-h-[100px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Cancellation Policy
          </label>
          <input
            name="cancellation_policy"
            placeholder="e.g. No refund"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Meal Plan
          </label>
          <input
            name="meal_plan"
            placeholder="e.g. Breakfast included"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Create Rate Plan"
          )}
        </button>
      </form>
    </section>
  );
}
