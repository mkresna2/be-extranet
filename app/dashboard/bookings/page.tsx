import { requireSession } from "@/lib/auth";

async function getBookings(token: string) {
  try {
    const res = await fetch(`${process.env.BACKEND_URL}/bookings/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      if (res.status === 404) return [];
      console.error(`Fetch error: ${res.status} ${res.statusText}`);
      return [];
    }

    return res.json();
  } catch (error) {
    console.error("Fetch failed:", error);
    return [];
  }
}

export default async function BookingsPage() {
  const session = await requireSession();
  const property = session.currentProperty;
  const bookings = await getBookings(session.accessToken);

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
            {bookings.length > 0 ? (
              bookings.map((booking: any) => (
                <tr key={booking.id} className="bg-white hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{booking.guest_name}</p>
                    <p className="text-xs text-slate-500">{booking.booking_ref}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {booking.check_in} - {booking.check_out}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium uppercase tracking-wider ${
                      booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                      booking.status === 'pending_payment' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900">
                    ${booking.total_price.toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="bg-white">
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                  No bookings found for this property.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
