import { auth } from "@/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import dbConnect from "@/lib/db";
import FirstAidConversation from "@/lib/models/FirstAidConversation";

export const runtime = "nodejs";

const MAX_MESSAGES = 100;

function sanitizeMessages(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const m of raw) {
    if (out.length >= MAX_MESSAGES) break;
    if (!m || typeof m !== "object") continue;
    const role = m.role === "user" || m.role === "assistant" ? m.role : null;
    const text = typeof m.text === "string" ? m.text.slice(0, 12000) : "";
    if (!role || !text.trim()) continue;
    out.push({ role, text });
  }
  return out;
}

export async function GET(request) {
  try {
    await dbConnect();
    const session = await auth();

    if (session?.user?.id) {
      const doc = await FirstAidConversation.findOne({
        userId: session.user.id,
      })
        .select("messages")
        .lean();
      return jsonOk({
        ok: true,
        messages: doc?.messages?.map((m) => ({ role: m.role, text: m.text })) ?? [],
      });
    }

    const anon = request.headers.get("x-first-aid-session")?.trim();
    if (!anon || anon.length > 80) {
      return jsonOk({ ok: true, messages: [] });
    }

    const doc = await FirstAidConversation.findOne({ anonymousId: anon })
      .select("messages")
      .lean();

    return jsonOk({
      ok: true,
      messages: doc?.messages?.map((m) => ({ role: m.role, text: m.text })) ?? [],
    });
  } catch (err) {
    console.error("[GET /api/first-aid/conversation]", err);
    return jsonError(500, { ok: false, error: "server_error" });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const messages = sanitizeMessages(body.messages);

    await dbConnect();
    const session = await auth();

    if (session?.user?.id) {
      await FirstAidConversation.findOneAndUpdate(
        { userId: session.user.id },
        { $set: { userId: session.user.id, messages } },
        { upsert: true, new: true },
      );
      return jsonOk({ ok: true });
    }

    const headerAnon = request.headers.get("x-first-aid-session")?.trim();
    const bodyAnon =
      typeof body.anonymousId === "string" ? body.anonymousId.trim() : "";
    const anonymousId = headerAnon || bodyAnon;
    if (!anonymousId || anonymousId.length > 80) {
      return jsonError(400, { ok: false, error: "missing_anonymous_id" });
    }

    if (headerAnon && bodyAnon && headerAnon !== bodyAnon) {
      return jsonError(400, { ok: false, error: "id_mismatch" });
    }

    await FirstAidConversation.findOneAndUpdate(
      { anonymousId },
      { $set: { anonymousId, messages } },
      { upsert: true, new: true },
    );

    return jsonOk({ ok: true });
  } catch (err) {
    console.error("[PUT /api/first-aid/conversation]", err);
    return jsonError(500, { ok: false, error: "server_error" });
  }
}
