import { Document } from 'mongoose';

export interface VendorPending extends Document {
  vendor: string;
  vendorName: string;
  branch: string;
  branchName: string;
  effDate: Date;
  refNo: string;
  opening: number;
  adjusted: number;
  closing: number;
  voucherType: string;
  voucherNo: string;
}
