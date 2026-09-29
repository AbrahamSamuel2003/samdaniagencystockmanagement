import { NextResponse } from "next/server";
import { InventoryService } from "@/lib/services/inventory-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const adjustment = await InventoryService.recordAdjustment({
      productId: body.productId,
      adjustmentQty: Number(body.adjustmentQty),
      reason: body.reason,
      notes: body.notes,
    });
    return NextResponse.json({ success: true, data: adjustment });
  } catch (error: any) {
    console.error("Failed to record adjustment:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record adjustment" },
      { status: 500 }
    );
  }
}
