"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  History,
  ArrowDownToLine,
  Search,
  Download,
  Calendar,
  Building2,
} from "lucide-react";
import { StockStore, AppState } from "@/lib/store";
import { formatDate, exportToCSV } from "@/lib/utils";

export default function StockInHistoryPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("ALL");

  useEffect(() => {
    setState(StockStore.getState());
  }, []);

  if (!state) return null;

  const filteredStockIns = state.stockIns.filter((s) => {
    const matchesSearch =
      s.stockInCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.invoiceNo && s.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSupplier =
      selectedSupplier === "ALL" || s.supplierId === selectedSupplier;
    return matchesSearch && matchesSupplier;
  });

  const handleExportCSV = () => {
    const data = filteredStockIns.flatMap((s) =>
      s.items.map((it) => ({
        "Stock-In Code": s.stockInCode,
        Date: formatDate(s.date),
        Supplier: s.supplierName,
        "Invoice / DC No": s.invoiceNo || "-",
        Product: `${it.brandName} ${it.productName}`,
        "Package Size": it.packageDisplay,
        Quantity: `${it.quantity} ${it.unit}`,
        Notes: s.notes || "-",
      }))
    );
    exportToCSV(data, `SD_Stock_In_History_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Stock-In Receipts ({filteredStockIns.length})
            </h1>
            <p className="text-[11px] text-slate-500">
              Audit log of inward godown consignments
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
            href="/stock-in"
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm flex items-center space-x-1"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 text-white" />
            <span>+ Receive Stock</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search code, supplier, invoice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 font-medium"
          />
        </div>

        <select
          value={selectedSupplier}
          onChange={(e) => setSelectedSupplier(e.target.value)}
          className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
        >
          <option value="ALL">All Suppliers ({state.suppliers.length})</option>
          {state.suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* 2-Cards-Per-Row Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredStockIns.length === 0 ? (
          <div className="col-span-full py-10 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            No stock-in records found.
          </div>
        ) : (
          filteredStockIns.map((stk) => (
            <div
              key={stk.id}
              className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all space-y-3"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-[11px] rounded-md border border-blue-200">
                    {stk.stockInCode}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(stk.date)}
                  </span>
                </div>

                <div className="mt-2 flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {stk.supplierName}
                  </span>
                  {stk.invoiceNo && (
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-medium">
                      Inv: {stk.invoiceNo}
                    </span>
                  )}
                </div>

                {/* Items preview list */}
                <div className="mt-2.5 space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                  {stk.items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center justify-between text-slate-700"
                    >
                      <span className="truncate pr-2 font-medium">
                        {it.brandName} - {it.productName} ({it.packageDisplay})
                      </span>
                      <span className="font-bold text-blue-700 whitespace-nowrap">
                        +{it.quantity} {it.unit}
                      </span>
                    </div>
                  ))}
                </div>

                {stk.notes && (
                  <div className="mt-2 text-[11px] text-slate-500 line-clamp-1">
                    Note: {stk.notes}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>{stk.items.length} Product Line Items</span>
                <span className="font-bold text-slate-900">
                  Total: +{stk.totalQuantity} Units
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
