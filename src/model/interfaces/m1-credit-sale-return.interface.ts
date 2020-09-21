import { Document } from 'mongoose';

export interface M1CreditSaleReturn extends Document {
  date: Date;
  refNo: string;
  customer: { id: string; name: string; displayName: string };
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
  description: string;
  customerPending: string;
  voucherNo: string;
  amount: number;
  discount: number;
  taxInclusiveRate: boolean;
  invTrns: Array<{
    id: string;
    inventory: { id: string; name: string; displayName: string; bwd: boolean; hsnCode: string };
    batch: string;
    batchNo: string;
    hsnCode: string;
    serialNo: number;
    unit: { id: string; name: string; displayName: string; conversion: number };
    qty: number;
    rate: number;
    sRateTaxInc: boolean;
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
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    cessAmount: number;
    taxableAmount: number;
    assetAmount: number;
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
