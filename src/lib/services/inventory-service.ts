import prisma from "@/lib/db";
import { AdjustmentReason } from "@prisma/client";

export class InventoryService {
  /**
   * Fetch full state directly from PostgreSQL Database
   */
  static async getFullState() {
    const [
      brands,
      products,
      suppliers,
      shops,
      deliveries,
      stockIns,
      adjustments,
      transactions,
    ] = await Promise.all([
      prisma.brand.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.product.findMany({
        include: { brand: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.supplier.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.shop.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.delivery.findMany({
        include: { items: true, shop: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.stockIn.findMany({
        include: { items: true, supplier: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.stockAdjustment.findMany({
        include: { product: { include: { brand: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.stockTransaction.findMany({
        include: { product: { include: { brand: true } } },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    ]);

    return {
      brands: brands.map((b) => ({
        id: b.id,
        name: b.name,
        code: b.code || undefined,
        status: b.status as "ACTIVE" | "INACTIVE",
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
      })),
      products: products.map((p) => ({
        id: p.id,
        brandId: p.brandId,
        brandName: p.brand.name,
        name: p.name,
        packageSize: p.packageSize,
        packageUnit: p.packageUnit,
        stockUnit: p.stockUnit,
        hasBoxConversion: p.hasBoxConversion,
        unitsPerBox: p.unitsPerBox || undefined,
        subUnitName: p.subUnitName || undefined,
        openingStock: p.openingStock,
        currentStock: p.currentStock,
        lowStockLimit: p.lowStockLimit || undefined,
        status: p.status as "ACTIVE" | "INACTIVE",
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      suppliers: suppliers.map((s) => ({
        id: s.id,
        name: s.name,
        phone: s.phone || undefined,
        address: s.address || undefined,
        notes: s.notes || undefined,
        status: s.status as "ACTIVE" | "INACTIVE",
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })),
      shops: shops.map((sh) => ({
        id: sh.id,
        name: sh.name,
        contactPerson: sh.contactPerson || undefined,
        phone: sh.phone || undefined,
        address: sh.address || undefined,
        notes: sh.notes || undefined,
        status: sh.status as "ACTIVE" | "INACTIVE",
        createdAt: sh.createdAt.toISOString(),
        updatedAt: sh.updatedAt.toISOString(),
      })),
      deliveries: deliveries.map((d) => ({
        id: d.id,
        deliveryCode: d.deliveryCode,
        shopId: d.shopId,
        shopName: d.shop.name,
        deliveryDate: d.deliveryDate.toISOString(),
        notes: d.notes || undefined,
        totalItemsCount: d.totalItemsCount,
        items: d.items.map((it) => ({
          id: it.id,
          productId: it.productId,
          productName: "",
          brandName: "",
          packageDisplay: it.packageDisplay,
          quantity: it.quantity,
          unit: it.unit,
          availableStockBefore: it.availableStockBefore,
          stockDeficit: it.stockDeficit || undefined,
        })),
        createdAt: d.createdAt.toISOString(),
      })),
      stockIns: stockIns.map((s) => ({
        id: s.id,
        stockInCode: s.stockInCode,
        supplierId: s.supplierId,
        supplierName: s.supplier.name,
        invoiceNo: s.invoiceNo || undefined,
        date: s.date.toISOString(),
        notes: s.notes || undefined,
        totalQuantity: s.totalQuantity,
        items: s.items.map((it) => ({
          id: it.id,
          productId: it.productId,
          productName: "",
          brandName: "",
          packageDisplay: it.packageDisplay,
          quantity: it.quantity,
          unit: it.unit,
          inputBoxes: it.inputBoxes || undefined,
        })),
        createdAt: s.createdAt.toISOString(),
      })),
      adjustments: adjustments.map((adj) => ({
        id: adj.id,
        adjustmentCode: adj.adjustmentCode,
        productId: adj.productId,
        productName: adj.product.name,
        brandName: adj.product.brand.name,
        packageDisplay: adj.packageDisplay,
        adjustmentQty: adj.adjustmentQty,
        previousStock: adj.previousStock,
        newStock: adj.newStock,
        unit: adj.unit,
        reason: adj.reason,
        notes: adj.notes || undefined,
        createdAt: adj.createdAt.toISOString(),
      })),
      transactions: transactions.map((tx) => ({
        id: tx.id,
        productId: tx.productId,
        productName: tx.product.name,
        brandName: tx.product.brand.name,
        packageDisplay: tx.packageDisplay,
        type: tx.type as any,
        quantity: tx.quantity,
        balanceAfter: tx.balanceAfter,
        unit: tx.unit,
        referenceNo: tx.referenceNo || undefined,
        partyName: tx.partyName || undefined,
        notes: tx.notes || undefined,
        transactionDate: tx.transactionDate.toISOString(),
        createdAt: tx.createdAt.toISOString(),
      })),
      counters: {
        stockIn: stockIns.length + 1,
        delivery: deliveries.length + 1,
        adjustment: adjustments.length + 1,
      },
    };
  }

  /**
   * Atomic Delivery Creation
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
   * Atomic Stock-In Receipt
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
   * Atomic Stock Adjustment
   */
  static async recordAdjustment(data: {
    productId: string;
    adjustmentQty: number;
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
   * Product Creation
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

  /**
   * Product Update
   */
  static async updateProduct(
    id: string,
    data: {
      brandId: string;
      name: string;
      packageSize: number;
      packageUnit: string;
      stockUnit: string;
      hasBoxConversion?: boolean;
      unitsPerBox?: number;
      subUnitName?: string;
      lowStockLimit?: number;
    }
  ) {
    return await prisma.product.update({
      where: { id },
      data: {
        brandId: data.brandId,
        name: data.name.trim(),
        packageSize: Number(data.packageSize),
        packageUnit: data.packageUnit.trim(),
        stockUnit: data.stockUnit.trim(),
        hasBoxConversion: !!data.hasBoxConversion,
        unitsPerBox: data.hasBoxConversion && data.unitsPerBox ? Number(data.unitsPerBox) : null,
        subUnitName: data.hasBoxConversion && data.subUnitName ? data.subUnitName.trim() : null,
        lowStockLimit: data.lowStockLimit !== undefined && data.lowStockLimit !== null ? Number(data.lowStockLimit) : null,
      },
      include: { brand: true },
    });
  }

  /**
   * Product Delete
   */
  static async deleteProduct(id: string) {
    return await prisma.$transaction(async (tx) => {
      // Clean associated transaction links or cascade
      await tx.deliveryItem.deleteMany({ where: { productId: id } });
      await tx.stockInItem.deleteMany({ where: { productId: id } });
      await tx.stockAdjustment.deleteMany({ where: { productId: id } });
      await tx.stockTransaction.deleteMany({ where: { productId: id } });
      return await tx.product.delete({ where: { id } });
    });
  }

  /**
   * Brand Create
   */
  static async createBrand(data: { name: string; code?: string }) {
    return await prisma.brand.create({
      data: {
        name: data.name.trim(),
        code: data.code ? data.code.trim().toUpperCase() : data.name.slice(0, 3).toUpperCase(),
      },
    });
  }

  /**
   * Brand Update
   */
  static async updateBrand(id: string, data: { name: string; code?: string; status?: "ACTIVE" | "INACTIVE" }) {
    return await prisma.brand.update({
      where: { id },
      data: {
        name: data.name.trim(),
        code: data.code ? data.code.trim().toUpperCase() : undefined,
        status: data.status as any,
      },
    });
  }

  /**
   * Brand Delete (Cascades associated products)
   */
  static async deleteBrand(id: string) {
    return await prisma.$transaction(async (tx) => {
      const prods = await tx.product.findMany({ where: { brandId: id }, select: { id: true } });
      const prodIds = prods.map((p) => p.id);

      if (prodIds.length > 0) {
        await tx.deliveryItem.deleteMany({ where: { productId: { in: prodIds } } });
        await tx.stockInItem.deleteMany({ where: { productId: { in: prodIds } } });
        await tx.stockAdjustment.deleteMany({ where: { productId: { in: prodIds } } });
        await tx.stockTransaction.deleteMany({ where: { productId: { in: prodIds } } });
        await tx.product.deleteMany({ where: { id: { in: prodIds } } });
      }

      return await tx.brand.delete({ where: { id } });
    });
  }

  /**
   * Supplier Create
   */
  static async createSupplier(data: { name: string; phone?: string; address?: string; notes?: string }) {
    return await prisma.supplier.create({
      data: {
        name: data.name.trim(),
        phone: data.phone?.trim() || null,
        address: data.address?.trim() || null,
        notes: data.notes?.trim() || null,
      },
    });
  }

  /**
   * Shop Create
   */
  static async createShop(data: { name: string; contactPerson?: string; phone?: string; address?: string; notes?: string }) {
    return await prisma.shop.create({
      data: {
        name: data.name.trim(),
        contactPerson: data.contactPerson?.trim() || null,
        phone: data.phone?.trim() || null,
        address: data.address?.trim() || null,
        notes: data.notes?.trim() || null,
      },
    });
  }
}
