import { NextResponse } from "next/server";
import { InventoryService } from "@/lib/services/inventory-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const shop = await InventoryService.createShop(body);
    return NextResponse.json({ success: true, data: shop });
  } catch (error: any) {
    console.error("Failed to create shop:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create shop" },
      { status: 500 }
    );
  }
}
