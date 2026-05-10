"use client";

import { Loader2, PencilLine, Plus, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createRatePlan, type RatePlan, type RatePlanPayload, updateRatePlan } from "@/app/actions/rate-plans";

export type RoomTypeOption = {
  id: string;
  name: string;
};

type PricingMode = "manual" | "derived_from_bar";
type AdjustmentType = "percentage" | "fixed_amount";

type RatePlanEditorProps = {
  roomTypes: RoomTypeOption[];
  initialPlan?: RatePlan | null;
  selectedRoomTypeIds?: string[];
  triggerLabel?: string;
  triggerVariant?: "primary" | "secondary" | "ghost";
};

function buildInitialValues(
  plan?: RatePlan | null,
  selectedRoomTypeIds: string[] = [],
) {
  return {
    room_type_ids:
      selectedRoomTypeIds.length > 0
        ? selectedRoomTypeIds
        : plan?.room_type_ids?.length
          ? plan.room_type_ids
          : plan?.room_type_id
            ? [plan.room_type_id]
            : [],
    original_name: plan?.name ?? "",
    existing_plan_ids_by_room_type: {},
    name: plan?.name ?? "",
    description: plan?.description ?? "",
    cancellation_policy: plan?.cancellation_policy ?? "",
    meal_plan: plan?.meal_plan ?? "",
    pricing_strategy: (plan?.pricing_strategy ?? "manual") as PricingMode,
    adjustment_type: (plan?.adjustment_type ?? "percentage") as AdjustmentType,
    adjustment_value:
      typeof plan?.adjustment_value === "number" ? String(plan.adjustment_value) : "",
  };
}

function formatAdjustmentPreview(mode: PricingMode, type: AdjustmentType, rawValue: string) {
  const value = Number(rawValue);
  if (mode !== "derived_from_bar" || !Number.isFinite(value) || value < 0) {
    return "Gunakan BAR manual biasa, atau aktifkan derived pricing untuk otomatis menghitung harga plan dari BAR.";
  }

  if (type === "percentage") {
    return `Harga rate plan akan mengikuti BAR dikurangi ${value}% untuk setiap tanggal yang punya base BAR.`;
  }

  return `Harga rate plan akan mengikuti BAR dikurangi Rp ${new Intl.NumberFormat("id-ID").format(value)} untuk setiap tanggal yang punya base BAR.`;
}

function sanitizePayload(values: ReturnType<typeof buildInitialValues>): RatePlanPayload {
  const pricingStrategy = values.pricing_strategy;
  const payload: RatePlanPayload = {
    room_type_ids: values.room_type_ids,
    original_name: values.original_name,
    name: values.name,
    description: values.description,
    cancellation_policy: values.cancellation_policy,
    meal_plan: values.meal_plan,
    pricing_strategy: pricingStrategy,
  };

  if (pricingStrategy === "derived_from_bar") {
    payload.adjustment_type = values.adjustment_type;
    payload.adjustment_value = Number(values.adjustment_value);
  }

  return payload;
}

