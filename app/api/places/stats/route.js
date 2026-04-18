import dbConnect from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api/json";
import Place from "@/lib/models/Place";

export async function GET() {
  try {
    await dbConnect();

    const [total, byCategory, latest] = await Promise.all([
      Place.countDocuments(),
      Place.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort:  { count: -1 } },
      ]),
      Place.findOne().sort({ syncedAt: -1 }).select("syncedAt").lean(),
    ]);

    const categories = Object.fromEntries(byCategory.map((b) => [b._id, b.count]));

    return jsonOk({
      ok: true,
      total,
      categories,
      lastSyncedAt: latest?.syncedAt ?? null,
    });
  } catch (err) {
    console.error("[GET /api/places/stats]", err.message);
    return jsonError(500, { ok: false, error: err.message });
  }
}
