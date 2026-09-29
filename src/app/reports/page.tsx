"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  FileBarChart2,
  Calendar,
  Download,
  Printer,
  History,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { StockStore, AppState } from "@/lib/store";
import { formatDate, exportToCSV } from "@/lib/utils";

type ReportType = "ALL" | "STOCK_IN" | "DELIVERY" | "ADJUSTMENT";

function ReportsContent() {
  const searchParams = useSearchParams();
  const preSelectedProdId = searchParams.get("productId") || "ALL";

  const [state, setState] = useState<AppState | null>(null);

  // Filters
  const [reportType, setReportType] = useState<ReportType>("ALL");
  const [selectedProductId, setSelectedProductId] = useState<string>(preSelectedProdId);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  useEffect(() => {
    setState(StockStore.getState());
    StockStore.fetchLiveState().then((live) => setState({ ...live }));
    const unsub = StockStore.subscribe((live) => setState({ ...live }));
    return () => unsub();
  }, []);

  const filteredTransactions = useMemo(() => {
    if (!state) return [];
    return state.transactions.filter((tx) => {
      // Type Filter
      if (reportType === "STOCK_IN" && tx.type !== "STOCK_IN") return false;
      if (reportType === "DELIVERY" && tx.type !== "DELIVERY") return false;
      if (reportType === "ADJUSTMENT" && tx.type !== "ADJUSTMENT") return false;

      // Product Filter
      if (selectedProductId !== "ALL" && tx.productId !== selectedProductId) return false;

      // Date Range Filter
      const txDate = tx.transactionDate ? tx.transactionDate.slice(0, 10) : "";
      if (fromDate && txDate && txDate < fromDate) return false;
      if (toDate && txDate && txDate > toDate) return false;

      return true;
    });
  }, [state, reportType, selectedProductId, fromDate, toDate]);

  if (!state) return null;

  // Summary computations
  let totalInward = 0;
  let totalOutward = 0;
  let totalAdj = 0;

  filteredTransactions.forEach((tx) => {
    if (tx.type === "STOCK_IN" || tx.type === "OPENING") {
      totalInward += Math.abs(tx.quantity);
    } else if (tx.type === "DELIVERY") {
      totalOutward += Math.abs(tx.quantity);
    } else if (tx.type === "ADJUSTMENT") {
      totalAdj += tx.quantity;
    }
  });

  const handleExportCSV = () => {
    const data = filteredTransactions.map((tx) => ({
      Date: formatDate(tx.transactionDate || tx.createdAt),
      Type: tx.type,
      Brand: tx.brandName,
      Product: tx.productName,
      "Package Size": tx.packageDisplay,
      Quantity: `${tx.quantity > 0 ? "+" : ""}${tx.quantity} ${tx.unit}`,
      "Balance After": `${tx.balanceAfter} ${tx.unit}`,
      "Reference / Party": tx.partyName || tx.referenceNo || "-",
      Notes: tx.notes || "-",
    }));
    exportToCSV(data, `SD_Inventory_Ledger_Report_${new Date().toISOString().slice(0, 10)}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 no-print">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileBarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Audit Ledger Movements ({filteredTransactions.length})
            </h1>
            <p className="text-[11px] text-slate-500">
              Chronological log of every unit increase and reduction
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

          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 shadow-xs flex items-center space-x-1"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs space-y-3 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Type */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
              Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="ALL">All Types</option>
              <option value="STOCK_IN">Stock In (Inward)</option>
              <option value="DELIVERY">Deliveries (Outward)</option>
              <option value="ADJUSTMENT">Adjustments</option>
            </select>
          </div>

          {/* Product Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
              Product SKU
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="ALL">All Products ({state.products.length})</option>
              {state.products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.brandName} - {p.name} ({p.packageSize} {p.packageUnit})
                </option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
          <div className="bg-blue-50/50 p-2 rounded-xl border border-blue-100">
            <span className="text-[10px] font-semibold text-slate-500 block uppercase">Inward</span>
            <span className="text-xs font-bold text-blue-700">+{totalInward.toFixed(2)}</span>
          </div>
          <div className="bg-emerald-50/50 p-2 rounded-xl border border-emerald-100">
            <span className="text-[10px] font-semibold text-slate-500 block uppercase">Outward</span>
            <span className="text-xs font-bold text-emerald-700">-{totalOutward.toFixed(2)}</span>
          </div>
          <div className="bg-amber-50/50 p-2 rounded-xl border border-amber-100">
            <span className="text-[10px] font-semibold text-slate-500 block uppercase">Net Adj</span>
            <span className={`text-xs font-bold ${totalAdj < 0 ? "text-red-600" : "text-slate-800"}`}>
              {totalAdj > 0 ? "+" : ""}{totalAdj.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* 2-Cards-Per-Row Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredTransactions.length === 0 ? (
          <div className="col-span-full py-10 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            No movement records match the filters.
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isPositive = tx.quantity > 0;
            return (
              <div
                key={tx.id}
                className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        tx.type === "STOCK_IN" || tx.type === "OPENING"
                          ? "bg-blue-100 text-blue-800"
                          : tx.type === "DELIVERY"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {tx.type}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(tx.transactionDate || tx.createdAt)}
                    </span>
                  </div>

                  <div className="mt-2">
                    <div className="font-bold text-slate-900 text-xs truncate">
                      {tx.productName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {tx.brandName} • Size: {tx.packageDisplay}
                    </div>
                  </div>

                  <div className="mt-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 flex justify-between items-center">
                    <span className="text-[11px] text-slate-500 font-medium truncate pr-2">
                      {tx.partyName || tx.referenceNo || "Ledger Entry"}
                    </span>
                    {tx.notes && (
                      <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                        {tx.notes}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center ${
                        isPositive ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {isPositive ? (
                        <ArrowDownRight className="w-3 h-3" />
                      ) : (
                        <ArrowUpRight className="w-3 h-3" />
                      )}
                    </div>
                    <span
                      className={`font-bold ${
                        isPositive ? "text-blue-700" : "text-slate-900"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {tx.quantity} {tx.unit}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      Bal After
                    </span>
                    <span className="font-bold text-slate-900">
                      {tx.balanceAfter} {tx.unit}
                    </span>
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

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-xs font-semibold text-slate-500">
            Loading reports...
          </div>
        </div>
      }
    >
      <ReportsContent />
    </Suspense>
  );
}
