"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  History,
  CheckCircle2,
  Download,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { StockStore, AppState } from "@/lib/store";
import { AdjustmentReason } from "@/lib/types";
import { formatDate, formatQuantity, exportToCSV } from "@/lib/utils";

const ADJUSTMENT_REASONS: { label: string; value: AdjustmentReason }[] = [
  { label: "Physical Count Correction", value: "PHYSICAL_COUNT_CORRECTION" },
  { label: "Damaged Products", value: "DAMAGED" },
  { label: "Expired Stock", value: "EXPIRED" },
  { label: "Missing / Shrinkage", value: "MISSING" },
  { label: "Data Entry Mistake", value: "DATA_ENTRY_MISTAKE" },
  { label: "Returned Stock from Shop", value: "RETURNED_STOCK" },
  { label: "Other / Uncategorized", value: "OTHER" },
];

function AdjustmentsContent() {
  const searchParams = useSearchParams();
  const preSelectedProdId = searchParams.get("productId") || "";

  const [state, setState] = useState<AppState | null>(null);

  // Form State
  const [productId, setProductId] = useState(preSelectedProdId);
  const [inputMode, setInputMode] = useState<"DIFF" | "PHYSICAL">("PHYSICAL");
  const [physicalCount, setPhysicalCount] = useState<number | "">("");
  const [adjustmentDiff, setAdjustmentDiff] = useState<number | "">("");
  const [reason, setReason] = useState<AdjustmentReason>("PHYSICAL_COUNT_CORRECTION");
  const [notes, setNotes] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLogOpen, setIsLogOpen] = useState(false);

  useEffect(() => {
    const s = StockStore.getState();
    setState(s);
    if (!preSelectedProdId && s.products.length > 0) {
      setProductId(s.products[0].id);
    }
    StockStore.fetchLiveState().then((live) => {
      setState({ ...live });
      if (!preSelectedProdId && live.products.length > 0) {
        setProductId(live.products[0].id);
      }
    });
    const unsub = StockStore.subscribe((live) => setState({ ...live }));
    return () => unsub();
  }, [preSelectedProdId]);

  const selectedProd = state?.products.find((p) => p.id === productId);

  // Sync calculations
  const handlePhysicalCountChange = (val: number | "") => {
    setPhysicalCount(val);
    if (selectedProd && val !== "") {
      const diff = Number((Number(val) - selectedProd.currentStock).toFixed(2));
      setAdjustmentDiff(diff);
    } else {
      setAdjustmentDiff("");
    }
  };

  const handleDiffChange = (val: number | "") => {
    setAdjustmentDiff(val);
    if (selectedProd && val !== "") {
      const phys = Number((selectedProd.currentStock + Number(val)).toFixed(2));
      setPhysicalCount(phys);
    } else {
      setPhysicalCount("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!productId) {
      setErrorMsg("Please select a product.");
      return;
    }
    if (adjustmentDiff === "" || Number(adjustmentDiff) === 0) {
      setErrorMsg("Adjustment difference cannot be zero.");
      return;
    }

    try {
      const adj = await StockStore.recordAdjustment({
        productId,
        adjustmentQty: Number(adjustmentDiff),
        reason,
        notes,
      });

      setSuccessMsg(
        `Adjustment ${adj.adjustmentCode} recorded in database: Stock for ${adj.brandName} ${adj.productName} corrected from ${adj.previousStock} to ${adj.newStock} ${adj.unit}.`
      );

      // Reset form
      setAdjustmentDiff("");
      setPhysicalCount("");
      setNotes("");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to record adjustment.");
    }
  };

  if (!state) return null;

  const handleExportCSV = () => {
    const data = state.adjustments.map((a) => ({
      "Adjustment Code": a.adjustmentCode,
      Date: formatDate(a.createdAt),
      Product: `${a.brandName} ${a.productName}`,
      "Package Size": a.packageDisplay,
      "Previous Stock": a.previousStock,
      "Adjustment Qty": a.adjustmentQty,
      "New Stock": a.newStock,
      Unit: a.unit,
      Reason: a.reason.replace(/_/g, " "),
      Notes: a.notes || "-",
    }));
    exportToCSV(data, `SD_Stock_Adjustments_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Stock Reconciliation
            </h1>
            <p className="text-[11px] text-slate-500">
              Correct physical count differences with reason audit
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 shadow-xs flex items-center space-x-1"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>CSV</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <Link
            href="/inventory"
            className="text-[11px] font-bold text-emerald-900 underline hover:no-underline whitespace-nowrap ml-2"
          >
            Check Stock
          </Link>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold shadow-xs">
          {errorMsg}
        </div>
      )}

      {/* Adjustment Input Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3.5">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          New Adjustment Entry
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Select Product SKU <span className="text-red-500">*</span>
              </label>
              <select
                value={productId}
                onChange={(e) => {
                  setProductId(e.target.value);
                  setPhysicalCount("");
                  setAdjustmentDiff("");
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                required
              >
                {state.products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.brandName} - {p.name} ({p.packageSize} {p.packageUnit}) [Stock: {p.currentStock} {p.stockUnit}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Reason Code <span className="text-red-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as AdjustmentReason)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
                required
              >
                {ADJUSTMENT_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedProd && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Recorded: <strong>{formatQuantity(selectedProd.currentStock, selectedProd.stockUnit)}</strong>
                </span>

                <div className="flex items-center space-x-1 bg-slate-200/80 p-0.5 rounded-lg text-[10px] font-medium">
                  <button
                    type="button"
                    onClick={() => setInputMode("PHYSICAL")}
                    className={`px-2 py-0.5 rounded-md ${
                      inputMode === "PHYSICAL"
                        ? "bg-white text-blue-700 font-bold shadow-xs"
                        : "text-slate-600"
                    }`}
                  >
                    Physical Count
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode("DIFF")}
                    className={`px-2 py-0.5 rounded-md ${
                      inputMode === "DIFF"
                        ? "bg-white text-blue-700 font-bold shadow-xs"
                        : "text-slate-600"
                    }`}
                  >
                    Diff (+/-)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
                {inputMode === "PHYSICAL" ? (
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                      New Physical Count ({selectedProd.stockUnit}) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder={`e.g. 97`}
                      value={physicalCount}
                      onChange={(e) =>
                        handlePhysicalCountChange(
                          e.target.value ? Number(e.target.value) : ""
                        )
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-blue-900"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                      Adjustment (+/-) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. -3"
                      value={adjustmentDiff}
                      onChange={(e) =>
                        handleDiffChange(
                          e.target.value ? Number(e.target.value) : ""
                        )
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-blue-900"
                      required
                    />
                  </div>
                )}

                <div className="p-2 bg-white border border-slate-200 rounded-xl text-[11px] space-y-0.5">
                  <div className="flex justify-between text-slate-600">
                    <span>Diff:</span>
                    <span className={`font-bold ${Number(adjustmentDiff) < 0 ? "text-red-600" : "text-blue-700"}`}>
                      {Number(adjustmentDiff) > 0 ? "+" : ""}{adjustmentDiff !== "" ? `${adjustmentDiff} ${selectedProd.stockUnit}` : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold">
                    <span>New Balance:</span>
                    <span className="text-emerald-700">
                      {physicalCount !== "" ? `${physicalCount} ${selectedProd.stockUnit}` : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <input
              type="text"
              placeholder="Remarks / damage description (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-1 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
            >
              Commit Adjustment
            </button>
          </div>
        </form>
      </div>

      {/* Adjustments History 2-Cards-Per-Row Grid (Collapsible, Closed by Default) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsLogOpen((prev) => !prev)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors focus:outline-none"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-900 uppercase">
                  Adjustment Log
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                  {state.adjustments.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {isLogOpen ? "Click to collapse audit records" : "Click to view historical physical count adjustments"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-slate-400">
            <span className="text-[11px] font-semibold text-blue-600 hidden sm:inline">
              {isLogOpen ? "Hide Log" : "Show Log"}
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              {isLogOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>
        </button>

        {isLogOpen && (
          <div className="p-4 pt-1 border-t border-slate-100 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {state.adjustments.length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  No physical adjustments recorded yet.
                </div>
              ) : (
                state.adjustments.map((a) => {
                  const isNeg = a.adjustmentQty < 0;
                  return (
                    <div
                      key={a.id}
                      className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all space-y-2.5"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                          <span className="font-bold text-blue-700 text-xs">
                            {a.adjustmentCode}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(a.createdAt)}
                          </span>
                        </div>

                        <div className="mt-2">
                          <div className="font-bold text-slate-900 text-xs truncate">
                            {a.brandName} - {a.productName}
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            Size: {a.packageDisplay}
                          </div>
                        </div>

                        <div className="mt-1.5">
                          <span className="inline-block px-2 py-0.5 bg-slate-100 rounded-md text-slate-700 text-[10px] font-semibold border border-slate-200">
                            {a.reason.replace(/_/g, " ")}
                          </span>
                        </div>

                        {a.notes && (
                          <div className="mt-1.5 text-[11px] text-slate-500 line-clamp-1">
                            Note: {a.notes}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                            Impact
                          </span>
                          <span className={`font-bold ${isNeg ? "text-red-600" : "text-blue-700"}`}>
                            {a.adjustmentQty > 0 ? "+" : ""}{a.adjustmentQty} {a.unit}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                            New Balance
                          </span>
                          <span className="font-bold text-slate-900">
                            {a.newStock} {a.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdjustmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-xs font-semibold text-slate-500">
            Loading adjustments...
          </div>
        </div>
      }
    >
      <AdjustmentsContent />
    </Suspense>
  );
}
