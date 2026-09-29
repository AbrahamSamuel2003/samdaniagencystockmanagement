"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDownToLine,
  Plus,
  Trash2,
  CheckCircle2,
  Building2,
  Calendar,
  FileText,
  Boxes,
  Layers,
  History,
} from "lucide-react";
import { StockStore, AppState } from "@/lib/store";
import { Product } from "@/lib/types";
import { formatQuantity } from "@/lib/utils";

interface RowItem {
  id: string;
  productId: string;
  isBoxInput: boolean;
  boxCount: number | "";
  baseQuantity: number | "";
}

export default function StockInPage() {
  const router = useRouter();
  const [state, setState] = useState<AppState | null>(null);

  const [supplierId, setSupplierId] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [receivingDate, setReceivingDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<RowItem[]>([
    { id: "row_1", productId: "", isBoxInput: false, boxCount: "", baseQuantity: "" },
  ]);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const s = StockStore.getState();
    setState(s);
    if (s.suppliers.length > 0) {
      setSupplierId(s.suppliers[0].id);
    }
  }, []);

  const getProduct = (prodId: string): Product | undefined => {
    return state?.products.find((p) => p.id === prodId);
  };

  const handleAddItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `row_${Date.now()}`,
        productId: "",
        isBoxInput: false,
        boxCount: "",
        baseQuantity: "",
      },
    ]);
  };

  const handleRemoveItemRow = (id: string) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleProductChange = (rowId: string, prodId: string) => {
    const prod = getProduct(prodId);
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === rowId) {
          const hasBox = prod?.hasBoxConversion || false;
          return {
            ...item,
            productId: prodId,
            isBoxInput: hasBox,
            boxCount: "",
            baseQuantity: "",
          };
        }
        return item;
      })
    );
  };

  const handleBoxCountChange = (rowId: string, boxes: number | "") => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === rowId) {
          const prod = getProduct(item.productId);
          let calcBaseQty: number | "" = "";
          if (boxes !== "" && prod?.unitsPerBox) {
            calcBaseQty = Number(boxes) * prod.unitsPerBox;
          }
          return {
            ...item,
            boxCount: boxes,
            baseQuantity: calcBaseQty,
          };
        }
        return item;
      })
    );
  };

  const handleBaseQtyChange = (rowId: string, qty: number | "") => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === rowId) {
          return {
            ...item,
            baseQuantity: qty,
          };
        }
        return item;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!supplierId) {
      setErrorMsg("Please select a supplier.");
      return;
    }

    const validItems: Array<{
      productId: string;
      quantity: number;
      inputBoxes?: number;
      unit: string;
    }> = [];

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.productId) {
        setErrorMsg(`Please select a product for Item row #${i + 1}.`);
        return;
      }
      if (!it.baseQuantity || Number(it.baseQuantity) <= 0) {
        setErrorMsg(`Please enter a valid quantity for Item row #${i + 1}.`);
        return;
      }

      const prod = getProduct(it.productId);
      if (!prod) continue;

      validItems.push({
        productId: it.productId,
        quantity: Number(it.baseQuantity),
        inputBoxes: it.isBoxInput && it.boxCount ? Number(it.boxCount) : undefined,
        unit: prod.stockUnit,
      });
    }

    try {
      const newStockIn = StockStore.recordStockIn({
        supplierId,
        invoiceNo,
        date: receivingDate,
        notes,
        items: validItems,
      });

      setSuccessMsg(
        `Stock-In batch ${newStockIn.stockInCode} recorded successfully with ${validItems.length} items.`
      );
      // Reset form
      setInvoiceNo("");
      setNotes("");
      setItems([{ id: `row_${Date.now()}`, productId: "", isBoxInput: false, boxCount: "", baseQuantity: "" }]);
      setState(StockStore.getState());
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to record stock in.");
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
              <ArrowDownToLine className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Record Inward Stock (Stock In)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Receive goods from suppliers, apply automatic packaging conversions, and update ledger.
          </p>
        </div>

        <Link
          href="/stock-in/history"
          className="inline-flex items-center px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
        >
          <History className="w-4 h-4 mr-1.5 text-slate-500" />
          <span>View Stock-In History</span>
        </Link>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <Link
            href="/inventory"
            className="text-xs font-bold text-emerald-900 underline hover:no-underline"
          >
            Check Inventory Table
          </Link>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold shadow-xs">
          {errorMsg}
        </div>
      )}

      {/* Main Stock-In Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sourcing & Batch Metadata */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Supplier & Inward Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Supplier */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Supplier / Distributor <span className="text-red-500">*</span>
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
                {state.suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Receipt Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={receivingDate}
                onChange={(e) => setReceivingDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              >
              </input>
            </div>

            {/* Invoice / DC No */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Supplier Invoice / DC No (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. INV-88901 / DC-44"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Received Products Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Received Product Line Items
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
              return (
                <div
                  key={row.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Line Item #{index + 1}
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
                    <div className="md:col-span-6">
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

                    {/* Packaging Conversion Input / Base Input */}
                    {selectedProd?.hasBoxConversion ? (
                      <>
                        <div className="md:col-span-3">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Received Boxes (1 Box = {selectedProd.unitsPerBox} {selectedProd.subUnitName || "Units"})
                          </label>
                          <input
                            type="number"
                            step="any"
                            placeholder="e.g. 5 boxes"
                            value={row.boxCount}
                            onChange={(e) =>
                              handleBoxCountChange(
                                row.id,
                                e.target.value ? Number(e.target.value) : ""
                              )
                            }
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Total Units ({selectedProd.stockUnit}) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="any"
                            placeholder="Calculated"
                            value={row.baseQuantity}
                            onChange={(e) =>
                              handleBaseQtyChange(
                                row.id,
                                e.target.value ? Number(e.target.value) : ""
                              )
                            }
                            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                          />
                        </div>
                      </>
                    ) : (
                      <div className="md:col-span-6">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Received Quantity ({selectedProd?.stockUnit || "Unit"}) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder="e.g. 25"
                          value={row.baseQuantity}
                          onChange={(e) =>
                            handleBaseQtyChange(
                              row.id,
                              e.target.value ? Number(e.target.value) : ""
                            )
                          }
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Stock Preview Preview */}
                  {selectedProd && row.baseQuantity && Number(row.baseQuantity) > 0 && (
                    <div className="text-xs text-slate-600 pt-1 flex items-center space-x-2">
                      <span className="text-slate-500">Stock Impact:</span>
                      <span>
                        Current: <strong>{selectedProd.currentStock} {selectedProd.stockUnit}</strong>
                      </span>
                      <span>+</span>
                      <span className="text-blue-700 font-bold">
                        {row.baseQuantity} {selectedProd.stockUnit}
                      </span>
                      <span>=</span>
                      <span className="text-emerald-700 font-bold">
                        {(selectedProd.currentStock + Number(row.baseQuantity)).toFixed(2)} {selectedProd.stockUnit}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Notes */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Inward Remarks / Vehicle / Delivery Notes
          </label>
          <input
            type="text"
            placeholder="e.g. Received via Tempo Truck, Goods in good condition"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Form Submission */}
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
            Confirm & Save Inward Stock
          </button>
        </div>
      </form>
    </div>
  );
}
