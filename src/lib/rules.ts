// Rule-Based Knowledge System for Agricultural Recommendations
// Implements decision rules combining ML outputs with domain knowledge

export interface RuleInput {
  demandLevel: "High" | "Medium" | "Low";
  predictedPrice: number;
  priceTrend: "Increasing" | "Stable" | "Decreasing";
  seasonalityScore: number;
  quantity: number;
  oversupplyDetected: boolean;
  alternativeMarkets: { id: number; name: string; distance: number }[];
}

export interface RuleOutput {
  strategy: string;
  timing: "Immediately" | "This Week" | "Next Week" | "Wait";
  explanation: string;
  riskLevel: "Low" | "Moderate" | "High";
  alternativeMarkets: { id: number; name: string; reason: string }[];
  confidence: number;
}

export class RuleEngine {
  evaluate(input: RuleInput): RuleOutput {
    const outputs: RuleOutput[] = [];

    // Rule 1: High demand + High price → Sell Immediately
    if (input.demandLevel === "High" && input.predictedPrice > 30) {
      outputs.push({
        strategy: "Sell Immediately",
        timing: "Immediately",
        explanation: `High demand and good price of ₱${input.predictedPrice}/kg. This is an excellent time to sell your produce.`,
        riskLevel: "Low",
        alternativeMarkets: [],
        confidence: 0.9,
      });
    }

    // Rule 2: High demand + Increasing price trend → Delay Selling
    if (input.demandLevel === "High" && input.priceTrend === "Increasing") {
      outputs.push({
        strategy: "Delay Selling - Prices Rising",
        timing: "Next Week",
        explanation: `Demand is high and prices are trending upward. Waiting a bit could yield higher profits.`,
        riskLevel: "Moderate",
        alternativeMarkets: [],
        confidence: 0.75,
      });
    }

    // Rule 3: Low demand → Suggest closest alternative market
    if (input.demandLevel === "Low" && input.alternativeMarkets.length > 0) {
      const sortedMarkets = [...input.alternativeMarkets].sort((a, b) => a.distance - b.distance);
      const bestMarket = sortedMarkets[0];
      const alternatives = sortedMarkets.map((m) => ({
        id: m.id,
        name: m.name,
        reason: `Potential better market opportunity ${m.distance.toFixed(1)}km away`,
      }));

      outputs.push({
        strategy: "Seek Alternative Markets",
        timing: "This Week",
        explanation: `Local demand is low. Consider selling at a nearby market like **${bestMarket.name}**, which is only ${bestMarket.distance.toFixed(1)}km away.`,
        riskLevel: "Moderate",
        alternativeMarkets: alternatives,
        confidence: 0.78, // Slightly increased confidence due to specific advice
      });
    }

    // Rule 4: Oversupply detected → Redistribution
    if (input.oversupplyDetected) {
      outputs.push({
        strategy: "Redistribute Surplus",
        timing: "Immediately",
        explanation: `Oversupply detected in your area. Consider redistributing to prevent spoilage and price collapse.`,
        riskLevel: "High",
        alternativeMarkets: [],
        confidence: 0.85,
      });
    }

    // Rule 5: Decreasing price trend → Sell now
    if (input.priceTrend === "Decreasing" && input.demandLevel !== "Low") {
      outputs.push({
        strategy: "Sell Now - Prices Falling",
        timing: "Immediately",
        explanation: `Prices are on a downward trend. Selling now will secure better returns before prices drop further.`,
        riskLevel: "Moderate",
        alternativeMarkets: [],
        confidence: 0.8,
      });
    }

    // Rule 6: Peak season + Medium demand → Normal market
    if (input.seasonalityScore > 0.7 && input.demandLevel === "Medium") {
      outputs.push({
        strategy: "Standard Market Sale",
        timing: "This Week",
        explanation: `It's peak season with moderate demand. Standard market conditions - proceed with normal selling.`,
        riskLevel: "Low",
        alternativeMarkets: [],
        confidence: 0.65,
      });
    }

    // Rule 7: Off season + High demand → Premium pricing
    if (input.seasonalityScore < 0.4 && input.demandLevel === "High") {
      outputs.push({
        strategy: "Premium Pricing Strategy",
        timing: "Immediately",
        explanation: `Off-season with high demand! You can command premium prices for your produce.`,
        riskLevel: "Low",
        alternativeMarkets: [],
        confidence: 0.88,
      });
    }

    // Rule 8: Low price + Low demand → Hold/Process
    if (input.demandLevel === "Low" && input.predictedPrice < 20) {
      outputs.push({
        strategy: "Consider Processing or Storage",
        timing: "Wait",
        explanation: `Both price and demand are low. Consider processing your crop (e.g., drying, milling) or storage until market improves.`,
        riskLevel: "High",
        alternativeMarkets: [],
        confidence: 0.6,
      });
    }

    // If no rules matched, provide a default recommendation
    if (outputs.length === 0) {
      outputs.push({
        strategy: "Monitor Market",
        timing: "This Week",
        explanation: `Market conditions are normal. Monitor prices daily and sell when you get a good offer.`,
        riskLevel: "Moderate",
        alternativeMarkets: [],
        confidence: 0.5,
      });
    }

    // Select the best recommendation (highest confidence, with risk preference)
    const sorted = outputs.sort((a, b) => {
      // Prefer low risk with high confidence
      const riskScore = { Low: 3, Moderate: 2, High: 1 };
      return b.confidence * riskScore[b.riskLevel] - a.confidence * riskScore[a.riskLevel];
    });

    return sorted[0];
  }
}

