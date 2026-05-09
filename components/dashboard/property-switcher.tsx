"use client";

import { useTransition } from "react";
import { ChevronDown, Hotel } from "lucide-react";
import type { AuthProperty } from "@/lib/auth";
import { setActiveProperty } from "@/app/actions/auth";

type PropertySwitcherProps = {
  properties: AuthProperty[];
  currentProperty: AuthProperty | null;
};

export function PropertySwitcher({
  properties,
  currentProperty,
}: PropertySwitcherProps) {
  const [isPending, startTransition] = useTransition();

  if (properties.length <= 1) {
    return (
      <div className="flex items-center gap-3 px-1 py-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
          <Hotel className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            {currentProperty?.name ?? "No property"}
          </p>
          <p className="truncate text-xs text-cyan-50/60">
            {currentProperty?.city ?? "Owner"}
          </p>
        </div>
      </div>
    );
  }

  const handleSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    startTransition(async () => {
      await setActiveProperty(id);
    });
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-3 px-1 py-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
          <Hotel className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1 pr-6">
          <p className="truncate text-sm font-semibold text-white">
            {currentProperty?.name}
          </p>
          <p className="truncate text-xs text-cyan-50/60">
            {currentProperty?.city}
          </p>
        </div>
        <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-50/40" />
      </div>
      <select
        value={currentProperty?.id ?? ""}
        onChange={handleSwitch}
        disabled={isPending}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
      >
        {properties.map((p) => (
          <option key={p.id} value={p.id} className="text-slate-900">
            {p.name}
          </option>
        ))}
      </select>
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/10">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      )}
    </div>
  );
}
