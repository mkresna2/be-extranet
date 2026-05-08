import {
  ArrowUpRight,
  CalendarClock,
  ChartNoAxesColumn,
  Coins,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { requireSession } from "@/lib/auth";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Makassar",
  }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-ID", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default async function DashboardPage() {
  const session = await requireSession();
  const property = session.currentProperty;
  const propertyCount = session.properties.length;

  const statCards = [
    {
      label: "Properties Connected",
      value: String(propertyCount),
      change: propertyCount > 0 ? "Live from booking engine" : "No properties yet",
      icon: "Building2",
    },
    {
      label: "Primary Property",
      value: property?.city ?? "Not assigned",
      change: property ? property.country : "Waiting for backend data",
      icon: "MapPin",
    },
    {
      label: "Property Status",
      value: property?.isActive ? "Active" : "Unknown",
      change: property ? `Created ${formatDate(property.createdAt)}` : "No property available",
      icon: property?.isActive ? "Hotel" : "CircleAlert",
    },
  ];

  const infoRows = property
    ? [
        {
          title: "Property description",
          detail: property.description ?? "No description is stored for this property yet.",
          status: "Live",
        },
        {
          title: "Address",
          detail: `${property.address}, ${property.city}, ${property.country}`,
          status: "Live",
        },
        {
          title: "Property ID",
          detail: property.id,
          status: "Synced",
        },
      ]
    : [
        {
          title: "No property linked yet",
          detail: "The authenticated user does not currently own any properties in the booking-engine API.",
          status: "Waiting",
        },
        {
          title: "Dashboard modules",
          detail: "Availability, rates, alerts, and settings are still placeholder screens.",
          status: "Placeholder",
        },
      ];

  return (
    <main className="flex-1">
      <section className="rounded-[32px] border border-white bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Dashboard
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
              Welcome, {session.user.fullName}
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              This workspace now loads the authenticated user and owned properties from
              the booking-engine API. Placeholder modules remain for rates,
              availability, alerts, and settings.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <CalendarClock className="h-4 w-4 text-[var(--color-accent)]" />
            Session loaded from API
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          {statCards.map(({ label, value, change, icon: iconName }) => {
            const Icon = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
            return (
              <article
                key={label}
                className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,_#ffffff,_#f8fbfc)] p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                      {value}
                    </p>
                  </div>
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-emerald-600">
                  <ArrowUpRight className="h-4 w-4" />
                  {change}
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-[28px] border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">
                  Property snapshot
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Live property details for the authenticated account.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                <ChartNoAxesColumn className="h-4 w-4" />
                {property ? "Live data" : "Fallback"}
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Field</th>
                    <th className="px-4 py-3 font-medium">Value</th>
                    <th className="px-4 py-3 font-medium">State</th>
                  </tr>
                </thead>
                <tbody>
                  {infoRows.map((row) => (
                    <tr key={row.title} className="border-t border-slate-100">
                      <td className="px-4 py-4 font-medium text-slate-800">
                        {row.title}
                      </td>
                      <td className="px-4 py-4 text-slate-500">{row.detail}</td>
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-[var(--color-accent)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 p-5">
            <h3 className="text-lg font-semibold text-slate-950">
              Integration notes
            </h3>
            <ul className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
              <li className="rounded-2xl bg-slate-50 px-4 py-3">
                Authentication now uses the booking-engine API and stores backend-issued
                tokens in secure HTTP-only cookies.
              </li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">
                Profile and property details are fetched from <code>/auth/me</code> and{" "}
                <code>/properties/my</code> on each server request.
              </li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">
                {property
                  ? `Primary property synced on ${formatDateTime(property.createdAt)}.`
                  : "No property data is available for this account yet."}
              </li>
            </ul>
          </section>
        </div>

        {property ? (
          <section className="mt-6 rounded-[28px] border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <Coins className="h-5 w-5 text-[var(--color-accent)]" />
              <h3 className="text-lg font-semibold text-slate-950">
                Current property
              </h3>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Name
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {property.name}
                </p>
              </article>
              <article className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  City
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {property.city}
                </p>
              </article>
              <article className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Country
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {property.country}
                </p>
              </article>
              <article className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Status
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {property.isActive ? "Active" : "Inactive"}
                </p>
              </article>
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
