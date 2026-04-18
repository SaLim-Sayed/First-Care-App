import bcrypt from "bcryptjs";
import { jsonError, jsonOk } from "@/lib/api/json";
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
      return jsonError(400, { ok: false, error: "invalid_email" });
    }
    if (typeof password !== "string" || password.length < 8) {
      return jsonError(400, { ok: false, error: "weak_password" });
    }

    await dbConnect();

    const exists = await User.findOne({ email }).lean();
    if (exists) {
      return jsonError(409, { ok: false, error: "email_taken" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ email, passwordHash, name });

    return jsonOk({ ok: true });
  } catch (err) {
    if (err?.code === 11000) {
      return jsonError(409, { ok: false, error: "email_taken" });
    }
    console.error("[POST /api/auth/register]", err);
    return jsonError(500, { ok: false, error: "server_error" });
  }
}
