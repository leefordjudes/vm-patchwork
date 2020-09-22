import * as mongoose from 'mongoose';

export const gstTransactionSchema = new mongoose.Schema({
  branchRegType: {
    type: String,
    required: true,
  },
  branchName: {
    type: String,
    required: true,
  },
  branchId: {
    type: String,
    required: true,
  },
  branchCountry: {
    type: String,
  },
  branchState: {
    type: String,
    required: true,
  },
  branchPcode: {
    type: String,
  },
  branchScode: Number,
  branchGstNo: {
    type: String,
    maxlength: 15,
    minlength: 15,
  },
  voucherId: {
    type: String,
    required: true,
    maxlength: 50,
  },
  voucherNo: {
    type: String,
    required: true,
    maxlength: 50,
  },
  date: {
    type: Date,
    required: true,
  },
  refNo: {
    type: String,
    maxlength: 50,
  },
  voucherType: {
    type: String,
    required: true,
    maxlength: 50,
  },
  assessableValue: {
    type: Number,
    // set: x => roundValue(x, 2),
    required: true,
  },
  assessableMmYyyy: {
    type: Number,
  },
  inventoryId: {
    type: String,
  },
  inventoryName: {
    type: String,
  },
  inventoryQty: {
    type: Number,
  },
  hsnCode: {
    type: String,
  },
  gstTreatment: {
    type: String,
  },
  gstId: {
    type: String,
  },
  gstName: {
    type: String,
  },
  contactType: {
    type: String,
    required: true,
  },
  contactId: {
    type: String,
  },
  contactName: {
    type: String,
  },
  contactCountry: {
    type: String,
  },
  contactState: {
    type: String,
  },
  contactPcode: {
    type: String,
  },
  contactScode: Number,
  contactGstNo: {
    type: String,
    maxlength: 15,
    minlength: 15,
  },
  ewaybillNo: {
    type: String,
  },
  ewaybillDate: {
    type: Date,
  },
  natureOfTrn: {
    type: String,
    required: true,
  },
  cgstAmount: {
    type: Number,
    default: 0,
  },
  sgstAmount: {
    type: Number,
    default: 0,
  },
  igstAmount: {
    type: Number,
    default: 0,
  },
  cessAmount: {
    type: Number,
    default: 0,
  },
  rcmAmount: {
    type: Number,
    // set: x => roundValue(x, 2),
    default: 0,
  },
  lut: {
    type: Boolean,
  },
  billEntryNo: {
    type: String,
  },
});
