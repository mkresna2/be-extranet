import { DollarSign, Calendar, Search } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { getRoomTypes } from "@/app/actions/room-types";
import { getRoomRates } from "@/app/actions/rates";
import { BulkRateForm } from "@/components/rates/bulk-rate-form";

export default async function RatesPage() {
  const session = await requireSession();
  const roomTypes = await getRoomTypes();
  
  // Default range: next 7 days
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 6);
  
  const startDateStr = today.toISOString().split('T')[0];
  const endDateStr = nextWeek.toISOString().split('T')[0];

  // Fetch rates for all room types
  const roomTypesWithRates = await Promise.all(
    roomTypes.map(async (rt) => {
      const rates = await getRoomRates(rt.id, startDateStr, endDateStr);
      return { ...rt, rates };
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
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Price Management (BAR)</h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-500">Manage Best Available Rates for {session.currentProperty?.name}.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[28px] border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-8 bg-slate-50 border-b border-slate-200">
              <div className="p-4 border-r border-slate-200 font-medium text-xs uppercase tracking-wider text-slate-400">Room Type</div>
              {dates.map((d, i) => (
                <div key={i} className="p-4 text-center border-r border-slate-200 last:border-r-0 font-medium">
                  <div className="text-xs text-slate-400 uppercase">{d.toLocaleDateString('en-US', { month: 'short' })}</div>
                  <div className="text-lg text-slate-900">{d.getDate()}</div>
                </div>
              ))}
            </div>
            
            <div className="divide-y divide-slate-100">
              {roomTypesWithRates.map((rt) => (
                <div key={rt.id} className="grid grid-cols-8">
                  <div className="p-4 border-r border-slate-200 bg-slate-50/50 flex flex-col justify-center">
                    <div className="font-semibold text-slate-900 text-sm">{rt.name}</div>
                    <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Price (IDR)</div>
                  </div>
                  {dates.map((d, i) => {
                    const dateStr = d.toISOString().split('T')[0];
                    const rate = rt.rates.find((r: any) => r.date === dateStr);
                    return (
                      <div key={i} className="p-4 border-r border-slate-200 last:border-r-0 flex flex-col items-center justify-center">
                        <div className="text-sm font-semibold text-slate-700">
                          {rate ? `${(rate.price / 1000).toLocaleString()}k` : '-'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div>
          <BulkRateForm roomTypes={roomTypes} />
        </div>
      </div>
    </main>
  );
}
