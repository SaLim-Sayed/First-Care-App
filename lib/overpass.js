import axios from "axios";
import Place from "./models/Place";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const MINIA_BBOX = "27.85,30.55,28.35,31.05";

export function buildQuery(bbox = MINIA_BBOX) {
  return `[out:json][timeout:60];(
    node["amenity"="hospital"](${bbox});
    node["amenity"="clinic"](${bbox});
    node["amenity"="doctors"](${bbox});
    node["amenity"="dentist"](${bbox});
    node["amenity"="pharmacy"](${bbox});
    way["amenity"="hospital"](${bbox});
    way["amenity"="clinic"](${bbox});
  );out center tags;`;
}

function parseEl(el) {
  const t = el.tags || {};
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (!lat || !lon) return null;

  return {
    osm_id: el.id,
    source: "osm",
    name: t["name:ar"] || t.name || t["name:en"] || "مرفق صحي",
    nameEn: t["name:en"] || t.name || "Healthcare Facility",
    category: t.amenity || "default",
    address:
      [t["addr:street"], t["addr:housenumber"], t["addr:city"]]
        .filter(Boolean)
        .join(", ") || "المنيا، مصر",
    phone: t.phone || t["contact:phone"] || null,
    phone2: t["contact:mobile"] || t["mobile"] || null,
    email: t.email || t["contact:email"] || null,
    website: t.website || t["contact:website"] || null,
    facebook: t["contact:facebook"] || null,
    openingHours: t.opening_hours || null,
    specialty:
      t.healthcare_speciality || t["healthcare:speciality"] || t.description || null,
    operator: t.operator || null,
    beds: t.beds || null,
    emergency: t.emergency || null,
    wheelchair: t.wheelchair || null,
    lat,
    lon,
    bbox: MINIA_BBOX,
    syncedAt: new Date(),
  };
}

export async function syncFromOverpass(bbox = MINIA_BBOX) {
  console.log(`[Overpass] Starting sync for bbox ${bbox}…`);

  const response = await axios.post(OVERPASS_URL, buildQuery(bbox), {
    headers: { "Content-Type": "text/plain" },
    timeout: 60_000,
  });

  const elements = response.data.elements || [];
  const places = elements.map(parseEl).filter(Boolean);

  if (places.length === 0) {
    console.warn("[Overpass] No elements returned — skipping upsert.");
    return { fetched: 0, upserted: 0 };
  }

  const ops = places.map((p) => ({
    updateOne: {
      filter: { osm_id: p.osm_id },
      update: { $set: p },
      upsert: true,
    },
  }));

  const result = await Place.bulkWrite(ops, { ordered: false });
  const upserted = (result.upsertedCount || 0) + (result.modifiedCount || 0);

  console.log(`[Overpass] Sync complete. Fetched: ${places.length}, Upserted/Updated: ${upserted}`);
  return { fetched: places.length, upserted };
}

export async function isCacheStale(ttlHours = 24) {
  const latest = await Place.findOne().sort({ syncedAt: -1 }).select("syncedAt");
  if (!latest) return true;
  const ageMs = Date.now() - new Date(latest.syncedAt).getTime();
  return ageMs > ttlHours * 60 * 60 * 1000;
}
