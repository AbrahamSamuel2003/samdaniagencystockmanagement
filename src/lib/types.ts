export type ItemStatus = 'ACTIVE' | 'INACTIVE';

export type TransactionType = 'OPENING' | 'STOCK_IN' | 'DELIVERY' | 'ADJUSTMENT';

export type AdjustmentReason =
  | 'DAMAGED'
  | 'EXPIRED'
  | 'MISSING'
  | 'PHYSICAL_COUNT_CORRECTION'
  | 'DATA_ENTRY_MISTAKE'
  | 'RETURNED_STOCK'
  | 'OTHER';

export interface Brand {
  id: string;
  name: string;
  code?: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Unit {
  id: string;
  name: string;
  symbol: string;
  isDecimal: boolean;
}

export interface Product {
  id: string;
  brandId: string;
  brandName: string;
  name: string;
  packageSize: number;
  packageUnit: string;
  stockUnit: string;
  hasBoxConversion: boolean;
  unitsPerBox?: number;
  subUnitName?: string;
  openingStock: number;
  currentStock: number;
  lowStockLimit?: number;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Shop {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
  notes?: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StockInItem {
  id: string;
  productId: string;
  productName: string;
  brandName: string;
  packageDisplay: string;
  quantity: number; // Base stockUnit quantity
  inputBoxes?: number;
  unit: string;
}

export interface StockIn {
  id: string;
  stockInCode: string;
  invoiceNo?: string;
  supplierId: string;
  supplierName: string;
  date: string;
  notes?: string;
  items: StockInItem[];
  totalQuantity: number;
  createdAt: string;
}

export interface DeliveryItem {
  id: string;
  productId: string;
  productName: string;
  brandName: string;
  packageDisplay: string;
  quantity: number;
  unit: string;
  availableStockBefore: number;
  stockDeficit?: number; // if requested > available
}

export interface Delivery {
  id: string;
  deliveryCode: string;
  shopId: string;
  shopName: string;
  deliveryDate: string;
  notes?: string;
  items: DeliveryItem[];
  totalItemsCount: number;
  createdAt: string;
}

export interface StockAdjustment {
  id: string;
  adjustmentCode: string;
  productId: string;
  productName: string;
  brandName: string;
  packageDisplay: string;
  unit: string;
  adjustmentQty: number; // e.g. -3 or +5
  previousStock: number;
  newStock: number;
  reason: AdjustmentReason;
  notes?: string;
  createdAt: string;
}

export interface StockTransaction {
  id: string;
  productId: string;
  productName: string;
  brandName: string;
  packageDisplay: string;
  type: TransactionType;
  quantity: number; // signed: +25, -5
  balanceAfter: number;
  unit: string;
  referenceNo?: string;
  referenceId?: string;
  partyName?: string; // Supplier name or Shop name or Reason
  notes?: string;
  transactionDate: string;
  createdAt: string;
}
