import { requireSession } from "@/lib/auth";
import { SyncButton } from "@/components/inventory/sync-button";
import { AvailabilityFilters } from "@/components/inventory/availability-filters";
import { getRoomTypes as getRoomTypesAction } from "@/app/actions/room-types";

const API_BASE_URL =
  process.env.BOOKING_ENGINE_API_URL ?? "https://booking-engine-vq7e.onrender.com";

interface RateAvailability {
  date: string;
  price: number;
  available_rooms: number;
  is_available: boolean;
}

async function getRoomTypeRates(
  roomTypeId: string,
  startDate: string,
  endDate: string,
  accessToken: string
): Promise<RateAvailability[]> {
  const res = await fetch(
    `${API_BASE_URL}/room-types/${roomTypeId}/rates/?start_date=${startDate}&end_date=${endDate}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<{ start_date?: string; end_date?: string; room_type_id?: string }>;
}) {
  const session = await requireSession();
  const accessToken = session.accessToken;
  const params = await searchParams;

  const today = new Date();
  const defaultStart = today.toISOString().split("T")[0];
  const defaultEnd = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const startDate = params.start_date || defaultStart;
  const endDate = params.end_date || defaultEnd;
  const filterRoomTypeId = params.room_type_id;

  let allRoomTypes = await getRoomTypesAction();
  let roomTypes = allRoomTypes;
  let roomRates: Record<string, RateAvailability[]> = {};

  // Apply room type filter if set
  if (filterRoomTypeId && filterRoomTypeId !== 'all') {
    roomTypes = allRoomTypes.filter(rt => rt.id === filterRoomTypeId);
  }

  const ratePromises = roomTypes.map(async (rt) => {
    const rates = await getRoomTypeRates(rt.id, startDate, endDate, accessToken);
    console.log(`Fetched ${rates.length} rates for room type ${rt.name} (${rt.id})`);
    return { id: rt.id, rates };
  });

  const allRates = await Promise.all(ratePromises);
  console.log(`Total room types in response: ${roomTypes.length}`);
  console.log(`Room types: ${JSON.stringify(roomTypes.map(r => r.name))}`);
  roomRates = allRates.reduce((acc, curr) => {
    acc[curr.id] = curr.rates;
    return acc;
  }, {} as Record<string, RateAvailability[]>);

  // Calculate dates between start and end
  const dates: Date[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  
  // Limit to a reasonable number of days (e.g., 31) to prevent UI issues
  const displayDays = Math.min(diffDays, 31);

  for (let i = 0; i < displayDays; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }

  return (
    <main className="flex-1 min-w-0 rounded-[24px] border border-white bg-white p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:rounded-[32px] sm:p-6">
      <div className="flex flex-col gap-5 border-b border-slate-100 pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--color-accent)] sm:text-sm">
            Inventory
          </p>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Rate & Availability Calendar
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              Manage pricing and room availability for {session.currentProperty?.name ?? "your property"}.
            </p>
          </div>
        </div>

        <div className="w-full lg:w-auto lg:flex-shrink-0">
          <SyncButton idleLabel="Update Availability" pendingLabel="Updating..." />
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <AvailabilityFilters 
          roomTypes={allRoomTypes} 
          initialStartDate={startDate} 
          initialEndDate={endDate}
          initialRoomTypeId={filterRoomTypeId}
        />

        <div className="rounded-[28px] border border-slate-200 overflow-x-auto relative">
          <div className="min-w-[800px] md:min-w-[1000px]">
            <div className={`grid border-b border-slate-200 bg-slate-50 sticky top-0 z-10`} style={{ gridTemplateColumns: `150px repeat(${dates.length}, 1fr)` }}>
                <div className="p-4 border-r border-slate-200 font-medium text-[10px] uppercase tracking-wider text-slate-400 sticky left-0 bg-slate-50 z-20">Room Type</div>
                {dates.map((date, i) => (
                  <div key={i} className="p-4 text-center border-r border-slate-200 last:border-r-0 font-medium">
                    <div className="text-[10px] text-slate-400 uppercase">
                      {date.toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                    <div className="text-base text-slate-900">{date.getDate()}</div>
                  </div>
                ))}
            </div>
            <div className="divide-y divide-slate-100">
                {roomTypes.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 italic">
                    No room types found for this property or filter.
                  </div>
                ) : (
                  roomTypes.map((roomType) => (
                    <div key={roomType.id} className="grid" style={{ gridTemplateColumns: `150px repeat(${dates.length}, 1fr)` }}>
                      <div className="p-4 border-r border-slate-200 bg-slate-50/50 sticky left-0 z-20 backdrop-blur-sm">
                          <div className="font-semibold text-slate-900 text-xs truncate break-all" title={roomType.name}>{roomType.name}</div>
                          <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">Rates</div>
                      </div>
                      {dates.map((date, i) => {
                        const dateStr = date.toISOString().split('T')[0];
                        const rate = roomRates[roomType.id]?.find(r => r.date === dateStr);
                        
                        return (
                          <div key={i} className="p-3 border-r border-slate-200 last:border-r-0 flex flex-col items-center justify-center gap-1 min-w-[70px]">
                            {rate ? (
                              <>
                                <div className="text-xs font-bold text-[var(--color-accent)]">
                                  {rate.price >= 1000 ? `${(rate.price / 1000).toFixed(0)}k` : rate.price}
                                </div>
                                <div className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                                  rate.available_rooms > 0 
                                    ? 'bg-emerald-100 text-emerald-700' 
                                    : 'bg-rose-100 text-rose-700'
                                }`}>
                                  {rate.available_rooms}L
                                </div>
                              </>
                            ) : (
                              <div className="text-[10px] text-slate-400 italic">N/A</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
