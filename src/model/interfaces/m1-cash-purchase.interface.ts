import { Document } from 'mongoose';

export interface M1CashPurchase extends Document {
  date: Date;
  refNo: string;
  billDate: Date;
  vendor: { id: string; name: string; displayName: string };
  branch: { id: string; name: string; displayName: string };
  warehouse: { id: string; name: string; displayName: string };
  gstInfo: {
    source: {
      gstNo: string;
      regType: { name: string; defaultName: string };
      location: { name: string; defaultName: string };
    };
    destination: {
      gstNo: string;
      regType: { name: string; defaultName: string };
      location: { name: string; defaultName: string };
    };
  };
  cashRegister: { id: string; name: string; displayName: string };
  description: string;
  voucherNo: string;
  amount: number;
  discount: number;
  rcm: boolean;
  taxInclusiveRate: boolean;
  invTrns: Array<{
    id: string;
    inventory: { id: string; name: string; displayName: string; bwd: boolean; hsnCode: string };
    branch: string;
    batch: string;
    batchNo: string;
    hsnCode: string;
    serialNo: number;
    unit: { id: string; name: string; displayName: string; conversion: number };
    qty: number;
    freeQty: number;
    rate: number;
    sRate: number;
    mrp: number;
    discount: number;
    unitPrecision: number;
    tax: {
      id: string;
      name: string;
      displayName: string;
      gstRatio: {
        cgst: number;
        sgst: number;
        igst: number;
        cess: number;
      };
    };
    natureOfTrn: string;
    assetAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    cessAmount: number;
    taxableAmount: number;
  }>;
  acTrns: Array<{
    account: { id: string; name: string; displayName: string; defaultName: string };
    credit: number;
    debit: number;
  }>;
  createdBy: string;
  updatedBy: string;
  approvedBy: string;
  createdAt: Date;
  updatedAt: Date;
  approvedAt: Date;
}
