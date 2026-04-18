import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id)
      .select("email name createdAt updatedAt")
      .lean();

    if (!user) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      profile: {
        email: user.email,
        name: user.name || "",
        createdAt: user.createdAt?.toISOString?.() ?? null,
        updatedAt: user.updatedAt?.toISOString?.() ?? null,
      },
    });
  } catch (err) {
    console.error("[GET /api/user/profile]", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const name =
      typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";

    await dbConnect();
    await User.updateOne({ _id: session.user.id }, { $set: { name } });

    return NextResponse.json({ ok: true, name });
  } catch (err) {
    console.error("[PATCH /api/user/profile]", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
