"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Layers,
  PlusCircle,
  Search,
  X,
  Edit2,
  Boxes,
} from "lucide-react";
import { StockStore, AppState } from "@/lib/store";
import { Product } from "@/lib/types";
import { formatQuantity } from "@/lib/utils";

export default function ProductsPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [brandId, setBrandId] = useState("");
  const [name, setName] = useState("");
  const [packageSize, setPackageSize] = useState<number | "">("");
  const [packageUnit, setPackageUnit] = useState("g");
  const [stockUnit, setStockUnit] = useState("kg");
  const [hasBoxConversion, setHasBoxConversion] = useState(false);
  const [unitsPerBox, setUnitsPerBox] = useState<number | "">("");
  const [subUnitName, setSubUnitName] = useState("Packet");
  const [openingStock, setOpeningStock] = useState<number | "">("");
  const [lowStockLimit, setLowStockLimit] = useState<number | "">("");
  const [formError, setFormError] = useState("");

  const refreshState = () => {
    setState(StockStore.getState());
  };

  useEffect(() => {
    const s = StockStore.getState();
    setState(s);
    if (s.brands.length > 0) {
      setBrandId(s.brands[0].id);
    }
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName("");
    setPackageSize("");
    setPackageUnit("g");
    setStockUnit("kg");
    setHasBoxConversion(false);
    setUnitsPerBox("");
    setSubUnitName("Packet");
    setOpeningStock("");
    setLowStockLimit("");
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setBrandId(p.brandId);
    setName(p.name);
    setPackageSize(p.packageSize);
    setPackageUnit(p.packageUnit);
    setStockUnit(p.stockUnit);
    setHasBoxConversion(p.hasBoxConversion);
    setUnitsPerBox(p.unitsPerBox || "");
    setSubUnitName(p.subUnitName || "Packet");
    setOpeningStock(p.openingStock);
    setLowStockLimit(p.lowStockLimit ?? "");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!brandId) {
      setFormError("Please select a brand.");
      return;
    }
    if (!name.trim()) {
      setFormError("Please enter the product name.");
      return;
    }
    if (!packageSize || Number(packageSize) <= 0) {
      setFormError("Please enter a valid package size greater than 0.");
      return;
    }
    if (hasBoxConversion && (!unitsPerBox || Number(unitsPerBox) <= 0)) {
      setFormError("Please enter the number of units per box.");
      return;
    }

    try {
      if (editingProduct) {
        StockStore.updateProduct(editingProduct.id, {
          brandId,
          name,
          packageSize: Number(packageSize),
          packageUnit,
          stockUnit,
          hasBoxConversion,
          unitsPerBox: hasBoxConversion && unitsPerBox ? Number(unitsPerBox) : undefined,
          subUnitName: hasBoxConversion ? subUnitName : undefined,
          lowStockLimit: lowStockLimit !== "" ? Number(lowStockLimit) : undefined,
        });
      } else {
        StockStore.addProduct({
          brandId,
          name,
          packageSize: Number(packageSize),
          packageUnit,
          stockUnit,
          hasBoxConversion,
          unitsPerBox: hasBoxConversion && unitsPerBox ? Number(unitsPerBox) : undefined,
          subUnitName: hasBoxConversion ? subUnitName : undefined,
          openingStock: openingStock !== "" ? Number(openingStock) : 0,
          lowStockLimit: lowStockLimit !== "" ? Number(lowStockLimit) : undefined,
        });
      }

      refreshState();
      setIsModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to save product.");
    }
  };

  if (!state) return null;

  const filteredProducts = state.products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${p.packageSize} ${p.packageUnit}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Products & SKUs ({filteredProducts.length})
            </h1>
            <p className="text-[11px] text-slate-500">
              Configure package sizes and box conversion rules
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm flex items-center justify-center space-x-1"
        >
          <PlusCircle className="w-3.5 h-3.5 text-white" />
          <span>+ Create SKU</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by brand, name, or size..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 font-medium"
          />
        </div>
      </div>

      {/* 2-Cards-Per-Row Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-10 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            No products found matching your search.
          </div>
        ) : (
          filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 text-[10px] font-bold rounded-md">
                    {p.brandName}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">
                    Base: {p.stockUnit}
                  </span>
                </div>

                <div className="mt-2">
                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                    {p.name}
                  </h3>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">
                    Package: {p.packageSize} {p.packageUnit}
                  </div>
                </div>

                {p.hasBoxConversion && (
                  <div className="mt-2 text-[11px] text-blue-700 bg-blue-50/70 px-2 py-1 rounded-md border border-blue-100 font-medium">
                    1 Box = {p.unitsPerBox} {p.subUnitName || "Units"}
                  </div>
                )}
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                    Stock
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatQuantity(p.currentStock, p.stockUnit)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => openEditModal(p)}
                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl text-xs font-semibold flex items-center space-x-1"
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Edit SKU</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Creating / Editing SKU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-4 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {editingProduct ? "Edit Product SKU" : "Create New Product SKU"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Brand <span className="text-red-500">*</span>
                </label>
                <select
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {state.brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Turmeric Powder, Chilli Powder"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Package Size <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 100"
                    value={packageSize}
                    onChange={(e) =>
                      setPackageSize(e.target.value ? Number(e.target.value) : "")
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Package Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={packageUnit}
                    onChange={(e) => setPackageUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="g">Gram (g)</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="L">Litre (L)</option>
                    <option value="ml">Millilitre (ml)</option>
                    <option value="pkt">Packet (pkt)</option>
                    <option value="pcs">Piece (pcs)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Stock Ledger Unit <span className="text-red-500">*</span>
                </label>
                <select
                  value={stockUnit}
                  onChange={(e) => setStockUnit(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="box">Box (box)</option>
                  <option value="pkt">Packet (pkt)</option>
                  <option value="btl">Bottle (btl)</option>
                  <option value="L">Litre (L)</option>
                  <option value="pcs">Piece (pcs)</option>
                </select>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasBoxConversion}
                    onChange={(e) => setHasBoxConversion(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <span className="text-xs font-bold text-blue-950">
                    Box Conversion (1 Box = N Units)
                  </span>
                </label>

                {hasBoxConversion && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <input
                        type="number"
                        placeholder="Units / Box (e.g. 20)"
                        value={unitsPerBox}
                        onChange={(e) =>
                          setUnitsPerBox(e.target.value ? Number(e.target.value) : "")
                        }
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Sub-unit (Packet/Bottle)"
                        value={subUnitName}
                        onChange={(e) => setSubUnitName(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {!editingProduct && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Opening Stock
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 25"
                      value={openingStock}
                      onChange={(e) =>
                        setOpeningStock(e.target.value ? Number(e.target.value) : "")
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                )}
                <div className={editingProduct ? "col-span-2" : ""}>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Low Stock Limit
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 5"
                    value={lowStockLimit}
                    onChange={(e) =>
                      setLowStockLimit(e.target.value ? Number(e.target.value) : "")
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm"
                >
                  {editingProduct ? "Save" : "Create SKU"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
