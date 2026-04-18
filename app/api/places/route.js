import dbConnect from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/json";
import Place from "@/lib/models/Place";
import { syncFromOverpass, isCacheStale } from "@/lib/overpass";

const TTL = Number(process.env.OVERPASS_CACHE_TTL_HOURS) || 24;

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q");
    const bbox = searchParams.get("bbox");

    // Background sync if stale
    isCacheStale(TTL).then((stale) => {
      if (stale) {
        console.log("[Auto-sync] Cache stale — refreshing in background…");
        syncFromOverpass(bbox || undefined).catch(console.error);
      }
    });

    const filter = {};
    if (category && category !== "all") filter.category = category;
    if (q && q.trim()) {
      filter.$text = { $search: q.trim() };
    }

    const places = await Place.find(filter)
      .select("-__v")
      .sort({ name: 1 })
      .lean();

    return jsonOk({
      ok: true,
      count: places.length,
      places,
    });
  } catch (err) {
    console.error("[GET /api/places]", err.message);
    return jsonError(500, { ok: false, error: err.message });
  }
}
