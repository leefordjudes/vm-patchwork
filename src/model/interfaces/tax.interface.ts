import { Document } from 'mongoose';

export interface Tax extends Document {
  id: string;
  validateName: string;
  name: string;
  taxType: { name: string; defaultName: string };
  displayName: string;
  defaultName: string;
  isDefault: boolean;
  hide: boolean;
  gstRatio: {
    cgst: number;
    igst: number;
    sgst: number;
    cess: number;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
