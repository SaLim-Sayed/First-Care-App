import dbConnect from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/json";
import { syncFromOverpass } from "@/lib/overpass";

export async function POST(request) {
  try {
    const body = await request.json();
    const bbox = body?.bbox;
    
    await dbConnect();
    const result = await syncFromOverpass(bbox);
    
    return jsonOk({ ok: true, ...result });
  } catch (err) {
    console.error("[POST /api/places/sync]", err.message);
    return jsonError(502, {
      ok: false,
      error: "Overpass sync failed: " + err.message,
    });
  }
}
