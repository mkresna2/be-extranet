import { requireSession } from "@/lib/auth";
import { getRoomTypes } from "@/app/actions/room-types";
import { getRoomRates } from "@/app/actions/rates";
import { getRatePlans } from "@/app/actions/rate-plans";
import { BulkRateForm } from "@/components/rates/bulk-rate-form";
import { SyncButton } from "@/components/inventory/sync-button";

export default async function RatesPage() {
  const session = await requireSession();
  const roomTypes = await getRoomTypes();
  const ratePlans = await getRatePlans();
  
  // Default range: next 7 days
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 6);
  
  const startDateStr = today.toISOString().split('T')[0];
  const endDateStr = nextWeek.toISOString().split('T')[0];

  // Fetch rates for all room types + rate plans
  const roomTypesWithPlans = await Promise.all(
    roomTypes.map(async (rt: any) => {
      const rtPlans = ratePlans.filter((p: any) => p.room_type_id === rt.id);
      // Also include "No Rate Plan" (Base BAR)
      const allPlans = [null, ...rtPlans];
      
      const plansWithRates = await Promise.all(
        allPlans.map(async (plan: any) => {
          const rates = await getRoomRates(rt.id, startDateStr, endDateStr, plan?.id);
          return { plan, rates };
        })
      );
      
      return { ...rt, plansWithRates };
    })
  );

  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }

  return (
    <main className="flex-1 rounded-[32px] border border-white bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between mb-8">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">Rates</p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Price Management</h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-500">Manage rates and availability across all room types and rate plans for {session.currentProperty?.name}.</p>
        </div>

        <SyncButton idleLabel="Update Availability" pendingLabel="Updating..." />
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-[28px] border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-8 bg-slate-50 border-b border-slate-200">
              <div className="p-4 border-r border-slate-200 font-medium text-xs uppercase tracking-wider text-slate-400">Room & Plan</div>
              {dates.map((d, i) => (
                <div key={i} className="p-4 text-center border-r border-slate-200 last:border-r-0 font-medium">
                  <div className="text-xs text-slate-400 uppercase">{d.toLocaleDateString('en-US', { month: 'short' })}</div>
                  <div className="text-lg text-slate-900">{d.getDate()}</div>
                </div>
              ))}
            </div>
            
            <div className="divide-y divide-slate-100">
              {roomTypesWithPlans.map((rt) => (
                <div key={rt.id} className="divide-y divide-slate-50">
                  {rt.plansWithRates.map((pr: any, idx: number) => (
                    <div key={pr.plan?.id || 'base'} className="grid grid-cols-8">
                      <div className="p-4 border-r border-slate-200 bg-slate-50/50 flex flex-col justify-center">
                        {idx === 0 && <div className="font-bold text-slate-900 text-xs mb-1 uppercase tracking-tight">{rt.name}</div>}
                        <div className="text-sm font-semibold text-[var(--color-accent)]">{pr.plan?.name || 'Base BAR'}</div>
                      </div>
                      {dates.map((d, i) => {
                        const dateStr = d.toISOString().split('T')[0];
                        const rate = pr.rates.find((r: any) => r.date === dateStr);
                        return (
                          <div key={i} className="p-4 border-r border-slate-200 last:border-r-0 flex flex-col items-center justify-center gap-1">
                            <div className="text-sm font-semibold text-slate-700">
                              {rate ? `${(rate.price / 1000).toLocaleString()}k` : '-'}
                            </div>
                            {rate ? (
                              <div className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                {rate.available} Left
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <BulkRateForm roomTypes={roomTypes} ratePlans={ratePlans} />
        </div>
      </div>
    </main>
  );
}
