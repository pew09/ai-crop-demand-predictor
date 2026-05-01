import type { Metadata } from "next";
import "./globals.css";
import { Leaf, Sprout } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Crop Market Predictor - Cotabato",
  description: "AI-Powered Crop Demand and Market Prediction System for Farmers in the Philippines",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
        <nav className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="bg-gradient-to-br from-green-500 to-green-700 p-2 rounded-xl group-hover:shadow-lg transition-all">
                  <Sprout className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold text-green-800">CropPredict</span>
                  <span className="text-xs text-green-600 block -mt-1">Cotabato AI</span>
                </div>
              </Link>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link
                  href="/"
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all"
                >
                  Home
                </Link>
                <Link
                  href="/farmer"
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all"
                >
                  Farmer Dashboard
                </Link>
                <Link
                  href="/admin"
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all"
                >
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-green-900 text-green-200 py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Leaf className="w-5 h-5 text-green-400" />
              <span className="font-semibold text-green-300">AI-Based Crop Demand and Market Prediction System</span>
            </div>
            <p className="text-sm text-green-400">
              Empowering Farmers in Cotabato and Mindanao with AI-Driven Agricultural Intelligence
            </p>
            <p className="text-xs text-green-500 mt-2">
              © 2026 CropPredict Cotabato. Built with ❤️ for Filipino Farmers
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
