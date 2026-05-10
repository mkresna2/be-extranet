import { CalendarRange, Info, PencilLine, Sparkles, Tag } from "lucide-react";

import { getRatePlans, type RatePlan } from "@/app/actions/rate-plans";
import { getRoomTypes, type RoomType } from "@/app/actions/room-types";
import { RatePlanEditor, type RoomTypeOption } from "@/components/rate-plans/rate-plan-editor";
import { requireSession } from "@/lib/auth";

function formatAdjustment(plan: RatePlan) {
  if (plan.pricing_strategy !== "derived_from_bar") {
    return "Manual pricing";
  }

  if (plan.adjustment_type === "percentage") {
    return `BAR - ${plan.adjustment_value}%`;
  }

  if (plan.adjustment_type === "fixed_amount") {
    return `BAR - Rp ${new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 0,
    }).format(plan.adjustment_value ?? 0)}`;
  }

  return "Derived from BAR";
}

function formatPricingMode(plan: RatePlan) {
  return plan.pricing_strategy === "derived_from_bar" ? "BAR Derived" : "Manual";
}

export default async function RatePlansPage() {
  const session = await requireSession();
  const property = session.currentProperty;
  const roomTypes: RoomType[] = (await getRoomTypes()) || [];
  const roomTypeOptions: RoomTypeOption[] = roomTypes.map((roomType) => ({
    id: roomType.id,
    name: roomType.name,
  }));
  const ratePlans: RatePlan[] = (await getRatePlans()) || [];

  const groupedPlans = ratePlans.map((plan) => {
    const roomTypeIds = plan.room_type_ids.length > 0 ? plan.room_type_ids : [plan.room_type_id];
    const roomTypeNames = roomTypeIds.map(
      (roomTypeId) => roomTypes.find((roomType) => roomType.id === roomTypeId)?.name ?? "Unknown room type",
    );
    return {
      key: plan.id,
      name: plan.name,
      description: plan.description,
      cancellation_policy: plan.cancellation_policy,
      meal_plan: plan.meal_plan,
      pricing_strategy: plan.pricing_strategy,
      adjustment_type: plan.adjustment_type,
      adjustment_value: plan.adjustment_value,
      roomTypeIds,
      roomTypeNames,
      representativePlan: plan,
    };
  });

  const derivedPlansCount = ratePlans.filter(
    (plan) => plan.pricing_strategy === "derived_from_bar",
  ).length;

  return (
    <main className="flex-1 min-w-0 space-y-6">
      <section className="rounded-[32px] border border-white bg-white p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Pricing
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Rate Plans
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              Define pricing rules and policies for {property?.name ?? "your property"}. Sekarang setiap rate plan bisa manual atau otomatis turunan dari Base BAR dengan diskon persen / rupiah.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="grid grid-cols-3 gap-3 sm:w-[360px]">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Plans
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950 sm:text-2xl">
                  {ratePlans.length}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Room Types
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950 sm:text-2xl">
                  {roomTypes.length}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  BAR Derived
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-950 sm:text-2xl">
                  {derivedPlansCount}
                </p>
              </div>
            </div>

            <RatePlanEditor roomTypes={roomTypeOptions} />
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
          <section className="rounded-[28px] border border-slate-200 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">
                  Current rate plans
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Edit policy, meal inclusion, room assignment, dan mode pricing langsung dari halaman ini.
                </p>
              </div>
              <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] sm:inline-flex">
                <CalendarRange className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 space-y-8">
              {groupedPlans.length > 0 ? (
                    <>
                      <div className="hidden overflow-hidden rounded-3xl border border-slate-200 md:block">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 text-slate-500">
                            <tr>
                              <th className="px-4 py-3 font-medium">Rate Plan</th>
                              <th className="px-4 py-3 font-medium">Room Types</th>
                              <th className="px-4 py-3 font-medium">Policy</th>
                              <th className="px-4 py-3 font-medium">Pricing Rule</th>
                              <th className="px-4 py-3 font-medium">Meal</th>
                              <th className="px-4 py-3 text-right font-medium">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupedPlans.map((planGroup) => (
                              <tr key={planGroup.key} className="border-t border-slate-100 align-top">
                                <td className="px-4 py-4">
                                  <p className="font-semibold text-slate-900">{planGroup.name}</p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {planGroup.description || "No description provided."}
                                  </p>
                                </td>
                                <td className="px-4 py-4 text-slate-600">
                                  <div className="flex flex-wrap gap-2">
                                    {planGroup.roomTypeNames.map((roomTypeName) => (
                                      <span
                                        key={`${planGroup.key}-${roomTypeName}`}
                                        className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
                                      >
                                        {roomTypeName}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-slate-600">
                                  {planGroup.cancellation_policy || "Standard"}
                                </td>
                                <td className="px-4 py-4">
                                  <div className="space-y-1">
                                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                                      {formatPricingMode(planGroup.representativePlan)}
                                    </span>
                                    <p className="text-sm text-slate-600">{formatAdjustment(planGroup.representativePlan)}</p>
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-slate-600">
                                  {planGroup.meal_plan || "None"}
                                </td>
                                <td className="px-4 py-4 text-right">
                                  <RatePlanEditor
                                    roomTypes={roomTypeOptions}
                                    initialPlan={planGroup.representativePlan}
                                    selectedRoomTypeIds={planGroup.roomTypeIds}
                                    triggerLabel="Edit"
                                    triggerVariant="ghost"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="space-y-3 md:hidden">
                        {groupedPlans.map((planGroup) => (
                          <div
                            key={planGroup.key}
                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                          >
                            <div className="mb-3 flex items-start justify-between gap-3 border-b border-slate-50 pb-3">
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900">{planGroup.name}</p>
                                {planGroup.description ? (
                                  <p className="mt-1 text-xs text-slate-500 line-clamp-3">
                                    {planGroup.description}
                                  </p>
                                ) : null}
                              </div>
                              <RatePlanEditor
                                roomTypes={roomTypeOptions}
                                initialPlan={planGroup.representativePlan}
                                selectedRoomTypeIds={planGroup.roomTypeIds}
                                triggerLabel="Edit"
                                triggerVariant="ghost"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="col-span-2">
                                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                                  Room Types
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {planGroup.roomTypeNames.map((roomTypeName) => (
                                    <span
                                      key={`${planGroup.key}-mobile-${roomTypeName}`}
                                      className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
                                    >
                                      {roomTypeName}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                                  Policy
                                </p>
                                <p className="text-xs text-slate-600">
                                  {planGroup.cancellation_policy || "Standard"}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 text-right">
                                  Meal Plan
                                </p>
                                <p className="text-right text-xs text-slate-600">
                                  {planGroup.meal_plan || "None"}
                                </p>
                              </div>
                              <div className="col-span-2 rounded-2xl bg-slate-50 p-3">
                                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                                  <Tag className="h-3.5 w-3.5" />
                                  {formatPricingMode(planGroup.representativePlan)}
                                </div>
                                <p className="mt-2 text-sm text-slate-600">{formatAdjustment(planGroup.representativePlan)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center">
                  <p className="text-xs text-slate-400">No rate plans yet.</p>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-4 rounded-[28px] border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
            <div className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-950">BAR-Derived Pricing</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Cocok untuk Non-Refundable, B&B, atau promo plan yang harus selalu mengikuti BAR.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Example
              </p>
              <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
                <p>
                  Jika Base BAR = <strong>Rp 1.000.000</strong>
                </p>
                <p>
                  Derived percentage 10% → <strong>Rp 900.000</strong>
                </p>
                <p>
                  Derived fixed amount Rp 500.000 → <strong>Rp 500.000</strong>
                </p>
              </div>
            </div>

            <div className="rounded-[24px] bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                <p className="text-sm leading-6 text-slate-600">
                  Saat mode pricing adalah <strong>derived from BAR</strong>, availability tetap mengikuti inventory rate-plan row, tapi harga booking/search akan dihitung dari Base BAR pada tanggal yang sama.
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <PencilLine className="h-4 w-4 text-[var(--color-accent)]" />
                Editing now supported
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Semua rate plan sekarang bisa di-edit langsung dari list desktop maupun mobile card.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
