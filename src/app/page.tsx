"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Boxes,
  Truck,
  ArrowDownToLine,
  Search,
  AlertTriangle,
  History,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { StockStore, AppState } from "@/lib/store";
import { Product } from "@/lib/types";
import { formatQuantity, formatDate } from "@/lib/utils";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";

export default function MobileNativeDashboard() {
  const [state, setState] = useState<AppState | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");
  const [filterMode, setFilterMode] = useState<"ALL" | "LOW" | "NEGATIVE">("ALL");
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refreshState = () => {
    setState(StockStore.getState());
  };

  useEffect(() => {
    refreshState();
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const confirmDeleteProduct = () => {
    if (!productToDelete) return;
    StockStore.deleteProduct(productToDelete.id);
    setToastMessage(`Product "${productToDelete.name}" deleted.`);
    setProductToDelete(null);
    refreshState();
  };

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
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs font-semibold text-emerald-800 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center space-x-2 truncate">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 text-sm"
          >
            ×
          </button>
        </div>
      )}

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
              <span>{negativeStockItems.length} Deficit (Negative)</span>
            </button>
          )}

          {lowStockItems.length > 0 && (
            <button
              type="button"
              onClick={() => setFilterMode(filterMode === "LOW" ? "ALL" : "LOW")}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center space-x-1.5 ${
                filterMode === "LOW"
                  ? "bg-amber-500 text-white border-amber-500"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{lowStockItems.length} Low Limit SKUs</span>
            </button>
          )}

          {filterMode !== "ALL" && (
            <button
              type="button"
              onClick={() => setFilterMode("ALL")}
              className="flex-shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              Clear Filter
            </button>
          )}
        </div>
      )}

      {/* Live Godown Inventory Grid */}
      <div className="space-y-3">
        {/* Section Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Boxes className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">
                Live Inventory ({filteredProducts.length})
              </h2>
            </div>
            <Link
              href="/inventory"
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Full Godown
            </Link>
          </div>

          {/* Quick Search */}
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

          {/* Brand Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setSelectedBrand("ALL")}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                selectedBrand === "ALL"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All ({products.length})
            </button>
            {brands.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedBrand(b.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
                  selectedBrand === b.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Cards-Per-Row Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
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

              const brandInitial = (p.brandName || "SD").slice(0, 3).toUpperCase();

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-200 p-2.5 sm:p-3.5 shadow-xs flex flex-col justify-between hover:border-blue-300 hover:shadow-sm transition-all overflow-hidden w-full min-w-0"
                >
                  <div className="w-full min-w-0">
                    {/* Top Preview / Media Box */}
                    <div className="w-full h-20 sm:h-24 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center p-2 mb-2.5 relative overflow-hidden group">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-blue-700 font-black text-xs sm:text-sm tracking-wider">
                          {brandInitial}
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-1 truncate max-w-[120px]">
                          {p.brandName}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div className="absolute top-1.5 right-1.5">
                        {isNeg ? (
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-800 text-[9px] font-bold rounded-md shadow-2xs border border-red-200">
                            Deficit
                          </span>
                        ) : isLow ? (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 text-[9px] font-bold rounded-md shadow-2xs border border-amber-200">
                            Low
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-md shadow-2xs border border-emerald-200">
                            Active
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product Name & Details */}
                    <div className="w-full min-w-0">
                      <h3
                        className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate"
                        title={p.name}
                      >
                        {p.name}
                      </h3>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                        Size: <span className="font-semibold text-slate-700">{p.packageSize} {p.packageUnit}</span>
                      </div>

                      {p.hasBoxConversion && (
                        <div className="mt-1 text-[10px] text-blue-700 bg-blue-50/80 px-1.5 py-0.5 rounded-md border border-blue-100 truncate">
                          1 Box = {p.unitsPerBox} {p.subUnitName || "Pkt"}
                        </div>
                      )}
                    </div>

                    {/* Stock Display */}
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-baseline justify-between min-w-0">
                      <div className="min-w-0 truncate">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block leading-none">
                          Current Stock
                        </span>
                        <span
                          className={`text-xs sm:text-sm font-black truncate block leading-tight mt-0.5 ${
                            isNeg
                              ? "text-red-600"
                              : isLow
                              ? "text-amber-600"
                              : "text-slate-900"
                          }`}
                        >
                          {formatQuantity(p.currentStock, p.stockUnit)}
                        </span>
                      </div>
                      {p.lowStockLimit !== undefined && p.lowStockLimit !== null && (
                        <span className="text-[9px] text-slate-400 shrink-0">
                          Min: {p.lowStockLimit}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dual Action Buttons (Adjust & Delete) */}
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-3 pt-2.5 border-t border-slate-100 w-full min-w-0">
                    <Link
                      href={`/adjustments?productId=${p.id}`}
                      className="flex-1 py-1.5 px-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1 transition-colors truncate"
                      title="Adjust Stock"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                      <span className="truncate">Adjust</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => setProductToDelete(p)}
                      className="flex-1 py-1.5 px-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1 transition-colors truncate"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                      <span className="truncate">Delete</span>
                    </button>
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
                className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      tx.type === "STOCK_IN" || tx.type === "OPENING"
                        ? "bg-blue-100 text-blue-700"
                        : tx.type === "DELIVERY"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {isPositive ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
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

                <div className="text-right shrink-0 ml-2">
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

      {/* Delete Product Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={confirmDeleteProduct}
        title="Delete Product SKU"
        itemName={productToDelete ? `${productToDelete.brandName} - ${productToDelete.name} (${productToDelete.packageSize} ${productToDelete.packageUnit})` : ""}
        itemType="Product"
        warningNote="Removing this product will exclude it from future stock transactions."
        confirmButtonText="Yes, Delete Product"
      />
    </div>
  );
}
