import "dotenv/config";
import { db, pool } from "../src/db";
import {
  regions,
  crops,
  markets,
  priceHistory,
  demandData,
} from "../src/db/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data (ignore if table not exist)
  try {
    await db.delete(demandData).execute();
  } catch { }
  try {
    await db.delete(priceHistory).execute();
  } catch { }
  try {
    await db.delete(markets).execute();
  } catch { }
  try {
    await db.delete(crops).execute();
  } catch { }
  try {
    await db.delete(regions).execute();
  } catch { }

  // 1. Regions
  const regionData = await db
    .insert(regions)
    .values([
      { name: "Arakan", province: "North Cotabato", latitude: "7.1333", longitude: "125.0667" },
      { name: "Alamada", province: "North Cotabato", latitude: "7.3167", longitude: "124.5167" },
      { name: "Aleosan", province: "North Cotabato", latitude: "7.1667", longitude: "124.5667" },
      { name: "Antipas", province: "North Cotabato", latitude: "7.1167", longitude: "124.9833" },
      { name: "Banisilan", province: "North Cotabato", latitude: "7.2667", longitude: "124.2833" },
      { name: "Carmen", province: "North Cotabato", latitude: "7.2167", longitude: "124.9500" },
      { name: "Kabacan", province: "North Cotabato", latitude: "7.0500", longitude: "124.8333" },
      { name: "Kidapawan City", province: "North Cotabato", latitude: "7.0083", longitude: "125.0894" },
      { name: "Libungan", province: "North Cotabato", latitude: "7.2667", longitude: "124.5167" },
      { name: "M'lang", province: "North Cotabato", latitude: "6.9667", longitude: "124.8833" },
      { name: "Midsayap", province: "North Cotabato", latitude: "7.1833", longitude: "124.5333" },
      { name: "Pigkawayan", province: "North Cotabato", latitude: "7.0833", longitude: "124.3833" },
      { name: "President Roxas", province: "North Cotabato", latitude: "7.1833", longitude: "124.2833" },
    ])
    .returning();
  console.log(`✅ Inserted ${regionData.length} regions`);

  // 2. Crops
  const cropData = await db
    .insert(crops)
    .values([
      { name: "Corn (Maize)", category: "grain", unit: "kg", seasonStart: 5, seasonEnd: 10 },
      { name: "Rice", category: "grain", unit: "kg", seasonStart: 6, seasonEnd: 11 },
      { name: "Banana", category: "fruit", unit: "kg", seasonStart: 1, seasonEnd: 12 },
      { name: "Coconut", category: "fruit", unit: "pc", seasonStart: 1, seasonEnd: 12 },
      { name: "Eggplant", category: "vegetable", unit: "kg", seasonStart: 9, seasonEnd: 3 },
      { name: "Tomato", category: "vegetable", unit: "kg", seasonStart: 10, seasonEnd: 4 },
      { name: "Okra", category: "vegetable", unit: "kg", seasonStart: 3, seasonEnd: 8 },
      { name: "String Beans", category: "vegetable", unit: "kg", seasonStart: 4, seasonEnd: 9 },
      { name: "Cabbage", category: "vegetable", unit: "kg", seasonStart: 11, seasonEnd: 4 },
      { name: "Coffee", category: "grain", unit: "kg", seasonStart: 10, seasonEnd: 3 },
    ])
    .returning();
  console.log(`✅ Inserted ${cropData.length} crops`);

  // 3. Markets - North Cotabato specific
  const marketData = await db
    .insert(markets)
    .values([
      { name: "Midsayap Public Market", regionId: 11, latitude: "7.1900", longitude: "124.5300", type: "public" },
      { name: "Kidapawan City Public Market", regionId: 8, latitude: "7.0100", longitude: "125.0900", type: "public" },
      { name: "Kabacan Public Market", regionId: 7, latitude: "7.0500", longitude: "124.8300", type: "public" },
      { name: "M'lang Agri-Market", regionId: 10, latitude: "6.9700", longitude: "124.8800", type: "wholesale" },
      { name: "Pigkawayan Trading Center", regionId: 12, latitude: "7.0800", longitude: "124.3800", type: "wholesale" },
      { name: "Alamada Vegetable Market", regionId: 2, latitude: "7.3200", longitude: "124.5200", type: "public" },
      { name: "Banisilan Corn Terminal", regionId: 5, latitude: "7.2700", longitude: "124.2800", type: "wholesale" },
      { name: "Carmen Public Market", regionId: 6, latitude: "7.2200", longitude: "124.9500", type: "public" },
    ])
    .returning();
  console.log(`✅ Inserted ${marketData.length} markets`);

  // 4. Historical Price Data (2022-2024)
  const priceData: any[] = [];
  const years = [2022, 2023, 2024];
  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  // Base prices per kg for each crop in Cotabato
  const basePrices: Record<string, { base: number; seasonal: number; trend: number }> = {
    "Corn (Maize)": { base: 18, seasonal: 3, trend: 0.5 },
    Rice: { base: 45, seasonal: 5, trend: 0.8 },
    Banana: { base: 30, seasonal: 2, trend: 0.3 },
    Coconut: { base: 15, seasonal: 1, trend: 0.2 },
    Eggplant: { base: 35, seasonal: 4, trend: 0.6 },
    Tomato: { base: 40, seasonal: 6, trend: 0.7 },
    Okra: { base: 25, seasonal: 3, trend: 0.4 },
    "String Beans": { base: 28, seasonal: 3, trend: 0.4 },
    Cabbage: { base: 38, seasonal: 5, trend: 0.6 },
    Coffee: { base: 120, seasonal: 8, trend: 2.0 },
  };

  for (const crop of cropData) {
    const cropInfo = basePrices[crop.name] || { base: 20, seasonal: 2, trend: 0.3 };
    for (const year of years) {
      for (const month of months) {
        // Seasonal pattern: prices higher during off-season
        const seasonFactor = Math.sin(((month - 3) / 12) * Math.PI * 2) * cropInfo.seasonal;
        const trendFactor = (year - 2022) * cropInfo.trend;
        const randomNoise = (Math.random() - 0.5) * 5;
        const price = Math.max(5, cropInfo.base + seasonFactor + trendFactor + randomNoise);

        // Region price variation (first 12 municipalities)
        for (let ri = 0; ri < Math.min(12, regionData.length); ri++) {
          const regionFactor = 1 + (ri - 1) * 0.05; // +/- 5% variation by region
          const adjustedPrice = Math.round(price * regionFactor * 100) / 100;

          priceData.push({
            cropId: crop.id,
            regionId: regionData[ri].id,
            price: adjustedPrice.toFixed(2),
            month,
            year,
            quantity: Math.round(1000 + Math.random() * 5000),
          });
        }
      }
    }
  }
  // Insert in batches
  for (let i = 0; i < priceData.length; i += 100) {
    const batch = priceData.slice(i, i + 100);
    await db.insert(priceHistory).values(batch);
  }
  console.log(`✅ Inserted ${priceData.length} price history records`);

  // 5. Demand Data
  const demandLevels = ["High", "Medium", "Low"];
  const demandDataEntries: any[] = [];

  for (const crop of cropData) {
    for (const region of regionData.slice(0, 12)) {
      for (const year of years) {
        for (const month of months) {
          // Seasonal demand: higher during harvest season
          const harvestSeason = month >= (crop.seasonStart || 1) && month <= (crop.seasonEnd || 12);
          const demandRand = Math.random();
          let demand: string;
          if (harvestSeason) {
            demand = demandRand < 0.6 ? "High" : demandRand < 0.85 ? "Medium" : "Low";
          } else {
            demand = demandRand < 0.2 ? "High" : demandRand < 0.5 ? "Medium" : "Low";
          }

          demandDataEntries.push({
            cropId: crop.id,
            regionId: region.id,
            demandLevel: demand,
            month,
            year,
            populationEstimate: Math.round(150000 + Math.random() * 50000),
          });
        }
      }
    }
  }

  for (let i = 0; i < demandDataEntries.length; i += 100) {
    const batch = demandDataEntries.slice(i, i + 100);
    await db.insert(demandData).values(batch);
  }
  console.log(`✅ Inserted ${demandDataEntries.length} demand records`);

  console.log("🎉 Seeding complete!");
}

seed()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
