import React from "react";
import { 
  CreditCard, 
  Plus, 
  Settings2,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { requireSession } from "@/lib/auth";
import { redirect } from "next/navigation";

async function getPlans(token: string) {
  const API_URL = process.env.BOOKING_ENGINE_API_URL ?? "https://booking-engine-vq7e.onrender.com";
  const res = await fetch(`${API_URL}/admin/plans`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 0 }
  });
  if (!res.ok) return [];
  return res.json();
}

async function getSubscriptions(token: string) {
  const API_URL = process.env.BOOKING_ENGINE_API_URL ?? "https://booking-engine-vq7e.onrender.com";
  const res = await fetch(`${API_URL}/admin/subscriptions`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 0 }
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function AdminBillingPage() {
  const session = await requireSession();
  
  if (!session.user.isSuperAdmin) {
    redirect("/dashboard");
  }

  const [plans, subscriptions] = await Promise.all([
    getPlans(session.accessToken),
    getSubscriptions(session.accessToken)
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription Management</h1>
        <p className="text-muted-foreground">Define plans and manage user access.</p>
      </div>

      {/* Subscription Plans Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Subscription Plans</h2>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90">
            <Plus className="h-4 w-4" />
            Create Plan
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.length === 0 ? (
            <div className="col-span-3 border-2 border-dashed rounded-xl p-12 text-center text-muted-foreground">
              No plans defined yet.
            </div>
          ) : (
            plans.map((plan: any) => (
              <div key={plan.id} className="border rounded-xl p-6 bg-card flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  {plan.is_active ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="text-3xl font-bold">${plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                <ul className="text-sm space-y-2 mt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Up to {plan.max_properties} properties
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Up to {plan.max_rooms} rooms
                  </li>
                </ul>
                <button className="mt-auto w-full border py-2 rounded-md text-sm font-medium hover:bg-muted">
                  Edit Plan
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Active Subscriptions Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">User Subscriptions</h2>
        <div className="border rounded-xl overflow-hidden bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b font-medium text-muted-foreground">
              <tr>
                <th className="px-6 py-3">User ID</th>
                <th className="px-6 py-3">Plan</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Started</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No active user subscriptions found.
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub: any) => (
                  <tr key={sub.id}>
                    <td className="px-6 py-4 font-mono text-xs">{sub.user_id}</td>
                    <td className="px-6 py-4">{sub.plan_id}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${sub.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {sub.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{new Date(sub.start_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary hover:underline">Manage</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
