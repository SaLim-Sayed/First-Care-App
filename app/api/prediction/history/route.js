import { auth } from "@/auth";
import { jsonError, jsonOk } from "@/lib/api/json";
import dbConnect from "@/lib/db";
import PredictionHistory from "@/lib/models/PredictionHistory";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    await dbConnect();
    const session = await auth();

    let query = {};

    if (session?.user?.id) {
      query = { userId: session.user.id };
    } else {
      const anon = request.headers.get("x-first-aid-session")?.trim();
      if (!anon || anon.length > 80) {
        return jsonOk({ ok: true, predictions: [] });
      }
      query = { anonymousId: anon };
    }

    const predictions = await PredictionHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return jsonOk({
      ok: true,
      predictions: predictions.map((p) => ({
        id: p._id.toString(),
        symptoms: p.symptoms,
        diagnosis: p.diagnosis,
        createdAt: p.createdAt,
      })),
    });
  } catch (err) {
    console.error("[GET /api/prediction/history]", err);
    return jsonError(500, { ok: false, error: "server_error" });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { symptoms, diagnosis, anonymousId: bodyAnon } = body;

    if (!Array.isArray(symptoms) || !diagnosis) {
      return jsonError(400, { ok: false, error: "invalid_body" });
    }

    await dbConnect();
    const session = await auth();

    const newDoc = new PredictionHistory({
      symptoms,
      diagnosis,
    });

    if (session?.user?.id) {
      newDoc.userId = session.user.id;
    } else {
      const headerAnon = request.headers.get("x-first-aid-session")?.trim();
      const anon = headerAnon || bodyAnon;
      if (!anon || anon.length > 80) {
        return jsonError(400, { ok: false, error: "missing_anonymous_id" });
      }
      newDoc.anonymousId = anon;
    }

    await newDoc.save();

    return jsonOk({ ok: true, id: newDoc._id.toString() });
  } catch (err) {
    console.error("[POST /api/prediction/history]", err);
    return jsonError(500, { ok: false, error: "server_error" });
  }
}
