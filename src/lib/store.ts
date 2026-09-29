import {
  Brand,
  Product,
  Supplier,
  Shop,
  StockIn,
  Delivery,
  StockAdjustment,
  StockTransaction,
  Unit,
  AdjustmentReason,
} from "./types";
import { generateCode } from "./utils";

const STORAGE_KEY = "sd_stock_management_v1";

export const DEFAULT_UNITS: Unit[] = [
  { id: "u1", name: "Kilogram", symbol: "kg", isDecimal: true },
  { id: "u2", name: "Gram", symbol: "g", isDecimal: true },
  { id: "u3", name: "Litre", symbol: "L", isDecimal: true },
  { id: "u4", name: "Millilitre", symbol: "ml", isDecimal: true },
  { id: "u5", name: "Packet", symbol: "pkt", isDecimal: false },
  { id: "u6", name: "Box", symbol: "box", isDecimal: false },
  { id: "u7", name: "Bottle", symbol: "btl", isDecimal: false },
  { id: "u8", name: "Piece", symbol: "pcs", isDecimal: false },
];

export const DEFAULT_BRANDS: Brand[] = [
  { id: "b1", name: "Aachi", code: "ACH", status: "ACTIVE", createdAt: "2026-09-01T08:00:00.000Z", updatedAt: "2026-09-01T08:00:00.000Z" },
  { id: "b2", name: "Sun", code: "SUN", status: "ACTIVE", createdAt: "2026-09-01T08:00:00.000Z", updatedAt: "2026-09-01T08:00:00.000Z" },
  { id: "b3", name: "Sakthi", code: "SKT", status: "ACTIVE", createdAt: "2026-09-01T08:00:00.000Z", updatedAt: "2026-09-01T08:00:00.000Z" },
  { id: "b4", name: "Anjali", code: "ANJ", status: "ACTIVE", createdAt: "2026-09-01T08:00:00.000Z", updatedAt: "2026-09-01T08:00:00.000Z" },
  { id: "b5", name: "Gold Winner", code: "GWN", status: "ACTIVE", createdAt: "2026-09-01T08:00:00.000Z", updatedAt: "2026-09-01T08:00:00.000Z" },
  { id: "b6", name: "Local Brand", code: "LOC", status: "ACTIVE", createdAt: "2026-09-01T08:00:00.000Z", updatedAt: "2026-09-01T08:00:00.000Z" },
];

export const DEFAULT_SUPPLIERS: Supplier[] = [
  { id: "s1", name: "ABC Traders", phone: "+91 98450 11223", address: "Wholesale Market, Sector 4", notes: "Primary spice distributor", status: "ACTIVE", createdAt: "2026-09-01T08:00:00.000Z", updatedAt: "2026-09-01T08:00:00.000Z" },
  { id: "s2", name: "XYZ Distributors", phone: "+91 97890 44556", address: "Industrial Estate, Phase 2", notes: "Oil and ghee supplier", status: "ACTIVE", createdAt: "2026-09-01T08:00:00.000Z", updatedAt: "2026-09-01T08:00:00.000Z" },
  { id: "s3", name: "Sri Murugan Agencies", phone: "+91 94430 77889", address: "Grain Market, Main Road", notes: "Local flour and masala supplier", status: "ACTIVE", createdAt: "2026-09-01T08:00:00.000Z", updatedAt: "2026-09-01T08:00:00.000Z" },
];

