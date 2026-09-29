"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Truck,
  Search,
  Download,
  Printer,
  Store,
  Calendar,
  X,
  PackageCheck,
} from "lucide-react";
import { StockStore, AppState } from "@/lib/store";
import { Delivery } from "@/lib/types";
import { formatDate, exportToCSV } from "@/lib/utils";

export default function DeliveryHistoryPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShop, setSelectedShop] = useState<string>("ALL");
  const [activeDeliveryModal, setActiveDeliveryModal] = useState<Delivery | null>(null);

  useEffect(() => {
    setState(StockStore.getState());
    StockStore.fetchLiveState().then((live) => setState({ ...live }));
    const unsub = StockStore.subscribe((live) => setState({ ...live }));
    return () => unsub();
  }, []);

  if (!state) return null;

  const filteredDeliveries = state.deliveries.filter((d) => {
    const matchesSearch =
      d.deliveryCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.shopName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesShop = selectedShop === "ALL" || d.shopId === selectedShop;
    return matchesSearch && matchesShop;
  });

  const handleExportCSV = () => {
    const data = filteredDeliveries.flatMap((d) =>
      d.items.map((it) => ({
        "Delivery Code": d.deliveryCode,
        Date: formatDate(d.deliveryDate),
        Shop: d.shopName,
        Product: `${it.brandName} ${it.productName}`,
        "Package Size": it.packageDisplay,
        Quantity: `${it.quantity} ${it.unit}`,
        Notes: d.notes || "-",
      }))
    );
    exportToCSV(data, `SD_Delivery_History_${new Date().toISOString().slice(0, 10)}`);
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
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Delivery Dispatches ({filteredDeliveries.length})
            </h1>
            <p className="text-[11px] text-slate-500">
              Trace shop dispatches and print delivery receipts
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
            href="/deliveries"
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm flex items-center space-x-1"
          >
            <Truck className="w-3.5 h-3.5 text-white" />
            <span>+ New Delivery</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-2.5 no-print">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search code or shop name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 font-medium"
          />
        </div>

        <select
          value={selectedShop}
          onChange={(e) => setSelectedShop(e.target.value)}
          className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
        >
          <option value="ALL">All Registered Shops ({state.shops.length})</option>
          {state.shops.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* 2-Cards-Per-Row Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 no-print">
        {filteredDeliveries.length === 0 ? (
          <div className="col-span-full py-10 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            No delivery records found matching criteria.
          </div>
        ) : (
          filteredDeliveries.map((dlv) => (
            <div
              key={dlv.id}
              className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all space-y-3"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-bold text-[11px] rounded-md border border-emerald-200">
                    {dlv.deliveryCode}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(dlv.deliveryDate)}
                  </span>
                </div>

                <div className="mt-2 flex items-center space-x-1.5">
                  <Store className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {dlv.shopName}
                  </span>
                </div>

                {/* Items preview */}
                <div className="mt-2.5 space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                  {dlv.items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center justify-between text-slate-700"
                    >
                      <span className="truncate pr-2 font-medium">
                        {it.brandName} - {it.productName} ({it.packageDisplay})
                      </span>
                      <span className="font-bold text-emerald-700 whitespace-nowrap">
                        {it.quantity} {it.unit}
                      </span>
                    </div>
                  ))}
                </div>

                {dlv.notes && (
                  <div className="mt-2 text-[11px] text-slate-500 line-clamp-1">
                    Note: {dlv.notes}
                  </div>
                )}
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  {dlv.items.length} Line Items
                </span>
                <button
                  type="button"
                  onClick={() => setActiveDeliveryModal(dlv)}
                  className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100"
                >
                  View Slip
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Printable Delivery Slip Modal */}
      {activeDeliveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between no-print">
              <div className="flex items-center space-x-2">
                <PackageCheck className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Delivery Dispatch Slip
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-2.5 py-1 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDeliveryModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slip Content */}
            <div className="p-6 space-y-4 text-slate-900 text-xs">
              <div className="border-b border-slate-900 pb-3 flex justify-between items-start">
                <div>
                  <h2 className="text-base font-bold">SAM & DANI STOCK MANAGEMENT</h2>
                  <p className="text-[10px] text-slate-500">Multi-Brand Stock & Wholesale Distribution</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-700">{activeDeliveryModal.deliveryCode}</div>
                  <div className="text-[10px] text-slate-500">{formatDate(activeDeliveryModal.deliveryDate)}</div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-500 block uppercase text-[9px]">Delivered To:</span>
                <span className="font-bold text-sm text-slate-900">{activeDeliveryModal.shopName}</span>
              </div>

              <div className="space-y-1.5">
                {activeDeliveryModal.items.map((it, idx) => (
                  <div key={it.id} className="p-2 bg-white rounded-lg border border-slate-100 flex justify-between items-center">
                    <div>
                      <span className="font-bold">{idx + 1}. {it.brandName} - {it.productName}</span>
                      <span className="text-[10px] text-slate-500 ml-1.5">({it.packageDisplay})</span>
                    </div>
                    <span className="font-bold text-emerald-700">{it.quantity} {it.unit}</span>
                  </div>
                ))}
              </div>

              {activeDeliveryModal.notes && (
                <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <strong>Notes:</strong> {activeDeliveryModal.notes}
                </div>
              )}

              <div className="pt-6 grid grid-cols-2 gap-4 text-center text-[10px] text-slate-500">
                <div className="border-t border-slate-300 pt-1 font-semibold">Warehouse Signatory</div>
                <div className="border-t border-slate-300 pt-1 font-semibold">Shop Receiver</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
