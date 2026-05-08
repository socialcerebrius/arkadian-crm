import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function roleIsAdmin(role: string | null | undefined) {
  return (role ?? "").toLowerCase() === "admin";
}

const bodySchema = z.object({
  leadId: z.string().uuid(),
  unitId: z.string().uuid(),
  status: z.enum([
    "available",
    "interested",
    "viewing",
    "deposit_secured",
    "payment_secured",
    "sold_assigned",
  ]),
  customerName: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  if (!hasDatabase()) {
    return NextResponse.json(
      { error: { code: "DB_NOT_CONFIGURED", message: "Database is not configured." } },
      { status: 503 },
    );
  }

  const session = await getSession();
  if (!session || !roleIsAdmin(session.role)) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Admin access required." } },
      { status: 403 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid inventory assignment payload." } },
      { status: 400 },
    );
  }

  const { leadId, unitId, status, customerName, notes } = parsed.data;

  try {
    const lead = await prisma.lead.findFirst({
      where: { id: leadId, deletedAt: null },
      select: { id: true, name: true },
    });
    if (!lead) {
      return NextResponse.json(
        { error: { code: "LEAD_NOT_FOUND", message: "Lead not found." } },
        { status: 404 },
      );
    }

    const unit = await prisma.inventoryUnit.findFirst({
      where: { id: unitId },
      select: { id: true, flatNumber: true, tower: true, type: true, viewCategory: true },
    });
    if (!unit) {
      return NextResponse.json(
        { error: { code: "UNIT_NOT_FOUND", message: "Inventory unit not found." } },
        { status: 404 },
      );
    }

    const effectiveCustomerName = (customerName ?? "").trim() || lead.name;

    // Enforce single flat per lead for now: unassign any other units linked to this lead.
    await prisma.$transaction([
      prisma.inventoryUnit.updateMany({
        where: { leadId, NOT: { id: unitId } },
        data: { leadId: null, status: "available", customerName: null, statusAt: new Date() },
      }),
      prisma.inventoryUnit.update({
        where: { id: unitId },
        data: {
          leadId: status === "available" ? null : leadId,
          status,
          customerName: status === "available" ? null : effectiveCustomerName,
          notes: notes ?? undefined,
          statusAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({ data: { ok: true } });
  } catch (e) {
    console.error("POST /api/inventory/assign", e);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Could not update inventory assignment." } },
      { status: 500 },
    );
  }
}

