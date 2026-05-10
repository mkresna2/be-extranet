"use client";

import { ArrowLeft, ArrowRight, Calendar, Filter, Search } from "lucide-react";
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
  windowDays: number;
  todayDate: string;
}

export function AvailabilityFilters({
  roomTypes,
  initialStartDate,
  initialEndDate,
  initialRoomTypeId,
  windowDays,
  todayDate,
}: AvailabilityFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [roomTypeId, setRoomTypeId] = useState(initialRoomTypeId || "all");

  const buildParams = (
    nextStartDate: string,
    nextEndDate: string,
    nextRoomTypeId: string,
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("start_date", nextStartDate);
    params.set("end_date", nextEndDate);

    if (nextRoomTypeId && nextRoomTypeId !== "all") {
      params.set("room_type_id", nextRoomTypeId);
    } else {
      params.delete("room_type_id");
    }

    return params;
  };

  const navigateWindow = (dayOffset: number) => {
    const nextStart = new Date(`${startDate}T00:00:00`);
    const nextEnd = new Date(`${endDate}T00:00:00`);

    nextStart.setDate(nextStart.getDate() + dayOffset);
    nextEnd.setDate(nextEnd.getDate() + dayOffset);

    const nextStartDate = nextStart.toISOString().split("T")[0];
    const nextEndDate = nextEnd.toISOString().split("T")[0];

    setStartDate(nextStartDate);
    setEndDate(nextEndDate);

    const params = buildParams(nextStartDate, nextEndDate, roomTypeId);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleToday = () => {
    const today = new Date(`${todayDate}T00:00:00`);
    const nextEnd = new Date(today);
    nextEnd.setDate(nextEnd.getDate() + Math.max(windowDays - 1, 0));

    const nextStartDate = today.toISOString().split("T")[0];
    const nextEndDate = nextEnd.toISOString().split("T")[0];

    setStartDate(nextStartDate);
    setEndDate(nextEndDate);

    const params = buildParams(nextStartDate, nextEndDate, roomTypeId);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleUpdate = () => {
    const params = buildParams(startDate, endDate, roomTypeId);
    router.push(`?${params.toString()}`, { scroll: false });
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

        <div className="flex min-w-0 flex-col gap-3 lg:items-end">
          <div className="-mx-1 overflow-x-auto px-1 pb-1 sm:mx-0 sm:px-0">
            <div className="flex min-w-max gap-2 sm:flex-wrap sm:justify-end">
              <button
                type="button"
                onClick={() => navigateWindow(-windowDays)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Prev Window</span>
              </button>

              <button
                type="button"
                onClick={handleToday}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
              >
                Today
              </button>

              <button
                onClick={handleUpdate}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[var(--color-accent)] px-5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/20 transition-all hover:bg-[var(--color-accent-strong)] active:scale-95"
              >
                <Search className="h-4 w-4" />
                Update View
              </button>

              <button
                type="button"
                onClick={() => navigateWindow(windowDays)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
              >
                <span>Next Window</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
