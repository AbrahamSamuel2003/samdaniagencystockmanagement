import { NextResponse } from "next/server";
import { InventoryService } from "@/lib/services/inventory-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const brand = await InventoryService.createBrand(body);
    return NextResponse.json({ success: true, data: brand });
  } catch (error: any) {
    console.error("Failed to create brand:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create brand" },
      { status: 500 }
    );
  }
}
