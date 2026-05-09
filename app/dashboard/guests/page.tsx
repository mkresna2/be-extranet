import { Users } from "lucide-react";
import { getSession } from "@/lib/auth";

const API_BASE_URL =
  process.env.BOOKING_ENGINE_API_URL || "https://booking-engine-vq7e.onrender.com";

async function getGuests() {
  const session = await getSession();
  if (!session) return [];
  
  try {
    const response = await fetch(`${API_BASE_URL}/guests/`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to fetch guests:", error);
    return [];
  }
}

export default async function GuestsPage() {
  const rawGuests = await getGuests();
  const guests = Array.isArray(rawGuests) ? rawGuests : [];

  return (
    <main className="flex-1 space-y-6">
      <section className="rounded-[32px] border border-white bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="space-y-2 border-b border-slate-100 pb-6">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">CRM</p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Guests</h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-500">View and manage guest profiles across all bookings.</p>
        </div>

        <div className="mt-6">
          {guests.length > 0 ? (
            <div className="overflow-hidden rounded-3xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {guests.map((guest: any) => (
                    <tr key={guest.id}>
                      <td className="px-4 py-4 font-medium text-slate-900">{guest.full_name}</td>
                      <td className="px-4 py-4 text-slate-600">{guest.email}</td>
                      <td className="px-4 py-4 text-slate-600">{guest.phone || "-"}</td>
                      <td className="px-4 py-4 text-slate-500">{new Date(guest.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-3xl bg-slate-50 py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No guests found</h3>
              <p className="mt-2 text-slate-500">Guests will appear here once they make a booking.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
