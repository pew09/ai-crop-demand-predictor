import { NextResponse } from "next/server";
import { db } from "@/db";
import { priceHistory, demandData, crops, regions } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { predictPrice, classifyDemand, calculateSeasonalityScore } from "@/lib/models";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cropId = parseInt(searchParams.get("cropId") || "0");
    const regionId = parseInt(searchParams.get("regionId") || "0");
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    if (!cropId || !regionId) {
      return NextResponse.json({ error: "cropId and regionId are required" }, { status: 400 });
    }

    // Fetch historical prices (last 3 years)
    const prices = await db
      .select()
      .from(priceHistory)
      .where(
        and(
          eq(priceHistory.cropId, cropId),
          eq(priceHistory.regionId, regionId)
        )
      )
      .orderBy(priceHistory.year, priceHistory.month);

    // Fetch historical demand
    const demands = await db
      .select()
      .from(demandData)
      .where(
        and(
          eq(demandData.cropId, cropId),
          eq(demandData.regionId, regionId)
        )
      )
      .orderBy(demandData.year, demandData.month);

    // Get crop info for seasonality
    const cropInfo = await db
      .select()
      .from(crops)
      .where(eq(crops.id, cropId))
      .then((r) => r[0]);

    // Price prediction
    const priceResult = predictPrice({
      cropId,
      regionId,
      month,
      year,
      historicalPrices: prices.map((p) => ({
        month: p.month,
        year: p.year,
        price: parseFloat(p.price as string),
      })),
      historicalDemand: demands.map((d) => ({
        month: d.month,
        year: d.year,
        demand: d.demandLevel,
      })),
    });

    // Demand classification
    const demandResult = classifyDemand({
      cropId,
      regionId,
      month,
      seasonFactor: cropInfo ? calculateSeasonalityScore(month, cropInfo.seasonStart || 1, cropInfo.seasonEnd || 12) : 0.5,
      historicalDemand: demands.map((d) => ({
        month: d.month,
        year: d.year,
        demand: d.demandLevel,
      })),
    });

    // Seasonality score
    const seasonalityScore = cropInfo
      ? calculateSeasonalityScore(month, cropInfo.seasonStart || 1, cropInfo.seasonEnd || 12)
      : 0.5;

    return NextResponse.json({
      success: true,
      data: {
        predictedPrice: priceResult.price,
        priceTrend: priceResult.trend,
        demandLevel: demandResult.level,
        demandConfidence: demandResult.confidence,
        seasonalityScore,
        cropName: cropInfo?.name,
        month,
        year,
      },
    });
  } catch (error: any) {
    console.error("Prediction error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
