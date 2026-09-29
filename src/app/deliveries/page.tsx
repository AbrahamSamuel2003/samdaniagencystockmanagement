"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Truck,
  Plus,
  Trash2,
  CheckCircle2,
  Store,
  Calendar,
  AlertTriangle,
  History,
  FileSpreadsheet,
  X,
} from "lucide-react";
import { StockStore, AppState } from "@/lib/store";
import { Product } from "@/lib/types";
import { formatQuantity } from "@/lib/utils";

interface DeliveryRow {
  id: string;
  productId: string;
  quantity: number | "";
}

interface DeficitItem {
  productName: string;
  brandName: string;
  packageDisplay: string;
  unit: string;
  availableStock: number;
  requestedStock: number;
  deficit: number;
}

export default function DeliveriesPage() {
  const router = useRouter();
  const [state, setState] = useState<AppState | null>(null);

  const [shopId, setShopId] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<DeliveryRow[]>([
    { id: "row_1", productId: "", quantity: "" },
  ]);

  // Warning Modal State
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [deficitsList, setDeficitsList] = useState<DeficitItem[]>([]);
  const [pendingPayload, setPendingPayload] = useState<{
    shopId: string;
    deliveryDate: string;
    notes?: string;
    items: Array<{ productId: string; quantity: number }>;
  } | null>(null);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const s = StockStore.getState();
    setState(s);
    if (s.shops.length > 0) {
      setShopId(s.shops[0].id);
    }
  }, []);

  const getProduct = (prodId: string): Product | undefined => {
    return state?.products.find((p) => p.id === prodId);
  };

  const handleAddItemRow = () => {
    setItems((prev) => [
      ...prev,
      { id: `row_${Date.now()}`, productId: "", quantity: "" },
    ]);
  };

  const handleRemoveItemRow = (id: string) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleProductChange = (rowId: string, prodId: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === rowId ? { ...item, productId: prodId } : item))
    );
  };

  const handleQtyChange = (rowId: string, qty: number | "") => {
    setItems((prev) =>
      prev.map((item) => (item.id === rowId ? { ...item, quantity: qty } : item))
    );
  };

  const validateAndProcess = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!shopId) {
      setErrorMsg("Please select a destination shop.");
      return;
    }

    const validItems: Array<{ productId: string; quantity: number }> = [];
    const deficits: DeficitItem[] = [];

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.productId) {
        setErrorMsg(`Please choose a product for Line Item #${i + 1}.`);
        return;
      }
      if (!it.quantity || Number(it.quantity) <= 0) {
        setErrorMsg(`Please specify a valid quantity for Line Item #${i + 1}.`);
        return;
      }

      const prod = getProduct(it.productId);
      if (!prod) continue;

      const reqQty = Number(it.quantity);
      validItems.push({
        productId: it.productId,
        quantity: reqQty,
      });

      // Check if requested exceeds available
      if (reqQty > prod.currentStock) {
        deficits.push({
          productName: prod.name,
          brandName: prod.brandName,
          packageDisplay: `${prod.packageSize} ${prod.packageUnit}`,
          unit: prod.stockUnit,
          availableStock: prod.currentStock,
          requestedStock: reqQty,
          deficit: Number((reqQty - prod.currentStock).toFixed(2)),
        });
      }
    }

    const payload = {
      shopId,
      deliveryDate,
      notes,
      items: validItems,
    };

    if (deficits.length > 0) {
      // Trigger Insufficient Stock Warning Modal
      setDeficitsList(deficits);
      setPendingPayload(payload);
      setIsWarningModalOpen(true);
    } else {
      executeDeliveryCommit(payload);
    }
  };

  const executeDeliveryCommit = (payload: {
    shopId: string;
    deliveryDate: string;
    notes?: string;
    items: Array<{ productId: string; quantity: number }>;
  }) => {
    try {
      const newDlv = StockStore.recordDelivery(payload);
      setSuccessMsg(
        `Delivery ${newDlv.deliveryCode} dispatched successfully with ${payload.items.length} line items.`
      );
      setItems([{ id: `row_${Date.now()}`, productId: "", quantity: "" }]);
      setNotes("");
      setIsWarningModalOpen(false);
      setPendingPayload(null);
      setState(StockStore.getState());
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to record delivery.");
    }
  };

  if (!state) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Truck className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              New Shop Delivery (Stock Out)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dispatch multiple products in a single delivery ticket with real-time stock verification.
          </p>
        </div>

        <Link
          href="/deliveries/history"
          className="inline-flex items-center px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
        >
          <History className="w-4 h-4 mr-1.5 text-slate-500" />
          <span>Delivery History</span>
        </Link>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <Link
            href="/deliveries/history"
            className="text-xs font-bold text-emerald-900 underline hover:no-underline"
          >
            View Delivery Slips
          </Link>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold shadow-xs">
          {errorMsg}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={validateAndProcess} className="space-y-6">
        {/* Destination & Meta */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Destination Shop & Date
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Shop */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Destination Shop / Customer <span className="text-red-500">*</span>
              </label>
              <select
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                required
              >
                {state.shops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.contactPerson || s.phone || "Store"})
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Dispatch Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Multi-item Line Rows */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Dispatched Product Items
            </h2>
            <button
              type="button"
              onClick={handleAddItemRow}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
            >
              <Plus className="w-3.5 h-3.5 mr-1 text-blue-600" />
              Add Product Line
            </button>
          </div>

          <div className="space-y-3">
            {items.map((row, index) => {
              const selectedProd = getProduct(row.productId);
              const isInsufficient =
                selectedProd &&
                row.quantity !== "" &&
                Number(row.quantity) > selectedProd.currentStock;

              return (
                <div
                  key={row.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isInsufficient
                      ? "bg-amber-50/60 border-amber-300"
                      : "bg-slate-50 border-slate-200 hover:border-blue-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700">
                      Product #{index + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(row.id)}
                        className="text-slate-400 hover:text-red-600 p-1"
                        title="Remove row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    {/* Product Selection */}
                    <div className="md:col-span-8">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Select Product & Size <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={row.productId}
                        onChange={(e) => handleProductChange(row.id, e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        required
                      >
                        <option value="">-- Choose Product --</option>
                        {state.products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.brandName} - {p.name} ({p.packageSize} {p.packageUnit}) [Stock: {p.currentStock} {p.stockUnit}]
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Delivery Quantity */}
                    <div className="md:col-span-4">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Dispatch Quantity ({selectedProd?.stockUnit || "Unit"}) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 5"
                        value={row.quantity}
                        onChange={(e) =>
                          handleQtyChange(
                            row.id,
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                        className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:outline-none font-bold ${
                          isInsufficient
                            ? "border-amber-400 text-amber-900 focus:ring-amber-500"
                            : "border-slate-300 text-slate-900 focus:ring-blue-500"
                        }`}
                        required
                      />
                    </div>
                  </div>

                  {/* Real-time stock status preview */}
                  {selectedProd && (
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-500">Available in warehouse:</span>{" "}
                        <span className="font-bold text-slate-800">
                          {formatQuantity(selectedProd.currentStock, selectedProd.stockUnit)}
                        </span>
                      </div>

                      {isInsufficient ? (
                        <span className="text-amber-800 font-bold flex items-center">
                          <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                          Exceeds current stock by {(Number(row.quantity) - selectedProd.currentStock).toFixed(2)} {selectedProd.stockUnit}
                        </span>
                      ) : row.quantity !== "" && Number(row.quantity) > 0 ? (
                        <span className="text-slate-600">
                          Remaining after delivery:{" "}
                          <strong className="text-slate-900">
                            {(selectedProd.currentStock - Number(row.quantity)).toFixed(2)} {selectedProd.stockUnit}
                          </strong>
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Remarks */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Delivery Remarks / Vehicle / Driver Note
          </label>
          <input
            type="text"
            placeholder="e.g. Route A, Delivered via Delivery Van 2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-3">
          <Link
            href="/inventory"
            className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-all"
          >
            Confirm & Dispatch Delivery
          </button>
        </div>
      </form>

      {/* Insufficient Stock Warning Modal (As Specified in Section 16 of Document) */}
      {isWarningModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-amber-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold">
                  Insufficient Stock Warning
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWarningModalOpen(false)}
                className="p-1 rounded-lg text-amber-700 hover:text-amber-950 hover:bg-amber-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-700 leading-relaxed">
                The requested delivery quantity exceeds currently recorded inventory for the following item(s).
              </p>

              <div className="space-y-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200 max-h-48 overflow-y-auto">
                {deficitsList.map((item, i) => (
                  <div key={i} className="text-xs p-2 bg-white rounded border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900">
                      {item.brandName} - {item.productName} ({item.packageDisplay})
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Available: <strong>{item.availableStock} {item.unit}</strong></span>
                      <span>Requested: <strong>{item.requestedStock} {item.unit}</strong></span>
                    </div>
                    <div className="text-red-700 font-bold text-right text-[11px]">
                      New Recorded Stock Balance: {(item.availableStock - item.requestedStock).toFixed(2)} {item.unit}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
                <strong>Business Note:</strong> Physical dispatches are permitted before supplier receipts are entered into the system. An audit transaction will be recorded.
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsWarningModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Adjust Quantities
                </button>
                <button
                  type="button"
                  onClick={() => pendingPayload && executeDeliveryCommit(pendingPayload)}
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm"
                >
                  Confirm & Dispatch Anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
