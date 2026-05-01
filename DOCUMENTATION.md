# 🌾 AI-Based Crop Demand and Market Prediction System

**Location:** North Cotabato, Philippines  
**Target Users:** Filipino Farmers  
**Tech Stack:** Next.js 16 (App Router), PostgreSQL, Drizzle ORM, Tailwind CSS, Recharts

---

## 🎯 Core Purpose

Helps farmers decide:
- **What crop to plant** — AI crop suitability recommendations
- **Where to sell** — Best market location with alternatives
- **When to sell** — Optimal timing (Immediately / This Week / Wait)
- **At what expected price** — ML-powered price prediction

---

## 🧠 AI Features Implemented

### 1. Machine Learning Models (TypeScript)

| Model | Type | Purpose |
|-------|------|---------|
| **PriceRegressionModel** | Linear Regression | Predicts crop prices based on historical prices, seasonality, and trend |
| **DemandClassifier** | Naive Bayes Classifier | Classifies demand as High, Medium, or Low |

### 2. Rule-Based Knowledge System

Decision rules that combine ML outputs with domain expertise:

| Rule | Condition | Recommendation |
|------|-----------|---------------|
| 1 | Demand=High AND Price=High | ✅ Sell Immediately |
| 2 | Demand=High AND Price=Increasing | ⏳ Delay Selling (prices rising) |
| 3 | Demand=Low | 🗺️ Seek Alternative Markets |
| 4 | Oversupply Detected | 📦 Redistribute Surplus |
| 5 | Price=Decreasing | ⚡ Sell Now (prices falling) |
| 6 | Peak Season + Med Demand | 🏪 Standard Market Sale |
| 7 | Off Season + High Demand | 💎 Premium Pricing Strategy |
| 8 | Low Price + Low Demand | 🏭 Consider Processing/Storage |

### 3. Reasoning Engine

Combines ML outputs + rules to generate:
- **Best market location**
- **Selling strategy** (with explanation in simple language)
- **Expected price range**
- **Risk level** (Low / Moderate / High)

### 4. AI Chatbot Assistant

Farmer-friendly chatbot answers questions like:
- "Where should I sell my corn?"
- "Is now a good time to sell?"
- "What should I plant this season?"
- "How much is rice selling for?"

---

## 📊 System Features

### 👨‍🌾 Farmer Dashboard
- **Input:** Crop type, Location (region), Quantity
- **Output:**
  - ✅ Predicted demand level (High/Medium/Low)
  - ✅ Predicted price per unit
  - ✅ Best market location
  - ✅ Selling strategy with explanation
  - ✅ Risk level indicator
  - ✅ Seasonality information
  - ✅ Price trend forecast chart
  - ✅ Alternative market suggestions
  - ✅ Expected total revenue
- **Interactive Charts:** Price trend line chart
- **Map Visualization:** Market locations in Cotabato
- **AI Chatbot:** Floating chat assistant

### 🛠️ Admin Panel
- **Upload datasets** (CSV files for prices, demand, markets)
- **View analytics dashboard:**
  - Total crops, regions, markets, datasets
  - Price trends over time
  - Average prices by crop (bar chart)
  - Demand distribution (pie chart)
  - Top performing crops
- **Manage crops and regions** overview
- **Download sample CSV** template

---

## 🗄️ Database Schema (PostgreSQL via Drizzle ORM)

| Table | Description |
|-------|-------------|
| `regions` | Cotabato provinces and cities |
| `crops` | 10 supported crops with season info |
| `markets` | 6 markets with locations and types |
| `price_history` | 1,080 records (3 years × 12 months × 3 regions × 10 crops) |
| `demand_data` | 1,080 demand classification records |
| `recommendations` | Stored prediction results |
| `datasets` | Uploaded CSV file metadata |
| `chat_history` | Chatbot conversation logs |

---

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/crops` | GET | List all crops |
| `/api/regions` | GET | List all regions |
| `/api/markets` | GET | List markets (optional `?regionId=`) |
| `/api/predict` | GET | ML price + demand prediction |
| `/api/recommend` | GET | Full recommendation (ML + Rules) |
| `/api/chatbot` | POST | AI chatbot response |
| `/api/suggest-crops` | GET | Crop planting recommendations |
| `/api/datasets` | GET/POST | Upload/manage datasets |
| `/api/analytics` | GET | Admin analytics data |

---

## 🌱 Sample Data (Cotabato Region)

### Regions
1. North Cotabato — Corn, Rice, Banana, Coffee
2. Midsayap — Rice, Corn, Vegetables
3. Kidapawan City — Coffee, Banana, Vegetables
4. Davao City — Trading hub
5. General Santos — Trading hub

### Crops (with seasonality)
| Crop | Season | Expected Price |
|------|--------|---------------|
| Corn (Maize) | May-Oct | ₱18-35/kg |
| Rice | Jun-Nov | ₱45-65/kg |
| Banana | Year-round | ₱30-50/kg |
| Coffee | Oct-Mar | ₱120-180/kg |
| Eggplant | Sep-Apr | ₱35-55/kg |
| Tomato | Oct-Apr | ₱40-60/kg |

### Markets
- Midsayap Public Market (Mon, Wed, Fri)
- Kidapawan City Public Market (Tue, Thu, Sat)
- North Cotabato Agri-Trading Center (Mon-Sat)
- Cotabato Corn Processing Center (Mon-Fri)
- Davao City Farmers Market
- General Santos Fishport Complex

---

## 🎨 UI/UX Design

- **Clean, mobile-friendly** design with Tailwind CSS
- **Simple language** (farmer-friendly Tagalog/English interface)
- **Color indicators:**
  - 🟢 Green = Good profit / Low risk
  - 🟡 Orange/Yellow = Moderate / Medium
  - 🔴 Red = Risk / Low demand
- **Icons:** Lucide React icon library
- **Animations:** Fade-in, slide, bounce effects
- **Cards, charts, and map visualization**

---

## 🚫 Limitations (Respected in Design)

- ❌ No real-time nationwide data (uses seeded sample data)
- ❌ No disaster prediction
- ❌ No full logistics optimization
- ❌ No physical hardware integration

---

## 🧪 How to Run

```bash
# 1. Start the dev server
npm run dev

# 2. Seed the database (already done)
npx tsx scripts/seed.ts

# 3. Build for production
npm run build
npm start
```

---

## 📝 Tech Stack

| Category | Technology |
|----------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL + Drizzle ORM |
| **AI/ML** | TypeScript (Linear Regression, Naive Bayes) |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **CSV** | PapaParse |
