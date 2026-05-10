"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Hotel, Menu, X } from "lucide-react";
import type { AuthSession } from "@/lib/auth";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { SidebarLink } from "@/components/dashboard/sidebar-link";
import { PropertySwitcher } from "@/components/dashboard/property-switcher";

export default function DashboardLayoutClient({
  children,
  session,
}: {
  children: ReactNode;
  session: AuthSession;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const navigation = [
    { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
    { href: "/dashboard/bookings", label: "Bookings", icon: "ClipboardList" },
    { href: "/dashboard/room-types", label: "Room Types", icon: "Hotel" },
    { href: "/dashboard/rate-plans", label: "Rate Plans", icon: "CalendarRange" },
    { href: "/dashboard/availability", label: "Availability", icon: "CalendarRange" },
    { href: "/dashboard/rates", label: "Rates", icon: "BarChart3" },
    { href: "/dashboard/guests", label: "Guests", icon: "ClipboardList" },
    { href: "/dashboard/webhooks", label: "Webhooks", icon: "Settings2" },
    { href: "/dashboard/alerts", label: "Alerts", icon: "BellDot" },
    { href: "/dashboard/settings", label: "Settings", icon: "Settings2" },
    { href: "/dashboard/dev", label: "Dev Tools", icon: "ClipboardList" },
  ];

  if (session?.user?.isSuperAdmin) {
    navigation.push({ href: "/admin", label: "Super Admin", icon: "ShieldCheck" });
  }

  if (!session?.user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-slate-950">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-[var(--color-accent)] px-4 py-3 text-white lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            <Hotel className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold tracking-wider uppercase">BE Extranet</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen((value) => !value)}
          className="rounded-lg bg-white/10 p-2"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1600px] flex-col gap-6 p-2 sm:p-4 lg:min-h-screen lg:flex-row lg:p-6">
        {/* Sidebar Backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[280px] transform flex-col justify-between bg-[linear-gradient(180deg,_#0b4c5e,_#0a3441)] p-6 text-white transition-all duration-300 ease-in-out lg:static lg:translate-x-0 lg:rounded-[32px] lg:shadow-[0_24px_80px_rgba(11,76,94,0.25)] ${
            isSidebarCollapsed ? "lg:w-[112px]" : "lg:w-80"
          } ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="space-y-8 overflow-y-auto">
            <div className="space-y-4">
              <div className={`hidden items-center lg:flex ${isSidebarCollapsed ? "justify-center" : "justify-between"}`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <Hotel className="h-6 w-6" />
                </div>
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed((value) => !value)}
                  className="rounded-2xl border border-white/10 bg-white/10 p-2 text-cyan-50 transition hover:bg-white/15"
                  aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                  title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {isSidebarCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div>
                <p
                  className={`hidden text-xs uppercase tracking-[0.24em] text-cyan-50/65 lg:block ${
                    isSidebarCollapsed ? "text-center" : ""
                  }`}
                >
                  BE Extranet
                </p>
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-2 transition-colors hover:bg-white/10">
                  <PropertySwitcher
                    properties={session.properties}
                    currentProperty={session.currentProperty}
                    collapsed={isSidebarCollapsed}
                  />
                </div>
              </div>
            </div>

            <nav className="space-y-1 pb-4">
              {navigation.map((link) => (
                <SidebarLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  iconName={link.icon}
                  collapsed={isSidebarCollapsed}
                  onNavigate={() => setIsSidebarOpen(false)}
                />
              ))}
            </nav>
          </div>

          <div
            className={`mt-auto rounded-3xl border border-white/10 bg-white/5 p-4 ${
              isSidebarCollapsed ? "flex flex-col items-center" : ""
            }`}
          >
            {!isSidebarCollapsed ? (
              <>
                <p className="truncate text-sm font-semibold">{session.user?.fullName ?? "User"}</p>
                <p className="mt-1 truncate text-xs text-cyan-50/70">{session.user?.email ?? ""}</p>
              </>
            ) : null}
            <div className={isSidebarCollapsed ? "mt-0" : "mt-4"}>
              <LogoutButton collapsed={isSidebarCollapsed} />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex flex-1 flex-col min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
