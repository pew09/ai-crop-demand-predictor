import { NextResponse } from "next/server";
import { db } from "@/db";
import { markets, regions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const regionId = searchParams.get("regionId");

    const baseQuery = db
      .select({
        id: markets.id,
        name: markets.name,
        regionId: markets.regionId,
        regionName: regions.name,
        latitude: markets.latitude,
        longitude: markets.longitude,
        type: markets.type,
      })
      .from(markets)
      .leftJoin(regions, eq(markets.regionId, regions.id));

    const result = regionId
      ? await baseQuery.where(eq(markets.regionId, parseInt(regionId)))
      : await baseQuery;

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
