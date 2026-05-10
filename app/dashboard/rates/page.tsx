import { BarChart3, CalendarRange, Layers3 } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { getRoomTypes, type RoomType } from "@/app/actions/room-types";
import { getRoomRates } from "@/app/actions/rates";
import { getRatePlans, type RatePlan } from "@/app/actions/rate-plans";
import { BulkRateForm } from "@/components/rates/bulk-rate-form";
import { RateWindowControls } from "@/components/rates/rate-window-controls";
import { SyncButton } from "@/components/inventory/sync-button";

const RANGE_OPTIONS = [7, 14, 30] as const;
const DEFAULT_RANGE_DAYS = 7;

type RatesPageSearchParams = Promise<{
  start_date?: string;
  range?: string;
}>;

type RateEntry = {
  date: string;
  price: number;
  available: number;
  rate_plan_id?: string | null;
};

type PlanRow = {
  plan: RatePlan | null;
  rates: RateEntry[];
};

type RoomTypeWithPlans = RoomType & {
  plansWithRates: PlanRow[];
};

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

function getDerivedPrice(basePrice: number | undefined, plan: RatePlan | null) {
  if (typeof basePrice !== "number" || !plan || plan.pricing_strategy !== "derived_from_bar") {
    return undefined;
  }

  const adjustmentValue = plan.adjustment_value;
  if (typeof adjustmentValue !== "number") {
    return basePrice;
  }

  if (plan.adjustment_type === "percentage") {
    return Math.max(basePrice * (1 - adjustmentValue / 100), 0);
  }

  if (plan.adjustment_type === "fixed_amount") {
    return Math.max(basePrice - adjustmentValue, 0);
  }

  return basePrice;
}

function getDerivedRuleLabel(plan: RatePlan | null) {
  if (!plan || plan.pricing_strategy !== "derived_from_bar") {
    return null;
  }

  if (plan.adjustment_type === "percentage") {
    return `BAR - ${plan.adjustment_value ?? 0}%`;
  }

  if (plan.adjustment_type === "fixed_amount") {
    return `BAR - ${formatCurrency(plan.adjustment_value ?? 0)}`;
  }

  return "Derived from BAR";
}

function parseDateParam(value?: string) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function parseRangeParam(value?: string) {
  const parsed = Number(value);
  if (
    !Number.isInteger(parsed) ||
    !RANGE_OPTIONS.includes(parsed as (typeof RANGE_OPTIONS)[number])
  ) {
    return DEFAULT_RANGE_DAYS;
  }
  return parsed as (typeof RANGE_OPTIONS)[number];
}

