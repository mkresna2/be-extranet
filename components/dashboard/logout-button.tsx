"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

export function LogoutButton({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        title={collapsed ? "Logout" : undefined}
        aria-label="Logout"
        className={`inline-flex h-11 items-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 ${
          collapsed ? "w-11 justify-center px-0" : "gap-2 px-4"
        }`}
      >
        <LogOut className="h-4 w-4" />
        {!collapsed ? "Logout" : null}
      </button>
    </form>
  );
}
