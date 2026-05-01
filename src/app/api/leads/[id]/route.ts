import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getLeadDetailById } from "@/lib/get-lead-detail";

const updateLeadSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  source: z
    .enum([
      "website_voice",
      "website_form",
      "website_game",
      "phone",
      "referral",
      "broker",
      "walk_in",
      "social_media",
    ])
    .optional(),
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
  language: z.string().max(10).optional(),
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
    const lead = await getLeadDetailById(id);
    if (!lead) {
      return NextResponse.json(
        { error: { code: "LEAD_NOT_FOUND", message: "Lead not found." } },
        { status: 404 },
      );
    }
    return NextResponse.json({ data: lead });
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
        source: body.source,
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
        language: body.language,
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