export const DEFAULT_SHOPS: Shop[] = [
  { id: "sh1", name: "Sri Lakshmi Stores", contactPerson: "Ramasamy", phone: "+91 98765 43210", address: "14 Bazaar Street, Town", notes: "Daily evening dispatch route", status: "ACTIVE", createdAt: "2026-09-01T08:00:00.000Z", updatedAt: "2026-09-01T08:00:00.000Z" },
  { id: "sh2", name: "ABC Supermarket", contactPerson: "Nagarajan", phone: "+91 98765 12345", address: "45 Bypass Road, Cross 2", notes: "Bulk weekly delivery on Mondays", status: "ACTIVE", createdAt: "2026-09-01T08:00:00.000Z", updatedAt: "2026-09-01T08:00:00.000Z" },
  { id: "sh3", name: "New Star Stores", contactPerson: "Mohamed", phone: "+91 97123 45678", address: "8 Anna Nagar West", notes: "Cash on delivery customer", status: "ACTIVE", createdAt: "2026-09-01T08:00:00.000Z", updatedAt: "2026-09-01T08:00:00.000Z" },
  { id: "sh4", name: "Anand Agencies", contactPerson: "Anand", phone: "+91 94440 98765", address: "22 Station Road", notes: "Retail partner", status: "ACTIVE", createdAt: "2026-09-01T08:00:00.000Z", updatedAt: "2026-09-01T08:00:00.000Z" },
];

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "p1",
    brandId: "b1",
    brandName: "Aachi",
    name: "Turmeric Powder",
    packageSize: 100,
    packageUnit: "g",
    stockUnit: "kg",
    hasBoxConversion: false,
    openingStock: 25,
    currentStock: 25,
    lowStockLimit: 10,
    status: "ACTIVE",
    createdAt: "2026-09-01T09:00:00.000Z",
    updatedAt: "2026-09-01T09:00:00.000Z",
  },
  {
    id: "p2",
    brandId: "b1",
    brandName: "Aachi",
    name: "Chilli Powder",
    packageSize: 100,
    packageUnit: "g",
    stockUnit: "pkt",
    hasBoxConversion: true,
    unitsPerBox: 20,
    subUnitName: "Packet",
    openingStock: 100,
    currentStock: 100,
    lowStockLimit: 30,
    status: "ACTIVE",
    createdAt: "2026-09-01T09:00:00.000Z",
    updatedAt: "2026-09-01T09:00:00.000Z",
  },
  {
    id: "p3",
    brandId: "b1",
    brandName: "Aachi",
    name: "Chilli Powder",
    packageSize: 500,
    packageUnit: "g",
    stockUnit: "pkt",
    hasBoxConversion: true,
    unitsPerBox: 10,
    subUnitName: "Packet",
    openingStock: 50,
    currentStock: 4,
    lowStockLimit: 15,
    status: "ACTIVE",
    createdAt: "2026-09-01T09:00:00.000Z",
    updatedAt: "2026-09-01T09:00:00.000Z",
  },
  {
    id: "p4",
    brandId: "b1",
    brandName: "Aachi",
    name: "Coriander Powder",
    packageSize: 100,
    packageUnit: "g",
    stockUnit: "kg",
    hasBoxConversion: false,
    openingStock: 20,
    currentStock: 18,
    lowStockLimit: 5,
    status: "ACTIVE",
    createdAt: "2026-09-01T09:00:00.000Z",
    updatedAt: "2026-09-01T09:00:00.000Z",
  },
  {
    id: "p5",
    brandId: "b2",
    brandName: "Sun",
    name: "Sunflower Oil",
    packageSize: 1,
    packageUnit: "L",
    stockUnit: "box",
    hasBoxConversion: true,
    unitsPerBox: 12,
    subUnitName: "Bottle",
    openingStock: 20,
    currentStock: 20,
    lowStockLimit: 5,
    status: "ACTIVE",
    createdAt: "2026-09-01T09:00:00.000Z",
    updatedAt: "2026-09-01T09:00:00.000Z",
  },
  {
    id: "p6",
    brandId: "b2",
    brandName: "Sun",
    name: "Sunflower Oil",
    packageSize: 5,
    packageUnit: "L",
    stockUnit: "box",
    hasBoxConversion: true,
    unitsPerBox: 4,
    subUnitName: "Can",
    openingStock: 10,
    currentStock: 3,
    lowStockLimit: 4,
    status: "ACTIVE",
    createdAt: "2026-09-01T09:00:00.000Z",
    updatedAt: "2026-09-01T09:00:00.000Z",
  },
  {
    id: "p7",
    brandId: "b4",
    brandName: "Anjali",
    name: "Ghee",
    packageSize: 1,
    packageUnit: "kg",
    stockUnit: "kg",
    hasBoxConversion: false,
    openingStock: 15,
    currentStock: -2,
    lowStockLimit: 5,
    status: "ACTIVE",
    createdAt: "2026-09-01T09:00:00.000Z",
    updatedAt: "2026-09-01T09:00:00.000Z",
  },
];

