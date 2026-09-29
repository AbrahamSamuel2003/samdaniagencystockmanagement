"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Boxes,
  Truck,
  ArrowDownToLine,
  Search,
  AlertTriangle,
  TrendingDown,
  History,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
} from "lucide-react";
import { StockStore, AppState } from "@/lib/store";
import { formatQuantity, formatDate } from "@/lib/utils";

export default function MobileNativeDashboard() {
  const [state, setState] = useState<AppState | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");
  const [filterMode, setFilterMode] = useState<"ALL" | "LOW" | "NEGATIVE">("ALL");

  useEffect(() => {
    setState(StockStore.getState());
  }, []);

  const filteredProducts = useMemo(() => {
    if (!state) return [];
    return state.products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${p.packageSize} ${p.packageUnit}`.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBrand = selectedBrand === "ALL" || p.brandId === selectedBrand;

      let matchesFilter = true;
      if (filterMode === "LOW") {
        matchesFilter =
          p.lowStockLimit !== undefined &&
          p.lowStockLimit !== null &&
          p.currentStock <= p.lowStockLimit &&
          p.currentStock >= 0;
      } else if (filterMode === "NEGATIVE") {
        matchesFilter = p.currentStock < 0;
      }

      return matchesSearch && matchesBrand && matchesFilter;
    });
  }, [state, searchQuery, selectedBrand, filterMode]);

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-xs font-semibold text-slate-500">
          Loading stock data...
        </div>
      </div>
    );
  }

  const { products, brands, deliveries, stockIns, transactions } = state;

  const lowStockItems = products.filter(
    (p) =>
      p.lowStockLimit !== undefined &&
      p.lowStockLimit !== null &&
      p.currentStock <= p.lowStockLimit &&
      p.currentStock >= 0
  );

  const negativeStockItems = products.filter((p) => p.currentStock < 0);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayDeliveries = deliveries.filter(
    (d) => d.deliveryDate && d.deliveryDate.slice(0, 10) === todayStr
  );
  const todayStockIns = stockIns.filter(
    (s) => s.date && s.date.slice(0, 10) === todayStr
  );

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* 2 Primary Core Native Action Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <Link
          href="/deliveries"
          className="bg-blue-600 active:bg-blue-700 text-white p-3.5 rounded-2xl shadow-sm flex flex-col justify-between transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className="text-[11px] font-semibold bg-white/15 px-2 py-0.5 rounded-full">
              {todayDeliveries.length} Today
            </span>
          </div>
          <div className="mt-3">
            <div className="text-sm font-bold tracking-tight leading-tight">
              Deliver to Shop
            </div>
            <div className="text-[11px] text-blue-100 mt-0.5">
              Reduces godown stock
            </div>
          </div>
        </Link>

        <Link
          href="/stock-in"
          className="bg-white active:bg-slate-50 border border-slate-200 p-3.5 rounded-2xl shadow-xs flex flex-col justify-between transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ArrowDownToLine className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              {todayStockIns.length} Today
            </span>
          </div>
          <div className="mt-3">
            <div className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
              Stock In Godown
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Adds received stock
            </div>
          </div>
        </Link>
      </div>

      {/* Critical Stock Alert Chips (if any) */}
      {(negativeStockItems.length > 0 || lowStockItems.length > 0) && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {negativeStockItems.length > 0 && (
            <button
              type="button"
              onClick={() =>
                setFilterMode(filterMode === "NEGATIVE" ? "ALL" : "NEGATIVE")
              }
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center space-x-1.5 ${
                filterMode === "NEGATIVE"
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{negativeStockItems.length} Negative Stock Alert</span>
            </button>
          )}

          {lowStockItems.length > 0 && (
            <button
              type="button"
              onClick={() =>
                setFilterMode(filterMode === "LOW" ? "ALL" : "LOW")
              }
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center space-x-1.5 ${
                filterMode === "LOW"
                  ? "bg-amber-500 text-white border-amber-500"
                  : "bg-amber-50 text-amber-900 border-amber-200"
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{lowStockItems.length} Low Stock Alert</span>
            </button>
          )}
        </div>
      )}

      {/* Live Godown Inventory List Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs space-y-3">
        {/* Search & Brand Filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Quick search product, brand, size..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 font-medium"
            />
          </div>

          {/* Brand Scrollable Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setSelectedBrand("ALL")}
              className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                selectedBrand === "ALL"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Brands ({products.length})
            </button>
            {brands.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBrand(b.id)}
                className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                  selectedBrand === b.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards List */}
        <div className="divide-y divide-slate-100">
          {filteredProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No products found matching filters.
            </div>
          ) : (
            filteredProducts.map((p) => {
              const isNeg = p.currentStock < 0;
              const isLow =
                p.lowStockLimit !== undefined &&
                p.lowStockLimit !== null &&
                p.currentStock <= p.lowStockLimit &&
                !isNeg;

              return (
                <div
                  key={p.id}
                  className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                        {p.brandName}
                      </span>
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {p.name}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center space-x-2">
                      <span>{p.packageSize} {p.packageUnit}</span>
                      {p.hasBoxConversion && (
                        <span className="text-[10px] text-blue-600 font-medium">
                          (1 Box = {p.unitsPerBox} {p.subUnitName || "Units"})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stock Counter & Quick Adjust Button */}
                  <div className="text-right flex items-center space-x-2.5 flex-shrink-0">
                    <div>
                      <div
                        className={`text-sm font-black ${
                          isNeg
                            ? "text-red-600"
                            : isLow
                            ? "text-amber-600"
                            : "text-slate-900"
                        }`}
                      >
                        {formatQuantity(p.currentStock, p.stockUnit)}
                      </div>
                      <div className="text-[10px] font-medium">
                        {isNeg ? (
                          <span className="text-red-600 font-bold">Deficit</span>
                        ) : isLow ? (
                          <span className="text-amber-700 font-bold">Low Stock</span>
                        ) : (
                          <span className="text-emerald-700 font-semibold">In Stock</span>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/adjustments?productId=${p.id}`}
                      className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 border border-slate-200 rounded-lg"
                      title="Adjust Stock"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recent Activity Ledger Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900 uppercase">
            <History className="w-4 h-4 text-blue-600" />
            <span>Recent Movements</span>
          </div>
          <Link
            href="/reports"
            className="text-[11px] font-bold text-blue-600 hover:underline"
          >
            All Logs
          </Link>
        </div>

        <div className="space-y-2.5">
          {recentTransactions.map((tx) => {
            const isPositive = tx.quantity > 0;
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      tx.type === "STOCK_IN" || tx.type === "OPENING"
                        ? "bg-blue-100 text-blue-700"
                        : tx.type === "DELIVERY"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {isPositive ? (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div className="min-w-0 truncate">
                    <div className="font-bold text-slate-900 truncate">
                      {tx.brandName} {tx.productName} ({tx.packageDisplay})
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {tx.partyName || tx.type} • {formatDate(tx.transactionDate || tx.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-2">
                  <div
                    className={`font-bold ${
                      isPositive ? "text-blue-700" : "text-slate-800"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {tx.quantity} {tx.unit}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Bal: {tx.balanceAfter}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
