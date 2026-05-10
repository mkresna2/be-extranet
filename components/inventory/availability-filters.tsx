"use client";

import { Calendar, Filter, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface RoomType {
  id: string;
  name: string;
}

interface AvailabilityFiltersProps {
  roomTypes: RoomType[];
  initialStartDate: string;
  initialEndDate: string;
  initialRoomTypeId?: string;
}

export function AvailabilityFilters({
  roomTypes,
  initialStartDate,
  initialEndDate,
  initialRoomTypeId,
}: AvailabilityFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [roomTypeId, setRoomTypeId] = useState(initialRoomTypeId || "all");

  const handleUpdate = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("start_date", startDate);
    params.set("end_date", endDate);
    if (roomTypeId && roomTypeId !== "all") {
      params.set("room_type_id", roomTypeId);
    } else {
      params.delete("room_type_id");
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="rounded-[28px] bg-slate-50 p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(220px,260px)] xl:items-end xl:gap-4">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex h-11 w-full min-w-0 items-center rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              End Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex h-11 w-full min-w-0 items-center rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2 xl:col-span-1">
            <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Room Type
            </label>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={roomTypeId}
                onChange={(e) => setRoomTypeId(e.target.value)}
                className="flex h-11 w-full min-w-0 appearance-none items-center rounded-2xl border border-slate-200 bg-white pl-11 pr-10 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              >
                <option value="all">All Room Types</option>
                {roomTypes.map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={handleUpdate}
          className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-[var(--color-accent)] px-5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/20 transition-all hover:bg-[var(--color-accent-strong)] active:scale-95 lg:w-auto"
        >
          <Search className="h-4 w-4" />
          Update View
        </button>
      </div>
    </div>
  );
}