// Knowledge base of agricultural facts
export const knowledgeBase = {
  cotabato: {
    regions: [
      { name: "North Cotabato", mainCrops: ["Corn (Maize)", "Rice", "Banana", "Coffee"] },
      { name: "Midsayap", mainCrops: ["Rice", "Corn (Maize)", "Vegetables"] },
      { name: "Kidapawan City", mainCrops: ["Coffee", "Banana", "Vegetables"] },
    ],
    marketDays: {
      "Midsayap Public Market": "Monday, Wednesday, Friday",
      "Kidapawan City Public Market": "Tuesday, Thursday, Saturday",
      "North Cotabato Agri-Trading Center": "Monday-Saturday",
      "Cotabato Corn Processing Center": "Monday-Friday",
    },
    cropCalendars: {
      "Corn (Maize)": {
        planting: "May-June",
        harvest: "August-October",
        priceRange: "₱30-45/kg",
        seasons: [5, 6, 7, 8, 9, 10],
        bestMarkets: ["Cotabato Corn Processing Center", "Midsayap Public Market"],
        icon: "🌽",
      },
      Rice: {
        planting: "June-July",
        harvest: "October-November",
        priceRange: "₱50-65/kg",
        seasons: [6, 7, 8, 9, 10, 11],
        bestMarkets: ["North Cotabato Agri-Trading Center"],
        icon: "🍚",
      },
      Eggplant: {
        planting: "September-November",
        harvest: "January-March",
        priceRange: "₱35-55/kg",
        seasons: [9, 10, 11, 12, 1, 2, 3],
        bestMarkets: ["Local Markets"],
        icon: "🍆",
      },
      Tomato: {
        planting: "October-December",
        harvest: "January-April",
        priceRange: "₱40-60/kg",
        seasons: [10, 11, 12, 1, 2, 3, 4],
        bestMarkets: ["Local Markets"],
        icon: "🍅",
      },
      "String Beans": {
        planting: "April-June",
        harvest: "July-September",
        priceRange: "₱30-45/kg",
        seasons: [4, 5, 6, 7, 8, 9],
        bestMarkets: ["Local Markets"],
        icon: "🌱",
      },
      Okra: {
        planting: "March-May",
        harvest: "June-August",
        priceRange: "₱25-40/kg",
        seasons: [3, 4, 5, 6, 7, 8],
        bestMarkets: ["Local Markets"],
        icon: "🌿",
      },
      Cabbage: {
        planting: "November-January",
        harvest: "February-April",
        priceRange: "₱38-55/kg",
        seasons: [11, 12, 1, 2, 3, 4],
        bestMarkets: ["Kidapawan City Public Market"],
        icon: "🥬",
      },
      Banana: {
        planting: "Year-round",
        harvest: "Year-round",
        priceRange: "₱30-50/kg",
        seasons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        bestMarkets: ["Davao City Farmers Market", "Local Markets"],
        icon: "🍌",
      },
      Coffee: {
        planting: "October-November",
        harvest: "January-March",
        priceRange: "₱120-180/kg",
        seasons: [10, 11, 12, 1, 2, 3],
        bestMarkets: ["Kidapawan City Public Market"],
        icon: "☕",
      },
    },
  },
};

export interface CropRecommendation {
  cropName: string;
  suitabilityScore: number;
  reason: string;
  expectedProfit: string;
}

// Recommends crops by pulling from the centralized knowledge base and using deterministic logic.
export function recommendCrops(
  month: number,
  regionName: string // regionName is kept for future expansion
): CropRecommendation[] {
  const allCrops = Object.entries(knowledgeBase.cotabato.cropCalendars);

  return allCrops
    .map(([cropName, cropData]) => {
      const isInSeason = cropData.seasons.includes(month);

      // Calculate how many months until the next season starts
      const nextSeasonMonths = cropData.seasons.map((s) => {
        const diff = s >= month ? s - month : s + 12 - month;
        return diff;
      });
      const closestSeason = Math.min(...nextSeasonMonths);

      // Deterministic suitability score based on seasonality
      let suitabilityScore: number;
      if (isInSeason) {
        suitabilityScore = 0.9; // High score for in-season crops
      } else if (closestSeason <= 2) {
        suitabilityScore = 0.6; // Medium score for crops starting soon
      } else {
        suitabilityScore = 0.3; // Low score for off-season crops
      }

      return {
        cropName: cropName,
        suitabilityScore: suitabilityScore,
        reason: isInSeason
          ? `Optimal planting time`
          : closestSeason <= 2
            ? `Season starting in ${closestSeason} month(s)`
            : `Off-season`,
        expectedProfit: cropData.priceRange,
      };
    })
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore);
}

