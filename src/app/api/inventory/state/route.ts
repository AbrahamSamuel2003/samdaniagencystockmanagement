import { NextResponse } from "next/server";
import { InventoryService } from "@/lib/services/inventory-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = await InventoryService.getFullState();
    return NextResponse.json({ success: true, data: state });
  } catch (error: any) {
    console.error("Failed to fetch database state:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch state" },
      { status: 500 }
    );
  }
}
