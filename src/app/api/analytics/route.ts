import { NextResponse } from "next/server";
import { db } from "@/db";
import { crops, regions, markets, priceHistory, demandData, datasets } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    // Get counts
    const [cropCount, regionCount, marketCount, datasetCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(crops).then((r) => Number(r[0].count)),
      db.select({ count: sql<number>`count(*)` }).from(regions).then((r) => Number(r[0].count)),
      db.select({ count: sql<number>`count(*)` }).from(markets).then((r) => Number(r[0].count)),
      db.select({ count: sql<number>`count(*)` }).from(datasets).then((r) => Number(r[0].count)),
    ]);

    // Average prices by crop
    const avgPricesByCrop = await db
      .select({
        cropName: crops.name,
        avgPrice: sql<number>`ROUND(AVG(${priceHistory.price})::numeric, 2)`,
        count: sql<number>`count(*)`,
      })
      .from(priceHistory)
      .innerJoin(crops, eq(priceHistory.cropId, crops.id))
      .groupBy(crops.name)
      .orderBy(crops.name);

    // Demand distribution
    const demandDistribution = await db
      .select({
        level: demandData.demandLevel,
        count: sql<number>`count(*)`,
      })
      .from(demandData)
      .groupBy(demandData.demandLevel);

    // Price trend over years
    const priceTrend = await db
      .select({
        year: priceHistory.year,
        month: priceHistory.month,
        avgPrice: sql<number>`ROUND(AVG(${priceHistory.price})::numeric, 2)`,
      })
      .from(priceHistory)
      .groupBy(priceHistory.year, priceHistory.month)
      .orderBy(priceHistory.year, priceHistory.month);

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalCrops: cropCount,
          totalRegions: regionCount,
          totalMarkets: marketCount,
          totalDatasets: datasetCount,
          totalPriceRecords: priceTrend.reduce((s: number, r: any) => s + 1, 0),
        },
        avgPricesByCrop,
        demandDistribution,
        priceTrend,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
