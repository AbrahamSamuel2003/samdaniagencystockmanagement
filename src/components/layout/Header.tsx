"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PackageCheck,
  Menu,
  RotateCcw,
  Layers,
  SlidersHorizontal,
  Store,
  Building2,
  Tag,
  X,
} from "lucide-react";
import { StockStore } from "@/lib/store";

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export function Header({ onToggleMobileMenu }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleResetData = () => {
    if (
      window.confirm(
        "Reset sample inventory data to default state?"
      )
    ) {
      StockStore.resetToDefault();
      window.location.reload();
    }
  };

  return (
    <>
      <header className="h-14 bg-white border-b border-slate-200 sticky top-0 z-30 px-3 sm:px-6 flex items-center justify-between shadow-xs">
        {/* Left: Brand / Title */}
        <div className="flex items-center space-x-2.5">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <PackageCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm tracking-tight block leading-none">
                Sam & Dani
              </span>
              <span className="text-[10px] text-blue-600 font-semibold tracking-wide">
                Stock Manager
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Native Action Menu Trigger & Quick SKU */}
        <div className="flex items-center space-x-2">
          <Link
            href="/inventory/products"
            className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 mr-1 text-blue-600" />
            <span>+ Product</span>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200"
            aria-label="More Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Slide-over / Modal Dropdown for Masters & Utilities */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-start sm:items-end p-3 bg-slate-900/40 backdrop-blur-xs">
          <div
            className="fixed inset-0"
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative w-full sm:w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 space-y-3 z-10 animate-in fade-in slide-in-from-bottom-3 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Management & Masters
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/inventory/brands"
                onClick={() => setMenuOpen(false)}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 font-semibold text-slate-800 flex items-center space-x-2"
              >
                <Tag className="w-4 h-4 text-blue-600" />
                <span>Brands</span>
              </Link>

              <Link
                href="/masters/shops"
                onClick={() => setMenuOpen(false)}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 font-semibold text-slate-800 flex items-center space-x-2"
              >
                <Store className="w-4 h-4 text-blue-600" />
                <span>Shops</span>
              </Link>

              <Link
                href="/masters/suppliers"
                onClick={() => setMenuOpen(false)}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 font-semibold text-slate-800 flex items-center space-x-2"
              >
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Suppliers</span>
              </Link>

              <Link
                href="/adjustments"
                onClick={() => setMenuOpen(false)}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 font-semibold text-slate-800 flex items-center space-x-2"
              >
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span>Adjust Stock</span>
              </Link>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetData}
                className="text-[11px] font-semibold text-slate-500 hover:text-red-600 flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>
              <span className="text-[10px] text-slate-400">v1.0 Native</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
