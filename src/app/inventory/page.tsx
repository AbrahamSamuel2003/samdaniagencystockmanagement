"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Boxes,
  Search,
  Download,
  PlusCircle,
  SlidersHorizontal,
  History,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import { StockStore, AppState } from "@/lib/store";
import { formatQuantity, exportToCSV } from "@/lib/utils";

function InventoryContent() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("filter") || "all";

  const [state, setState] = useState<AppState | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter);

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

      let matchesStatus = true;
      if (statusFilter === "low") {
        matchesStatus =
          p.lowStockLimit !== undefined &&
          p.lowStockLimit !== null &&
          p.currentStock <= p.lowStockLimit &&
          p.currentStock >= 0;
      } else if (statusFilter === "negative") {
        matchesStatus = p.currentStock < 0;
      } else if (statusFilter === "normal") {
        matchesStatus =
          p.currentStock > 0 &&
          (p.lowStockLimit === undefined ||
            p.lowStockLimit === null ||
            p.currentStock > p.lowStockLimit);
      }

      return matchesSearch && matchesBrand && matchesStatus;
    });
  }, [state, searchQuery, selectedBrand, statusFilter]);

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xs font-semibold text-slate-500">
          Loading inventory...
        </div>
      </div>
    );
  }

  const handleExportCSV = () => {
    const data = filteredProducts.map((p) => ({
      Brand: p.brandName,
      Product: p.name,
      "Package Size": `${p.packageSize} ${p.packageUnit}`,
      "Stock Unit": p.stockUnit,
      "Current Stock": p.currentStock,
      "Low Stock Limit": p.lowStockLimit ?? "None",
      "Box Conversion": p.hasBoxConversion
        ? `1 Box = ${p.unitsPerBox} ${p.subUnitName || "Units"}`
        : "No",
      Status:
        p.currentStock < 0
          ? "Negative"
          : p.lowStockLimit && p.currentStock <= p.lowStockLimit
          ? "Low Stock"
          : "Normal",
    }));
    exportToCSV(data, `SD_Current_Stock_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Godown Stock ({filteredProducts.length} SKUs)
            </h1>
            <p className="text-[11px] text-slate-500">
              Live physical balance across all brands
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 shadow-xs flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV</span>
          </button>

          <Link
            href="/inventory/products"
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm flex items-center space-x-1"
          >
            <PlusCircle className="w-3.5 h-3.5 text-white" />
            <span>+ SKU</span>
          </Link>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search product, brand, package size..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 font-medium"
          />
        </div>

        {/* Brand Chips */}
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
            All ({state.products.length})
          </button>
          {state.brands.map((b) => (
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

        {/* Status Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`flex-1 py-1 font-semibold rounded-lg transition-colors ${
              statusFilter === "all"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600"
            }`}
          >
            All Stock
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("low")}
            className={`flex-1 py-1 font-semibold rounded-lg transition-colors ${
              statusFilter === "low"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-amber-700"
            }`}
          >
            Low Limit
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("negative")}
            className={`flex-1 py-1 font-semibold rounded-lg transition-colors ${
              statusFilter === "negative"
                ? "bg-red-600 text-white shadow-xs"
                : "text-red-700"
            }`}
          >
            Negative
          </button>
        </div>
      </div>

      {/* 2-Cards-Per-Row Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            No products match the selected filters.
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
                className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all space-y-3"
              >
                <div>
                  {/* Top line: Brand Badge & Status Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold rounded-md">
                      {p.brandName}
                    </span>
                    {isNeg ? (
                      <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold rounded-md">
                        Deficit
                      </span>
                    ) : isLow ? (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-md">
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                        In Stock
                      </span>
                    )}
                  </div>

                  {/* Product Name & Package Details */}
                  <div className="mt-2">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                      {p.name}
                    </h3>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      Size: {p.packageSize} {p.packageUnit}
                    </div>
                  </div>

                  {/* Box Conversion details if applicable */}
                  {p.hasBoxConversion && (
                    <div className="mt-1.5 text-[11px] text-blue-700 bg-blue-50/60 px-2 py-1 rounded-md border border-blue-100">
                      1 Box = {p.unitsPerBox} {p.subUnitName || "Units"}
                    </div>
                  )}
                </div>

                {/* Bottom Section: Stock Quantity & Action Shortcuts */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                      Current Stock
                    </span>
                    <span
                      className={`text-base font-black ${
                        isNeg
                          ? "text-red-600"
                          : isLow
                          ? "text-amber-600"
                          : "text-slate-900"
                      }`}
                    >
                      {formatQuantity(p.currentStock, p.stockUnit)}
                    </span>
                    {p.lowStockLimit !== undefined && p.lowStockLimit !== null && (
                      <span className="text-[10px] text-slate-400 block">
                        Limit: {p.lowStockLimit} {p.stockUnit}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <Link
                      href={`/adjustments?productId=${p.id}`}
                      className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1"
                      title="Adjust Stock"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Adjust</span>
                    </Link>

                    <Link
                      href={`/reports?productId=${p.id}`}
                      className="p-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl text-xs font-semibold flex items-center space-x-1"
                      title="View Movement History"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Logs</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-xs font-semibold text-slate-500">
            Loading inventory...
          </div>
        </div>
      }
    >
      <InventoryContent />
    </Suspense>
  );
}
