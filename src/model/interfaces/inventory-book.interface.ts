import { Document } from 'mongoose';

export interface InventoryBook extends Document {
  id: string;
  date: Date;
  inventoryId: string;
  inventoryName: string;
  contactId: string;
  contactName: string;
  branchId: string;
  branchName: string;
  warehouseId: string;
  warehouseName: string;
  inward: number;
  outward: number;
  narration: string;
  saleValue: number;
  assetValue: number;
  voucherNo: string;
  refNo: string;
  voucherType: string;
  collectionName: string;
  voucherId: string;
  voucherName: string;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}