export const DEFAULT_TRANSACTIONS: StockTransaction[] = [
  {
    id: "tx1",
    productId: "p1",
    productName: "Turmeric Powder",
    brandName: "Aachi",
    packageDisplay: "100 g",
    type: "OPENING",
    quantity: 25,
    balanceAfter: 25,
    unit: "kg",
    partyName: "System Genesis",
    notes: "Initial inventory setup",
    transactionDate: "2026-09-01T09:00:00.000Z",
    createdAt: "2026-09-01T09:00:00.000Z",
  },
  {
    id: "tx2",
    productId: "p5",
    productName: "Sunflower Oil",
    brandName: "Sun",
    packageDisplay: "1 L",
    type: "OPENING",
    quantity: 20,
    balanceAfter: 20,
    unit: "box",
    partyName: "System Genesis",
    notes: "Initial inventory setup",
    transactionDate: "2026-09-01T09:00:00.000Z",
    createdAt: "2026-09-01T09:00:00.000Z",
  },
  {
    id: "tx3",
    productId: "p3",
    productName: "Chilli Powder",
    brandName: "Aachi",
    packageDisplay: "500 g",
    type: "OPENING",
    quantity: 50,
    balanceAfter: 50,
    unit: "pkt",
    partyName: "System Genesis",
    notes: "Initial inventory setup",
    transactionDate: "2026-09-01T09:00:00.000Z",
    createdAt: "2026-09-01T09:00:00.000Z",
  },
  {
    id: "tx4",
    productId: "p7",
    productName: "Ghee",
    brandName: "Anjali",
    packageDisplay: "1 kg",
    type: "OPENING",
    quantity: 15,
    balanceAfter: 15,
    unit: "kg",
    partyName: "System Genesis",
    notes: "Initial inventory setup",
    transactionDate: "2026-09-01T09:00:00.000Z",
    createdAt: "2026-09-01T09:00:00.000Z",
  },
  {
    id: "tx5",
    productId: "p7",
    productName: "Ghee",
    brandName: "Anjali",
    packageDisplay: "1 kg",
    type: "DELIVERY",
    quantity: -17,
    balanceAfter: -2,
    unit: "kg",
    referenceNo: "DLV-00001",
    partyName: "Sri Lakshmi Stores",
    notes: "Urgent dispatch ahead of stock receipt",
    transactionDate: "2026-09-28T14:30:00.000Z",
    createdAt: "2026-09-28T14:30:00.000Z",
  },
  {
    id: "tx6",
    productId: "p3",
    productName: "Chilli Powder",
    brandName: "Aachi",
    packageDisplay: "500 g",
    type: "DELIVERY",
    quantity: -46,
    balanceAfter: 4,
    unit: "pkt",
    referenceNo: "DLV-00002",
    partyName: "ABC Supermarket",
    notes: "Bulk stock order fulfilled",
    transactionDate: "2026-09-29T10:15:00.000Z",
    createdAt: "2026-09-29T10:15:00.000Z",
  },
];

export interface AppState {
  brands: Brand[];
  products: Product[];
  suppliers: Supplier[];
  shops: Shop[];
  stockIns: StockIn[];
  deliveries: Delivery[];
  adjustments: StockAdjustment[];
  transactions: StockTransaction[];
  counters: {
    stockIn: number;
    delivery: number;
    adjustment: number;
  };
}

export function getInitialState(): AppState {
  return {
    brands: DEFAULT_BRANDS,
    products: DEFAULT_PRODUCTS,
    suppliers: DEFAULT_SUPPLIERS,
    shops: DEFAULT_SHOPS,
    stockIns: [],
    deliveries: [
      {
        id: "dlv1",
        deliveryCode: "DLV-00001",
        shopId: "sh1",
        shopName: "Sri Lakshmi Stores",
        deliveryDate: "2026-09-28T14:30:00.000Z",
        notes: "Urgent dispatch ahead of stock receipt",
        totalItemsCount: 1,
        items: [
          {
            id: "di1",
            productId: "p7",
            productName: "Ghee",
            brandName: "Anjali",
            packageDisplay: "1 kg",
            quantity: 17,
            unit: "kg",
            availableStockBefore: 15,
            stockDeficit: 2,
          },
        ],
        createdAt: "2026-09-28T14:30:00.000Z",
      },
      {
        id: "dlv2",
        deliveryCode: "DLV-00002",
        shopId: "sh2",
        shopName: "ABC Supermarket",
        deliveryDate: "2026-09-29T10:15:00.000Z",
        notes: "Bulk stock order fulfilled",
        totalItemsCount: 1,
        items: [
          {
            id: "di2",
            productId: "p3",
            productName: "Chilli Powder",
            brandName: "Aachi",
            packageDisplay: "500 g",
            quantity: 46,
            unit: "pkt",
            availableStockBefore: 50,
          },
        ],
        createdAt: "2026-09-29T10:15:00.000Z",
      },
    ],
    adjustments: [],
    transactions: DEFAULT_TRANSACTIONS,
    counters: {
      stockIn: 1,
      delivery: 3,
      adjustment: 1,
    },
  };
}

