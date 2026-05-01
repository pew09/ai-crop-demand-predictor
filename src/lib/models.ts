// ML Models implemented in TypeScript for crop price prediction and demand classification
// These implement simplified versions of Linear Regression and Naive Bayes classifiers

export interface PricePredictionInput {
  cropId: number;
  regionId: number;
  month: number;
  year: number;
  historicalPrices: { month: number; year: number; price: number }[];
  historicalDemand: { month: number; year: number; demand: string }[];
}

export interface DemandClassificationInput {
  cropId: number;
  regionId: number;
  month: number;
  seasonFactor: number;
  historicalDemand: { month: number; year: number; demand: string }[];
}

export interface PredictionResult {
  predictedPrice: number;
  demandLevel: "High" | "Medium" | "Low";
  demandConfidence: number;
  priceTrend: "Increasing" | "Stable" | "Decreasing";
  seasonalityScore: number;
}

// Simple Linear Regression for price prediction
export class PriceRegressionModel {
  private slope: number = 0;
  private intercept: number = 0;
  private seasonalWeights: number[] = Array(12).fill(0);
  private locationBias: Map<string, number> = new Map();

  train(data: { month: number; year: number; price: number; regionId: number; cropId: number }[]) {
    // A simple regression needs at least 2 data points to find a line.
    if (data.length < 2) {
      console.warn("Warning: Not enough data to train price model. Predictions will be flat.");
      return;
    }

    // Time trend (year + month/12)
    const timeValues = data.map((d) => d.year + (d.month - 1) / 12);
    const prices = data.map((d) => d.price);

    // Simple linear regression for trend
    const n = timeValues.length;
    const meanX = timeValues.reduce((a, b) => a + b, 0) / n;
    const meanY = prices.reduce((a, b) => a + b, 0) / n;

    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (timeValues[i] - meanX) * (prices[i] - meanY);
      den += (timeValues[i] - meanX) ** 2;
    }

    this.slope = den !== 0 ? num / den : 0;
    this.intercept = meanY - this.slope * meanX;

    // Seasonal weights (average deviation per month)
    const monthlyAvg: number[] = Array(12).fill(0);
    const monthlyCount: number[] = Array(12).fill(0);
    for (const d of data) {
      const idx = d.month - 1;
      monthlyAvg[idx] += d.price;
      monthlyCount[idx]++;
    }
    for (let i = 0; i < 12; i++) {
      if (monthlyCount[i] > 0) {
        monthlyAvg[i] /= monthlyCount[i];
      }
    }
    const validMonthlyAvgs = monthlyAvg.filter((avg, i) => monthlyCount[i] > 0);
    const overallAvg = validMonthlyAvgs.length > 0
      ? validMonthlyAvgs.reduce((a, b) => a + b, 0) / validMonthlyAvgs.length
      : prices.reduce((a, b) => a + b, 0) / n; // Fallback to overall average

    for (let i = 0; i < 12; i++) {
      this.seasonalWeights[i] = monthlyCount[i] > 0 ? monthlyAvg[i] - overallAvg : 0;
    }
  }

  predict(month: number, year: number): number {
    const timeValue = year + (month - 1) / 12;
    const trendPrice = this.slope * timeValue + this.intercept;
    const seasonalAdjustment = this.seasonalWeights[month - 1] || 0;
    return Math.max(1, trendPrice + seasonalAdjustment);
  }

  getTrend(): "Increasing" | "Stable" | "Decreasing" {
    if (this.slope > 0.05) return "Increasing";
    if (this.slope < -0.05) return "Decreasing";
    return "Stable";
  }
}

// Classification model for demand prediction using Bayesian approach
export class DemandClassifier {
  private priorProbabilities: Record<string, number> = { High: 0.33, Medium: 0.34, Low: 0.33 };
  private seasonalProbabilities: Record<string, number[]> = {
    High: Array(12).fill(1 / 12),
    Medium: Array(12).fill(1 / 12),
    Low: Array(12).fill(1 / 12),
  };

