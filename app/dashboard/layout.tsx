import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import {
  BarChart3,
  BellDot,
  CalendarRange,
  ClipboardList,
  Hotel,
  LayoutDashboard,
  Settings2,
} from "lucide-react";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { SidebarLink } from "@/components/dashboard/sidebar-link";
import { getSession } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const propertyTitle = session.currentProperty?.name ?? "No property assigned";

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6">
        <aside className="flex w-full flex-col justify-between rounded-[32px] bg-[linear-gradient(180deg,_#0b4c5e,_#0a3441)] p-6 text-white shadow-[0_24px_80px_rgba(11,76,94,0.25)] lg:w-80">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <Hotel className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-50/65">
                  BE Extranet
                </p>
                <h1 className="mt-2 text-xl font-semibold">{propertyTitle}</h1>
              </div>
            </div>

            <nav className="space-y-2">
              <SidebarLink href="/dashboard" label="Dashboard" icon={LayoutDashboard} />
              <SidebarLink href="/dashboard/bookings" label="Bookings" icon={ClipboardList} />
              <SidebarLink href="/dashboard/availability" label="Availability" icon={CalendarRange} />
              <SidebarLink href="/dashboard/rates" label="Rates" icon={BarChart3} />
              <SidebarLink href="/dashboard/alerts" label="Alerts" icon={BellDot} />
              <SidebarLink href="/dashboard/settings" label="Settings" icon={Settings2} />
            </nav>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/8 p-4">
            <p className="text-sm font-semibold">{session.user.fullName}</p>
            <p className="mt-1 text-sm text-cyan-50/70">{session.user.email}</p>
            <div className="mt-4">
              <LogoutButton />
            </div>
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