export function RatePlanEditor({
  roomTypes,
  initialPlan = null,
  selectedRoomTypeIds = [],
  triggerLabel,
  triggerVariant = "primary",
}: RatePlanEditorProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState(() =>
    buildInitialValues(initialPlan, selectedRoomTypeIds),
  );

  const isEditing = Boolean(initialPlan);
  const selectedPricingStrategy = values.pricing_strategy;
  const selectedAdjustmentType = values.adjustment_type;
  const linkedRoomTypeCount = values.room_type_ids.length;
  const linkedRoomTypeLabel = `${linkedRoomTypeCount} room type${linkedRoomTypeCount === 1 ? "" : "s"} linked`;

  const triggerText =
    triggerLabel || (isEditing ? "Edit Plan" : "Add Rate Plan");

  const triggerClassName = useMemo(() => {
    if (triggerVariant === "ghost") {
      return "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50";
    }

    if (triggerVariant === "secondary") {
      return "inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50";
    }

    return "inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800";
  }, [triggerVariant]);

  function openEditor() {
    setValues(
      buildInitialValues(initialPlan, selectedRoomTypeIds),
    );
    setError(null);
    setIsOpen(true);
  }

  function closeEditor() {
    setIsOpen(false);
    setIsLoading(false);
    setError(null);
  }

  function updateField<K extends keyof ReturnType<typeof buildInitialValues>>(
    key: K,
    value: ReturnType<typeof buildInitialValues>[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function toggleRoomTypeSelection(roomTypeId: string) {
    setValues((current) => {
      const nextSelection = current.room_type_ids.includes(roomTypeId)
        ? current.room_type_ids.filter((value) => value !== roomTypeId)
        : [...current.room_type_ids, roomTypeId];

      return {
        ...current,
        room_type_ids: nextSelection,
      };
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload = sanitizePayload(values);
      if (isEditing && initialPlan) {
        await updateRatePlan(initialPlan.id, payload);
      } else {
        await createRatePlan(payload);
      }
      closeEditor();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save rate plan");
      setIsLoading(false);
    }
  }

  return (
    <>
      <button type="button" onClick={openEditor} className={triggerClassName}>
        {isEditing ? <PencilLine className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {triggerText}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/30 p-3 backdrop-blur-sm sm:p-4">
          <div className="flex min-h-full items-start justify-center py-2 sm:items-center sm:py-6">
            <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-white bg-white shadow-2xl max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-3rem)] sm:rounded-[32px]">
              <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-100 bg-white px-4 py-4 sm:gap-4 sm:px-8 sm:py-6">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                    {isEditing ? "Edit Rate Plan" : "New Rate Plan"}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950 sm:text-2xl">
                    {isEditing ? initialPlan?.name : "Create a new rate plan"}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Gunakan mode BAR-derived untuk membuat plan seperti Non-Refundable atau Bed & Breakfast otomatis mengikuti BAR dengan potongan persen atau rupiah.
                  </p>
                  {isEditing ? (
                    <div className="mt-3 inline-flex w-fit rounded-full bg-[var(--color-accent)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                      {linkedRoomTypeLabel}
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={closeEditor}
                  className="shrink-0 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-8 sm:py-6">
                  <div className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-3 sm:col-span-2">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Room Types
                          </span>
                          <span className="text-xs text-slate-400">
                            {values.room_type_ids.length} selected
                          </span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {roomTypes.map((roomType) => {
                            const checked = values.room_type_ids.includes(roomType.id);

                            return (
                              <label
                                key={roomType.id}
                                className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                                  checked
                                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5"
                                    : "border-slate-200 bg-slate-50 hover:border-slate-300"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleRoomTypeSelection(roomType.id)}
                                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                                />
                                <span className="min-w-0 font-medium text-slate-700">
                                  {roomType.name}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                        <p className="text-xs leading-5 text-slate-500">
                          Pilih satu atau lebih tipe kamar. Sistem akan membuat / sinkronkan rate plan yang sama ke semua room type terpilih.
                        </p>
                      </div>

                      <label className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Plan Name
                        </span>
                        <input
                          required
                          value={values.name}
                          onChange={(event) => updateField("name", event.target.value)}
                          placeholder="e.g. Non-Refundable B&B"
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10"
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Meal Plan
                        </span>
                        <input
                          value={values.meal_plan}
                          onChange={(event) => updateField("meal_plan", event.target.value)}
                          placeholder="Breakfast included"
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10"
                        />
                      </label>

                      <label className="space-y-2 sm:col-span-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Description
                        </span>
                        <textarea
                          value={values.description}
                          onChange={(event) => updateField("description", event.target.value)}
                          placeholder="Describe what guests get with this plan"
                          className="min-h-[100px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10"
                        />
                      </label>

                      <label className="space-y-2 sm:col-span-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Cancellation Policy
                        </span>
                        <input
                          value={values.cancellation_policy}
                          onChange={(event) => updateField("cancellation_policy", event.target.value)}
                          placeholder="No refund after booking confirmation"
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10"
                        />
                      </label>
                    </div>

                    <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-slate-950">Pricing Rule</h4>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            Manual berarti harga plan diisi langsung di halaman Rates. Derived from BAR berarti harga plan otomatis dihitung dari Base BAR.
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Pricing Mode
                          </span>
                          <select
                            value={selectedPricingStrategy}
                            onChange={(event) =>
                              updateField(
                                "pricing_strategy",
                                event.target.value as PricingMode,
                              )
                            }
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10"
                          >
                            <option value="manual">Manual</option>
                            <option value="derived_from_bar">Derived from BAR</option>
                          </select>
                        </label>

                        <label className="space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Adjustment Type
                          </span>
                          <select
                            value={selectedAdjustmentType}
                            disabled={selectedPricingStrategy !== "derived_from_bar"}
                            onChange={(event) =>
                              updateField(
                                "adjustment_type",
                                event.target.value as AdjustmentType,
                              )
                            }
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                          >
                            <option value="percentage">Percentage discount</option>
                            <option value="fixed_amount">Fixed IDR discount</option>
                          </select>
                        </label>

                        <label className="space-y-2 sm:col-span-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Adjustment Value
                          </span>
                          <input
                            type="number"
                            min="0"
                            step={selectedAdjustmentType === "percentage" ? "0.01" : "1000"}
                            value={values.adjustment_value}
                            disabled={selectedPricingStrategy !== "derived_from_bar"}
                            onChange={(event) => updateField("adjustment_value", event.target.value)}
                            placeholder={
                              selectedAdjustmentType === "percentage" ? "10" : "500000"
                            }
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                          />
                          <p className="text-xs leading-5 text-slate-500">
                            {formatAdjustmentPreview(
                              selectedPricingStrategy,
                              selectedAdjustmentType,
                              values.adjustment_value,
                            )}
                          </p>
                        </label>
                      </div>
                    </div>

                    {error ? (
                      <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
                        {error}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="sticky bottom-0 border-t border-slate-100 bg-white px-4 py-4 sm:px-8 sm:py-5">
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeEditor}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 sm:w-auto"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {isEditing ? "Save Changes" : "Create Rate Plan"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
