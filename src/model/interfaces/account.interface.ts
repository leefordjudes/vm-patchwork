import { Document } from 'mongoose';

export interface Account extends Document {
  id: string;
  validateName: string;
  validateAliasName: string;
  type: { name: string; defaultName: string };
  name: string;
  defaultName: string;
  displayName: string;
  aliasName: string;
  parentAccount: string;
  opening: [{ branch: string; amount: number }];
  parentIds: string[];
  hide: boolean;
  description: string;
  tdsApplicable: boolean;
  tdsRatio: {
    individual: number;
    business: number;
  };
  tdsApplicableType: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
