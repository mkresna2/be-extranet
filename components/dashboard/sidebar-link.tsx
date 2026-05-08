"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as LucideIcons from "lucide-react";

type SidebarLinkProps = {
  href: string;
  label: string;
  iconName: string;
};

export function SidebarLink({
  href,
  label,
  iconName,
}: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  // Dynamically get the icon component from Lucide
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
        isActive
          ? "bg-[var(--color-accent)] text-white shadow-[0_18px_40px_rgba(11,76,94,0.25)]"
          : "text-slate-600 hover:bg-white hover:text-slate-900"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
