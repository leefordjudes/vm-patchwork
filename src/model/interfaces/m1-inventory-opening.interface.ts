import { Document } from 'mongoose';

export interface M1InventoryOpening extends Document {
  id: string;
  effDate: string;
  inventory: string;
  branch: string;
  batch: string;
  batchNo: string;
  qty: number;
  mrp: number;
  pRate: number;
  sPrice: number;
  unit: {id: string, name: string};
  unitPrecision: number;
}
