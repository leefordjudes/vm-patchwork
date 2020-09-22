import { Document } from 'mongoose';

export interface Warehouse extends Document {
  id: string;
  validateName: string;
  validateAliasName: string;
  name: string;
  aliasName: string;
  displayName: string;
  contactInfo: {
    mobile: string;
    telephone: string;
    email: string;
  };
  addressInfo: {
    address: string;
    city: string;
    state: { name: string; defaultName: string };
    pincode: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
