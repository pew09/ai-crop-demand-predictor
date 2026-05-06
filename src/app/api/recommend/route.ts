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
    // If local crop+region history is missing, fall back to crop-wide price history
    // so the UI doesn't return unrealistically low values.
    const cropWidePrices =
      prices.length > 1
        ? prices
        : (
          await db
            .select()
            .from(priceHistory)
            .where(and(eq(priceHistory.cropId, cropId)))
            .orderBy(priceHistory.year, priceHistory.month)
        );

    const cropWideDemands =
      demands.length > 1
        ? demands
        : (
          await db
            .select()
            .from(demandData)
            .where(and(eq(demandData.cropId, cropId)))
            .orderBy(demandData.year, demandData.month)
        );

    const priceHistoryForModel = cropWidePrices.map((p) => ({
      month: p.month,
      year: p.year,
      price: parseFloat(p.price as string),
    }));
    const demandHistoryForModel = cropWideDemands.map((d) => ({
      month: d.month,
      year: d.year,
      demand: d.demandLevel,
    }));

    // If there isn't enough history to train ML, use DB-driven empirical fallbacks.
    // This prevents “flat” predictions that don't change across inputs.
    const priceResult =
      priceHistoryForModel.length < 2
        ? (() => {
          const allPrices = priceHistoryForModel.map((x) => x.price);
          const overallAvg = allPrices.length ? allPrices.reduce((a, b) => a + b, 0) / allPrices.length : 0;

          const monthPrices = priceHistoryForModel.filter((x) => x.month === month).map((x) => x.price);
          const monthAvg = monthPrices.length ? monthPrices.reduce((a, b) => a + b, 0) / monthPrices.length : overallAvg;

          // Small trend heuristic based on overall year avg (if possible)
          const yearGroups = priceHistoryForModel.reduce<Record<number, number[]>>((acc, x) => {
            acc[x.year] = acc[x.year] || [];
            acc[x.year].push(x.price);
            return acc;
          }, {});
          const years = Object.keys(yearGroups).map((y) => parseInt(y, 10)).sort((a, b) => a - b);
          const lastYear = years[years.length - 1] ?? year;
          const prevYear = years[years.length - 2] ?? lastYear;

          const lastAvg = (yearGroups[lastYear] || []).reduce((a, b) => a + b, 0) / Math.max(1, (yearGroups[lastYear] || []).length);
          const prevAvg = (yearGroups[prevYear] || []).reduce((a, b) => a + b, 0) / Math.max(1, (yearGroups[prevYear] || []).length);
          const trendDelta = prevAvg > 0 ? (lastAvg - prevAvg) / prevAvg : 0;

          const seasonBoost = 1 + (calculateSeasonalityScore(month, cropInfo.seasonStart || 1, cropInfo.seasonEnd || 12) - 0.5) * 0.2;

          const basePrice = monthAvg > 0 ? monthAvg : overallAvg > 0 ? overallAvg : 25;
          const predicted = basePrice * seasonBoost * (1 + trendDelta * 0.2);
          const predictedRounded = Math.round(Math.max(0.1, predicted) * 100) / 100;

          const trend: "Increasing" | "Stable" | "Decreasing" =
            predictedRounded > monthAvg * 1.02 ? "Increasing" : predictedRounded < monthAvg * 0.98 ? "Decreasing" : "Stable";

          return { price: predictedRounded, trend };
        })()
        : predictPrice({
          cropId,
          regionId,
          month,
          year,
          historicalPrices: priceHistoryForModel,
          historicalDemand: demandHistoryForModel,
        });

    const seasonalityForDemand = calculateSeasonalityScore(
      month,
      cropInfo.seasonStart || 1,
      cropInfo.seasonEnd || 12
    );

    const demandResult =
      demandHistoryForModel.length < 2
        ? (() => {
          const candidates = demandHistoryForModel.filter((x) => x.month === month);
          const pool = candidates.length ? candidates : demandHistoryForModel;

          const counts: Record<"High" | "Medium" | "Low", number> = { High: 0, Medium: 0, Low: 0 };
          for (const x of pool) {
            if (x.demand === "High") counts.High++;
            else if (x.demand === "Medium") counts.Medium++;
            else counts.Low++;
          }
          const total = Math.max(1, counts.High + counts.Medium + counts.Low);
          const best = (Object.entries(counts) as [string, number][])
            .sort((a, b) => b[1] - a[1])[0];

          const level = best[0] as "High" | "Medium" | "Low";
          const confidence = Math.round(((best[1] / total) * 100)) / 100;
          return { level, confidence };
        })()
        : classifyDemand({
          cropId,
          regionId,
          month,
          seasonFactor: seasonalityForDemand,
          historicalDemand: cropWideDemands.map((d) => ({
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
