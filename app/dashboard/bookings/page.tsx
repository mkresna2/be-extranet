import { requireSession } from "@/lib/auth";

export default async function BookingsPage() {
  const session = await requireSession();
  const property = session.currentProperty;

  return (
    <main className="flex-1 rounded-[32px] border border-white bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
          Operations
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
          Booking Overview
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-500">
          View and manage all reservations for {property?.name ?? "your property"}.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Guest</th>
              <th className="px-6 py-4 font-medium">Check-in / Out</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
             <tr className="bg-white">
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                   Fetching live bookings from the engine...
                </td>
             </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
