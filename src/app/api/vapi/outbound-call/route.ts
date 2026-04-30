import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CallLogDirection, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60;

const VAPI_CALL_URL = "https://api.vapi.ai/call";

const bodySchema = z.object({
  leadId: z.string().uuid(),
});

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function vapiEnvMissing(): string[] {
  const missing: string[] = [];
  if (!process.env.VAPI_PRIVATE_KEY?.trim()) missing.push("VAPI_PRIVATE_KEY");
  if (!process.env.VAPI_PHONE_NUMBER_ID?.trim()) missing.push("VAPI_PHONE_NUMBER_ID");
  if (!process.env.VAPI_ASSISTANT_ID?.trim()) missing.push("VAPI_ASSISTANT_ID");
  return missing;
}

function normalizeCustomerPhone(raw: string): string {
  return raw.trim();
}

type VapiCreateCallResponse = {
  id?: string;
  message?: string;
  error?: string;
};

export async function POST(req: NextRequest) {
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

    const missingEnv = vapiEnvMissing();
    if (missingEnv.length > 0) {
      return NextResponse.json(
        {
          error: {
            code: "VAPI_NOT_CONFIGURED",
            message: `Missing required environment variables: ${missingEnv.join(", ")}.`,
          },
        },
        { status: 503 },
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

    const { leadId } = parsed.data;

    const lead = await prisma.lead.findFirst({
      where: { id: leadId, deletedAt: null },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: { code: "LEAD_NOT_FOUND", message: "Lead not found." } },
        { status: 404 },
      );
    }

    const phone = lead.phone != null ? normalizeCustomerPhone(lead.phone) : "";
    if (!phone) {
      return NextResponse.json(
        {
          error: {
            code: "LEAD_NO_PHONE",
            message: "Lead has no phone number; cannot place outbound call.",
          },
        },
        { status: 400 },
      );
    }

    const startedAt = new Date();

    const callLog = await prisma.callLog.create({
      data: {
        leadId: lead.id,
        direction: CallLogDirection.OUTBOUND,
        status: "initiated",
        startedAt,
      },
    });

    const privateKey = process.env.VAPI_PRIVATE_KEY!.trim();
    const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID!.trim();
    const assistantId = process.env.VAPI_ASSISTANT_ID!.trim();

    const emailStr = lead.email ?? "";
    const variableValues: Record<string, string> = {
      leadId: lead.id,
      callLogId: callLog.id,
      name: lead.name,
      phone,
      email: emailStr,
      // Lead model has no company field; pass empty string for assistant templates / tools.
      company: "",
    };

    const vapiPayload = {
      assistantId,
      phoneNumberId,
      customer: {
        number: phone,
        name: lead.name,
        ...(lead.email ? { email: lead.email } : {}),
      },
      assistantOverrides: {
        variableValues,
      },
    };

    const vapiRes = await fetch(VAPI_CALL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${privateKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vapiPayload),
    });

    const vapiText = await vapiRes.text();
    let vapiJson: VapiCreateCallResponse | null = null;
    try {
      vapiJson = vapiText ? (JSON.parse(vapiText) as VapiCreateCallResponse) : null;
    } catch {
      vapiJson = null;
    }

    if (!vapiRes.ok) {
      const detail =
        vapiJson?.message ??
        vapiJson?.error ??
        (vapiText ? vapiText.slice(0, 500) : `HTTP ${vapiRes.status}`);
      await prisma.callLog.update({
        where: { id: callLog.id },
        data: {
          status: "failed",
          outcome: detail.slice(0, 500),
        },
      });
      return NextResponse.json(
        {
          error: {
            code: "VAPI_CALL_FAILED",
            message: "Vapi rejected the outbound call request.",
            details: detail,
          },
        },
        { status: 502 },
      );
    }

    const vapiCallId = vapiJson?.id;
    if (!vapiCallId || typeof vapiCallId !== "string") {
      await prisma.callLog.update({
        where: { id: callLog.id },
        data: {
          status: "failed",
          outcome: "Vapi response missing call id.",
        },
      });
      return NextResponse.json(
        {
          error: {
            code: "VAPI_INVALID_RESPONSE",
            message: "Vapi did not return a call id.",
          },
        },
        { status: 502 },
      );
    }

    await prisma.callLog.update({
      where: { id: callLog.id },
      data: { vapiCallId },
    });

    return NextResponse.json({
      data: {
        callLogId: callLog.id,
        vapiCallId,
      },
    });
  } catch (e) {
    console.error("POST /api/vapi/outbound-call", e);

    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2021") {
        return NextResponse.json(
          {
            error: {
              code: "TABLE_MISSING",
              message:
                "Database tables are missing. Run: npx prisma migrate deploy (or prisma db push) with your DATABASE_URL.",
            },
          },
          { status: 503 },
        );
      }
    }

    if (e instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        {
          error: {
            code: "DB_UNREACHABLE",
            message: "Cannot reach the database. Check DATABASE_URL and network.",
          },
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error: {
          code: "OUTBOUND_CALL_FAILED",
          message: "Unable to start outbound call.",
        },
      },
      { status: 500 },
    );
  }
}
