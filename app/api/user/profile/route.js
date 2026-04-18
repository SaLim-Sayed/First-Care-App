import { auth } from "@/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";

export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonError(401, { ok: false, error: "unauthorized" });
    }

    await dbConnect();
    const user = await User.findById(session.user.id)
      .select("email name createdAt updatedAt")
      .lean();

    if (!user) {
      return jsonError(404, { ok: false, error: "not_found" });
    }

    return jsonOk({
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
    return jsonError(500, { ok: false, error: "server_error" });
  }
}

export async function PATCH(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonError(401, { ok: false, error: "unauthorized" });
    }

    const body = await request.json();
    const name =
      typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";

    await dbConnect();
    await User.updateOne({ _id: session.user.id }, { $set: { name } });

    return jsonOk({ ok: true, name });
  } catch (err) {
    console.error("[PATCH /api/user/profile]", err);
    return jsonError(500, { ok: false, error: "server_error" });
  }
}
