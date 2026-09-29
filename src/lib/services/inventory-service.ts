import prisma from "@/lib/db";
import { AdjustmentReason } from "@prisma/client";

export class InventoryService {
  /**
   * Atomic Delivery Creation:
   * 1. Creates Delivery record + DeliveryItem rows
   * 2. Decrements Product.currentStock for each line item
   * 3. Creates signed DELIVERY StockTransaction ledger entries
   */
  static async recordDelivery(data: {
    shopId: string;
    deliveryDate?: Date;
    notes?: string;
    items: Array<{
      productId: string;
      quantity: number;
    }>;
  }) {
    return await prisma.$transaction(async (tx) => {
      const shop = await tx.shop.findUnique({ where: { id: data.shopId } });
      if (!shop) throw new Error("Destination shop not found");

      const deliveryCount = await tx.delivery.count();
      const deliveryCode = `DLV-${(deliveryCount + 1).toString().padStart(5, "0")}`;
      const now = data.deliveryDate || new Date();

      const createdDelivery = await tx.delivery.create({
        data: {
          deliveryCode,
          shopId: data.shopId,
          deliveryDate: now,
          notes: data.notes,
          totalItemsCount: data.items.length,
        },
      });

      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { brand: true },
        });
        if (!product) throw new Error(`Product not found: ${item.productId}`);

        const prevStock = product.currentStock;
        const reqQty = Number(item.quantity);
        const newStock = Number((prevStock - reqQty).toFixed(2));
        const deficit = reqQty > prevStock ? Number((reqQty - prevStock).toFixed(2)) : null;

        // Update product stock
        await tx.product.update({
          where: { id: product.id },
          data: { currentStock: newStock },
        });

        const packageDisplay = `${product.packageSize} ${product.packageUnit}`;

        // Create Delivery Item row
        await tx.deliveryItem.create({
          data: {
            deliveryId: createdDelivery.id,
            productId: product.id,
            quantity: reqQty,
            unit: product.stockUnit,
            packageDisplay,
            availableStockBefore: prevStock,
            stockDeficit: deficit,
          },
        });

        // Insert double-entry ledger transaction
        await tx.stockTransaction.create({
          data: {
            productId: product.id,
            type: "DELIVERY",
            quantity: -reqQty,
            balanceAfter: newStock,
            unit: product.stockUnit,
            packageDisplay,
            partyName: shop.name,
            referenceNo: deliveryCode,
            deliveryId: createdDelivery.id,
            notes: data.notes,
            transactionDate: now,
          },
        });
      }

