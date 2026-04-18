import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/json";
import Place from "@/lib/models/Place";
import { syncFromOverpass, isCacheStale } from "@/lib/overpass";

export const runtime = "nodejs";

const TTL = Number(process.env.OVERPASS_CACHE_TTL_HOURS) || 24;

const ALLOWED_CATEGORIES = [
  "hospital",
  "clinic",
  "doctors",
  "dentist",
  "pharmacy",
  "default",
];

/** Minia governorate bbox (south,west,north,east) — matches constants.MINIA_BBOX */
const MIN_LAT = 27.85;
const MAX_LAT = 28.35;
const MIN_LON = 30.55;
const MAX_LON = 31.05;

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function nextManualOsmId() {
  const minNeg = await Place.findOne({ osm_id: { $lt: 0 } })
    .sort({ osm_id: 1 })
    .select("osm_id")
    .lean();
  return minNeg ? minNeg.osm_id - 1 : -1;
}

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q");
    const bbox = searchParams.get("bbox");

    isCacheStale(TTL).then((stale) => {
      if (stale) {
        console.log("[Auto-sync] Cache stale — refreshing in background…");
        syncFromOverpass(bbox || undefined).catch(console.error);
      }
    });

    const clauses = [];

    if (category && category !== "all") {
      clauses.push({ category });
    }

    if (q && q.trim()) {
      const regex = new RegExp(escapeRegex(q.trim()), "i");
      clauses.push({
        $or: [
          { name: regex },
          { nameEn: regex },
          { address: regex },
          { specialty: regex },
          { operator: regex },
          { phone: regex },
          { phone2: regex },
          { email: regex },
        ],
      });
    }

    const filter =
      clauses.length === 0
        ? {}
        : clauses.length === 1
          ? clauses[0]
          : { $and: clauses };

    const places = await Place.find(filter).select("-__v").sort({ name: 1 }).lean();

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

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return jsonError(401, { ok: false, error: "unauthorized" });
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name || name.length > 200) {
      return jsonError(400, { ok: false, error: "invalid_name" });
    }

    const nameEn =
      typeof body.nameEn === "string" ? body.nameEn.trim().slice(0, 200) : "";
    const address =
      typeof body.address === "string" ? body.address.trim().slice(0, 500) : "";
    const category =
      typeof body.category === "string" && ALLOWED_CATEGORIES.includes(body.category)
        ? body.category
        : "doctors";

    const lat = Number(body.lat);
    const lon = Number(body.lon);
    if (
      Number.isNaN(lat) ||
      Number.isNaN(lon) ||
      lat < MIN_LAT ||
      lat > MAX_LAT ||
      lon < MIN_LON ||
      lon > MAX_LON
    ) {
      return jsonError(400, { ok: false, error: "invalid_coordinates" });
    }

    const phone =
      typeof body.phone === "string" && body.phone.trim()
        ? body.phone.trim().slice(0, 40)
        : null;
    const specialty =
      typeof body.specialty === "string" && body.specialty.trim()
        ? body.specialty.trim().slice(0, 200)
        : null;

    await dbConnect();
    const osm_id = await nextManualOsmId();

    const doc = await Place.create({
      osm_id,
      source: "manual",
      createdBy: session.user.id,
      name,
      nameEn,
      category,
      address: address || "Minia, Egypt",
      lat,
      lon,
      phone,
      specialty,
      syncedAt: new Date(),
    });

    const place = doc.toObject();
    delete place.__v;

    return jsonOk({ ok: true, place });
  } catch (err) {
    console.error("[POST /api/places]", err);
    return jsonError(500, { ok: false, error: "server_error" });
  }
}
