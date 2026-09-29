import { NextResponse } from "next/server";
import { InventoryService } from "@/lib/services/inventory-service";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await InventoryService.updateBrand(id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Failed to update brand:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update brand" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await InventoryService.deleteBrand(id);
    return NextResponse.json({ success: true, data: deleted });
  } catch (error: any) {
    console.error("Failed to delete brand:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete brand" },
      { status: 500 }
    );
  }
}