      return createdDelivery;
    });
  }

  /**
   * Atomic Stock-In Receipt:
   * 1. Creates StockIn + StockInItem rows
   * 2. Increments Product.currentStock
   * 3. Creates signed STOCK_IN StockTransaction ledger entries
   */
  static async recordStockIn(data: {
    supplierId: string;
    invoiceNo?: string;
    date?: Date;
    notes?: string;
    items: Array<{
      productId: string;
      quantity: number;
      inputBoxes?: number;
    }>;
  }) {
    return await prisma.$transaction(async (tx) => {
      const supplier = await tx.supplier.findUnique({ where: { id: data.supplierId } });
      if (!supplier) throw new Error("Supplier not found");

      const stockInCount = await tx.stockIn.count();
      const stockInCode = `STK-${(stockInCount + 1).toString().padStart(5, "0")}`;
      const now = data.date || new Date();

      let totalQuantity = 0;

      const createdStockIn = await tx.stockIn.create({
        data: {
          stockInCode,
          supplierId: data.supplierId,
          invoiceNo: data.invoiceNo,
          date: now,
          notes: data.notes,
        },
      });

      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { brand: true },
        });
        if (!product) throw new Error(`Product not found: ${item.productId}`);

        const qty = Number(item.quantity);
        totalQuantity += qty;
        const newStock = Number((product.currentStock + qty).toFixed(2));

        // Update product stock
        await tx.product.update({
          where: { id: product.id },
          data: { currentStock: newStock },
        });

        const packageDisplay = `${product.packageSize} ${product.packageUnit}`;

        // Create StockIn Item row
        await tx.stockInItem.create({
          data: {
            stockInId: createdStockIn.id,
            productId: product.id,
            quantity: qty,
            inputBoxes: item.inputBoxes,
            unit: product.stockUnit,
            packageDisplay,
          },
        });

        // Insert double-entry ledger transaction
        await tx.stockTransaction.create({
          data: {
            productId: product.id,
            type: "STOCK_IN",
            quantity: qty,
            balanceAfter: newStock,
            unit: product.stockUnit,
            packageDisplay,
            partyName: supplier.name,
            referenceNo: stockInCode,
            stockInId: createdStockIn.id,
            notes: data.notes || (data.invoiceNo ? `Invoice: ${data.invoiceNo}` : undefined),
            transactionDate: now,
          },
        });
      }

      await tx.stockIn.update({
        where: { id: createdStockIn.id },
        data: { totalQuantity },
      });

      return createdStockIn;
    });
  }

  /**
   * Atomic Stock Adjustment (Physical Count Correction):
   */
  static async recordAdjustment(data: {
    productId: string;
    adjustmentQty: number; // Signed (+/-)
    reason: AdjustmentReason;
    notes?: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: data.productId },
        include: { brand: true },
      });
      if (!product) throw new Error("Product not found");

      const prevStock = product.currentStock;
      const adjQty = Number(data.adjustmentQty);
      const newStock = Number((prevStock + adjQty).toFixed(2));
      const now = new Date();

      const adjCount = await tx.stockAdjustment.count();
      const adjustmentCode = `ADJ-${(adjCount + 1).toString().padStart(5, "0")}`;
      const packageDisplay = `${product.packageSize} ${product.packageUnit}`;

      await tx.product.update({
        where: { id: product.id },
        data: { currentStock: newStock },
      });

      const adjustment = await tx.stockAdjustment.create({
        data: {
          adjustmentCode,
          productId: product.id,
          adjustmentQty: adjQty,
          previousStock: prevStock,
          newStock,
          unit: product.stockUnit,
          packageDisplay,
          reason: data.reason,
          notes: data.notes,
          createdAt: now,
        },
      });

      await tx.stockTransaction.create({
        data: {
          productId: product.id,
          type: "ADJUSTMENT",
          quantity: adjQty,
          balanceAfter: newStock,
          unit: product.stockUnit,
          packageDisplay,
          partyName: data.reason.replace(/_/g, " "),
          referenceNo: adjustmentCode,
          adjustmentId: adjustment.id,
          notes: data.notes,
          transactionDate: now,
        },
      });

      return adjustment;
    });
  }

  /**
   * Product Creation with Genesis Opening Stock Ledger
   */
  static async createProduct(data: {
    brandId: string;
    name: string;
    packageSize: number;
    packageUnit: string;
    stockUnit: string;
    hasBoxConversion?: boolean;
    unitsPerBox?: number;
    subUnitName?: string;
    openingStock?: number;
    lowStockLimit?: number;
  }) {
    return await prisma.$transaction(async (tx) => {
      const opening = data.openingStock || 0;
      const now = new Date();

      const product = await tx.product.create({
        data: {
          brandId: data.brandId,
          name: data.name.trim(),
          packageSize: Number(data.packageSize),
          packageUnit: data.packageUnit.trim(),
          stockUnit: data.stockUnit.trim(),
          hasBoxConversion: !!data.hasBoxConversion,
          unitsPerBox: data.hasBoxConversion && data.unitsPerBox ? Number(data.unitsPerBox) : undefined,
          subUnitName: data.hasBoxConversion && data.subUnitName ? data.subUnitName.trim() : undefined,
          openingStock: opening,
          currentStock: opening,
          lowStockLimit: data.lowStockLimit !== undefined && data.lowStockLimit !== null ? Number(data.lowStockLimit) : undefined,
        },
        include: { brand: true },
      });

      if (opening > 0) {
        await tx.stockTransaction.create({
          data: {
            productId: product.id,
            type: "OPENING",
            quantity: opening,
            balanceAfter: opening,
            unit: product.stockUnit,
            packageDisplay: `${product.packageSize} ${product.packageUnit}`,
            partyName: "System Genesis",
            notes: "Initial inventory setup",
            transactionDate: now,
          },
        });
      }

      return product;
    });
  }
}
