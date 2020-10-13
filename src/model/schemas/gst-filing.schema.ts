import * as mongoose from 'mongoose';

const item = new mongoose.Schema(
  {
    itemType: String,
    hsnsac: String,
    qty: Number,
    taxableValue: Number,
  }, { _id: false }
);

export const gstFilingSchema = new mongoose.Schema(
  {
    voucherNo: String,
    voucherDate: String,
    party: String,
    amount: Number,
    voucherType: String,
    reverseCharge: String,
    gstin: String,
    pos: String,
    discount: Number,
    orderNo: String,
    orderDate: String,
    items: [item]
  }, { versionKey: false }
);
