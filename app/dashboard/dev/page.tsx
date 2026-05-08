import { requireSession } from "@/lib/auth";
import { terminal } from "@/lib/terminal"; // Hypothetical, but we'll use a server action or button

export default async function DevToolsPage() {
  await requireSession();

  return (
    <main className="flex-1 rounded-[32px] border border-white bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-amber-600">
          Development
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
          Developer Tools
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-500">
          Utility tools for seeding data and debugging during development.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-950">Seed Bookings</h3>
          <p className="mt-2 text-sm text-slate-500">
            Generate 4 sample bookings in the database to test the Booking Overview page.
          </p>
          <div className="mt-6 flex flex-col gap-3">
             <p className="text-xs font-mono bg-slate-100 p-3 rounded-xl text-slate-600">
               python scripts/seed_bookings.py
             </p>
             <p className="text-sm italic text-amber-700">
               Note: Run this command via Hermes terminal to update the remote database.
             </p>
          </div>
        </section>
      </div>
    </main>
  );
}
