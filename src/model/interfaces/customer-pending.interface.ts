import { Document } from 'mongoose';

export interface CustomerPending extends Document {
  customer: string;
  customerName: string;
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
