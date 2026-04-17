import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { syncFromOverpass } from "@/lib/overpass";

export async function POST(request) {
  try {
    const body = await request.json();
    const bbox = body?.bbox;
    
    await dbConnect();
    const result = await syncFromOverpass(bbox);
    
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[POST /api/places/sync]", err.message);
    return NextResponse.json(
      { ok: false, error: "Overpass sync failed: " + err.message },
      { status: 502 }
    );
  }
}
