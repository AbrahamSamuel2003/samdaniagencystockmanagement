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
    deliveries: [],
    adjustments: [],
    transactions: [],
    counters: {
      stockIn: 1,
      delivery: 1,
      adjustment: 1,
    },
  };
}

type Listener = (state: AppState) => void;

export class StockStore {
  private static cachedState: AppState | null = null;
  private static listeners: Set<Listener> = new Set();
  private static isFetching = false;

  private static notifyListeners() {
    if (this.cachedState) {
      this.listeners.forEach((listener) => listener(this.cachedState!));
    }
  }

  static subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static loadLocalState(): AppState {
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

  private static saveLocalState(state: AppState) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error("Failed to persist state locally", err);
    }
  }

  static getState(): AppState {
    if (!this.cachedState) {
      this.cachedState = this.loadLocalState();
    }
    return this.cachedState;
  }

  /**
   * Fetches latest live data from Supabase PostgreSQL Database
   */
  static async fetchLiveState(): Promise<AppState> {
    if (typeof window === "undefined") return getInitialState();
    try {
      this.isFetching = true;
      const res = await fetch("/api/inventory/state", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          this.cachedState = json.data;
          this.saveLocalState(json.data);
          this.notifyListeners();
          return json.data;
        }
      }
    } catch (err) {
      console.warn("Live DB fetch fallback to cache:", err);
    } finally {
      this.isFetching = false;
    }
    return this.getState();
  }

  static resetToDefault(): AppState {
    const initial = getInitialState();
    this.cachedState = initial;
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    }
    this.notifyListeners();
    return initial;
  }

  // --- BRAND ACTIONS ---
  static async addBrand(name: string, code?: string): Promise<Brand> {
    try {
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code }),
      });
      if (res.ok) {
        await this.fetchLiveState();
        const state = this.getState();
        const created = state.brands.find((b) => b.name === name.trim());
        if (created) return created;
      }
    } catch (e) {
      console.error("DB addBrand error:", e);
    }

    // Fallback local update
    const state = this.getState();
    const newBrand: Brand = {
      id: `b_${Date.now()}`,
      name: name.trim(),
      code: code ? code.trim().toUpperCase() : name.slice(0, 3).toUpperCase(),
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.brands.unshift(newBrand);
    this.cachedState = state;
    this.saveLocalState(state);
    this.notifyListeners();
    return newBrand;
  }

  static async updateBrand(id: string, name: string, code?: string, status: "ACTIVE" | "INACTIVE" = "ACTIVE"): Promise<Brand | null> {
    try {
      const res = await fetch(`/api/brands/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code, status }),
      });
      if (res.ok) {
        await this.fetchLiveState();
        return this.getState().brands.find((b) => b.id === id) || null;
      }
    } catch (e) {
      console.error("DB updateBrand error:", e);
    }

    const state = this.getState();
    const idx = state.brands.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    state.brands[idx] = {
      ...state.brands[idx],
      name: name.trim(),
      code: code ? code.trim().toUpperCase() : state.brands[idx].code,
      status,
      updatedAt: new Date().toISOString(),
    };
    this.cachedState = state;
    this.saveLocalState(state);
    this.notifyListeners();
    return state.brands[idx];
  }

  static async deleteBrand(id: string, cascadeProducts: boolean = true): Promise<boolean> {
    try {
      const res = await fetch(`/api/brands/${id}`, { method: "DELETE" });
      if (res.ok) {
        await this.fetchLiveState();
        return true;
      }
    } catch (e) {
      console.error("DB deleteBrand error:", e);
    }

    const state = this.getState();
    state.brands = state.brands.filter((b) => b.id !== id);
    if (cascadeProducts) {
      state.products = state.products.filter((p) => p.brandId !== id);
    }
    this.cachedState = state;
    this.saveLocalState(state);
    this.notifyListeners();
    return true;
  }

  // --- PRODUCT ACTIONS ---
  static async addProduct(data: {
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
  }): Promise<Product> {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await this.fetchLiveState();
        const state = this.getState();
        const created = state.products.find((p) => p.name === data.name.trim() && p.brandId === data.brandId);
        if (created) return created;
      }
    } catch (e) {
      console.error("DB addProduct error:", e);
    }

    // Fallback local update
    const state = this.getState();
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
      lowStockLimit: data.lowStockLimit !== undefined && data.lowStockLimit !== null ? Number(data.lowStockLimit) : undefined,
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now,
    };
    state.products.unshift(newProduct);
    this.cachedState = state;
    this.saveLocalState(state);
    this.notifyListeners();
    return newProduct;
  }

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
      status?: "ACTIVE" | "INACTIVE";
    }
  ): Promise<Product | null> {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await this.fetchLiveState();
        return this.getState().products.find((p) => p.id === id) || null;
      }
    } catch (e) {
      console.error("DB updateProduct error:", e);
    }

    const state = this.getState();
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
    this.cachedState = state;
    this.saveLocalState(state);
    this.notifyListeners();
    return state.products[idx];
  }

  static async deleteProduct(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        await this.fetchLiveState();
        return true;
      }
    } catch (e) {
      console.error("DB deleteProduct error:", e);
    }

    const state = this.getState();
    state.products = state.products.filter((p) => p.id !== id);
    this.cachedState = state;
    this.saveLocalState(state);
    this.notifyListeners();
    return true;
  }

  // --- SUPPLIER ACTIONS ---
  static async addSupplier(data: { name: string; phone?: string; address?: string; notes?: string }): Promise<Supplier> {
    try {
      const res = await fetch("/api/masters/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await this.fetchLiveState();
        const state = this.getState();
        const created = state.suppliers.find((s) => s.name === data.name.trim());
        if (created) return created;
      }
    } catch (e) {
      console.error("DB addSupplier error:", e);
    }

    const state = this.getState();
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
    this.cachedState = state;
    this.saveLocalState(state);
    this.notifyListeners();
    return newSupplier;
  }

  // --- SHOP ACTIONS ---
  static async addShop(data: { name: string; contactPerson?: string; phone?: string; address?: string; notes?: string }): Promise<Shop> {
    try {
      const res = await fetch("/api/masters/shops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await this.fetchLiveState();
        const state = this.getState();
        const created = state.shops.find((sh) => sh.name === data.name.trim());
        if (created) return created;
      }
    } catch (e) {
      console.error("DB addShop error:", e);
    }

    const state = this.getState();
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
    this.cachedState = state;
    this.saveLocalState(state);
    this.notifyListeners();
    return newShop;
  }

  // --- STOCK-IN ATOMIC ACTION ---
  static async recordStockIn(data: {
    supplierId: string;
    invoiceNo?: string;
    date: string;
    notes?: string;
    items: Array<{
      productId: string;
      quantity: number;
      inputBoxes?: number;
    }>;
  }): Promise<StockIn> {
    try {
      const res = await fetch("/api/stock-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await this.fetchLiveState();
        const state = this.getState();
        if (state.stockIns.length > 0) return state.stockIns[0];
      }
    } catch (e) {
      console.error("DB recordStockIn error:", e);
    }

    const state = this.getState();
    const code = generateCode("STK", state.counters.stockIn);
    state.counters.stockIn += 1;
    const now = new Date().toISOString();
    const supplier = state.suppliers.find((s) => s.id === data.supplierId);

    const stockInItems = data.items.map((item, idx) => {
      const product = state.products.find((p) => p.id === item.productId);
      const pkg = product ? `${product.packageSize} ${product.packageUnit}` : "Standard";
      const unit = product ? product.stockUnit : "kg";
      if (product) {
        product.currentStock = Number((product.currentStock + item.quantity).toFixed(2));
      }
      return {
        id: `si_${Date.now()}_${idx}`,
        productId: item.productId,
        productName: product?.name || "Product",
        brandName: product?.brandName || "Brand",
        packageDisplay: pkg,
        quantity: item.quantity,
        unit,
        inputBoxes: item.inputBoxes,
      };
    });

    const newStockIn: StockIn = {
      id: `stk_${Date.now()}`,
      stockInCode: code,
      supplierId: data.supplierId,
      supplierName: supplier?.name || "Supplier",
      invoiceNo: data.invoiceNo?.trim(),
      date: data.date,
      notes: data.notes?.trim(),
      totalQuantity: stockInItems.reduce((acc, item) => acc + item.quantity, 0),
      items: stockInItems,
      createdAt: now,
    };

    state.stockIns.unshift(newStockIn);
    this.cachedState = state;
    this.saveLocalState(state);
    this.notifyListeners();
    return newStockIn;
  }

  // --- DELIVERY ATOMIC ACTION ---
  static async recordDelivery(data: {
    shopId: string;
    deliveryDate: string;
    notes?: string;
    items: Array<{
      productId: string;
      quantity: number;
    }>;
  }): Promise<Delivery> {
    try {
      const res = await fetch("/api/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await this.fetchLiveState();
        const state = this.getState();
        if (state.deliveries.length > 0) return state.deliveries[0];
      }
    } catch (e) {
      console.error("DB recordDelivery error:", e);
    }

    const state = this.getState();
    const code = generateCode("DLV", state.counters.delivery);
    state.counters.delivery += 1;
    const now = new Date().toISOString();
    const shop = state.shops.find((s) => s.id === data.shopId);

    const deliveryItems = data.items.map((item, idx) => {
      const product = state.products.find((p) => p.id === item.productId);
      const prevStock = product ? product.currentStock : 0;
      const deficit = item.quantity > prevStock ? Number((item.quantity - prevStock).toFixed(2)) : undefined;
      const pkg = product ? `${product.packageSize} ${product.packageUnit}` : "Standard";
      const unit = product ? product.stockUnit : "kg";
      if (product) {
        product.currentStock = Number((product.currentStock - item.quantity).toFixed(2));
      }
      return {
        id: `di_${Date.now()}_${idx}`,
        productId: item.productId,
        productName: product?.name || "Product",
        brandName: product?.brandName || "Brand",
        packageDisplay: pkg,
        quantity: item.quantity,
        unit,
        availableStockBefore: prevStock,
        stockDeficit: deficit,
      };
    });

    const newDelivery: Delivery = {
      id: `dlv_${Date.now()}`,
      deliveryCode: code,
      shopId: data.shopId,
      shopName: shop?.name || "Shop",
      deliveryDate: data.deliveryDate,
      notes: data.notes?.trim(),
      totalItemsCount: deliveryItems.length,
      items: deliveryItems,
      createdAt: now,
    };

    state.deliveries.unshift(newDelivery);
    this.cachedState = state;
    this.saveLocalState(state);
    this.notifyListeners();
    return newDelivery;
  }

  // --- ADJUSTMENT ATOMIC ACTION ---
  static async recordAdjustment(data: {
    productId: string;
    adjustmentQty: number;
    reason: AdjustmentReason;
    notes?: string;
  }): Promise<StockAdjustment> {
    try {
      const res = await fetch("/api/adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await this.fetchLiveState();
        const state = this.getState();
        if (state.adjustments.length > 0) return state.adjustments[0];
      }
    } catch (e) {
      console.error("DB recordAdjustment error:", e);
    }

    const state = this.getState();
    const product = state.products.find((p) => p.id === data.productId);
    const prevStock = product ? product.currentStock : 0;
    const newStock = Number((prevStock + data.adjustmentQty).toFixed(2));
    if (product) {
      product.currentStock = newStock;
    }

    const code = generateCode("ADJ", state.counters.adjustment);
    state.counters.adjustment += 1;
    const now = new Date().toISOString();

    const newAdj: StockAdjustment = {
      id: `adj_${Date.now()}`,
      adjustmentCode: code,
      productId: data.productId,
      productName: product?.name || "Product",
      brandName: product?.brandName || "Brand",
      packageDisplay: product ? `${product.packageSize} ${product.packageUnit}` : "Standard",
      adjustmentQty: data.adjustmentQty,
      previousStock: prevStock,
      newStock,
      unit: product?.stockUnit || "kg",
      reason: data.reason,
      notes: data.notes?.trim(),
      createdAt: now,
    };

    state.adjustments.unshift(newAdj);
    this.cachedState = state;
    this.saveLocalState(state);
    this.notifyListeners();
    return newAdj;
  }
}
