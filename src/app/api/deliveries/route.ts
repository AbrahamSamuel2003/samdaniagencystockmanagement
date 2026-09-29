import { NextResponse } from "next/server";
import { InventoryService } from "@/lib/services/inventory-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const delivery = await InventoryService.recordDelivery({
      shopId: body.shopId,
      deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : undefined,
      notes: body.notes,
      items: body.items,
    });
    return NextResponse.json({ success: true, data: delivery });
  } catch (error: any) {
    console.error("Failed to record delivery:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record delivery" },
      { status: 500 }
    );
  }
}
