"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  Layers,
  Tag,
  ArrowDownToLine,
  History,
  Truck,
  FileSpreadsheet,
  SlidersHorizontal,
  Store,
  Building2,
  FileBarChart2,
  PackageCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    title: "INVENTORY",
    items: [
      { label: "Current Stock", href: "/inventory", icon: Boxes, exact: true },
      { label: "Products & SKUs", href: "/inventory/products", icon: Layers },
      { label: "Brands", href: "/inventory/brands", icon: Tag },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      { label: "Stock In (Receive)", href: "/stock-in", icon: ArrowDownToLine, exact: true },
      { label: "Stock In History", href: "/stock-in/history", icon: History },
      { label: "New Delivery", href: "/deliveries", icon: Truck, exact: true },
      { label: "Delivery History", href: "/deliveries/history", icon: FileSpreadsheet },
      { label: "Stock Adjustments", href: "/adjustments", icon: SlidersHorizontal },
    ],
  },
  {
    title: "MASTERS & DIRECTORY",
    items: [
      { label: "Shops & Customers", href: "/masters/shops", icon: Store },
      { label: "Suppliers", href: "/masters/suppliers", icon: Building2 },
    ],
  },
  {
    title: "AUDIT & REPORTS",
    items: [
      { label: "Reports & Analytics", href: "/reports", icon: FileBarChart2 },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <aside className="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800 bg-slate-950/40">
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            <PackageCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-base tracking-tight block leading-tight">
              Sam & Dani
            </span>
            <span className="text-xs text-blue-400 font-medium tracking-wide">
              Stock Management
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {section.title}
            </h3>
            <div className="mt-1 space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group",
                      active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 mr-3 flex-shrink-0 transition-colors",
                        active ? "text-white" : "text-slate-400 group-hover:text-blue-400"
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/30">
        <div className="px-2 py-1.5 rounded-md bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">System Status</span>
            <span className="text-emerald-400 font-semibold">Active & Synced</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            SD Stock Management v1.0
          </div>
        </div>
      </div>
    </aside>
  );
}
