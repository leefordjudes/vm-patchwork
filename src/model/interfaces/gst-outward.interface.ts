import { Document } from 'mongoose';

export interface GSTOutward extends Document {
  voucherNo: string;
  voucherId: string;
  voucherDate: Date;
  voucherType: string;
  invoiceType: string;
  contactId: string;
  contactName: string;
  contactGstNo: string;
  placeOfSupply: string;
  placeOfSupplyCode: string;
  branchId: string;
  branchName: string;
  branchGstNo: string;
  branchLocationCode: string;
  saleType: string;
  totalAmount: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  cessAmount: number;
  rcm: boolean;
  lut: boolean;
  gstSummary: any;
  refVoucherNo: string;
}
