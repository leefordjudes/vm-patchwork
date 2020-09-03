import { Document } from 'mongoose';

export interface M2Inventory extends Document {
  id: string;
  validateName: string;
  validateAliasName: string;
  name: string;
  displayName: string;
  bwd: boolean;
  allowNegativeStock: boolean;
  barcode: string;
  precision: number;
  aliasName: string;
  section: string;
  manufacturer: string;
  preferredVendor: string;
  tax: string;
  unit: string;
  hsnCode: string;
  unitConversion: [{
    unit: string,
    conversion: number,
    preferredForPurchase?: boolean,
    preferredForSale?: boolean,
    primary?: boolean,
  }];
  allUnitConversion: [{
    unit: string,
    conversion: number,
    preferredForPurchase?: boolean,
    preferredForSale?: boolean,
    primary: boolean,
  }];
  racks: [{
    branch: string;
    rack1: string;
    rack2: string;
    rack3: string;
    rack4: string;
  }];
  sDisc: [{ ratio: number, branch: string}];
  salts: string[];
  scheduleH: boolean;
  scheduleH1: boolean;
  narcotics: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}
