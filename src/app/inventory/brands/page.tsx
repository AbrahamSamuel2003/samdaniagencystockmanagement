"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Tag,
  PlusCircle,
  Search,
  CheckCircle2,
  X,
  Edit2,
  Trash2,
  Layers,
  ArrowLeft,
} from "lucide-react";
import { StockStore, AppState } from "@/lib/store";
import { Brand } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { DeleteConfirmModal } from "@/components/ui/DeleteConfirmModal";

export default function BrandsPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [formError, setFormError] = useState("");

  const refreshState = () => {
    setState(StockStore.getState());
  };

  useEffect(() => {
    setState(StockStore.getState());
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const openCreateModal = () => {
    setEditingBrand(null);
    setName("");
    setCode("");
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (b: Brand) => {
    setEditingBrand(b);
    setName(b.name);
    setCode(b.code || "");
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Brand name is required.");
      return;
    }

    try {
      if (editingBrand) {
        StockStore.updateBrand(editingBrand.id, name, code, editingBrand.status);
        setToastMessage(`Brand "${name}" updated successfully.`);
      } else {
        StockStore.addBrand(name, code);
        setToastMessage(`Brand "${name}" created successfully.`);
      }
      refreshState();
      setIsModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to save brand.");
    }
  };

  const confirmDeleteBrand = () => {
    if (!brandToDelete) return;
    const count = state ? state.products.filter((p) => p.brandId === brandToDelete.id).length : 0;
    StockStore.deleteBrand(brandToDelete.id, true);
    setToastMessage(`Brand "${brandToDelete.name}" and ${count} associated SKU(s) deleted.`);
    setBrandToDelete(null);
    refreshState();
  };

  const filteredBrands = useMemo(() => {
    if (!state) return [];
    return state.brands.filter(
      (b) =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.code && b.code.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [state, searchQuery]);

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
              <Tag className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
                Brand Master
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                {filteredBrands.length} brands (Aachi, Sun, Sakthi, Anjali, Gold Winner)
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
          <span>+ Add Brand</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search brand by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 font-medium"
          />
        </div>
      </div>

      {/* Production 2-Cards-Per-Row Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {filteredBrands.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            No brands found matching your search.
          </div>
        ) : (
          filteredBrands.map((b) => {
            const productCount = state.products.filter((p) => p.brandId === b.id).length;
            const codeDisplay = b.code || b.name.slice(0, 3).toUpperCase();

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 p-2.5 sm:p-3.5 shadow-xs flex flex-col justify-between hover:border-blue-300 hover:shadow-sm transition-all overflow-hidden w-full min-w-0"
              >
                <div className="w-full min-w-0">
                  {/* Top Preview / Media Box */}
                  <div className="w-full h-20 sm:h-24 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center p-2 mb-2.5 relative overflow-hidden group">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center text-blue-700 font-black text-xs sm:text-sm tracking-wider uppercase">
                        {codeDisplay}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1 truncate max-w-[120px]">
                        Brand Code: {b.code || "-"}
                      </span>
                    </div>

                    {/* Top Right Status Badge */}
                    <div className="absolute top-1.5 right-1.5">
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-md shadow-2xs border border-emerald-200">
                        Active
                      </span>
                    </div>
                  </div>

                  {/* Brand Title & Details */}
                  <div className="w-full min-w-0">
                    <h3
                      className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate"
                      title={b.name}
                    >
                      {b.name}
                    </h3>

                    <div className="mt-1 flex items-center space-x-1.5 text-[11px] text-blue-700 bg-blue-50/80 px-1.5 py-0.5 rounded-md border border-blue-100 truncate">
                      <Layers className="w-3 h-3 shrink-0 text-blue-600" />
                      <span className="truncate font-semibold">{productCount} SKUs</span>
                    </div>
                  </div>

                  {/* Date Created */}
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-baseline justify-between min-w-0 text-[10px] text-slate-400">
                    <span className="truncate">Added {formatDate(b.createdAt)}</span>
                  </div>
                </div>

                {/* Symmetrical Dual Action Buttons (Edit Brand & Delete) */}
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-3 pt-2.5 border-t border-slate-100 w-full min-w-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(b)}
                    className="flex-1 py-1.5 px-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1 transition-colors truncate"
                    title="Edit Brand"
                  >
                    <Edit2 className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                    <span className="truncate">Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBrandToDelete(b)}
                    className="flex-1 py-1.5 px-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl text-[11px] font-bold flex items-center justify-center space-x-1 transition-colors truncate"
                    title="Delete Brand"
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2 truncate">
                <Tag className="w-4 h-4 text-blue-600 shrink-0" />
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  {editingBrand ? "Edit Brand" : "Create New Brand"}
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

            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              {formError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aachi, Sun, Sakthi, Anjali, Gold Winner"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Brand Short Code (3-4 Chars)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ACH, SUN, SKT, ANJ, GWN"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900 uppercase"
                />
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
                  {editingBrand ? "Save Changes" : "Create Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!brandToDelete}
        onClose={() => setBrandToDelete(null)}
        onConfirm={confirmDeleteBrand}
        title="Delete Brand Master"
        itemName={brandToDelete ? brandToDelete.name : ""}
        itemType="Brand"
        warningNote={
          brandToDelete && state
            ? `This brand currently has ${
                state.products.filter((p) => p.brandId === brandToDelete.id).length
              } associated SKU(s). Deleting it will also remove all those products.`
            : undefined
        }
        confirmButtonText="Yes, Delete Brand"
      />
    </div>
  );
}
