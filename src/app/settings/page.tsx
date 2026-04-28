export default function SettingsPage() {
  return (
    <div className="px-5 sm:px-8 py-8">
      <div className="max-w-[1440px] mx-auto">
        <div>
          <h1 className="font-(--font-display) text-3xl sm:text-4xl text-navy tracking-tight">
            Settings
          </h1>
          <p className="mt-2 text-medium-grey max-w-2xl">
            Workspace preferences and account controls (Phase 1 placeholder).
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-light-grey bg-white shadow-card p-6">
          <div className="text-sm text-medium-grey">
            Settings content will be filled after auth is wired.
          </div>
        </div>
      </div>
    </div>
  );
}

