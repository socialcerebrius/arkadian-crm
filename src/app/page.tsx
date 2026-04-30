import { MobileNav } from "@/components/layout/MobileNav";
import { StatCard } from "@/components/dashboard/StatCard";
import { HotLeadsList } from "@/components/dashboard/HotLeadsList";
import { RecentCalls } from "@/components/dashboard/RecentCalls";
import { AIRecommendations } from "@/components/dashboard/AIRecommendations";
import { TargetGraph } from "@/components/dashboard/TargetGraph";
import Link from "next/link";
import Image from "next/image";
import {
  Activity,
  Flame,
  PieChart,
  Users,
} from "lucide-react";
import type { DemoCall, DemoLead } from "@/lib/demo-data";
import { headers } from "next/headers";

type DashboardStats = {
  totalLeads: number;
  hotLeads: number;
  viewingsBooked: number;
  conversionRate: number;
  monthOverMonth: number;
};

type PipelineCounts = {
  new: number;
  contacted: number;
  viewing_booked: number;
  negotiating: number;
  closed_won: number;
  closed_lost: number;
};

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (!host) return "http://localhost:3000";
  return `${proto}://${host}`;
}

async function getDashboardHotLeads(baseUrl: string): Promise<DemoLead[]> {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const res = await fetch(`${baseUrl}/api/dashboard/hot-leads`, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
  });
  if (!res.ok) return [];
  const json: unknown = await res.json();
  const data =
    json && typeof json === "object" && "data" in json ? (json as { data?: unknown }).data : null;
  return Array.isArray(data) ? (data as DemoLead[]) : [];
}

async function getDashboardRecentCalls(baseUrl: string): Promise<DemoCall[]> {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const res = await fetch(`${baseUrl}/api/dashboard/recent-calls`, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
  });
  if (!res.ok) return [];
  const json: unknown = await res.json();
  const data =
    json && typeof json === "object" && "data" in json ? (json as { data?: unknown }).data : null;
  return Array.isArray(data) ? (data as DemoCall[]) : [];
}

async function getPipelineCounts(baseUrl: string): Promise<PipelineCounts | null> {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const res = await fetch(`${baseUrl}/api/dashboard/pipeline-counts`, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
  });
  if (!res.ok) return null;
  const json: unknown = await res.json();
  const data =
    json && typeof json === "object" && "data" in json ? (json as { data?: unknown }).data : null;
  if (!data || typeof data !== "object") return null;
  const d = data as Partial<PipelineCounts>;
  return {
    new: Number(d.new ?? 0),
    contacted: Number(d.contacted ?? 0),
    viewing_booked: Number(d.viewing_booked ?? 0),
    negotiating: Number(d.negotiating ?? 0),
    closed_won: Number(d.closed_won ?? 0),
    closed_lost: Number(d.closed_lost ?? 0),
  };
}

async function getDashboardStats(baseUrl: string): Promise<DashboardStats | null> {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const res = await fetch(`${baseUrl}/api/dashboard/stats`, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
  });
  if (!res.ok) return null;
  const json: unknown = await res.json();
  const data =
    json && typeof json === "object" && "data" in json ? (json as { data?: unknown }).data : null;
  if (!data || typeof data !== "object") return null;
  const d = data as Partial<DashboardStats>;
  return {
    totalLeads: Number(d.totalLeads ?? 0),
    hotLeads: Number(d.hotLeads ?? 0),
    viewingsBooked: Number(d.viewingsBooked ?? 0),
    conversionRate: Number(d.conversionRate ?? 0),
    monthOverMonth: Number(d.monthOverMonth ?? 0),
  };
}

export default async function Home() {
  const baseUrl = await getBaseUrl();
  const [stats, hotLeads, recentCalls, pipelineCounts] = await Promise.all([
    getDashboardStats(baseUrl),
    getDashboardHotLeads(baseUrl),
    getDashboardRecentCalls(baseUrl),
    getPipelineCounts(baseUrl),
  ]);

  return (
    <div className="px-5 sm:px-8 py-8">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/arkadians-clearlogo-alpha.png"
                alt="The Arkadians"
                width={520}
                height={180}
                priority
                className="h-12 w-auto"
              />
            </div>
            <div className="text-xs tracking-[0.2em] uppercase text-medium-grey">
              Private Dashboard
            </div>
            <h1 className="mt-2 font-(--font-display) text-4xl sm:text-5xl text-navy tracking-tight">
              Good morning, Ahmad
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <MobileNav />
            <Link
              href="/leads/new"
              className="rounded px-5 py-3 text-xs font-semibold tracking-[0.2em] uppercase text-white bg-[linear-gradient(135deg,#0A1628,#1a2c4e)] hover:shadow-[0_4px_15px_rgba(10,22,40,0.30)] transition-shadow"
            >
              Register Prospect
            </Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Leads"
            value={stats?.totalLeads ?? 0}
            change={stats?.monthOverMonth ?? 0}
            trend="up"
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            title="Hot Leads"
            value={stats?.hotLeads ?? 0}
            change={0}
            trend="up"
            icon={<Flame className="w-5 h-5" />}
          />
          <StatCard
            title="Viewings Booked"
            value={stats?.viewingsBooked ?? 0}
            change={0}
            trend="up"
            icon={<Activity className="w-5 h-5" />}
          />
          <StatCard
            title="Conversion Rate"
            value={`${(stats?.conversionRate ?? 0).toFixed(1)}%`}
            change={0}
            trend="up"
            icon={<PieChart className="w-5 h-5" />}
          />
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <HotLeadsList leads={hotLeads} />
          </div>
          <div className="lg:col-span-5">
            <RecentCalls calls={recentCalls} />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <AIRecommendations />
          </div>
          <div className="lg:col-span-7 flex flex-col gap-6">
            <TargetGraph />
            <div className="rounded-lg border border-gold/20 bg-white shadow-[0_4px_24px_rgba(10,22,40,0.02)] p-8">
              <div className="flex items-center justify-between gap-6">
                <div className="font-(--font-display) text-navy text-lg">
                  Pipeline Overview
                </div>
                <Link
                  href="/pipeline"
                  className="text-xs font-semibold tracking-[0.2em] uppercase text-gold hover:text-navy transition-colors"
                >
                  View Full Funnel
                </Link>
              </div>

              <div className="mt-6 flex items-center justify-between relative pt-4 pb-2">
                <div className="absolute top-1/2 left-0 w-full h-px bg-light-grey/80 -translate-y-1/2" />
                {[
                  { label: "New", value: pipelineCounts?.new ?? 0 },
                  { label: "Contacted", value: pipelineCounts?.contacted ?? 0 },
                  { label: "Viewing", value: pipelineCounts?.viewing_booked ?? 0 },
                  { label: "Negotiating", value: pipelineCounts?.negotiating ?? 0 },
                  { label: "Won", value: pipelineCounts?.closed_won ?? 0 },
                ].map((stage) => (
                  <div
                    key={stage.label}
                    className="relative bg-white px-4 flex flex-col items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center border border-light-grey text-navy font-medium">
                      {stage.value}
                    </div>
                    <div className="text-xs tracking-[0.2em] uppercase text-medium-grey">
                      {stage.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