  train(data: { month: number; demand: string }[]) {
    if (data.length === 0) return;

    const total = data.length;
    const demandCounts: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
    const monthGivenDemand: Record<string, number[]> = {
      High: Array(12).fill(0),
      Medium: Array(12).fill(0),
      Low: Array(12).fill(0),
    };

    for (const d of data) {
      demandCounts[d.demand] = (demandCounts[d.demand] || 0) + 1;
      if (monthGivenDemand[d.demand]) {
        monthGivenDemand[d.demand][d.month - 1]++;
      }
    }

    for (const level of ["High", "Medium", "Low"] as const) {
      this.priorProbabilities[level] = demandCounts[level] / total;
      const countInLevel = demandCounts[level] || 1;
      for (let m = 0; m < 12; m++) {
        // Laplace smoothing
        this.seasonalProbabilities[level][m] = (monthGivenDemand[level][m] + 1) / (countInLevel + 12);
      }
    }
  }

  predict(month: number, seasonFactor: number): { level: "High" | "Medium" | "Low"; confidence: number } {
    const monthIdx = month - 1;
    const scores: Record<string, number> = {};

    for (const level of ["High", "Medium", "Low"] as const) {
      scores[level] =
        Math.log(this.priorProbabilities[level] || 0.33) +
        Math.log(this.seasonalProbabilities[level][monthIdx] || 1 / 12);
    }

    // Adjust scores based on seasonality.
    // A high seasonality score implies peak season (high supply), which we'll correlate with a higher likelihood of high demand.
    // This is a heuristic to make the model consider seasonality as a feature.
    scores["High"] += (seasonFactor - 0.5) * 0.5; // Boosts score for High demand in-season
    scores["Low"] -= (seasonFactor - 0.5) * 0.5;  // Penalizes score for Low demand in-season

    const maxScore = Math.max(...Object.values(scores));
    const expScores = Object.entries(scores).reduce(
      (acc, [k, v]) => {
        acc[k] = Math.exp(v - maxScore);
        return acc;
      },
      {} as Record<string, number>
    );

    const sumExp = Object.values(expScores).reduce((a, b) => a + b, 0);
    const probs: Record<string, number> = {};
    for (const [k, v] of Object.entries(expScores)) {
      probs[k] = v / sumExp;
    }

    const best = Object.entries(probs).sort((a, b) => b[1] - a[1])[0];

    return {
      level: best[0] as "High" | "Medium" | "Low",
      confidence: Math.round(best[1] * 100) / 100,
    };
  }
}

// Main prediction orchestrator
export function predictPrice(
  input: PricePredictionInput
): { price: number; trend: "Increasing" | "Stable" | "Decreasing" } {
  const model = new PriceRegressionModel();
  model.train(
    input.historicalPrices.map((p) => ({
      month: p.month,
      year: p.year,
      price: p.price,
      regionId: input.regionId,
      cropId: input.cropId,
    }))
  );

  const predictedPrice = model.predict(input.month, input.year);
  const trend = model.getTrend();

  return { price: Math.round(predictedPrice * 100) / 100, trend };
}

export function classifyDemand(input: DemandClassificationInput): {
  level: "High" | "Medium" | "Low";
  confidence: number;
} {
  const classifier = new DemandClassifier();
  classifier.train(
    input.historicalDemand.map((d) => ({
      month: d.month,
      demand: d.demand,
    }))
  );

  return classifier.predict(input.month, input.seasonFactor);
}

// Calculate seasonality score (0-1) for a crop given the month
export function calculateSeasonalityScore(
  month: number,
  seasonStart: number,
  seasonEnd: number
): number {
  if (seasonStart <= seasonEnd) {
    if (month >= seasonStart && month <= seasonEnd) {
      // Peak season = higher supply
      return 0.8 + 0.2 * Math.sin(((month - seasonStart) / (seasonEnd - seasonStart)) * Math.PI);
    }
  } else {
    // Cross-year season (e.g., Oct-Mar)
    if (month >= seasonStart || month <= seasonEnd) {
      return 0.8 + 0.2 * Math.sin(((month - seasonStart + 12) / (seasonEnd + 12 - seasonStart)) * Math.PI);
    }
  }
  // Off season
  const distToStart = Math.min(
    Math.abs(month - seasonStart),
    Math.abs(month - (seasonStart + 12)),
    Math.abs(month - seasonEnd),
    Math.abs(month - (seasonEnd + 12))
  );
  return Math.max(0.1, 0.5 - distToStart * 0.05);
}