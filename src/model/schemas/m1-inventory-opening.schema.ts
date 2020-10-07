import * as mongoose from 'mongoose';

export const m1InventoryOpeningSchema = new mongoose.Schema({
  inventory: {
    type: String,
  },
  branch: {
    type: String,
  },
  batch: String,
  batchNo: {
    type: String,
    maxlength: 20,
  },
  qty: Number,
  unitPrecision: Number,
  mrp: Number,
  pRate: Number,
  sRate: Number,
  pRateTaxInc: {
    type: Boolean,
    default: false,
  },
  sRateTaxInc: {
    type: Boolean,
    default: false,
  },
  effDate: Date,
  unit: {
    type: {
      id: String,
      name: String,
    },
  },
});
