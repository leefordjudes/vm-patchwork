import { Document } from 'mongoose';

export interface Branch extends Document {
  id: string;
  validateName: string;
  validateAliasName: string;
  name: string;
  aliasName: string;
  displayName: string;
  licenseNo: string;
  users: [string];
  desktopClients: string[];
  contactInfo: {
    mobile: string;
    alternateMobile: string;
    telephone: string;
    email: string;
  };
  addressInfo: {
    address: string;
    city: string;
    state: { name: string; defaultName: string };
    pincode: string;
  };
  gstInfo: {
    gstNo: string;
    regType: { name: string; defaultName: string };
    location: { name: string; defaultName: string };
  };
  otherInfo: {
    licenseNo: string;
  };
  inventoryHead: string;
  features: {
    pharamacyRetail: true;
  };
  createdAt: Date;
  updatedAt: Date;
}
