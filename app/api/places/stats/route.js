import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
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

    return NextResponse.json({
      ok: true,
      total,
      categories,
      lastSyncedAt: latest?.syncedAt ?? null,
    });
  } catch (err) {
    console.error("[GET /api/places/stats]", err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
