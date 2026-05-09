import { Webhook } from "lucide-react";
import { getSession } from "@/lib/auth";

const API_BASE_URL =
  process.env.BOOKING_ENGINE_API_URL || "https://booking-engine-vq7e.onrender.com";

async function getWebhooks() {
  const session = await getSession();
  if (!session) return [];
  
  try {
    const response = await fetch(`${API_BASE_URL}/webhooks/`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to fetch webhooks:", error);
    return [];
  }
}

export default async function WebhooksPage() {
  const rawWebhooks = await getWebhooks();
  const webhooks = Array.isArray(rawWebhooks) ? rawWebhooks : [];

  return (
    <main className="flex-1 space-y-6">
      <section className="rounded-[32px] border border-white bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="space-y-2 border-b border-slate-100 pb-6">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">Developers</p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Webhooks</h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-500">Manage external notifications and integrations.</p>
        </div>

        <div className="mt-6">
          {webhooks.length > 0 ? (
            <div className="overflow-hidden rounded-3xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">URL</th>
                    <th className="px-4 py-3 font-medium">Events</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {webhooks.map((hook: any) => (
                    <tr key={hook.id}>
                      <td className="px-4 py-4 font-mono text-xs text-slate-600">{hook.url}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {hook.events?.map((e: string) => (
                            <span key={e} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                              {e}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${hook.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {hook.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-3xl bg-slate-50 py-12 text-center">
              <Webhook className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No webhooks configured</h3>
              <p className="mt-2 text-slate-500">Add a webhook to receive real-time updates for bookings and payments.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
