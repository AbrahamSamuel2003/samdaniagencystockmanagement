"use client";

import React, { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileBottomNav } from "./MobileBottomNav";
import { initRealtimeSync } from "@/lib/realtime";

export function AppShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initRealtimeSync();
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 antialiased font-sans">
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 md:pb-0">
        <Header />

        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 bg-slate-50">
          <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">{children}</div>
        </main>

        {/* Native Mobile Bottom Navigation Bar */}
        <MobileBottomNav />
      </div>
    </div>
  );
}