export class StockStore {
  private static loadState(): AppState {
    if (typeof window === "undefined") {
      return getInitialState();
    }
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (!serialized) {
        const initial = getInitialState();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(serialized);
    } catch {
      return getInitialState();
    }
  }

  private static saveState(state: AppState) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error("Failed to persist state", err);
    }
  }

  static resetToDefault(): AppState {
    const initial = getInitialState();
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    }
    return initial;
  }

  static getState(): AppState {
    return this.loadState();
  }

  // --- BRAND ACTIONS ---
  static addBrand(name: string, code?: string): Brand {
    const state = this.loadState();
    const newBrand: Brand = {
      id: `b_${Date.now()}`,
      name: name.trim(),
      code: code ? code.trim().toUpperCase() : name.slice(0, 3).toUpperCase(),
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.brands.unshift(newBrand);
    this.saveState(state);
    return newBrand;
  }

  static updateBrand(id: string, name: string, code?: string, status: "ACTIVE" | "INACTIVE" = "ACTIVE"): Brand | null {
    const state = this.loadState();
    const idx = state.brands.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    state.brands[idx] = {
      ...state.brands[idx],
      name: name.trim(),
      code: code ? code.trim().toUpperCase() : state.brands[idx].code,
      status,
      updatedAt: new Date().toISOString(),
    };
    this.saveState(state);
    return state.brands[idx];
  }

  static deleteBrand(id: string, cascadeProducts: boolean = true): boolean {
    const state = this.loadState();
    const initialLen = state.brands.length;
    state.brands = state.brands.filter((b) => b.id !== id);
    if (state.brands.length === initialLen) return false;
    if (cascadeProducts) {
      state.products = state.products.filter((p) => p.brandId !== id);
    }
    this.saveState(state);
    return true;
  }

  // --- PRODUCT ACTIONS ---
  static addProduct(data: {
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
  }): Product {
    const state = this.loadState();
    const brand = state.brands.find((b) => b.id === data.brandId);
    const brandName = brand ? brand.name : "General";
    const opening = data.openingStock || 0;
    const now = new Date().toISOString();
    const newProduct: Product = {
      id: `p_${Date.now()}`,
      brandId: data.brandId,
      brandName,
      name: data.name.trim(),
      packageSize: Number(data.packageSize),
      packageUnit: data.packageUnit.trim(),
      stockUnit: data.stockUnit.trim(),
      hasBoxConversion: !!data.hasBoxConversion,
      unitsPerBox: data.hasBoxConversion && data.unitsPerBox ? Number(data.unitsPerBox) : undefined,
      subUnitName: data.hasBoxConversion && data.subUnitName ? data.subUnitName.trim() : undefined,
      openingStock: opening,
      currentStock: opening,
      lowStockLimit: data.lowStockLimit !== undefined && data.lowStockLimit !== null && data.lowStockLimit > 0 ? Number(data.lowStockLimit) : undefined,
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now,
    };

    state.products.unshift(newProduct);

    if (opening > 0) {
      const tx: StockTransaction = {
        id: `tx_${Date.now()}`,
        productId: newProduct.id,
        productName: newProduct.name,
        brandName: newProduct.brandName,
        packageDisplay: `${newProduct.packageSize} ${newProduct.packageUnit}`,
        type: "OPENING",
        quantity: opening,
        balanceAfter: opening,
        unit: newProduct.stockUnit,
        partyName: "System Genesis",
        notes: "Product creation opening balance",
        transactionDate: now,
        createdAt: now,
      };
      state.transactions.unshift(tx);
    }

    this.saveState(state);
    return newProduct;
  }

  static updateProduct(
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
      status?: "ACTIVE" | "INACTIVE";
    }
  ): Product | null {
    const state = this.loadState();
    const idx = state.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const brand = state.brands.find((b) => b.id === data.brandId);
    state.products[idx] = {
      ...state.products[idx],
      brandId: data.brandId,
      brandName: brand ? brand.name : state.products[idx].brandName,
      name: data.name.trim(),
      packageSize: Number(data.packageSize),
      packageUnit: data.packageUnit.trim(),
      stockUnit: data.stockUnit.trim(),
      hasBoxConversion: !!data.hasBoxConversion,
      unitsPerBox: data.hasBoxConversion && data.unitsPerBox ? Number(data.unitsPerBox) : undefined,
      subUnitName: data.hasBoxConversion && data.subUnitName ? data.subUnitName.trim() : undefined,
      lowStockLimit: data.lowStockLimit !== undefined && data.lowStockLimit !== null ? Number(data.lowStockLimit) : undefined,
      status: data.status || state.products[idx].status,
      updatedAt: new Date().toISOString(),
    };
    this.saveState(state);
    return state.products[idx];
  }

  static deleteProduct(id: string): boolean {
    const state = this.loadState();
    const initialLen = state.products.length;
    state.products = state.products.filter((p) => p.id !== id);
    if (state.products.length === initialLen) return false;
    this.saveState(state);
    return true;
  }

  // --- SUPPLIER ACTIONS ---
  static addSupplier(data: { name: string; phone?: string; address?: string; notes?: string }): Supplier {
    const state = this.loadState();
    const newSupplier: Supplier = {
      id: `s_${Date.now()}`,
      name: data.name.trim(),
      phone: data.phone?.trim(),
      address: data.address?.trim(),
      notes: data.notes?.trim(),
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.suppliers.unshift(newSupplier);
    this.saveState(state);
    return newSupplier;
  }

  // --- SHOP ACTIONS ---
  static addShop(data: { name: string; contactPerson?: string; phone?: string; address?: string; notes?: string }): Shop {
    const state = this.loadState();
    const newShop: Shop = {
      id: `sh_${Date.now()}`,
      name: data.name.trim(),
      contactPerson: data.contactPerson?.trim(),
      phone: data.phone?.trim(),
      address: data.address?.trim(),
      notes: data.notes?.trim(),
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.shops.unshift(newShop);
    this.saveState(state);
    return newShop;
  }

  // --- STOCK-IN ATOMIC ACTION ---
  static recordStockIn(data: {
    supplierId: string;
    invoiceNo?: string;
    date: string;
    notes?: string;
    items: Array<{
      productId: string;
      quantity: number; // Base quantity
      inputBoxes?: number;
      unit: string;
    }>;
  }): StockIn {
    const state = this.loadState();
    const supplier = state.suppliers.find((s) => s.id === data.supplierId);
    const supplierName = supplier ? supplier.name : "Unknown Supplier";
    const stockInCode = generateCode("STK", state.counters.stockIn);
    state.counters.stockIn += 1;

    const now = new Date().toISOString();
    let totalQty = 0;

    const processedItems = data.items.map((item, index) => {
      const prodIndex = state.products.findIndex((p) => p.id === item.productId);
      if (prodIndex === -1) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      const prod = state.products[prodIndex];
      const newStock = Number((prod.currentStock + Number(item.quantity)).toFixed(2));
      prod.currentStock = newStock;
      prod.updatedAt = now;
      totalQty += Number(item.quantity);

      // Create Ledger Transaction
      const tx: StockTransaction = {
        id: `tx_${Date.now()}_${index}`,
        productId: prod.id,
        productName: prod.name,
        brandName: prod.brandName,
        packageDisplay: `${prod.packageSize} ${prod.packageUnit}`,
        type: "STOCK_IN",
        quantity: Number(item.quantity),
        balanceAfter: newStock,
        unit: prod.stockUnit,
        referenceNo: stockInCode,
        partyName: supplierName,
        notes: data.notes || (data.invoiceNo ? `Inv: ${data.invoiceNo}` : undefined),
        transactionDate: data.date ? new Date(data.date).toISOString() : now,
        createdAt: now,
      };
      state.transactions.unshift(tx);

      return {
        id: `si_${Date.now()}_${index}`,
        productId: prod.id,
        productName: prod.name,
        brandName: prod.brandName,
        packageDisplay: `${prod.packageSize} ${prod.packageUnit}`,
        quantity: Number(item.quantity),
        inputBoxes: item.inputBoxes ? Number(item.inputBoxes) : undefined,
        unit: prod.stockUnit,
      };
    });

    const newStockIn: StockIn = {
      id: `stkin_${Date.now()}`,
      stockInCode,
      invoiceNo: data.invoiceNo?.trim(),
      supplierId: data.supplierId,
      supplierName,
      date: data.date ? new Date(data.date).toISOString() : now,
      notes: data.notes?.trim(),
      items: processedItems,
      totalQuantity: totalQty,
      createdAt: now,
    };

    state.stockIns.unshift(newStockIn);
    this.saveState(state);
    return newStockIn;
  }

  // --- DELIVERY ATOMIC ACTION ---
  static recordDelivery(data: {
    shopId: string;
    deliveryDate: string;
    notes?: string;
    items: Array<{
      productId: string;
      quantity: number;
    }>;
  }): Delivery {
    const state = this.loadState();
    const shop = state.shops.find((s) => s.id === data.shopId);
    const shopName = shop ? shop.name : "Unknown Shop";
    const deliveryCode = generateCode("DLV", state.counters.delivery);
    state.counters.delivery += 1;

    const now = new Date().toISOString();

    const processedItems = data.items.map((item, index) => {
      const prodIndex = state.products.findIndex((p) => p.id === item.productId);
      if (prodIndex === -1) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      const prod = state.products[prodIndex];
      const prevStock = prod.currentStock;
      const reqQty = Number(item.quantity);
      const newStock = Number((prevStock - reqQty).toFixed(2));
      const deficit = reqQty > prevStock ? Number((reqQty - prevStock).toFixed(2)) : 0;

      prod.currentStock = newStock;
      prod.updatedAt = now;

      // Create Ledger Transaction
      const tx: StockTransaction = {
        id: `tx_${Date.now()}_${index}`,
        productId: prod.id,
        productName: prod.name,
        brandName: prod.brandName,
        packageDisplay: `${prod.packageSize} ${prod.packageUnit}`,
        type: "DELIVERY",
        quantity: -reqQty,
        balanceAfter: newStock,
        unit: prod.stockUnit,
        referenceNo: deliveryCode,
        partyName: shopName,
        notes: data.notes,
        transactionDate: data.deliveryDate ? new Date(data.deliveryDate).toISOString() : now,
        createdAt: now,
      };
      state.transactions.unshift(tx);

      return {
        id: `di_${Date.now()}_${index}`,
        productId: prod.id,
        productName: prod.name,
        brandName: prod.brandName,
        packageDisplay: `${prod.packageSize} ${prod.packageUnit}`,
        quantity: reqQty,
        unit: prod.stockUnit,
        availableStockBefore: prevStock,
        stockDeficit: deficit > 0 ? deficit : undefined,
      };
    });

    const newDelivery: Delivery = {
      id: `dlv_${Date.now()}`,
      deliveryCode,
      shopId: data.shopId,
      shopName,
      deliveryDate: data.deliveryDate ? new Date(data.deliveryDate).toISOString() : now,
      notes: data.notes?.trim(),
      items: processedItems,
      totalItemsCount: processedItems.length,
      createdAt: now,
    };

    state.deliveries.unshift(newDelivery);
    this.saveState(state);
    return newDelivery;
  }

  // --- STOCK ADJUSTMENT ATOMIC ACTION ---
  static recordAdjustment(data: {
    productId: string;
    adjustmentQty: number; // Signed: -3 or +2
    reason: AdjustmentReason;
    notes?: string;
  }): StockAdjustment {
    const state = this.loadState();
    const prodIndex = state.products.findIndex((p) => p.id === data.productId);
    if (prodIndex === -1) {
      throw new Error(`Product not found: ${data.productId}`);
    }
    const prod = state.products[prodIndex];
    const prevStock = prod.currentStock;
    const adjQty = Number(data.adjustmentQty);
    const newStock = Number((prevStock + adjQty).toFixed(2));
    const now = new Date().toISOString();
    const adjCode = generateCode("ADJ", state.counters.adjustment);
    state.counters.adjustment += 1;

    prod.currentStock = newStock;
    prod.updatedAt = now;

    // Create Ledger Transaction
    const tx: StockTransaction = {
      id: `tx_${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      brandName: prod.brandName,
      packageDisplay: `${prod.packageSize} ${prod.packageUnit}`,
      type: "ADJUSTMENT",
      quantity: adjQty,
      balanceAfter: newStock,
      unit: prod.stockUnit,
      referenceNo: adjCode,
      partyName: data.reason.replace(/_/g, " "),
      notes: data.notes,
      transactionDate: now,
      createdAt: now,
    };
    state.transactions.unshift(tx);

    const adjustmentRecord: StockAdjustment = {
      id: `adj_${Date.now()}`,
      adjustmentCode: adjCode,
      productId: prod.id,
      productName: prod.name,
      brandName: prod.brandName,
      packageDisplay: `${prod.packageSize} ${prod.packageUnit}`,
      unit: prod.stockUnit,
      adjustmentQty: adjQty,
      previousStock: prevStock,
      newStock,
      reason: data.reason,
      notes: data.notes?.trim(),
      createdAt: now,
    };

    state.adjustments.unshift(adjustmentRecord);
    this.saveState(state);
    return adjustmentRecord;
  }
}
