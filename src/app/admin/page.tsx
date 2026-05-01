"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  Database,
  BarChart3,
  TrendingUp,
  Wheat,
  MapPin,
  Store,
  Download,
  FileSpreadsheet,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Users,
  PieChart,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface AnalyticsData {
  overview: {
    totalCrops: number;
    totalRegions: number;
    totalMarkets: number;
    totalDatasets: number;
    totalPriceRecords: number;
  };
  avgPricesByCrop: { cropName: string; avgPrice: number; count: number }[];
  demandDistribution: { level: string; count: number }[];
  priceTrend: { year: number; month: number; avgPrice: number }[];
}

const COLORS = ["#4caf50", "#ff9800", "#ef5350"];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "datasets" | "crops">("dashboard");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState("");
  const [datasetType, setDatasetType] = useState("price");
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    fetchDatasets();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      const data = await res.json();
      if (data.success) setAnalytics(data.data);
    } catch (e) {
      console.error("Failed to fetch analytics", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchDatasets = async () => {
    try {
      const res = await fetch("/api/datasets");
      const data = await res.json();
      if (data.success) setDatasets(data.data);
    } catch (e) {
      console.error("Failed to fetch datasets", e);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !datasetName) return;

    setUploading(true);
    setUploadMsg("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", datasetName);
    formData.append("type", datasetType);

    try {
      const res = await fetch("/api/datasets", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setUploadMsg(`✅ ${data.message}`);
        setFile(null);
        setDatasetName("");
        fetchDatasets();
        fetchAnalytics();
      } else {
        setUploadMsg(`❌ ${data.error}`);
      }
    } catch (e: any) {
      setUploadMsg(`❌ Upload failed: ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  const downloadSampleCSV = () => {
    const headers = "crop_name,region_name,price,month,year,quantity\n";
    const sampleData =
      "Corn (Maize),North Cotabato,25.50,1,2024,1200\nRice,North Cotabato,52.00,1,2024,800\nBanana,North Cotabato,35.00,1,2024,1500\nEggplant,Midsayap,40.00,2,2024,600\nTomato,Kidapawan City,45.00,2,2024,900\nCoffee,North Cotabato,150.00,3,2024,300\n";
    const blob = new Blob([headers + sampleData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = "sample_crop_data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatPriceTrend = (data: { year: number; month: number; avgPrice: number }[]) => {
    return data.map((d) => ({
      period: `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.month - 1]} ${d.year}`,
      price: d.avgPrice,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Database className="w-8 h-8 mr-3 text-green-600" />
          Admin Panel
        </h1>
        <p className="text-gray-600 mt-1">Manage datasets, crops, regions, and view analytics</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white rounded-2xl p-1 shadow-sm border border-green-100 mb-8">
        {[
          { id: "dashboard" as const, label: "Analytics Dashboard", icon: BarChart3 },
          { id: "datasets" as const, label: "Manage Datasets", icon: Upload },
          { id: "crops" as const, label: "Crops & Regions", icon: Wheat },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-green-600 text-white shadow-md"
                : "text-gray-600 hover:bg-green-50"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && analytics && (
        <div className="space-y-6 animate-fadeIn">
          {/* Overview Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: "Total Crops", value: analytics.overview.totalCrops, icon: Wheat, color: "text-green-600", bg: "bg-green-100" },
              { label: "Regions", value: analytics.overview.totalRegions, icon: MapPin, color: "text-blue-600", bg: "bg-blue-100" },
              { label: "Markets", value: analytics.overview.totalMarkets, icon: Store, color: "text-purple-600", bg: "bg-purple-100" },
              { label: "Datasets", value: analytics.overview.totalDatasets, icon: Database, color: "text-orange-600", bg: "bg-orange-100" },
              { label: "Price Records", value: analytics.overview.totalPriceRecords, icon: Activity, color: "text-teal-600", bg: "bg-teal-100" },
            ].map((stat, i) => (
              <div key={i} className="card p-4 text-center">
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Price Trend Chart */}
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Price Trends Over Time
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formatPriceTrend(analytics.priceTrend).slice(-24)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="period" tick={{ fontSize: 10 }} interval={3} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₱${v}`} />
                    <Tooltip
                      formatter={(value: any) => [`₱${Number(value).toFixed(2)}`, "Avg Price"]}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e0e0e0" }}
                    />
                    <Line type="monotone" dataKey="price" stroke="#4caf50" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Average Prices by Crop */}
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                Average Prices by Crop
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.avgPricesByCrop} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₱${v}`} />
                    <YAxis type="category" dataKey="cropName" tick={{ fontSize: 10 }} width={100} />
                    <Tooltip
                      formatter={(value: any) => [`₱${Number(value).toFixed(2)}`, "Avg Price"]}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e0e0e0" }}
                    />
                    <Bar dataKey="avgPrice" fill="#4caf50" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Demand Distribution */}
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-green-600" />
                Demand Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={analytics.demandDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="level"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {analytics.demandDistribution.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "12px" }} />
                    <Legend />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-600" />
                System Summary
              </h3>
              <div className="space-y-4">
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="font-semibold text-green-800">Top Performing Crops (by avg price)</div>
                  <div className="mt-2 space-y-1">
                    {analytics.avgPricesByCrop
                      .sort((a, b) => b.avgPrice - a.avgPrice)
                      .slice(0, 5)
                      .map((crop, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-gray-700">{crop.cropName}</span>
                          <span className="font-medium text-green-700">₱{crop.avgPrice.toFixed(2)}</span>
                        </div>
                      ))}
                  </div>
                </div>
                <div className="bg-orange-50 rounded-xl p-4">
                  <div className="font-semibold text-orange-800">Demand Insights</div>
                  <div className="mt-2 space-y-1">
                    {analytics.demandDistribution.map((d, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-700">{d.level} Demand</span>
                        <span className="font-medium text-orange-700">
                          {((d.count / analytics.demandDistribution.reduce((s, x) => s + x.count, 0)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Datasets Tab */}
      {activeTab === "datasets" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Upload Form */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2 text-green-600" />
              Upload Dataset (CSV)
            </h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dataset Name</label>
                  <input
                    type="text"
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                    className="input-field"
                    placeholder="e.g., Cotabato Crop Prices 2024"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data Type</label>
                  <select
                    value={datasetType}
                    onChange={(e) => setDatasetType(e.target.value)}
                    className="input-field"
                  >
                    <option value="price">Price Data</option>
                    <option value="demand">Demand Data</option>
                    <option value="market">Market Data</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CSV File</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="input-field file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 file:font-medium"
                    required
                  />
                </div>
              </div>
              {uploadMsg && (
                <div className={`p-3 rounded-xl text-sm ${
                  uploadMsg.includes("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}>
                  {uploadMsg}
                </div>
              )}
              <div className="flex gap-3">
                <button type="submit" disabled={uploading} className="btn-primary flex items-center">
                  {uploading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5 mr-2" />
                  )}
                  {uploading ? "Uploading..." : "Upload Dataset"}
                </button>
                <button type="button" onClick={downloadSampleCSV} className="btn-secondary flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  Download Sample CSV
                </button>
              </div>
            </form>
          </div>

          {/* Saved Datasets */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FileSpreadsheet className="w-5 h-5 mr-2 text-green-600" />
              Saved Datasets
            </h2>
            {datasets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Database className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No datasets uploaded yet. Upload a CSV to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Rows</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Uploaded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datasets.map((ds) => (
                      <tr key={ds.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{ds.name}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                            {ds.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700">{ds.rows}</td>
                        <td className="py-3 px-4 text-right text-gray-500">
                          {new Date(ds.uploadedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Crops & Regions Tab */}
      {activeTab === "crops" && (
        <div className="grid lg:grid-cols-2 gap-6 animate-fadeIn">
          {/* Crops List */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Wheat className="w-5 h-5 mr-2 text-green-600" />
              Available Crops
            </h2>
            <div className="space-y-2">
              {analytics?.avgPricesByCrop.map((crop, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-green-50 transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Wheat className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{crop.cropName}</div>
                      <div className="text-xs text-gray-500">{crop.count} price records</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-700">₱{crop.avgPrice.toFixed(2)}</div>
                    <div className="text-xs text-gray-400">avg price</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regions List */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-green-600" />
              Service Areas
            </h2>
            <div className="space-y-2">
              {["North Cotabato", "Midsayap", "Kidapawan City", "Davao City", "General Santos"].map((region, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 transition-all">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{region}</div>
                      <div className="text-xs text-gray-500">{i < 3 ? "Cotabato Province" : "Nearby Region"}</div>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                    Active
                  </span>
                </div>
              ))}
            </div>

            {/* Markets */}
            <h3 className="font-bold text-gray-900 mt-6 mb-3">📍 Registered Markets</h3>
            <div className="space-y-2">
              {[
                { name: "Midsayap Public Market", type: "Public" },
                { name: "Kidapawan City Public Market", type: "Public" },
                { name: "North Cotabato Agri-Trading Center", type: "Wholesale" },
                { name: "Davao City Farmers Market", type: "Wholesale" },
                { name: "Cotabato Corn Processing Center", type: "Processing" },
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-2">
                    <Store className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{m.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{m.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
