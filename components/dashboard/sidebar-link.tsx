"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

type SidebarLinkProps = {
  href: string;
  label: string;
  iconName: string;
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function SidebarLink({
  href,
  label,
  iconName,
  collapsed = false,
  onNavigate,
}: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  const Icon =
    (LucideIcons[iconName as keyof typeof LucideIcons] as LucideIcon | undefined) ??
    LucideIcons.HelpCircle;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      aria-label={label}
      className={`flex items-center rounded-2xl text-sm font-medium transition ${
        isActive
          ? "bg-[var(--color-accent)] text-white shadow-[0_18px_40px_rgba(11,76,94,0.25)]"
          : "text-slate-600 hover:bg-white hover:text-slate-900"
      } ${collapsed ? "justify-center px-3 py-3" : "gap-3 px-4 py-3"}`}
    >
      <Icon className="h-4 w-4" />
      {!collapsed ? label : null}
    </Link>
  );
}
