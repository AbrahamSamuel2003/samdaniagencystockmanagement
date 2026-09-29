"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  Truck,
  ArrowDownToLine,
  History,
  MoreHorizontal,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomTab {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const TABS: BottomTab[] = [
  { label: "Home", href: "/", icon: LayoutDashboard, exact: true },
  { label: "Stock", href: "/inventory", icon: Boxes },
  { label: "Deliver", href: "/deliveries", icon: Truck },
  { label: "Stock In", href: "/stock-in", icon: ArrowDownToLine },
  { label: "History", href: "/reports", icon: History },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (tab: BottomTab) => {
    if (tab.exact) return pathname === tab.href;
    return pathname.startsWith(tab.href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg md:hidden">
      {TABS.map((tab) => {
        const active = isActive(tab);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-col items-center justify-center py-1 px-2 rounded-lg min-w-[56px] transition-colors",
              active
                ? "text-blue-600 font-bold"
                : "text-slate-500 hover:text-slate-800 font-medium"
            )}
          >
            <div
              className={cn(
                "p-1 rounded-lg transition-colors",
                active ? "bg-blue-50 text-blue-600" : "text-slate-500"
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[11px] tracking-tight mt-0.5">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
