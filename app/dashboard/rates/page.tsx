     1|import { DollarSign, Calendar, Search } from "lucide-react";
     2|import { requireSession } from "@/lib/auth";
     3|import { getRoomTypes } from "@/app/actions/room-types";
     4|import { getRoomRates } from "@/app/actions/rates";
     5|import { BulkRateForm } from "@/components/rates/bulk-rate-form";
     6|
     7|export default async function RatesPage() {
     8|  const session = await requireSession();
     9|  const roomTypes = await getRoomTypes();
    10|  
    11|  // Default range: next 7 days
    12|  const today = new Date();
    13|  const nextWeek = new Date();
    14|  nextWeek.setDate(today.getDate() + 6);
    15|  
    16|  const startDateStr = today.toISOString().split('T')[0];
    17|  const endDateStr = nextWeek.toISOString().split('T')[0];
    18|
    19|  // Fetch rates for all room types
    20|  const roomTypesWithRates = await Promise.all(
    21|    roomTypes.map(async (rt) => {
    22|      const rates = await getRoomRates(rt.id, startDateStr, endDateStr);
    23|      return { ...rt, rates };
    24|    })
    25|  );
    26|
    27|  const dates: Date[] = [];
    28|  for (let i = 0; i < 7; i++) {
    29|    const d = new Date(today);
    30|    d.setDate(today.getDate() + i);
    31|    dates.push(d);
    32|  }
    33|
    34|  return (
    35|    <main className="flex-1 rounded-[32px] border border-white bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
    36|      <div className="flex items-start justify-between mb-8">
    37|        <div className="space-y-2">
    38|          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">Rates</p>
    39|          <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Price Management (BAR)</h2>
    40|          <p className="max-w-2xl text-sm leading-6 text-slate-500">Manage Best Available Rates for {session.currentProperty?.name}.</p>
    41|        </div>
    42|      </div>
    43|
    44|      <div className="grid lg:grid-cols-3 gap-8">
    45|        <div className="lg:col-span-2 space-y-6">
    46|          <div className="rounded-[28px] border border-slate-200 overflow-hidden">
    47|            <div className="grid grid-cols-8 bg-slate-50 border-b border-slate-200">
    48|              <div className="p-4 border-r border-slate-200 font-medium text-xs uppercase tracking-wider text-slate-400">Room Type</div>
    49|              {dates.map((d, i) => (
    50|                <div key={i} className="p-4 text-center border-r border-slate-200 last:border-r-0 font-medium">
    51|                  <div className="text-xs text-slate-400 uppercase">{d.toLocaleDateString('en-US', { month: 'short' })}</div>
    52|                  <div className="text-lg text-slate-900">{d.getDate()}</div>
    53|                </div>
    54|              ))}
    55|            </div>
    56|            
    57|            <div className="divide-y divide-slate-100">
    58|              {roomTypesWithRates.map((rt) => (
    59|                <div key={rt.id} className="grid grid-cols-8">
    60|                  <div className="p-4 border-r border-slate-200 bg-slate-50/50 flex flex-col justify-center">
    61|                    <div className="font-semibold text-slate-900 text-sm">{rt.name}</div>
    62|                    <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Price (IDR)</div>
    63|                  </div>
    64|                  {dates.map((d, i) => {
    65|                    const dateStr = d.toISOString().split('T')[0];
    66|                    const rate = rt.rates.find((r: any) => r.date === dateStr);
    67|                    return (
    68|                      <div key={i} className="p-4 border-r border-slate-200 last:border-r-0 flex flex-col items-center justify-center">
    69|                        <div className="text-sm font-semibold text-slate-700">
    70|                          {rate ? `${(rate.price / 1000).toLocaleString()}k` : '-'}
    71|                        </div>
    72|                      </div>
    73|                    );
    74|                  })}
    75|                </div>
    76|              ))}
    77|            </div>
    78|          </div>
    79|        </div>
    80|        
    81|        <div>
    82|          <BulkRateForm roomTypes={roomTypes} />
    83|        </div>
    84|      </div>
    85|    </main>
    86|  );
    87|}
    88|