"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
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

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  const links = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Current Stock", href: "/inventory", icon: Boxes },
    { label: "Products & SKUs", href: "/inventory/products", icon: Layers },
    { label: "Brands", href: "/inventory/brands", icon: Tag },
    { label: "Stock In (Receive)", href: "/stock-in", icon: ArrowDownToLine },
    { label: "Stock In History", href: "/stock-in/history", icon: History },
    { label: "New Delivery", href: "/deliveries", icon: Truck },
    { label: "Delivery History", href: "/deliveries/history", icon: FileSpreadsheet },
    { label: "Stock Adjustments", href: "/adjustments", icon: SlidersHorizontal },
    { label: "Shops & Customers", href: "/masters/shops", icon: Store },
    { label: "Suppliers", href: "/masters/suppliers", icon: Building2 },
    { label: "Reports & Analytics", href: "/reports", icon: FileBarChart2 },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-4/5 max-w-xs bg-slate-900 text-white flex flex-col h-full shadow-2xl z-10">
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              <PackageCheck className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-base">Sam & Dani</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {links.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 mr-3 flex-shrink-0",
                    active ? "text-white" : "text-slate-400"
                  )}
                />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
