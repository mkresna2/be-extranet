import React from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings,
  ShieldCheck,
  Building2,
  DollarSign
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r bg-muted/30 p-6 flex flex-col gap-6">
        <div className="flex items-center gap-2 font-bold text-xl px-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span>Super Admin</span>
        </div>
        
        <nav className="flex flex-col gap-1">
          <Link 
            href="/admin" 
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium"
          >
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </Link>
          <Link 
            href="/admin/billing" 
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium"
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
      <main className="flex-1 p-8 bg-background">
        {children}
      </main>
    </div>
  );
}