// Simple chatbot response engine
export function getChatbotResponse(
  message: string,
  context: { crop?: string; region?: string }
): string {
  const msg = message.toLowerCase();

  // Sell-related queries
  if (msg.includes("sell") || msg.includes("market") || msg.includes("where")) {
    const crops = knowledgeBase.cotabato.cropCalendars;
    if (msg.includes("corn") || msg.includes("maiz")) {
      const crop = crops["Corn (Maize)"];
      return `${crop.icon} For corn in North Cotabato, the best markets are **${crop.bestMarkets.join(" and ")}** where prices range from ${crop.priceRange}.`;
    }
    if (msg.includes("rice")) {
      const crop = crops["Rice"];
      return `${crop.icon} For rice, I recommend the **${crop.bestMarkets.join(" and ")}**. Current prices are around ${crop.priceRange} depending on quality.`;
    }
    if (msg.includes("coffee")) {
      const crop = crops["Coffee"];
      return `${crop.icon} For coffee, **${crop.bestMarkets.join(" and ")}** is your best option. Cotabato Arabica coffee fetches premium prices of ${crop.priceRange}.`;
    }
    if (msg.includes("banana")) {
      const crop = crops["Banana"];
      return `${crop.icon} You can sell bananas at any local market. **${crop.bestMarkets[0]}** offers the best bulk prices at ${crop.priceRange}.`;
    }
    return `📍 For your produce in ${context.region || "Cotabato"}, I recommend visiting your nearest public market or the North Cotabato Agri-Trading Center. Want me to check specific crop prices?`;
  }

  // Price-related queries
  if (msg.includes("price") || msg.includes("how much") || msg.includes("magkano")) {
    const crops = knowledgeBase.cotabato.cropCalendars;
    if (msg.includes("corn") || msg.includes("maiz")) {
      return `💰 Current corn prices in Cotabato range from ${crops["Corn (Maize)"].priceRange}. Prices are expected to rise in the coming weeks due to increasing demand.`;
    }
    if (msg.includes("rice")) {
      return `💰 Rice prices: ${crops["Rice"].priceRange} in local markets. Imported rice may affect local prices slightly.`;
    }
    return `💰 For the latest prices in ${context.region || "Cotabato"}, check the Farmer Dashboard for AI-powered price predictions.`;
  }

  // When to sell
  if (msg.includes("when") || msg.includes("time") || msg.includes("now")) {
    return "⏰ Check the **Farmer Dashboard** for AI analysis! It combines demand forecasts and price trends to tell you the best time to sell. Generally, selling when demand is High and prices are stable gives the best returns.";
  }

  // What to plant
  if (msg.includes("plant") || msg.includes("grow") || msg.includes("tanim")) {
    const month = new Date().getMonth() + 1;
    if (month >= 5 && month <= 10) {
      return "🌱 This is a great time to plant **Corn** or **Rice** in Cotabato! The rainy season provides good growing conditions. For vegetables, consider **Eggplant** or **Okra**.";
    }
    if (month >= 10 && month <= 3) {
      return "🌱 **Coffee** and **Cabbage** are excellent choices for planting now. The cooler months are perfect for these crops in Cotabato.";
    }
    return "🌱 Consider planting **Banana** (anytime) or **String Beans** for the upcoming season. Check the dashboard for AI recommendations!";
  }

  // Weather / Climate
  if (msg.includes("weather") || msg.includes("rain") || msg.includes("ulan")) {
    return "🌤️ In Cotabato, the dry season runs December-May and wet season June-November. Plan your planting accordingly: crops like Rice and Corn thrive during the wet season.";
  }

  // Help / Default
  if (msg.includes("help") || msg.includes("hello") || msg.includes("hi")) {
    return "👋 **Ate! Kuya!** I'm your AI farming assistant! You can ask me:\n• \"Where should I sell my corn?\"\n• \"Is now a good time to sell?\"\n• \"What should I plant this season?\"\n• \"How much is rice selling for?\"";
  }

  // Default response
  return `🤖 I understand you're asking about "${message}". For Cotabato farmers, I can help with:
• Market locations and prices
• Best time to sell
• What crops to plant
• Price predictions

Please visit the **Farmer Dashboard** for detailed AI analysis, or ask me a specific question!`;
}