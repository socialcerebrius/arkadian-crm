"use client";

type BarDatum = { label: string; value: number; hint?: string };
type DonutDatum = { label: string; value: number };
type LineDatum = { label: string; value: number };

function maxOf(values: number[]) {
  return values.reduce((m, v) => (v > m ? v : m), 0);
}

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-light-grey bg-white px-2.5 py-1 text-[11px] font-semibold text-medium-grey">
      {text}
    </span>
  );
}

export function MiniBarChart({ title, data }: { title: string; data: BarDatum[] }) {
  const max = Math.max(1, maxOf(data.map((d) => d.value)));
  return (
    <div className="rounded-xl border border-light-grey bg-white shadow-card p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="font-(--font-display) text-navy">{title}</div>
        <Badge text="Live" />
      </div>
      <div className="mt-4 space-y-3">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-3">
            <div className="w-28 text-xs text-medium-grey truncate">{d.label}</div>
            <div className="flex-1">
              <div className="h-2.5 rounded-full bg-cream border border-light-grey overflow-hidden">
                <div
                  className="h-full bg-[linear-gradient(90deg,rgba(212,175,55,0.30),rgba(212,175,55,0.90))]"
                  style={{ width: `${Math.round((d.value / max) * 100)}%` }}
                />
              </div>
            </div>
            <div className="w-10 text-right text-xs font-semibold text-navy">{d.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScoreDistribution({ hot, warm, cold }: { hot: number; warm: number; cold: number }) {
  const total = Math.max(1, hot + warm + cold);
  const hotPct = Math.round((hot / total) * 100);
  const warmPct = Math.round((warm / total) * 100);
  const coldPct = Math.max(0, 100 - hotPct - warmPct);
  return (
    <div className="rounded-xl border border-light-grey bg-white shadow-card p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="font-(--font-display) text-navy">Score Distribution</div>
        <Badge text="Live" />
      </div>
      <div className="mt-4 rounded-lg border border-light-grey bg-cream/30 p-4">
        <div className="h-3 rounded-full bg-white border border-light-grey overflow-hidden flex">
          <div className="h-full bg-success" style={{ width: `${hotPct}%` }} />
          <div className="h-full bg-gold" style={{ width: `${warmPct}%` }} />
          <div className="h-full bg-slate-400" style={{ width: `${coldPct}%` }} />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
          <div className="rounded-lg border border-light-grey bg-white px-3 py-2">
            <div className="text-medium-grey">Hot</div>
            <div className="mt-1 font-semibold text-navy">
              {hot} <span className="text-medium-grey font-medium">({hotPct}%)</span>
            </div>
          </div>
          <div className="rounded-lg border border-light-grey bg-white px-3 py-2">
            <div className="text-medium-grey">Warm</div>
            <div className="mt-1 font-semibold text-navy">
              {warm} <span className="text-medium-grey font-medium">({warmPct}%)</span>
            </div>
          </div>
          <div className="rounded-lg border border-light-grey bg-white px-3 py-2">
            <div className="text-medium-grey">Cold</div>
            <div className="mt-1 font-semibold text-navy">
              {cold} <span className="text-medium-grey font-medium">({coldPct}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MiniLineChart({
  title,
  subtitle,
  data,
}: {
  title: string;
  subtitle: string;
  data: LineDatum[];
}) {
  const max = Math.max(1, maxOf(data.map((d) => d.value)));
  const points = data
    .map((d, i) => {
      const x = (i / Math.max(1, data.length - 1)) * 100;
      const y = 100 - (d.value / max) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-xl border border-light-grey bg-white shadow-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-(--font-display) text-navy">{title}</div>
          <div className="mt-1 text-xs text-medium-grey">{subtitle}</div>
        </div>
        <Badge text="Projected" />
      </div>
      <div className="mt-4 rounded-lg border border-light-grey bg-cream/30 p-4">
        <svg viewBox="0 0 100 100" className="w-full h-24">
          <polyline
            fill="none"
            stroke="rgba(212,175,55,0.95)"
            strokeWidth="2"
            points={points}
          />
          <polyline
            fill="none"
            stroke="rgba(10,22,40,0.10)"
            strokeWidth="12"
            points={points}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
          {data.map((d) => (
            <div key={d.label} className="rounded-lg border border-light-grey bg-white px-3 py-2">
              <div className="text-medium-grey">{d.label}</div>
              <div className="mt-1 font-semibold text-navy">{d.value.toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

