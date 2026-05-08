import { Calendar, Filter, Search } from "lucide-react";
import { requireSession } from "@/lib/auth";

export default async function AvailabilityPage() {
  const session = await requireSession();
  const property = session.currentProperty;

  return (
    <main className="flex-1 rounded-[32px] border border-white bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
          Inventory
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
          Rate & Availability Calendar
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-500">
          Manage pricing and room availability for {property?.name ?? "your property"}.
        </p>
      </div>

      <div className="mt-8 space-y-6">
        <div className="flex items-center justify-between rounded-3xl bg-slate-50 p-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <div className="flex h-11 w-56 items-center rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300">
                May 8 - May 14, 2026
              </div>
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <div className="flex h-11 w-44 items-center rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300">
                All Room Types
              </div>
            </div>
          </div>
          <button className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[var(--color-accent)] px-6 text-sm font-semibold text-white shadow-lg shadow-cyan-900/20 transition-all hover:bg-[var(--color-accent-strong)] active:scale-95">
            <Search className="h-4 w-4" />
            Update View
          </button>
        </div>

        <div className="rounded-[28px] border border-slate-200 overflow-hidden">
           <div className="grid grid-cols-8 bg-slate-50 border-b border-slate-200">
              <div className="p-4 border-r border-slate-200 font-medium text-xs uppercase tracking-wider text-slate-400">Room Type</div>
              {[...Array(7)].map((_, i) => (
                <div key={i} className="p-4 text-center border-r border-slate-200 last:border-r-0 font-medium">
                   <div className="text-xs text-slate-400 uppercase">May</div>
                   <div className="text-lg text-slate-900">{8 + i}</div>
                </div>
              ))}
           </div>
           <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-8">
                 <div className="p-4 border-r border-slate-200 bg-slate-50/50">
                    <div className="font-semibold text-slate-900 text-sm">Deluxe Room</div>
                    <div className="text-xs text-slate-500 mt-1">Rates (IDR)</div>
                 </div>
                 {[...Array(7)].map((_, i) => (
                    <div key={i} className="p-4 border-r border-slate-200 last:border-r-0 flex flex-col items-center justify-center gap-1">
                       <div className="text-sm font-semibold text-[var(--color-accent)]">1.250k</div>
                       <div className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">5 Left</div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}
