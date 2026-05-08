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
    <div className="flex items-center justify-between rounded-3xl bg-slate-50 p-4">
      <div className="flex items-center gap-4">
        <div className="relative flex items-center gap-2">
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex h-11 w-44 items-center rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
          <span className="text-slate-400">to</span>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex h-11 w-44 items-center rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
        </div>

        <div className="relative">
          <Filter className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={roomTypeId}
            onChange={(e) => setRoomTypeId(e.target.value)}
            className="flex h-11 w-48 appearance-none items-center rounded-2xl border border-slate-200 bg-white pl-11 pr-8 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
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

      <button
        onClick={handleUpdate}
        className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[var(--color-accent)] px-6 text-sm font-semibold text-white shadow-lg shadow-cyan-900/20 transition-all hover:bg-[var(--color-accent-strong)] active:scale-95"
      >
        <Search className="h-4 w-4" />
        Update View
      </button>
    </div>
  );
}
