"use client";

import { useState, useEffect } from "react";
import {
  Sprout,
  MapPin,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Leaf,
  Wheat,
  Store,
  BarChart3,
  Loader2,
  RefreshCw,
  ThumbsUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";

interface Crop {
  id: number;
  name: string;
  category: string;
  unit: string;
}

interface Region {
  id: number;
  name: string;
  province: string;
}

interface Market {
  id: number;
  name: string;
  regionName: string;
  type: string;
  latitude: string;
  longitude: string;
}

interface PredictionResult {
  crop: { id: number; name: string; category: string; unit: string };
  region: { id: number; name: string; province: string };
  mlPredictions: {
    predictedPrice: number;
    priceTrend: "Increasing" | "Stable" | "Decreasing";
    demandLevel: "High" | "Medium" | "Low";
    demandConfidence: number;
    seasonalityScore: number;
  };
  recommendation: {
    strategy: string;
    timing: "Immediately" | "This Week" | "Next Week" | "Wait";
    explanation: string;
    riskLevel: "Low" | "Moderate" | "High";
    confidence: number;
  };
  market: {
    bestMarket: string;
    type: string;
    alternativeMarkets: { id: number; name: string; reason: string }[];
  };
  financials: {
    predictedPricePerUnit: number;
    quantity: number;
    expectedRevenue: number;
    currency: string;
  };
  seasonInfo: {
    isPeakSeason: boolean;
    seasonScore: number;
    plantingSeason: string;
  };
}

// Sample price trend data for chart
const generateTrendData = (basePrice: number, trend: string) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = new Date().getMonth();
  return months.map((name, i) => {
    const monthDiff = i - currentMonth;
    let price = basePrice + monthDiff * (trend === "Increasing" ? 1.5 : trend === "Decreasing" ? -1.5 : 0.3);
    price += (Math.random() - 0.5) * 3;
    return { name, price: Math.max(5, Math.round(price * 100) / 100) };
  });
};

