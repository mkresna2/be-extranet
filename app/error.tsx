"use client";

import { useEffect } from "react";

type AppError = Error & {
  digest?: string;
};

export default function AppError({
  error,
  reset,
}: {
  error: AppError;
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] route error", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,_#f3f7f8,_#fff8ee)] px-6 py-12">
      <div className="w-full max-w-lg rounded-[32px] border border-white bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
          Render error
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          The page could not finish rendering.
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Check the server logs for the auth/session payload details.
        </p>
        {error.digest ? (
          <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 font-mono text-sm text-slate-600">
            Digest: {error.digest}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 rounded-2xl bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-strong)]"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
