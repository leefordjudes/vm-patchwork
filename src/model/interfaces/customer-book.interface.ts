import { Document } from 'mongoose';

export interface CustomerBook extends Document {
  id: string;
  date: Date;
  accountId: string;
  accountName: string;
  altAccountId: string;
  altAccountName: string;
  branchId: string;
  branchName: string;
  credit: number;
  debit: number;
  narration: string;
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
