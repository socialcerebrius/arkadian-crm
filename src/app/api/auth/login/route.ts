import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionToken } from "@/lib/auth";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SEC } from "@/lib/auth-constants";
import {
  LEGACY_PASSWORD_HASH_PLACEHOLDER,
  SEED_USER_PASSWORD,
} from "@/lib/seed-auth";

const bodySchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(1)
    .transform((s) => s.trim()),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: "Invalid email or password." } },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        email: { equals: normalizedEmail, mode: "insensitive" },
        status: "active",
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: { message: "Invalid email or password." } },
        { status: 401 },
      );
    }

    let ok = await bcrypt.compare(password, user.passwordHash);

    if (
      !ok &&
      user.passwordHash === LEGACY_PASSWORD_HASH_PLACEHOLDER &&
      password === SEED_USER_PASSWORD
    ) {
      const newHash = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });
      ok = true;
    }

    if (!ok) {
      return NextResponse.json(
        { error: { message: "Invalid email or password." } },
        { status: 401 },
      );
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const res = NextResponse.json({
      data: { email: user.email, name: user.name },
    });

    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      // HTTP deployments (e.g. http://IP:3001): do not set secure. Use COOKIE_SECURE=true only behind HTTPS.
      secure: process.env.COOKIE_SECURE === "true",
      path: "/",
      maxAge: SESSION_MAX_AGE_SEC,
    });

    return res;
  } catch (e) {
    console.error("POST /api/auth/login", e);
    return NextResponse.json(
      { error: { message: "Login failed. Try again." } },
      { status: 500 },
    );
  }
}
