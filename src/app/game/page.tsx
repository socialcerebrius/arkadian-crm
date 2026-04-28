import { ResidenceSelector } from "@/components/game/ResidenceSelector";

export default function GamePage() {
  return (
    <div className="px-5 sm:px-8 py-8">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-end justify-between gap-6">
          <div>
          <h1 className="font-(--font-display) text-3xl sm:text-4xl text-navy tracking-tight">
            Buyer Game
          </h1>
          <p className="mt-2 text-medium-grey max-w-2xl">
            Internal view of completed sessions and AI recommendations.
          </p>
          </div>
          <button
            type="button"
            className="rounded px-5 py-3 text-xs font-semibold tracking-[0.2em] uppercase text-white bg-[linear-gradient(135deg,#0A1628,#1a2c4e)] hover:shadow-[0_4px_15px_rgba(10,22,40,0.30)] transition-shadow"
          >
            New Session
          </button>
        </div>

        <div className="mt-8">
          <ResidenceSelector />
        </div>
      </div>
    </div>
  );
}

