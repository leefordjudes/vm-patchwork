import { Document } from 'mongoose';

export interface GSTFiling extends Document {
    voucherNo: string;
    voucherDate: string;
    party: string;
    amount: number;
    voucherType: string;
    reverseCharge: string;
    gstin: string;
    pos: string;
    discount: number;
    orderNo: string;
    orderDate: string;
    items: [
      {
        itemType: string;
        hsnsac: string;
        qty: number;
        taxableValue: number;
      }
    ];
}
