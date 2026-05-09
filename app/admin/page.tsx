import React from "react";
import { 
  Users, 
  Building2, 
  CreditCard, 
  TrendingUp,
  Activity
} from "lucide-react";
import { requireSession } from "@/lib/auth";
import { redirect } from "next/navigation";

async function getAdminStats(token: string) {
  const API_URL = process.env.BOOKING_ENGINE_API_URL ?? "https://booking-engine-vq7e.onrender.com";
  const res = await fetch(`${API_URL}/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 60 }
  });
  
  if (!res.ok) return null;
  return res.json();
}

export default async function AdminDashboardPage() {
  const session = await requireSession();
  
  if (!session.user.isSuperAdmin) {
    redirect("/dashboard");
  }

  const stats = await getAdminStats(session.accessToken);

  const statCards = [
    {
      title: "Total Users",
      value: stats?.total_users ?? "0",
      icon: Users,
      description: "Registered property owners"
    },
    {
      title: "Active Properties",
      value: stats?.total_properties ?? "0",
      icon: Building2,
      description: "Total hotels on platform"
    },
    {
      title: "Subscriptions",
      value: stats?.active_subscriptions ?? "0",
      icon: Activity,
      description: "Paying customers"
    },
    {
      title: "Est. Monthly Revenue",
      value: `$${(stats?.total_revenue ?? 0).toLocaleString()}`,
      icon: TrendingUp,
      description: "Gross revenue estimate"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">System Overview</h1>
        <p className="text-muted-foreground">Manage your platform and monitor growth.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.title} className="p-6 border rounded-xl bg-card shadow-sm flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-muted-foreground">{card.title}</span>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="border rounded-xl p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="text-sm text-muted-foreground italic">
            Activity logs coming soon...
          </div>
        </div>
        <div className="border rounded-xl p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Platform Health</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span>API Status</span>
              <span className="text-green-500 font-medium">Operational</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Database Latency</span>
              <span className="text-green-500 font-medium">12ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
