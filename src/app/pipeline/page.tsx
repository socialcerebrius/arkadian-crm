import Link from "next/link";
import { KanbanBoard } from "@/components/pipeline/KanbanBoard";

export default function PipelinePage() {
  return (
    <div className="px-5 sm:px-8 py-8">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="font-(--font-display) text-3xl sm:text-4xl text-navy tracking-tight">
              Sales Pipeline
            </h1>
            <p className="mt-2 text-medium-grey max-w-2xl">
              Manage active prospects and track high-value negotiations across
              the registry.
            </p>
          </div>
          <Link
            href="/leads/new"
            className="rounded px-5 py-3 text-xs font-semibold tracking-[0.2em] uppercase text-white bg-[linear-gradient(135deg,#0A1628,#1a2c4e)] hover:shadow-[0_4px_15px_rgba(10,22,40,0.30)] transition-shadow inline-block text-center"
          >
            Register Prospect
          </Link>
        </div>

        <div className="mt-8">
          <KanbanBoard />
        </div>
      </div>
    </div>
  );
}

