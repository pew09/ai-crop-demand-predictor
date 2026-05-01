"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sprout,
  TrendingUp,
  MapPin,
  Bot,
  Shield,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Wheat,
  Store,
  Users,
  LineChart,
  MessageCircle,
  Database,
} from "lucide-react";

export default function HomePage() {
  const [currentMonth] = useState(new Date().getMonth() + 1);

  const features = [
    {
      icon: TrendingUp,
      title: "AI Price Prediction",
      desc: "ML-powered price forecasts based on historical data, seasonality, and market trends",
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      icon: BarChart3,
      title: "Demand Analysis",
      desc: "Classification models predict demand levels: High, Medium, or Low for informed decisions",
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      icon: Store,
      title: "Market Recommendations",
      desc: "AI identifies best market locations and optimal selling strategies",
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      icon: Bot,
      title: "AI Chat Assistant",
      desc: "Ask questions in simple language: \"Where should I sell my corn?\"",
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      icon: Shield,
      title: "Rule-Based Intelligence",
      desc: "Expert farming rules combined with ML for reliable, explainable recommendations",
      color: "text-red-600",
      bg: "bg-red-100",
    },
    {
      icon: Database,
      title: "Admin Analytics",
      desc: "Upload datasets, manage crops/regions, and view comprehensive analytics",
      color: "text-teal-600",
      bg: "bg-teal-100",
    },
  ];

  const plantingGuide = [
    { month: "May-Oct", crop: "Corn (Maize)", emoji: "🌽", profit: "₱30-45/kg" },
    { month: "Jun-Nov", crop: "Rice", emoji: "🍚", profit: "₱50-65/kg" },
    { month: "Year-round", crop: "Banana", emoji: "🍌", profit: "₱30-50/kg" },
    { month: "Sep-Apr", crop: "Eggplant", emoji: "🍆", profit: "₱35-55/kg" },
    { month: "Oct-Apr", crop: "Tomato", emoji: "🍅", profit: "₱40-60/kg" },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-800 via-green-700 to-emerald-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-green-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-28 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fadeIn">
              <div className="inline-flex items-center bg-green-600/30 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6 border border-green-400/30">
                <Sprout className="w-4 h-4 mr-2 text-green-300" />
                AI-Powered for Cotabato Farmers
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                AI-Based Crop Demand &{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                  Market Prediction
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-green-200 mb-8 max-w-xl">
                Empowering Filipino farmers with machine learning intelligence to decide
                <strong className="text-white"> what to plant, where to sell, when to sell, and at what price.</strong>
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/farmer"
                  className="inline-flex items-center px-6 py-3.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-green-900 font-bold rounded-xl hover:from-yellow-300 hover:to-orange-400 transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  Start Farming AI
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  href="/admin"
                  className="inline-flex items-center px-6 py-3.5 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
                >
                  Admin Panel
                </Link>
              </div>
            </div>
            <div className="hidden lg:block relative animate-slideInRight">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Crops Analyzed", value: "10+", icon: Wheat },
                    { label: "Markets Covered", value: "6+", icon: MapPin },
                    { label: "Data Points", value: "43K+", icon: BarChart3 },
                    { label: "Regions Served", value: "5", icon: Users },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/5 rounded-2xl p-4 text-center">
                      <stat.icon className="w-6 h-6 mx-auto mb-2 text-green-300" />
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-xs text-green-300">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-green-50 to-transparent" />
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Smart Features for Smart Farming
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Combine Machine Learning predictions with knowledge-based rules for accurate, actionable farming recommendations
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="card p-6 hover:border-green-200 border border-transparent animate-fadeIn"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-b from-white to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">Simple 3-step process for farmers</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Enter Your Details",
                desc: "Tell us your crop type, location, and quantity you plan to sell",
                icon: Sprout,
                color: "bg-green-500",
              },
              {
                step: "2",
                title: "AI Analysis",
                desc: "Our ML models analyze prices, demand, seasonality, and market data",
                icon: Bot,
                color: "bg-blue-500",
              },
              {
                step: "3",
                title: "Get Recommendations",
                desc: "Receive planting advice, best market, price prediction, and selling strategy",
                icon: CheckCircle2,
                color: "bg-orange-500",
              },
            ].map((item, i) => (
              <div key={i} className="text-center animate-fadeIn" style={{ animationDelay: `${i * 0.2}s` }}>
                <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-2">{item.step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Crop Planting Guide */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              🌾 Cotabato Crop Planting Guide
            </h2>
            <p className="text-gray-600 mb-6">
              Based on historical data and seasonal patterns, here are the recommended crops for Cotabato farmers
            </p>
            <div className="space-y-3">
              {plantingGuide.map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-green-100 hover:border-green-300 transition-all">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <div className="font-semibold text-gray-900">{item.crop}</div>
                      <div className="text-sm text-gray-500">{item.month}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-700">{item.profit}</div>
                    <div className="text-xs text-gray-400">Expected price</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl p-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
                AI Assistant Says:
              </h3>
              <div className="bg-green-50 rounded-xl p-4 mb-4">
                <p className="text-gray-700">
                  🌱 <strong>Ate! Kuya!</strong> For this month ({["January","February","March","April","May","June","July","August","September","October","November","December"][currentMonth-1]}), consider planting crops that match the current season in Cotabato.
                </p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4">
                <p className="text-gray-700">
                  💡 <strong>Tip:</strong> Visit the{" "}
                  <Link href="/farmer" className="text-green-700 font-semibold hover:underline">
                    Farmer Dashboard
                  </Link>{" "}
                  for AI-powered price predictions and personalized recommendations!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-green-700 to-emerald-800 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Grow Smarter? 🌱
          </h2>
          <p className="text-green-200 text-lg mb-8 max-w-2xl mx-auto">
            Join hundreds of Cotabato farmers using AI to make better decisions about their crops
          </p>
          <Link
            href="/farmer"
            className="inline-flex items-center px-8 py-4 bg-yellow-400 text-green-900 font-bold text-lg rounded-xl hover:bg-yellow-300 transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            Open Farmer Dashboard
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
