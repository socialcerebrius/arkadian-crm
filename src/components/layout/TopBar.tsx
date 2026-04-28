export function TopBar() {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/85 backdrop-blur border-b border-light-grey">
      <div className="h-16 px-5 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="lg:hidden w-9 h-9 rounded-full bg-cream border border-light-grey" />
          <div className="text-navy font-semibold tracking-tight text-base sm:text-lg">
            The Arkadians Client Portfolio
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="h-9 rounded-full border border-light-grey text-medium-grey hover:text-navy hover:bg-cream transition-colors px-3 text-xs tracking-wide"
            aria-label="Briefings"
          >
            Briefings
          </button>
          <div
            className="w-9 h-9 rounded-full bg-cream border border-light-grey"
            aria-label="User"
          />
        </div>
      </div>
    </header>
  );
}

