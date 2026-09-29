"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Layers,
  PlusCircle,
  Search,
  X,
  Edit2,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  Boxes,
} from "lucide-react";
import { StockStore, AppState } from "@/lib/store";
import { Product } from "@/lib/types";
import { formatQuantity } from "@/lib/utils";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";

export default function ProductsPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    setState({ ...StockStore.getState() });
  };

  useEffect(() => {
    const s = StockStore.getState();
    setState(s);
    if (s.brands.length > 0) {
      setBrandId(s.brands[0].id);
    }
    StockStore.fetchLiveState().then((live) => {
      setState({ ...live });
      if (live.brands.length > 0) {
        setBrandId(live.brands[0].id);
      }
    });
    const unsub = StockStore.subscribe((live) => setState({ ...live }));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const openCreateModal = () => {
    setEditingProduct(null);
    if (state && state.brands.length > 0) {
      setBrandId(state.brands[0].id);
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
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
        await StockStore.updateProduct(editingProduct.id, {
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
        setToastMessage(`Product "${name}" updated successfully in database.`);
      } else {
        await StockStore.addProduct({
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
        setToastMessage(`Product "${name}" created successfully in database.`);
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to save product.");
    }
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    const prodName = `${productToDelete.name} (${productToDelete.packageSize} ${productToDelete.packageUnit})`;
    await StockStore.deleteProduct(productToDelete.id);
    setToastMessage(`Product SKU "${prodName}" deleted from database.`);
    setProductToDelete(null);
  };

  const filteredProducts = useMemo(() => {
    if (!state) return [];
    return state.products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${p.packageSize} ${p.packageUnit}`.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBrand = selectedBrand === "ALL" || p.brandId === selectedBrand;
      return matchesSearch && matchesBrand;
    });
  }, [state, searchQuery, selectedBrand]);

  if (!state) return null;

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

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5">
        <div className="min-w-0">
          <div className="flex items-center space-x-2.5">
            <Link
              href="/inventory"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shrink-0"
              title="Back to Inventory"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
                Products & SKUs Master
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                {filteredProducts.length} configured items with package sizes & box conversions
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-98 shadow-sm flex items-center justify-center space-x-1.5 transition-all shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5 text-white" />
          <span>+ Create SKU</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs space-y-3">
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
      </div>

      {/* Production 2-Cards-Per-Row Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            No products found matching your search.
          </div>
        ) : (
          filteredProducts.map((p) => {
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

                    {/* Top Right Status Badge */}
                    <div className="absolute top-1.5 right-1.5">
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-md shadow-2xs border border-emerald-200">
                        Active
                      </span>
                    </div>
                  </div>

                  {/* Product Title & Package Details */}
                  <div className="w-full min-w-0">
                    <h3
                      className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate"
                      title={p.name}
                    >
                      {p.name}
                    </h3>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                      Package: <span className="font-semibold text-slate-700">{p.packageSize} {p.packageUnit}</span>
                    </div>

                    {p.hasBoxConversion ? (
                      <div className="mt-1 text-[10px] text-blue-700 bg-blue-50/80 px-1.5 py-0.5 rounded-md border border-blue-100 truncate">
                        1 Box = {p.unitsPerBox} {p.subUnitName || "Pkt"}
                      </div>
                    ) : (
                      <div className="mt-1 text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100 truncate">
                        Stock Unit: {p.stockUnit}
                      </div>
                    )}
                  </div>

                  {/* Current Balance */}
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-baseline justify-between min-w-0">
                    <div className="min-w-0 truncate">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block leading-none">
                        Stock
                      </span>
                      <span className="text-xs sm:text-sm font-black text-slate-900 truncate block leading-tight mt-0.5">
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

                {/* Symmetrical Dual Action Buttons (Edit SKU & Delete) */}
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-3 pt-2.5 border-t border-slate-100 w-full min-w-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(p)}
                    className="flex-1 py-1.5 px-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1 transition-colors truncate"
                    title="Edit SKU"
                  >
                    <Edit2 className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                    <span className="truncate">Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProductToDelete(p)}
                    className="flex-1 py-1.5 px-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1 transition-colors truncate"
                    title="Delete SKU"
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

      {/* Modal for Creating / Editing SKU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2 truncate">
                <Layers className="w-4 h-4 text-blue-600 shrink-0" />
                <h3 className="text-sm font-bold text-slate-900 truncate">
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
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                >
                  {state.brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code || "Brand"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Product Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Turmeric Powder, Sunflower Oil, Ghee"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
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
                    placeholder="e.g. 100, 500, 1"
                    value={packageSize}
                    onChange={(e) =>
                      setPackageSize(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Package Unit
                  </label>
                  <select
                    value={packageUnit}
                    onChange={(e) => setPackageUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                  >
                    <option value="g">Gram (g)</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="ml">Millilitre (ml)</option>
                    <option value="L">Litre (L)</option>
                    <option value="pkt">Packet (pkt)</option>
                    <option value="pcs">Piece (pcs)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Godown Stock Unit <span className="text-red-500">*</span>
                </label>
                <select
                  value={stockUnit}
                  onChange={(e) => setStockUnit(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="g">Gram (g)</option>
                  <option value="L">Litre (L)</option>
                  <option value="ml">Millilitre (ml)</option>
                  <option value="pkt">Packet (pkt)</option>
                  <option value="box">Box (box)</option>
                  <option value="btl">Bottle (btl)</option>
                  <option value="pcs">Piece (pcs)</option>
                </select>
              </div>

              {/* Box Conversion Switch */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasBoxConversion}
                    onChange={(e) => setHasBoxConversion(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Enable Box Packaging Conversion
                  </span>
                </label>
                <p className="text-[10px] text-slate-400 mt-0.5 ml-6">
                  Allows entering inward stock receipts by wholesale Box count
                </p>
              </div>

              {hasBoxConversion && (
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div>
                    <label className="block text-[10px] font-bold text-blue-950 uppercase mb-1">
                      Units Per Box <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 20, 24"
                      value={unitsPerBox}
                      onChange={(e) =>
                        setUnitsPerBox(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-blue-950 uppercase mb-1">
                      Unit Name
                    </label>
                    <input
                      type="text"
                      placeholder="Packet / Bottle"
                      value={subUnitName}
                      onChange={(e) => setSubUnitName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                {!editingProduct && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Opening Balance
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="0"
                      value={openingStock}
                      onChange={(e) =>
                        setOpeningStock(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                    />
                  </div>
                )}
                <div className={editingProduct ? "col-span-2" : ""}>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Low Stock Alert Limit
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 10"
                    value={lowStockLimit}
                    onChange={(e) =>
                      setLowStockLimit(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm"
                >
                  {editingProduct ? "Save Changes" : "Create SKU"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={confirmDeleteProduct}
        title="Delete Product SKU"
        itemName={productToDelete ? `${productToDelete.brandName} - ${productToDelete.name} (${productToDelete.packageSize} ${productToDelete.packageUnit})` : ""}
        itemType="Product"
        warningNote="Removing this product will exclude it from future stock transactions."
        confirmButtonText="Yes, Delete SKU"
      />
    </div>
  );
}
