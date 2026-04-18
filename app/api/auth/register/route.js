import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const body = await request.json();
    const emailRaw = body.email;
    const password = body.password;
    const name = typeof body.name === "string" ? body.name.trim() : "";

    const email =
      typeof emailRaw === "string" ? emailRaw.toLowerCase().trim() : "";

    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { ok: false, error: "invalid_email" },
        { status: 400 },
      );
    }
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { ok: false, error: "weak_password" },
        { status: 400 },
      );
    }

    await dbConnect();

    const exists = await User.findOne({ email }).lean();
    if (exists) {
      return NextResponse.json(
        { ok: false, error: "email_taken" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ email, passwordHash, name });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err?.code === 11000) {
      return NextResponse.json(
        { ok: false, error: "email_taken" },
        { status: 409 },
      );
    }
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json(
      { ok: false, error: "server_error" },
      { status: 500 },
    );
  }
}
