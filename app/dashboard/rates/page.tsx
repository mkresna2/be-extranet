import Link from "next/link";
import { ArrowLeft, ArrowRight, BarChart3, CalendarRange, Layers3 } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { getRoomTypes } from "@/app/actions/room-types";
import { getRoomRates } from "@/app/actions/rates";
import { getRatePlans } from "@/app/actions/rate-plans";
import { BulkRateForm } from "@/components/rates/bulk-rate-form";
import { SyncButton } from "@/components/inventory/sync-button";

const RANGE_OPTIONS = [7, 14, 30] as const;
const DEFAULT_RANGE_DAYS = 7;

type RatesPageSearchParams = Promise<{
  start_date?: string;
  range?: string;
}>;

function formatCurrency(price?: number) {
  if (typeof price !== "number") return "Not set";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatCompactAmount(price?: number) {
  if (typeof price !== "number") return "—";

  if (price >= 1000000) {
    return `Rp ${(price / 1000000).toFixed(price % 1000000 === 0 ? 0 : 1)}M`;
  }

  if (price >= 1000) {
    return `Rp ${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}K`;
  }

  return `Rp ${price}`;
}

function formatMonth(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short" });
}

function formatFullDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatIsoDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function parseDateParam(value?: string) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function parseRangeParam(value?: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || !RANGE_OPTIONS.includes(parsed as (typeof RANGE_OPTIONS)[number])) {
    return DEFAULT_RANGE_DAYS;
  }
  return parsed as (typeof RANGE_OPTIONS)[number];
}

function buildRatesHref(startDate: string, rangeDays: number) {
  const params = new URLSearchParams();
  params.set("start_date", startDate);
  params.set("range", String(rangeDays));
  return `/dashboard/rates?${params.toString()}`;
}

