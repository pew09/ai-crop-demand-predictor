const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');

// Use same DB as main app
const databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/app_db";
const pool = new Pool({ connectionString: databaseUrl });
const db = drizzle(pool);

// North Cotabato 13 municipalities + data
async function seedNC() {
  console.log('🌱 North Cotabato Seed Script');

  // Clear old data
  try {
    await db.execute('DELETE FROM "demandData"');
    await db.execute('DELETE FROM "priceHistory"');
    await db.execute('DELETE FROM "markets"');
    await db.execute('DELETE FROM "crops"');
    await db.execute('DELETE FROM "regions"');
    console.log('🗑️  Cleared old data');
  } catch (e) {
    console.log('⚠️  Clearing failed:', e.message);
  }

  // 1. Insert 13 Real North Cotabato Municipalities
  const regionsSql = `
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
    RETURNING *;
  `;
  const regions = await db.execute(regionsSql);
  console.log(`✅ ${regions.rowCount || 0} North Cotabato municipalities`);

  // 2. Crops (Cotabato common)
  const cropsSql = `
    INSERT INTO "crops" (name, category, unit) VALUES
    ('Corn (Maize)', 'grain', 'kg'),
    ('Rice', 'grain', 'kg'),
    ('Banana', 'fruit', 'kg'),
    ('Coconut', 'fruit', 'pc'),
    ('Eggplant', 'vegetable', 'kg'),
    ('Tomato', 'vegetable', 'kg'),
    ('Okra', 'vegetable', 'kg'),
    ('String Beans', 'vegetable', 'kg'),
    ('Cabbage', 'vegetable', 'kg'),
    ('Coffee', 'grain', 'kg');
  `;
  await db.execute(cropsSql);
  console.log('✅ Crops seeded');

  // 3. Markets (North Cotabato specific)
  const marketsSql = `
    INSERT INTO "markets" (name, region_id, latitude, longitude, type) VALUES
    ('Midsayap Public Market', 11, '7.1900', '124.5300', 'public'),
    ('Kidapawan City Market', 8, '7.0100', '125.0900', 'public'),
    ('Kabacan Public Market', 7, '7.0500', '124.8300', 'public'),
    ('Mlang Agri-Market', 10, '6.9700', '124.8800', 'wholesale'),
    ('Pigkawayan Trading', 12, '7.0800', '124.3800', 'wholesale'),
    ('Alamada Vegetable Market', 2, '7.3200', '124.5200', 'public'),
    ('Banisilan Corn Terminal', 5, '7.2700', '124.2800', 'wholesale');
  `;
  await db.execute(marketsSql);
  console.log('✅ Markets seeded');

  console.log('🎉 North Cotabato data ready!');
  console.log('🔄 Restart dev server & check location dropdown!');
  console.log('📊 Test: curl http://localhost:3000/api/regions | jq \'.data | length\' (should show 13)');

  await pool.end();
}

seedNC().catch(console.error);

