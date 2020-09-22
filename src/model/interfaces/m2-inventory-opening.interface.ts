import { Document } from 'mongoose';

export interface M2InventoryOpening extends Document {
  id: string;
  effDate: string;
  inventory: string;
  branch: string;
  batch: string;
  batchNo: string;
  qty: number;
  mrp: number;
  expMonth: number;
  expYear: number;
  pRate: number;
  sPrice: number;
  unit: {id: string, name: string, displayName: string};
  unitPrecision: number;
}