export default async function RatesPage({
  searchParams,
}: {
  searchParams: RatesPageSearchParams;
}) {
  const session = await requireSession();
  const { start_date: startDateParam, range: rangeParam } = await searchParams;
  const roomTypes = await getRoomTypes();
  const ratePlans = await getRatePlans();

  const today = new Date();
  const normalizedToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const startDate = parseDateParam(startDateParam) ?? normalizedToday;
  const rangeDays = parseRangeParam(rangeParam);
  const endDate = addDays(startDate, rangeDays - 1);

  const startDateStr = formatIsoDate(startDate);
  const endDateStr = formatIsoDate(endDate);
  const previousWindowStart = formatIsoDate(addDays(startDate, -rangeDays));
  const nextWindowStart = formatIsoDate(addDays(startDate, rangeDays));
  const activeWindowLabel = `${formatFullDate(startDate)} — ${formatFullDate(endDate)}`;

  const roomTypesWithPlans = await Promise.all(
    roomTypes.map(async (roomType: any) => {
      const matchingPlans = ratePlans.filter(
        (plan: any) => plan.room_type_id === roomType.id,
      );
      const allPlans = [null, ...matchingPlans];

      const plansWithRates = await Promise.all(
        allPlans.map(async (plan: any) => {
          const rates = await getRoomRates(
            roomType.id,
            startDateStr,
            endDateStr,
            plan?.id,
          );

          return { plan, rates: Array.isArray(rates) ? rates : [] };
        }),
      );

      return { ...roomType, plansWithRates };
    }),
  );

  const dates: Date[] = [];
  for (let i = 0; i < rangeDays; i += 1) {
    dates.push(addDays(startDate, i));
  }

  const hasRoomTypes = roomTypesWithPlans.length > 0;
  const totalPlanRows = roomTypesWithPlans.reduce(
    (sum, roomType) => sum + roomType.plansWithRates.length,
    0,
  );
  const configuredRates = roomTypesWithPlans.reduce(
    (sum, roomType) =>
      sum +
      roomType.plansWithRates.reduce(
        (planSum: number, plan: any) => planSum + plan.rates.length,
        0,
      ),
    0,
  );

  return (
    <main className="flex-1 min-w-0 rounded-[24px] border border-white bg-white p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:rounded-[32px] sm:p-6">
      <div className="flex flex-col gap-5 border-b border-slate-100 pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--color-accent)] sm:text-sm">
            Rates
          </p>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Price Management
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              Manage rates and availability across all room types and rate plans for{" "}
              {session.currentProperty?.name ?? "your property"}.
            </p>
          </div>
        </div>

        <div className="w-full lg:w-auto lg:flex-shrink-0">
          <SyncButton idleLabel="Update Availability" pendingLabel="Updating..." />
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
              <Layers3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Room Types
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">
                {roomTypes.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Plan Rows
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">
                {totalPlanRows}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
              <CalendarRange className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                {rangeDays}-Day Window
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-950 sm:text-base">
                {configuredRates} configured cells
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
        <section className="min-w-0 space-y-4">
          <div className="rounded-[28px] border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-slate-950">
                    Live rate grid
                  </h3>
                  <p className="text-sm text-slate-500">
                    Review {rangeDays} days of prices and availability before running bulk updates.
                  </p>
                </div>
                <div className="inline-flex w-full flex-wrap items-center gap-2 text-xs font-medium text-slate-500 md:w-auto md:justify-end">
                  <span className="rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200">
                    Base BAR always shown first
                  </span>
                  <span className="rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200">
                    Empty cells mean no rate is set yet
                  </span>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-3 sm:p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Date Window
                    </p>
                    <p className="text-sm font-semibold text-slate-950 sm:text-base">
                      {activeWindowLabel}
                    </p>
                    <p className="text-xs text-slate-500">
                      Geser window untuk melihat tanggal lain, atau pilih range tampilan yang lebih panjang.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 lg:items-end">
                    <div className="flex flex-wrap gap-2">
                      {RANGE_OPTIONS.map((option) => {
                        const isActive = option === rangeDays;
                        return (
                          <Link
                            key={option}
                            href={buildRatesHref(startDateStr, option)}
                            className={`inline-flex items-center justify-center rounded-full px-3 py-2 text-xs font-semibold transition ${
                              isActive
                                ? "bg-[var(--color-accent)] text-white shadow-sm"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {option} Hari
                          </Link>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
                      <Link
                        href={buildRatesHref(previousWindowStart, rangeDays)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Prev</span>
                      </Link>
                      <Link
                        href={buildRatesHref(nextWindowStart, rangeDays)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <span>Next</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        href={buildRatesHref(formatIsoDate(normalizedToday), rangeDays)}
                        className="col-span-2 inline-flex items-center justify-center rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 sm:col-auto"
                      >
                        Today
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {hasRoomTypes ? (
            <>
              <div className="space-y-4 md:hidden">
                {roomTypesWithPlans.map((roomType) => (
                  <section
                    key={roomType.id}
                    className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
                          Room Type
                        </p>
                        <h3 className="mt-1 break-words text-lg font-semibold text-slate-950">
                          {roomType.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {roomType.plansWithRates.length} plan
                          {roomType.plansWithRates.length > 1 ? "s" : ""} in this window.
                        </p>
                      </div>
                      <span className="inline-flex w-fit rounded-full bg-[var(--color-accent)]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                        {roomType.total_rooms} rooms
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {roomType.plansWithRates.map((planRow: any) => (
                        <article
                          key={planRow.plan?.id || `base-${roomType.id}`}
                          className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3"
                        >
                          <div className="flex flex-col gap-2 border-b border-slate-200 pb-3">
                            <div>
                              <p className="break-words text-sm font-semibold text-[var(--color-accent)]">
                                {planRow.plan?.name || "Base BAR"}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                {planRow.plan?.description ||
                                  "Default direct pricing with no additional rate-plan rules."}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {dates.map((date, index) => {
                              const dateStr = formatIsoDate(date);
                              const rate = planRow.rates.find(
                                (entry: any) => entry.date === dateStr,
                              );

                              return (
                                <div
                                  key={`${roomType.id}-${planRow.plan?.id || "base"}-${index}`}
                                  className="rounded-2xl border border-white bg-white p-3 shadow-sm"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                                        {formatMonth(date)}
                                      </p>
                                      <p className="text-sm font-semibold text-slate-900">
                                        {formatFullDate(date)}
                                      </p>
                                    </div>
                                    <span
                                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                                        rate
                                          ? "bg-emerald-100 text-emerald-700"
                                          : "bg-slate-100 text-slate-500"
                                      }`}
                                    >
                                      {rate ? `${rate.available} left` : "Pending"}
                                    </span>
                                  </div>

                                  <div className="mt-3">
                                    <p className="text-lg font-semibold text-slate-950">
                                      {formatCurrency(rate?.price)}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      {rate
                                        ? "Availability synced for this date."
                                        : "No price has been configured for this date yet."}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <div className="hidden min-w-0 overflow-hidden rounded-[28px] border border-slate-200 md:block">
                <div className="overflow-x-auto">
                  <div
                    className="bg-white"
                    style={{ minWidth: `${220 + dates.length * 108}px` }}
                  >
                    <div
                      className="grid border-b border-slate-200 bg-slate-50"
                      style={{
                        gridTemplateColumns: `220px repeat(${dates.length}, minmax(108px, 1fr))`,
                      }}
                    >
                      <div className="sticky left-0 z-20 border-r border-slate-200 bg-slate-50 p-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                        Room & Plan
                      </div>
                      {dates.map((date, index) => (
                        <div
                          key={`${date.toISOString()}-${index}`}
                          className="border-r border-slate-200 p-4 text-center last:border-r-0"
                        >
                          <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                            {formatMonth(date)}
                          </div>
                          <div className="mt-1 text-lg font-semibold text-slate-900">
                            {date.getDate()}
                          </div>
                          <div className="mt-1 text-[11px] text-slate-500">
                            {date.toLocaleDateString("en-US", { weekday: "short" })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="divide-y divide-slate-100">
                      {roomTypesWithPlans.map((roomType) => (
                        <div key={roomType.id} className="divide-y divide-slate-100">
                          {roomType.plansWithRates.map((planRow: any, index: number) => (
                            <div
                              key={planRow.plan?.id || `base-${roomType.id}`}
                              className="grid"
                              style={{
                                gridTemplateColumns: `220px repeat(${dates.length}, minmax(108px, 1fr))`,
                              }}
                            >
                              <div className="sticky left-0 z-10 border-r border-slate-200 bg-white p-4">
                                {index === 0 ? (
                                  <p className="mb-1 break-words text-[11px] font-bold uppercase tracking-[0.18em] text-slate-900">
                                    {roomType.name}
                                  </p>
                                ) : null}
                                <p className="break-words text-sm font-semibold text-[var(--color-accent)]">
                                  {planRow.plan?.name || "Base BAR"}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                  {planRow.plan?.description ||
                                    "Default direct pricing for the property website and direct bookings."}
                                </p>
                              </div>

                              {dates.map((date, cellIndex) => {
                                const dateStr = formatIsoDate(date);
                                const rate = planRow.rates.find(
                                  (entry: any) => entry.date === dateStr,
                                );

                                return (
                                  <div
                                    key={`${roomType.id}-${planRow.plan?.id || "base"}-${cellIndex}`}
                                    className="flex flex-col items-center justify-center gap-2 border-r border-slate-200 p-4 text-center last:border-r-0"
                                  >
                                    <div className="text-sm font-semibold text-slate-900">
                                      {formatCompactAmount(rate?.price)}
                                    </div>
                                    <span
                                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                                        rate
                                          ? "bg-emerald-100 text-emerald-700"
                                          : "bg-slate-100 text-slate-500"
                                      }`}
                                    >
                                      {rate ? `${rate.available} left` : "No rate"}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
              <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[var(--color-accent)] shadow-sm ring-1 ring-slate-200">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-950">
                No room types available yet
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Create room types first so rates and availability can be managed from one place.
              </p>
            </div>
          )}
        </section>

        <aside className="min-w-0 space-y-4 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
              Bulk Actions
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Apply one price range update to multiple dates, then confirm the result in the live grid.
            </p>
          </div>

          <BulkRateForm roomTypes={roomTypes} ratePlans={ratePlans} />
        </aside>
      </div>
    </main>
  );
}
