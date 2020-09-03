import { Document } from 'mongoose';

export interface Branch extends Document {
  id: string;
  validateName: string;
  validateAliasName: string;
  name: string;
  aliasName: string;
  displayName: string;
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
    state: {id: string, name: string};
    pincode: string;
  };
  gstInfo: {
    gstNo: string;
    regType: {id: string, name: string};
    location: {id: string, name: string};
  };
  createdAt: Date;
  updatedAt: Date;
}
