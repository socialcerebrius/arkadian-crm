import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getLeadById } from "@/lib/demo-data";

const updateLeadSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  status: z
    .enum([
      "new",
      "contacted",
      "viewing_booked",
      "negotiating",
      "closed_won",
      "closed_lost",
    ])
    .optional(),
  budgetMin: z.number().int().nonnegative().optional().nullable(),
  budgetMax: z.number().int().nonnegative().optional().nullable(),
  preferredUnit: z
    .enum(["two_bed", "three_bed", "three_bed_large", "four_bed_duplex", "penthouse"])
    .optional()
    .nullable(),
  preferredView: z.enum(["sea", "golf", "city", "dual"]).optional().nullable(),
  urgency: z.enum(["low", "medium", "high", "immediate"]).optional(),
  notes: z.string().optional().nullable(),
});

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    if (!hasDatabase()) {
      const lead = getLeadById(id);
      if (!lead) {
        return NextResponse.json(
          { error: { code: "LEAD_NOT_FOUND", message: "Lead not found." } },
          { status: 404 },
        );
      }
      return NextResponse.json({ data: lead });
    }

    const lead = await prisma.lead.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        source: true,
        status: true,
        score: true,
        budgetMin: true,
        budgetMax: true,
        preferredUnit: true,
        preferredView: true,
        urgency: true,
        language: true,
        updatedAt: true,
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: { code: "LEAD_NOT_FOUND", message: "Lead not found." } },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: {
        id: lead.id,
        name: lead.name,
        phone: lead.phone ?? undefined,
        email: lead.email ?? undefined,
        source: lead.source,
        status: lead.status,
        score: lead.score,
        budgetLabel: budgetLabel(lead.budgetMin, lead.budgetMax),
        preferredUnit: lead.preferredUnit ?? undefined,
        preferredView: lead.preferredView ?? undefined,
        urgency: lead.urgency,
        language: lead.language,
        updatedLabel: "Recently",
      },
    });
  } catch {
    return NextResponse.json(
      { error: { code: "LEAD_GET_FAILED", message: "Unable to load lead." } },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    if (!hasDatabase()) {
      return NextResponse.json(
        {
          error: {
            code: "DATABASE_NOT_CONFIGURED",
            message: "DATABASE_URL is not configured for write operations.",
          },
        },
        { status: 501 },
      );
    }

    const json = await req.json();
    const parsed = updateLeadSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input.",
            details: parsed.error.flatten(),
          },
        },
        { status: 400 },
      );
    }

    const body = parsed.data;
    await prisma.lead.update({
      where: { id },
      data: {
        name: body.name,
        phone: body.phone === undefined ? undefined : body.phone,
        email: body.email === undefined ? undefined : body.email,
        status: body.status,
        budgetMin:
          body.budgetMin === undefined
            ? undefined
            : body.budgetMin === null
              ? null
              : BigInt(body.budgetMin),
        budgetMax:
          body.budgetMax === undefined
            ? undefined
            : body.budgetMax === null
              ? null
              : BigInt(body.budgetMax),
        preferredUnit: body.preferredUnit === undefined ? undefined : body.preferredUnit,
        preferredView: body.preferredView === undefined ? undefined : body.preferredView,
        urgency: body.urgency,
        notes: body.notes === undefined ? undefined : body.notes,
      },
    });

    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json(
      { error: { code: "LEAD_UPDATE_FAILED", message: "Unable to update lead." } },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    if (!hasDatabase()) {
      return NextResponse.json(
        {
          error: {
            code: "DATABASE_NOT_CONFIGURED",
            message: "DATABASE_URL is not configured for write operations.",
          },
        },
        { status: 501 },
      );
    }

    await prisma.lead.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json(
      { error: { code: "LEAD_DELETE_FAILED", message: "Unable to delete lead." } },
      { status: 500 },
    );
  }
}

function budgetLabel(min?: bigint | null, max?: bigint | null) {
  if (!min && !max) return "PKR —";
  const toCr = (n: bigint) => Number(n) / 10_000_000;
  const minCr = min ? toCr(min) : undefined;
  const maxCr = max ? toCr(max) : undefined;
  if (minCr != null && maxCr != null) return `PKR ${minCr.toFixed(0)}–${maxCr.toFixed(0)}Cr`;
  if (maxCr != null) return `Up to PKR ${maxCr.toFixed(0)}Cr`;
  return `From PKR ${minCr?.toFixed(0)}Cr`;
}

