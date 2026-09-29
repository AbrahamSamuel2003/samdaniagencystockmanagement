import { createClient } from "@/utils/supabase/client";
import { StockStore } from "./store";

let syncChannel: any = null;

export function initRealtimeSync() {
  if (typeof window === "undefined") return;
  if (syncChannel) return;

  try {
    const supabase = createClient();
    syncChannel = supabase
      .channel("sd-stock-live-sync", {
        config: { broadcast: { self: false } },
      })
      .on("broadcast", { event: "db-sync" }, () => {
        // Trigger live state re-fetch and UI update across devices
        StockStore.fetchLiveState();
      })
      .subscribe();
  } catch (err) {
    console.warn("Realtime sync initialization skipped:", err);
  }
}

export function broadcastStateChange(eventType: string = "mutation") {
  if (typeof window === "undefined") return;
  try {
    if (syncChannel) {
      syncChannel.send({
        type: "broadcast",
        event: "db-sync",
        payload: { eventType, timestamp: Date.now() },
      });
    }
  } catch (err) {
    console.warn("Broadcast send error:", err);
  }
}
