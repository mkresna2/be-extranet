"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";
import { useMemo, useState } from "react";

const RANGE_OPTIONS = [7, 14, 30] as const;

type RateWindowControlsProps = {
  startDate: string;
  rangeDays: 7 | 14 | 30;
  todayDate: string;
  activeWindowLabel: string;
};

function addDays(dateString: string, days: number) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export function RateWindowControls({
  startDate,
  rangeDays,
  todayDate,
  activeWindowLabel,
}: RateWindowControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedStartDate, setSelectedStartDate] = useState(startDate);

  const hrefs = useMemo(() => {
    const buildHref = (nextStartDate: string, nextRange: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("start_date", nextStartDate);
      params.set("range", String(nextRange));
      return `/dashboard/rates?${params.toString()}`;
    };

    return {
      prev: buildHref(addDays(startDate, -rangeDays), rangeDays),
      next: buildHref(addDays(startDate, rangeDays), rangeDays),
      today: buildHref(todayDate, rangeDays),
      ranges: RANGE_OPTIONS.map((option) => ({
        option,
        href: buildHref(startDate, option),
      })),
    };
  }, [rangeDays, searchParams, startDate, todayDate]);

  const handleApplyStartDate = () => {
    if (!selectedStartDate) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("start_date", selectedStartDate);
    params.set("range", String(rangeDays));
    router.push(`/dashboard/rates?${params.toString()}`);
  };

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-3 sm:p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Date Window
          </p>
          <p className="text-sm font-semibold text-slate-950 sm:text-base">
            {activeWindowLabel}
          </p>
          <p className="text-xs text-slate-500">
            Pilih tanggal mulai langsung dari header, lalu geser kontrol horizontal di mobile untuk pindah window dengan cepat.
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-3 lg:items-end">
          <div className="grid gap-2 sm:grid-cols-[minmax(0,220px)_auto] sm:items-end">
            <label className="space-y-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              <span className="block">Start Date</span>
              <div className="relative normal-case tracking-normal">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={selectedStartDate}
                  onChange={(event) => setSelectedStartDate(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-medium text-slate-900 outline-none transition focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10"
                />
              </div>
            </label>

            <button
              type="button"
              onClick={handleApplyStartDate}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-accent-strong)]"
            >
              Apply Date
            </button>
          </div>

          <div className="-mx-3 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
            <div className="flex min-w-max gap-2 snap-x snap-mandatory sm:flex-wrap">
              {hrefs.ranges.map(({ option, href }) => {
                const isActive = option === rangeDays;
                return (
                  <Link
                    key={option}
                    href={href}
                    className={`snap-start inline-flex min-w-[92px] items-center justify-center rounded-full px-3 py-2 text-xs font-semibold transition ${
                      isActive
                        ? "bg-[var(--color-accent)] text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {option} Hari
                  </Link>
                );
              })}

              <Link
                href={hrefs.today}
                className="snap-start inline-flex min-w-[92px] items-center justify-center rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Today
              </Link>
            </div>
          </div>

          <div className="-mx-3 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
            <div className="flex min-w-max gap-2 snap-x snap-mandatory sm:flex-wrap sm:justify-end">
              <Link
                href={hrefs.prev}
                className="snap-start inline-flex min-w-[120px] items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Prev Window</span>
              </Link>
              <Link
                href={hrefs.next}
                className="snap-start inline-flex min-w-[120px] items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <span>Next Window</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
