export default function SettingsPage() {
  return (
    <main className="flex-1 rounded-[32px] border border-white bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <p className="text-sm font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
        Settings
      </p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
        Extranet settings
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
        Placeholder page for user roles, property configuration, and future API connection settings.
      </p>
    </main>
  );
}
