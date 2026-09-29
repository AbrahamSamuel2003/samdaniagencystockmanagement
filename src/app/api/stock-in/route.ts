import { NextResponse } from "next/server";
import { InventoryService } from "@/lib/services/inventory-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const stockIn = await InventoryService.recordStockIn({
      supplierId: body.supplierId,
      invoiceNo: body.invoiceNo,
      date: body.date ? new Date(body.date) : undefined,
      notes: body.notes,
      items: body.items,
    });
    return NextResponse.json({ success: true, data: stockIn });
  } catch (error: any) {
    console.error("Failed to record stock in:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record stock in" },
      { status: 500 }
    );
  }
}
