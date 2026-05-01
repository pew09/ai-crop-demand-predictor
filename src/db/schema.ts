import { pgTable, serial, varchar, text, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";

// Regions (e.g., Cotabato, Davao, etc.)
export const regions = pgTable("regions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  province: varchar("province", { length: 100 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Crops
export const crops = pgTable("crops", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  category: varchar("category", { length: 50 }), // vegetable, grain, fruit
  unit: varchar("unit", { length: 20 }).default("kg"),
  seasonStart: integer("season_start"), // month number 1-12
  seasonEnd: integer("season_end"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Markets
export const markets = pgTable("markets", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  regionId: integer("region_id").references(() => regions.id),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  type: varchar("type", { length: 50 }).default("public"), // public, wholesale, retail
  createdAt: timestamp("created_at").defaultNow(),
});

// Historical price data
export const priceHistory = pgTable("price_history", {
  id: serial("id").primaryKey(),
  cropId: integer("crop_id").references(() => crops.id),
  regionId: integer("region_id").references(() => regions.id),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  month: integer("month").notNull(), // 1-12
  year: integer("year").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }), // supply quantity
  createdAt: timestamp("created_at").defaultNow(),
});

// Demand data
export const demandData = pgTable("demand_data", {
  id: serial("id").primaryKey(),
  cropId: integer("crop_id").references(() => crops.id),
  regionId: integer("region_id").references(() => regions.id),
  demandLevel: varchar("demand_level", { length: 20 }).notNull(), // High, Medium, Low
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  populationEstimate: integer("population_estimate"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User recommendations
export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  cropId: integer("crop_id").references(() => crops.id),
  regionId: integer("region_id").references(() => regions.id),
  predictedPrice: decimal("predicted_price", { precision: 10, scale: 2 }),
  demandLevel: varchar("demand_level", { length: 20 }),
  bestMarketId: integer("best_market_id").references(() => markets.id),
  sellingStrategy: varchar("selling_strategy", { length: 100 }),
  priceTrend: varchar("price_trend", { length: 50 }),
  confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Datasets uploaded by admin
export const datasets = pgTable("datasets", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // price, demand, market
  fileUrl: text("file_url"),
  rows: integer("rows").default(0),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Chatbot conversations
export const chatHistory = pgTable("chat_history", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 100 }),
  message: text("message").notNull(),
  response: text("response").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
