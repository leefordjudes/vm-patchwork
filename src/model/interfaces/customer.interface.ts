import { Document } from 'mongoose';

export interface Customer extends Document {
  validateName: string;
  validateAliasName: string;
  name: string;
  aliasName: string;
  displayName: string;
  contactInfo: {
    mobile: string;
    alternateMobile: string;
    telephone: string;
    email: string;
    contactPerson: string;
  };
  addressInfo: {
    address: string;
    city: string;
    state: { name: string; defaultName: string };
    country: { name: string; defaultName: string };
    pincode: string;
    contactPerson: string;
  };
  gstInfo: {
    gstNo: string;
    regType: { name: string; defaultName: string };
    location: { name: string; defaultName: string };
  };
  otherInfo: {
    aadharNo: string;
    panNo: string;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
