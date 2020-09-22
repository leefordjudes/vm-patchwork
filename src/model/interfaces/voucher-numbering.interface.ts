import { Document } from 'mongoose';

export interface VoucherNumbering extends Document {
  id: string;
  voucherType: { name: string; defaultName: string };
  branch: { id: string; name: string };
  fYear: string;
  prefix: string;
  sequence: number;
  suffix: string;
  createdAt: Date;
  updatedAt: Date;
}
