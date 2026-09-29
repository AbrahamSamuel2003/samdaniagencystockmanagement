import { createClient } from "@/utils/supabase/client";
import { StockStore, AppState } from "./store";

let syncChannel: any = null;
let isInitialized = false;

export function initRealtimeSync() {
  if (typeof window === "undefined") return;
  if (isInitialized) return;
  isInitialized = true;

  try {
    const supabase = createClient();
    syncChannel = supabase
      .channel("sd-stock-live-sync", {
        config: { broadcast: { self: false } },
      })
      .on("broadcast", { event: "db-sync" }, (payload: { payload?: { state?: AppState; eventType?: string } }) => {
        // Sub-50ms instant sync: apply remote state payload directly
        if (payload?.payload?.state) {
          StockStore.applyRemoteState(payload.payload.state);
        } else {
          StockStore.fetchLiveState();
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("⚡ Ultra-fast Realtime WebSocket channel connected");
        }
      });

    // Auto-sync when phone unlocks or user switches back to browser tab
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        StockStore.fetchLiveState();
      }
    });

    // Auto-sync on window focus
    window.addEventListener("focus", () => {
      StockStore.fetchLiveState();
    });
  } catch (err) {
    console.warn("Realtime sync initialization error:", err);
  }
}

export function broadcastStateChange(eventType: string = "mutation", currentState?: AppState) {
  if (typeof window === "undefined") return;
  try {
    if (syncChannel) {
      syncChannel.send({
        type: "broadcast",
        event: "db-sync",
        payload: {
          eventType,
          state: currentState || StockStore.getState(),
          timestamp: Date.now(),
        },
      });
    }
  } catch (err) {
    console.warn("Broadcast error:", err);
  }
}
