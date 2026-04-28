import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    data: {
      totalLeads: 147,
      hotLeads: 12,
      viewingsBooked: 8,
      conversionRate: 23.4,
      monthOverMonth: 12,
    },
  });
}