export default function FarmerDashboard() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState("");
  const [trendData, setTrendData] = useState<any[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [cropLoading, setCropLoading] = useState(true);
  const [cropError, setCropError] = useState("");

  useEffect(() => {
    fetchCrops();
    fetchRegions();
    fetchMarkets();
  }, []);

  const fetchCrops = async () => {
    setCropLoading(true);
    setCropError("");
    try {
      const res = await fetch("/api/crops");
      const data = await res.json();
      if (data.success) {
        setCrops(data.data);
        if (data.data.length === 0) {
          setCropError("No crops in database. Run seed script.");
        }
      } else {
        setCropError(data.error || "API error");
      }
    } catch (e) {
      console.error("Failed to fetch crops", e);
      setCropError("Failed to connect to database. Check DATABASE_URL and server.");
    } finally {
      setCropLoading(false);
    }
  };

  const fetchRegions = async () => {
    try {
      const res = await fetch("/api/regions");
      const data = await res.json();
      if (data.success) setRegions(data.data);
    } catch (e) {
      console.error("Failed to fetch regions", e);
    }
  };

  const fetchMarkets = async () => {
    try {
      const res = await fetch("/api/markets");
      const data = await res.json();
      if (data.success) setMarkets(data.data);
    } catch (e) {
      console.error("Failed to fetch markets", e);
    }
  };

  const handlePredict = async () => {
    if (!selectedCrop || !selectedRegion) {
      setError("Please select both a crop and a region");
      return;
    }
    setError("");
    setLoading(true);
    setShowWelcome(false);

    try {
      const res = await fetch(
        `/api/recommend?cropId=${selectedCrop}&regionId=${selectedRegion}&quantity=${quantity}&month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`
      );
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        setTrendData(
          generateTrendData(
            data.data.mlPredictions.predictedPrice,
            data.data.mlPredictions.priceTrend
          )
        );
      } else {
        setError(data.error || "Failed to get prediction");
      }
    } catch (e: any) {
      setError(e.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (risk: string) => {
    const styles: Record<string, string> = {
      Low: "risk-low",
      Moderate: "risk-moderate",
      High: "risk-high",
    };
    return styles[risk] || "risk-low";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "Increasing":
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case "Decreasing":
        return <TrendingUp className="w-5 h-5 text-red-500 rotate-180" />;
      default:
        return <TrendingUp className="w-5 h-5 text-yellow-500 rotate-90" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Sprout className="w-8 h-8 mr-3 text-green-600" />
          Farmer Dashboard
        </h1>
        <p className="text-gray-600 mt-1">AI-powered crop analysis for Cotabato farmers</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Input + Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input Form */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Leaf className="w-5 h-5 mr-2 text-green-600" />
              What are you farming?
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="input-field"
                  disabled={cropLoading}
                >
                  <option value="">
                    {cropLoading ? "Loading crops..." : cropError ? cropError : "Select crop..."}
                  </option>
                  {!cropLoading && !cropError &&
                    crops.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
                {cropError && (
                  <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1 flex-shrink-0" />
                    {cropError}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Location</label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select location...</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity ({result?.crop.unit || "kg"})
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="input-field"
                  min="1"
                />
              </div>
            </div>
            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}
            <button
              onClick={handlePredict}
              disabled={loading}
              className="btn-primary mt-4 w-full flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  AI is Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Get AI Recommendation
                </>
              )}
            </button>
          </div>

          {/* Results Section */}
          {showWelcome && !result && (
            <div className="card p-8 text-center animate-fadeIn">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sprout className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome, Farmer! 🌾</h2>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Enter your crop details on the left to get AI-powered predictions and recommendations tailored for Cotabato farmers.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 max-w-lg mx-auto">
                {[
                  { icon: Wheat, label: "Select Crop", desc: "Choose your crop" },
                  { icon: MapPin, label: "Your Area", desc: "Pick location" },
                  { icon: BarChart3, label: "Get Results", desc: "AI analysis" },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <item.icon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-sm font-semibold text-gray-900">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prediction Results */}
          {result && (
            <div className="space-y-6 animate-fadeIn">
              {/* Main Recommendation Card */}
              <div className="card p-6 border-l-4 border-green-500">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {result.crop.name} in {result.region.name}
                    </h3>
                    <p className="text-sm text-gray-500">{result.region.province}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskBadge(result.recommendation.riskLevel)}`}>
                    {result.recommendation.riskLevel} Risk
                  </span>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-green-800 text-lg">{result.recommendation.strategy}</p>
                      <p className="text-green-700 text-sm mt-1">{result.recommendation.explanation}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    <Clock className="w-4 h-4 mr-1" />
                    {result.recommendation.timing}
                  </span>
                  <span className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    {Math.round(result.recommendation.confidence * 100)}% Confidence
                  </span>
                </div>
              </div>

              {/* ML Predictions Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-4 text-center">
                  <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    ₱{result.mlPredictions.predictedPrice}
                  </div>
                  <div className="text-sm text-gray-500">Predicted Price/{result.crop.unit}</div>
                  <div className="mt-1 flex items-center justify-center text-xs">
                    {getTrendIcon(result.mlPredictions.priceTrend)}
                    <span className="ml-1">{result.mlPredictions.priceTrend}</span>
                  </div>
                </div>
                <div className="card p-4 text-center">
                  <BarChart3 className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {result.mlPredictions.demandLevel}
                  </div>
                  <div className="text-sm text-gray-500">Demand Level</div>
                  <div className={`mt-1 text-xs font-medium ${result.mlPredictions.demandLevel === "High" ? "text-green-600" :
                    result.mlPredictions.demandLevel === "Medium" ? "text-orange-600" : "text-red-600"
                    }`}>
                    {Math.round(result.mlPredictions.demandConfidence * 100)}% confidence
                  </div>
                </div>
                <div className="card p-4 text-center">
                  <Store className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-gray-900 truncate" title={result.market.bestMarket}>
                    {result.market.bestMarket}
                  </div>
                  <div className="text-sm text-gray-500">Best Market</div>
                  <div className="text-xs text-gray-400 capitalize">{result.market.type}</div>
                </div>
                <div className="card p-4 text-center">
                  <ShoppingCart className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-700">
                    ₱{result.financials.expectedRevenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Expected Revenue</div>
                  <div className="text-xs text-gray-400">{result.financials.quantity} {result.crop.unit}</div>
                </div>
              </div>

              {/* Season Info */}
              <div className="card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${result.seasonInfo.isPeakSeason ? "bg-green-500" : "bg-orange-400"}`} />
                    <div>
                      <span className="font-semibold text-gray-900">
                        {result.seasonInfo.isPeakSeason ? "Peak Season 🌤️" : "Off Season 🌧️"}
                      </span>
                      <p className="text-sm text-gray-500">Planting season: {result.seasonInfo.plantingSeason}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-700">Season Score</div>
                    <div className="text-2xl font-bold text-green-700">
                      {Math.round(result.seasonInfo.seasonScore * 100)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Alternative Markets */}
              {result.market.alternativeMarkets.length > 0 && (
                <div className="card p-5">
                  <h3 className="font-bold text-gray-900 mb-3">📍 Alternative Markets</h3>
                  <div className="space-y-2">
                    {result.market.alternativeMarkets.map((m, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-gray-900">{m.name}</span>
                        </div>
                        <span className="text-sm text-blue-700">{m.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Trend Chart */}
              <div className="card p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Price Trend Forecast
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(val) => `₱${val}`}
                      />
                      <Tooltip
                        formatter={(value: any) => [`₱${Number(value).toFixed(2)}`, "Price"]}
                        contentStyle={{
                          backgroundColor: "#fff",
                          borderRadius: "12px",
                          border: "1px solid #e0e0e0",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#4caf50"
                        strokeWidth={3}
                        dot={{ fill: "#2e7d32", strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: "#2e7d32" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Markets Map */}
              <div className="card p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-green-600" />
                  Available Markets Near You
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {markets.map((m) => (
                    <div
                      key={m.id}
                      className={`p-3 rounded-xl border transition-all ${m.name === result.market.bestMarket
                        ? "border-green-500 bg-green-50 shadow-sm"
                        : "border-gray-200 hover:border-green-300"
                        }`}
                    >
                      <div className="flex items-start space-x-2">
                        <Store className={`w-4 h-4 mt-0.5 ${m.name === result.market.bestMarket ? "text-green-600" : "text-gray-400"}`} />
                        <div className="min-w-0">
                          <div className="font-medium text-sm text-gray-900 truncate">{m.name}</div>
                          <div className="text-xs text-gray-500">{m.regionName}</div>
                          <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 mt-1 capitalize">
                            {m.type}
                          </span>
                          {m.name === result.market.bestMarket && (
                            <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 ml-1">
                              Best Choice
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Quick Info + Map */}
        <div className="space-y-6">
          {/* Quick Facts */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-3">📋 Quick Facts</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Crops Available:</span>
                <span className="font-semibold text-gray-900">{crops.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Markets:</span>
                <span className="font-semibold text-gray-900">{markets.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Regions:</span>
                <span className="font-semibold text-gray-900">{regions.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current Month:</span>
                <span className="font-semibold text-gray-900">
                  {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][new Date().getMonth()]}
                </span>
              </div>
            </div>
          </div>

          {/* Season Guide */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-3">🌱 Season Guide</h3>
            <div className="space-y-2">
              {[
                { crop: "Corn", season: "May-Oct", status: "planting" },
                { crop: "Rice", season: "Jun-Nov", status: "planting" },
                { crop: "Banana", season: "Year-round", status: "harvest" },
                { crop: "Coffee", season: "Oct-Mar", status: "planting" },
                { crop: "Eggplant", season: "Sep-Apr", status: "growing" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <span className="text-sm font-medium text-gray-900">{item.crop}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{item.season}</span>
                    <span className="w-2 h-2 rounded-full ${
                      item.status === 'harvest' ? 'bg-green-500' :
                      item.status === 'planting' ? 'bg-blue-500' : 'bg-yellow-500'
                    }" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Simple SVG Map */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-3">🗺️ Cotabato Markets</h3>
            <div className="bg-green-50 rounded-xl p-4">
              <svg viewBox="0 0 200 200" className="w-full h-48">
                {/* Simplified map of Cotabato region */}
                <polygon points="100,20 180,60 170,140 100,180 30,140 20,60" fill="#c8e6c9" stroke="#66bb6a" strokeWidth="2" />
                {/* Market markers */}
                <circle cx="80" cy="90" r="6" fill="#4caf50" stroke="white" strokeWidth="2" />
                <text x="85" y="85" fontSize="6" fill="#2e7d32">Midsayap</text>
                <circle cx="120" cy="70" r="6" fill="#4caf50" stroke="white" strokeWidth="2" />
                <text x="125" y="65" fontSize="6" fill="#2e7d32">Kidapawan</text>
                <circle cx="90" cy="120" r="6" fill="#2e7d32" stroke="white" strokeWidth="2" />
                <text x="95" y="115" fontSize="6" fill="#2e7d32">Cotabato City</text>
                <circle cx="140" cy="100" r="5" fill="#ff8f00" stroke="white" strokeWidth="2" />
                <text x="145" y="95" fontSize="6" fill="#e65100">Davao</text>
                {/* Legend */}
                <rect x="10" y="170" width="8" height="8" fill="#4caf50" rx="4" />
                <text x="22" y="178" fontSize="7" fill="#555">Markets</text>
                <rect x="80" y="170" width="8" height="8" fill="#2e7d32" rx="4" />
                <text x="92" y="178" fontSize="7" fill="#555">Best Choice</text>
              </svg>
              <p className="text-xs text-gray-500 text-center mt-2">
                Major market locations in Cotabato and nearby regions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