export default async function RatesPage({
  searchParams,
}: {
  searchParams: RatesPageSearchParams;
}) {
  const session = await requireSession();
  const { start_date: startDateParam, range: rangeParam } = await searchParams;
  const roomTypes: RoomType[] = await getRoomTypes();
  const ratePlans: RatePlan[] = await getRatePlans();

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
  const activeWindowLabel = `${formatFullDate(startDate)} — ${formatFullDate(endDate)}`;

  const roomTypesWithPlans: RoomTypeWithPlans[] = await Promise.all(
    roomTypes.map(async (roomType) => {
      const matchingPlans = ratePlans.filter(
        (plan) => plan.room_type_id === roomType.id,
      );
      const allPlans: Array<RatePlan | null> = [null, ...matchingPlans];

      const plansWithRates: PlanRow[] = await Promise.all(
        allPlans.map(async (plan) => {
          const rates = await getRoomRates(
            roomType.id,
            startDateStr,
            endDateStr,
            plan?.id,
          );

          return { plan, rates: Array.isArray(rates) ? (rates as RateEntry[]) : [] };
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
        (planSum, plan) => planSum + plan.rates.length,
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

              <RateWindowControls
                startDate={startDateStr}
                rangeDays={rangeDays}
                todayDate={formatIsoDate(normalizedToday)}
                activeWindowLabel={activeWindowLabel}
              />
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
                      {roomType.plansWithRates.map((planRow) => (
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
                            {planRow.plan?.pricing_strategy === "derived_from_bar" ? (
                              <div className="inline-flex w-fit rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-700 ring-1 ring-amber-200">
                                Preview from {getDerivedRuleLabel(planRow.plan)}
                              </div>
                            ) : null}
                          </div>

                          <div className="-mx-3 mt-3 overflow-x-auto px-3 pb-1">
                            <div className="flex min-w-max gap-3 snap-x snap-mandatory sm:grid sm:min-w-0 sm:grid-cols-2 sm:gap-2">
                              {dates.map((date, index) => {
                                const dateStr = formatIsoDate(date);
                                const rate = planRow.rates.find(
                                  (entry) => entry.date === dateStr,
                                );
                                const basePlanRow = roomType.plansWithRates.find(
                                  (candidate) => candidate.plan === null,
                                );
                                const baseRate = basePlanRow?.rates.find(
                                  (entry) => entry.date === dateStr,
                                );
                                const derivedPreviewPrice = getDerivedPrice(
                                  baseRate?.price,
                                  planRow.plan,
                                );
                                const displayPrice =
                                  typeof derivedPreviewPrice === "number"
                                    ? derivedPreviewPrice
                                    : rate?.price;

                                return (
                                  <div
                                    key={`${roomType.id}-${planRow.plan?.id || "base"}-${index}`}
                                    className="snap-start w-[240px] rounded-2xl border border-white bg-white p-3 shadow-sm sm:w-auto"
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
                                        {formatCurrency(displayPrice)}
                                      </p>
                                      {typeof derivedPreviewPrice === "number" ? (
                                        <p className="mt-1 text-[11px] font-medium text-amber-700">
                                          Estimated from Base BAR {formatCurrency(baseRate?.price)}
                                        </p>
                                      ) : null}
                                      <p className="mt-1 text-xs text-slate-500">
                                        {typeof derivedPreviewPrice === "number"
                                          ? "Preview follows the BAR rule for this rate plan."
                                          : rate
                                            ? "Availability synced for this date."
                                            : "No price has been configured for this date yet."}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
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
                          {roomType.plansWithRates.map((planRow, index) => (
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
                                {planRow.plan?.pricing_strategy === "derived_from_bar" ? (
                                  <div className="mt-2 inline-flex w-fit rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-700 ring-1 ring-amber-200">
                                    Preview from {getDerivedRuleLabel(planRow.plan)}
                                  </div>
                                ) : null}
                              </div>

                              {dates.map((date, cellIndex) => {
                                const dateStr = formatIsoDate(date);
                                const rate = planRow.rates.find(
                                  (entry) => entry.date === dateStr,
                                );
                                const basePlanRow = roomType.plansWithRates.find(
                                  (candidate) => candidate.plan === null,
                                );
                                const baseRate = basePlanRow?.rates.find(
                                  (entry) => entry.date === dateStr,
                                );
                                const derivedPreviewPrice = getDerivedPrice(
                                  baseRate?.price,
                                  planRow.plan,
                                );
                                const displayPrice =
                                  typeof derivedPreviewPrice === "number"
                                    ? derivedPreviewPrice
                                    : rate?.price;

                                return (
                                  <div
                                    key={`${roomType.id}-${planRow.plan?.id || "base"}-${cellIndex}`}
                                    className="flex flex-col items-center justify-center gap-2 border-r border-slate-200 p-4 text-center last:border-r-0"
                                  >
                                    <div className="text-sm font-semibold text-slate-900">
                                      {formatCompactAmount(displayPrice)}
                                    </div>
                                    {typeof derivedPreviewPrice === "number" ? (
                                      <div className="text-[10px] font-medium text-amber-700">
                                        Est. from {formatCompactAmount(baseRate?.price)}
                                      </div>
                                    ) : null}
                                    <span
                                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                                        typeof derivedPreviewPrice === "number" || rate
                                          ? "bg-emerald-100 text-emerald-700"
                                          : "bg-slate-100 text-slate-500"
                                      }`}
                                    >
                                      {typeof derivedPreviewPrice === "number"
                                        ? `BAR preview${rate ? ` · ${rate.available} left` : ""}`
                                        : rate
                                          ? `${rate.available} left`
                                          : "No rate"}
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
