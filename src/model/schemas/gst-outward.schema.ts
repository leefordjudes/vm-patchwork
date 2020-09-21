import * as mongoose from 'mongoose';

export const gstOutwardSchema = new mongoose.Schema({
  voucherNo: {
    type: String,
    required: true,
  },
  voucherId: {
    type: String,
    required: true,
  },
  voucherDate: {
    type: Date,
    required: true,
  },
  voucherType: String,
  invoiceType: String,
  contactId: String,
  contactName: String,
  contactGstNo: String,
  placeOfSupply: String,
  placeOfSupplyCode: String,
  branchId: String,
  branchName: String,
  branchGstNo: String,
  branchLocationCode: {
    type: String,
    required: true,
  },
  saleType: {
    type: String,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  taxableAmount: {
    type: Number,
    required: true,
  },
  cgstAmount: {
    type: Number,
    required: true,
  },
  sgstAmount: {
    type: Number,
    required: true,
  },
  igstAmount: {
    type: Number,
    required: true,
  },
  cessAmount: {
    type: Number,
    required: true,
  },
  rcm: {
    type: Boolean,
    required: true,
  },
  lut: {
    type: Boolean,
    required: true,
  },
  gstSummary: {
    type: Array,
  },
  refVoucherNo: String,
});
