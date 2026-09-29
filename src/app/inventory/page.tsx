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
  Trash2,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from "lucide-react";
import { StockStore, AppState } from "@/lib/store";
import { Product, Brand } from "@/lib/types";
import { formatQuantity, exportToCSV } from "@/lib/utils";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";

function InventoryContent() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("filter") || "all";

  const [state, setState] = useState<AppState | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter);

  // Delete State
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const refreshState = () => {
    setState({ ...StockStore.getState() });
  };

  useEffect(() => {
    setState(StockStore.getState());
    StockStore.fetchLiveState().then((s) => setState({ ...s }));
    const unsub = StockStore.subscribe((s) => setState({ ...s }));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (actionSuccessMsg) {
      const timer = setTimeout(() => setActionSuccessMsg(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [actionSuccessMsg]);

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    const name = `${productToDelete.name} (${productToDelete.packageSize} ${productToDelete.packageUnit})`;
    await StockStore.deleteProduct(productToDelete.id);
    setActionSuccessMsg(`Product "${name}" deleted successfully.`);
    setProductToDelete(null);
  };

  const confirmDeleteBrand = async () => {
    if (!brandToDelete) return;
    const name = brandToDelete.name;
    await StockStore.deleteBrand(brandToDelete.id, true);
    setActionSuccessMsg(`Brand "${name}" and associated SKUs deleted.`);
    setBrandToDelete(null);
    if (selectedBrand === brandToDelete.id) {
      setSelectedBrand("ALL");
    }
  };

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

  const handleExportCSV = () => {
    if (!filteredProducts.length) return;
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
    exportToCSV(data, `SD_Stock_Inventory_${new Date().toISOString().slice(0, 10)}`);
  };

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xs font-semibold text-slate-500">
          Loading inventory...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Toast Banner */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs font-semibold text-emerald-800 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center space-x-2 truncate">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">{actionSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 text-sm"
          >
            ×
          </button>
        </div>
      )}

      {/* Top Header Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5">
        <div className="min-w-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <Boxes className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
                Godown Stock Inventory
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                {filteredProducts.length} active SKUs across {state.brands.length} brands
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 shadow-xs flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV</span>
          </button>

          <Link
            href="/inventory/brands"
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 shadow-xs flex items-center space-x-1.5 transition-colors"
          >
            <Tag className="w-3.5 h-3.5 text-slate-600" />
            <span>Brands</span>
          </Link>

          <Link
            href="/inventory/products"
            className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-98 shadow-sm flex items-center space-x-1.5 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 text-white" />
            <span>+ Add SKU</span>
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search product, brand, size (e.g., Aachi, Turmeric, 100g)..."
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
            All Brands ({state.products.length})
          </button>
          {state.brands.map((b) => {
            const count = state.products.filter((p) => p.brandId === b.id).length;
            return (
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
                {b.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Status Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`flex-1 py-1 font-semibold rounded-lg transition-colors text-center ${
              statusFilter === "all"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Stock
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("low")}
            className={`flex-1 py-1 font-semibold rounded-lg transition-colors text-center ${
              statusFilter === "low"
                ? "bg-amber-500 text-white shadow-xs font-bold"
                : "text-amber-700 hover:text-amber-900"
            }`}
          >
            Low Limit
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("negative")}
            className={`flex-1 py-1 font-semibold rounded-lg transition-colors text-center ${
              statusFilter === "negative"
                ? "bg-red-600 text-white shadow-xs font-bold"
                : "text-red-700 hover:text-red-900"
            }`}
          >
            Deficit / Negative
          </button>
        </div>
      </div>

      {/* Production-Grade 2-Cards-Per-Row Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            No products match your active search filters.
          </div>
        ) : (
          filteredProducts.map((p) => {
            const isNeg = p.currentStock < 0;
            const isLow =
              p.lowStockLimit !== undefined &&
              p.lowStockLimit !== null &&
              p.currentStock <= p.lowStockLimit &&
              !isNeg;

            // Brand initial / short code for preview box
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

                    {/* Top Right Status Badge on Preview */}
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

                  {/* Product Title & Package Metadata */}
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

                  {/* Stock Quantity Value */}
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

                {/* Symmetrical Dual Action Buttons (Adjust & Delete) */}
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

      {/* Delete Product Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={confirmDeleteProduct}
        title="Delete Product SKU"
        itemName={productToDelete ? `${productToDelete.brandName} - ${productToDelete.name} (${productToDelete.packageSize} ${productToDelete.packageUnit})` : ""}
        itemType="Product"
        warningNote="Removing this product will exclude it from future stock-in receipts, shop deliveries, and inventory reports."
        confirmButtonText="Yes, Delete Product"
      />

      {/* Delete Brand Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!brandToDelete}
        onClose={() => setBrandToDelete(null)}
        onConfirm={confirmDeleteBrand}
        title="Delete Brand Master"
        itemName={brandToDelete ? brandToDelete.name : ""}
        itemType="Brand"
        warningNote="Deleting this brand will also permanently remove all products and SKUs associated with it."
        confirmButtonText="Yes, Delete Brand & SKUs"
      />
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
