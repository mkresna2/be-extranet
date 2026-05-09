"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CreditCard, 
  ShieldCheck,
  Building2,
  Menu,
  X
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="flex items-center justify-between border-b bg-background px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2 font-bold text-lg">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span>Super Admin</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="rounded-md border p-2"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Admin Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-muted/30 p-6 flex flex-col gap-6 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="hidden lg:flex items-center gap-2 font-bold text-xl px-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span>Super Admin</span>
        </div>
        
        <nav className="flex flex-col gap-1">
          <Link 
            href="/admin" 
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
              pathname === "/admin" ? "bg-muted text-primary" : "hover:bg-muted"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </Link>
          <Link 
            href="/admin/billing" 
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
              pathname === "/admin/billing" ? "bg-muted text-primary" : "hover:bg-muted"
            }`}
          >
            <CreditCard className="h-4 w-4" />
            Billing & Plans
          </Link>
          <Link 
            href="/dashboard" 
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium mt-4 text-muted-foreground"
          >
            <Building2 className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 bg-background overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
