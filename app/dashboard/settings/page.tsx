import { Shield, Key, Webhook, Building2 } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { PropertyForm } from "@/components/settings/property-form";

import { CreatePropertyDialog } from "@/components/settings/create-property-dialog";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await requireSession();
  const { tab = "property" } = await searchParams;

  return (
    <main className="flex-1 space-y-6">
      <section className="rounded-[32px] border border-white bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Account & Property
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
              Settings
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              Manage your property configuration, team roles, and external API
              connections.
            </p>
          </div>
          {tab === "property" && <CreatePropertyDialog />}
        </div>

        <div className="mt-6 space-y-8">
          <SettingsTabs />

          {tab === "property" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">
                    Property Configuration
                  </h3>
                  <p className="text-sm text-slate-500">
                    Details used for the booking engine and channel manager.
                  </p>
                </div>
              </div>

              {session.currentProperty ? (
                <PropertyForm property={session.currentProperty} />
              ) : (
                <div className="rounded-3xl bg-slate-50 p-8 text-center italic text-slate-500">
                  No primary property found for this account.
                </div>
              )}
            </div>
          )}

          {tab === "roles" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">
                    User Roles
                  </h3>
                  <p className="text-sm text-slate-500">
                    Manage team permissions and access levels.
                  </p>
                </div>
              </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 hidden md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 font-medium">Users</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-4 py-4 font-semibold text-slate-900">Owner</td>
                      <td className="px-4 py-4 text-slate-500">Full administrative access to property and billing.</td>
                      <td className="px-4 py-4 text-slate-500">1</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 font-semibold text-slate-900">Manager</td>
                      <td className="px-4 py-4 text-slate-500">Can manage rates, availability, and bookings.</td>
                      <td className="px-4 py-4 text-slate-500">0</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 font-semibold text-slate-900">Staff</td>
                      <td className="px-4 py-4 text-slate-500">View-only access to bookings and guest lists.</td>
                      <td className="px-4 py-4 text-slate-500">0</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Mobile Role Cards */}
              <div className="space-y-4 md:hidden">
                {[
                  { role: "Owner", desc: "Full administrative access to property and billing.", users: 1 },
                  { role: "Manager", desc: "Can manage rates, availability, and bookings.", users: 0 },
                  { role: "Staff", desc: "View-only access to bookings and guest lists.", users: 0 },
                ].map((item) => (
                  <div key={item.role} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                      <p className="font-bold text-slate-900">{item.role}</p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {item.users} Users
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "api" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                    <Key className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">
                      API Keys
                    </h3>
                    <p className="text-sm text-slate-500">
                      Keys for programmatic access to the booking engine.
                    </p>
                  </div>
                </div>
                <div className="rounded-3xl bg-slate-50 p-8 text-center border-2 border-dashed border-slate-200">
                   <p className="text-sm text-slate-500 font-medium">API key management coming soon.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                    <Webhook className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">
                      Webhooks
                    </h3>
                    <p className="text-sm text-slate-500">
                      Configure endpoints for event notifications.
                    </p>
                  </div>
                </div>
                <div className="rounded-3xl bg-slate-50 p-8 text-center border-2 border-dashed border-slate-200">
                   <p className="text-sm text-slate-500 font-medium">Webhook configuration coming soon.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
