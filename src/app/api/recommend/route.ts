import { NextResponse } from "next/server";
import { db } from "@/db";
import { crops, regions, markets, priceHistory, demandData } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { predictPrice, classifyDemand, calculateSeasonalityScore } from "@/lib/models";
import { RuleEngine } from "@/lib/rules";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cropId = parseInt(searchParams.get("cropId") || "0");
    const regionId = parseInt(searchParams.get("regionId") || "0");
    const quantity = parseFloat(searchParams.get("quantity") || "100");
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    if (!cropId || !regionId) {
      return NextResponse.json({ error: "cropId and regionId are required" }, { status: 400 });
    }

    // Fetch all needed data in parallel
    const [cropInfo, regionInfo, allMarkets, prices, demands] = await Promise.all([
      db.select().from(crops).where(eq(crops.id, cropId)).then((r) => r[0]),
      db.select().from(regions).where(eq(regions.id, regionId)).then((r) => r[0]),
      db.select().from(markets),
      db
        .select()
        .from(priceHistory)
        .where(and(eq(priceHistory.cropId, cropId), eq(priceHistory.regionId, regionId)))
        .orderBy(priceHistory.year, priceHistory.month),
      db
        .select()
        .from(demandData)
        .where(and(eq(demandData.cropId, cropId), eq(demandData.regionId, regionId)))
        .orderBy(demandData.year, demandData.month),
    ]);

    if (!cropInfo || !regionInfo) {
      return NextResponse.json({ error: "Crop or region not found" }, { status: 404 });
    }

    // ML Predictions
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

    const demandResult = classifyDemand({
      cropId,
      regionId,
      month,
      seasonFactor: calculateSeasonalityScore(month, cropInfo.seasonStart || 1, cropInfo.seasonEnd || 12),
      historicalDemand: demands.map((d) => ({
        month: d.month,
        year: d.year,
        demand: d.demandLevel,
      })),
    });

    const seasonalityScore = calculateSeasonalityScore(
      month,
      cropInfo.seasonStart || 1,
      cropInfo.seasonEnd || 12
    );

    // Check for oversupply (more quantity than average)
    const avgQuantity =
      prices.length > 0
        ? prices.reduce((s, p) => s + parseFloat(p.quantity as string || "0"), 0) / prices.length
        : 1000;
    const oversupplyDetected = quantity > avgQuantity * 1.5;

    // Alternative markets (exclude current region)
    const altMarkets = allMarkets
      .filter((m) => m.regionId !== regionId)
      .slice(0, 3)
      .map((m) => ({
        id: m.id,
        name: m.name,
        distance: Math.round(20 + Math.random() * 80), // simulated distance in km
      }));

    // Rule Engine
    const ruleEngine = new RuleEngine();
    const recommendation = ruleEngine.evaluate({
      demandLevel: demandResult.level,
      predictedPrice: priceResult.price,
      priceTrend: priceResult.trend,
      seasonalityScore,
      quantity,
      oversupplyDetected,
      alternativeMarkets: altMarkets,
    });

    // Find best market
    const bestMarket = allMarkets.find((m) => m.regionId === regionId) || allMarkets[0];

    // Calculate expected total revenue
    const expectedRevenue = Math.round(priceResult.price * quantity * 100) / 100;

    return NextResponse.json({
      success: true,
      data: {
        crop: {
          id: cropInfo.id,
          name: cropInfo.name,
          category: cropInfo.category,
          unit: cropInfo.unit,
        },
        region: {
          id: regionInfo.id,
          name: regionInfo.name,
          province: regionInfo.province,
        },
        mlPredictions: {
          predictedPrice: priceResult.price,
          priceTrend: priceResult.trend,
          demandLevel: demandResult.level,
          demandConfidence: demandResult.confidence,
          seasonalityScore: Math.round(seasonalityScore * 100) / 100,
        },
        recommendation: {
          strategy: recommendation.strategy,
          timing: recommendation.timing,
          explanation: recommendation.explanation,
          riskLevel: recommendation.riskLevel,
          confidence: recommendation.confidence,
        },
        market: {
          bestMarket: bestMarket?.name || "Local Market",
          type: bestMarket?.type || "public",
          alternativeMarkets: recommendation.alternativeMarkets,
        },
        financials: {
          predictedPricePerUnit: priceResult.price,
          quantity,
          expectedRevenue,
          currency: "₱",
        },
        seasonInfo: {
          isPeakSeason: seasonalityScore > 0.7,
          seasonScore: Math.round(seasonalityScore * 100) / 100,
          plantingSeason: cropInfo.seasonStart && cropInfo.seasonEnd
            ? `${monthToString(cropInfo.seasonStart)} - ${monthToString(cropInfo.seasonEnd)}`
            : "Year-round",
        },
      },
    });
  } catch (error: any) {
    console.error("Recommendation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function monthToString(m: number): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return months[m - 1] || "Unknown";
}
