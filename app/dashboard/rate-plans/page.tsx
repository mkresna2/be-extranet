import { CalendarRange, Hotel, Info } from "lucide-react";
import { getRatePlans } from "@/app/actions/rate-plans";
import { getRoomTypes } from "@/app/actions/room-types";
import { CreateRatePlanForm } from "@/components/rate-plans/create-rate-plan-form";
import { requireSession } from "@/lib/auth";

export default async function RatePlansPage() {
  const session = await requireSession();
  const property = session.currentProperty;
  const roomTypes = await getRoomTypes();
  const ratePlans = await getRatePlans();

  // Group rate plans by room type for display
  const plansByRoomType = roomTypes.map((rt: any) => ({
    ...rt,
    plans: ratePlans.filter((p: any) => p.room_type_id === rt.id),
  }));

  return (
    <main className="flex-1 space-y-6">
      <section className="rounded-[32px] border border-white bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Pricing
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
              Rate Plans
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              Define pricing rules and policies for {property?.name ?? "your property"}.
              Each room type can have multiple rate plans (e.g., Standard, Non-Refundable).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:w-80">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Plans
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {ratePlans.length}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Room Types
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {roomTypes.length}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
          <section className="rounded-[28px] border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">
                  Current rate plans
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Manage your property's rate offerings.
                </p>
              </div>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                <CalendarRange className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 space-y-8">
              {plansByRoomType.map((rt) => (
                <div key={rt.id} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Hotel className="h-4 w-4 text-slate-400" />
                    <h4 className="font-semibold text-slate-900">{rt.name}</h4>
                    <span className="text-xs text-slate-400">— {rt.plans.length} plans</span>
                  </div>

                  {rt.plans.length > 0 ? (
                    <div className="overflow-hidden rounded-3xl border border-slate-200">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            <th className="px-4 py-3 font-medium">Rate Plan</th>
                            <th className="px-4 py-3 font-medium">Policy</th>
                            <th className="px-4 py-3 font-medium">Meal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rt.plans.map((plan: any) => (
                            <tr key={plan.id} className="border-t border-slate-100">
                              <td className="px-4 py-4">
                                <p className="font-semibold text-slate-900">
                                  {plan.name}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {plan.description}
                                </p>
                              </td>
                              <td className="px-4 py-4 text-slate-600">
                                {plan.cancellation_policy || "Standard"}
                              </td>
                              <td className="px-4 py-4 text-slate-600">
                                {plan.meal_plan || "None"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center">
                      <p className="text-xs text-slate-400">No rate plans for this room type yet.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <CreateRatePlanForm roomTypes={roomTypes} />
        </div>
      </section>
    </main>
  );
}
