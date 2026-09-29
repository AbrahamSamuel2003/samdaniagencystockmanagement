import { NextResponse } from "next/server";
import { InventoryService } from "@/lib/services/inventory-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const product = await InventoryService.createProduct(body);
    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    console.error("Failed to create product:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
