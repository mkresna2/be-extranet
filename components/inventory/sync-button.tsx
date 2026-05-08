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
        <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-white pr-4 shadow-sm transition-all hover:bg-slate-50">
          <span className="pointer-events-none inline-flex items-center pl-4 text-slate-500">
            <RefreshCcw className="h-4 w-4" />
          </span>
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
