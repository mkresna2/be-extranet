"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Shield, Home, Terminal } from "lucide-react";

export function SettingsTabs() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "property";

  const tabs = [
    { id: "property", label: "Property Configuration", icon: Home },
    { id: "roles", label: "User Roles", icon: Shield },
    { id: "api", label: "API Settings", icon: Terminal },
  ];

  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <Link
            key={tab.id}
            href={`/dashboard/settings?tab=${tab.id}`}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-medium transition-all ${
              isActive
                ? "bg-[var(--color-accent)] text-white shadow-[0_12px_30px_rgba(11,76,94,0.15)]"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
