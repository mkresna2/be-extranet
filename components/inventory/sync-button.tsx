"use client";

import { useActionState } from "react";
import { RefreshCcw } from "lucide-react";
import { syncAvailability } from "@/app/actions/inventory";
import { SubmitButton } from "@/components/auth/submit-button";

const initialInventoryState = {
  status: "idle" as const,
};

type SyncButtonProps = {
  idleLabel?: string;
  pendingLabel?: string;
};

export function SyncButton({
  idleLabel = "Update from Channel Manager",
  pendingLabel = "Updating...",
}: SyncButtonProps) {
  const [state, formAction] = useActionState(
    syncAvailability,
    initialInventoryState,
  );

  return (
    <div className="space-y-3">
      <form action={formAction}>
        <div className="flex w-full flex-col gap-3 sm:inline-flex sm:w-auto sm:flex-row sm:items-center sm:rounded-2xl sm:border sm:border-slate-200 sm:bg-white sm:pr-4 sm:shadow-sm sm:transition-all sm:hover:bg-slate-50">
          <div className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-500 shadow-sm sm:w-auto sm:justify-start sm:rounded-none sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:shadow-none">
            <RefreshCcw className="h-4 w-4" />
            <span className="sm:hidden">Sync inventory first</span>
          </div>
          <SubmitButton
            idleLabel={idleLabel}
            pendingLabel={pendingLabel}
          />
        </div>
      </form>

      {state.message ? (
        <p
          className={`max-w-md rounded-2xl px-4 py-3 text-sm ${
            state.status === "error"
              ? "bg-rose-50 text-rose-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
          role={state.status === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
