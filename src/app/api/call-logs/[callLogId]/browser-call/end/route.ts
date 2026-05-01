import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CallLogDirection } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  leadId: z.string().uuid(),
  status: z.enum(["completed", "failed", "ended"]).default("completed"),
  transcript: z.string().max(500_000).optional(),
  summary: z.string().max(20_000).optional().nullable(),
  vapiCallId: z.string().max(200).optional().nullable(),
  durationSeconds: z.number().int().min(0).max(86400).optional(),
});

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ callLogId: string }> },
) {
  const { callLogId } = await params;

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

    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json(
        { error: { code: "INVALID_JSON", message: "Request body must be JSON." } },
        { status: 400 },
      );
    }

    const parsed = bodySchema.safeParse(json);
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
    const existing = await prisma.callLog.findFirst({
      where: {
        id: callLogId,
        leadId: body.leadId,
        direction: CallLogDirection.OUTBOUND,
        status: { startsWith: "browser_test" },
      },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: { code: "CALL_LOG_NOT_FOUND", message: "Call log not found for this lead." } },
        { status: 404 },
      );
    }

    const endedAt = new Date();
    const dbStatus = body.status === "failed" ? "browser_test_failed" : "browser_test_completed";

    await prisma.callLog.update({
      where: { id: callLogId },
      data: {
        status: dbStatus,
        endedAt,
        transcript: body.transcript === undefined ? undefined : body.transcript,
        summary: body.summary === undefined ? undefined : body.summary,
        vapiCallId: body.vapiCallId === undefined ? undefined : body.vapiCallId,
        durationSeconds: body.durationSeconds === undefined ? undefined : body.durationSeconds,
      },
    });

    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json(
      { error: { code: "BROWSER_CALL_END_FAILED", message: "Could not update browser call log." } },
      { status: 500 },
    );
  }
}
