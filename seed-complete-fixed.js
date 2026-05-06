const { Pool } = require('pg');

const databaseUrl = "postgresql://postgres:postgres@localhost:5432/app_db";
const pool = new Pool({ connectionString: databaseUrl });

async function seedComplete() {
    console.log('🔥 FIXED Complete Seed Script - Region-Specific Prices (Raw SQL)');

    // Clear existing data
    await pool.query('DELETE FROM "demand_data"');
    await pool.query('DELETE FROM "price_history"');
    await pool.query('DELETE FROM "markets"');
    await pool.query('DELETE FROM "crops"');
    await pool.query('DELETE FROM "regions"');

    // Regions (13 North Cotabato municipalities)
    await pool.query(`
    INSERT INTO "regions" (name, province, latitude, longitude) VALUES
    ('Arakan', 'North Cotabato', '7.1333', '125.0667'),
    ('Alamada', 'North Cotabato', '7.3167', '124.5167'),
    ('Aleosan', 'North Cotabato', '7.1667', '124.5667'),
    ('Antipas', 'North Cotabato', '7.1167', '124.9833'),
    ('Banisilan', 'North Cotabato', '7.2667', '124.2833'),
    ('Carmen', 'North Cotabato', '7.2167', '124.9500'),
    ('Kabacan', 'North Cotabato', '7.0500', '124.8333'),
    ('Kidapawan City', 'North Cotabato', '7.0083', '125.0894'),
    ('Libungan', 'North Cotabato', '7.2667', '124.5167'),
    ('Mlang', 'North Cotabato', '6.9667', '124.8833'),
    ('Midsayap', 'North Cotabato', '7.1833', '124.5333'),
    ('Pigkawayan', 'North Cotabato', '7.0833', '124.3833'),
    ('President Roxas', 'North Cotabato', '7.1833', '124.2833')
  `);

    // Crops with correct column names
    await pool.query(`
    INSERT INTO "crops" (name, category, unit, "season_start", "season_end") VALUES
    ('Corn (Maize)', 'grain', 'kg', 5, 10),
    ('Rice', 'grain', 'kg', 6, 11),
    ('Banana', 'fruit', 'kg', 1, 12),
    ('Eggplant', 'vegetable', 'kg', 9, 3),
    ('Tomato', 'vegetable', 'kg', 10, 4),
    ('Okra', 'vegetable', 'kg', 3, 8),
    ('String Beans', 'vegetable', 'kg', 4, 9),
    ('Cabbage', 'vegetable', 'kg', 11, 4),
    ('Coffee', 'grain', 'kg', 10, 3),
    ('Coconut', 'fruit', 'pc', 1, 12)
  `);

    // Markets
    await pool.query(`
    INSERT INTO "markets" (name, "region_id", latitude, longitude, type) VALUES
    ('Midsayap Public Market', 11, '7.1900', '124.5300', 'public'),
    ('Kidapawan City Market', 8, '7.0100', '125.0900', 'public'),
    ('Kabacan Public Market', 7, '7.0500', '124.8300', 'public'),
    ('Mlang Agri-Market', 10, '6.9700', '124.8800', 'wholesale'),
    ('Pigkawayan Trading', 12, '7.0800', '124.3800', 'wholesale')
  `);

    // Generate and insert price_history with REGION-SPECIFIC variations
    console.log('🌾 Generating 156,000 price records with region variation...');
    const years = [2022, 2023, 2024, 2025];
    const basePrices = { 1: 25, 2: 50, 3: 30, 4: 35, 5: 40, 6: 25, 7: 28, 8: 38, 9: 120, 10: 15 };

    let priceCount = 0;
    for (let cropId = 1; cropId <= 10; cropId++) {
        const basePrice = basePrices[cropId];
        for (let year of years) {
            for (let month = 1; month <= 12; month++) {
                for (let regionId = 1; regionId <= 13; regionId++) {
                    const regionVariation = 1 + (regionId - 7) * 0.006; // ±8% by region index
                    const seasonFactor = Math.sin((month - 6) / 12 * Math.PI * 2) * 0.12;
                    const trend = (year - 2022) * 0.5;
                    const price = Math.round((basePrice * regionVariation + seasonFactor * basePrice + trend) * 100) / 100;
                    const quantity = Math.round(2000 + Math.random() * 3000);

                    await pool.query(
                        `INSERT INTO price_history (crop_id, region_id, price, month, year, quantity) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
                        [cropId, regionId, price, month, year, quantity]
                    );
                    priceCount++;

                    if (priceCount % 10000 === 0) {
                        console.log(`   Inserted ${priceCount} price records...`);
                    }
                }
            }
        }
    }
    console.log(`✅ ${priceCount} price records with unique region variations!`);

    // Demand data
    console.log('📊 Generating demand records...');
    let demandCount = 0;
    for (let cropId = 1; cropId <= 10; cropId++) {
        for (let regionId = 1; regionId <= 13; regionId++) {
            for (let year of years) {
                for (let month = 1; month <= 12; month++) {
                    const demand = Math.random() > 0.3 ? 'High' : Math.random() > 0.5 ? 'Medium' : 'Low';
                    await pool.query(
                        `INSERT INTO demand_data (crop_id, region_id, demand_level, month, year, population_estimate) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
                        [cropId, regionId, demand, month, year, 50000]
                    );
                    demandCount++;
                }
            }
        }
    }
    console.log(`✅ ${demandCount} demand records!`);

    console.log('🎉 SEED COMPLETE! 🔄 Restart dev server');
    console.log('🧪 Test: /farmer → same crop, different regions → DIFFERENT PRICES!');
    await pool.end();
}

seedComplete().catch(console.error);

