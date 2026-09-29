import { NextResponse } from "next/server";
import { InventoryService } from "@/lib/services/inventory-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supplier = await InventoryService.createSupplier(body);
    return NextResponse.json({ success: true, data: supplier });
  } catch (error: any) {
    console.error("Failed to create supplier:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create supplier" },
      { status: 500 }
    );
  }
}
