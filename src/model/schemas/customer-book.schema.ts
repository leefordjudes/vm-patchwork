import * as mongoose from 'mongoose';

export const customerBookSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    accountId: {
      type: String,
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    altAccountId: {
      type: String,
      required: true,
    },
    altAccountName: {
      type: String,
      required: true,
    },
    branchId: {
      type: String,
      required: true,
    },
    branchName: {
      type: String,
      required: true,
    },
    credit: {
      type: Number,
      // set: (x) => roundValue(x, 2),
      required: true,
    },
    debit: {
      type: Number,
      // set: (x) => roundValue(x, 2),
      required: true,
    },
    narration: {
      type: String,
    },
    voucherNo: String,
    refNo: {
      type: String,
      maxlength: 50,
    },
    voucherType: {
      type: String,
      maxlength: 50,
      required: true,
    },
    collectionName: {
      type: String,
      required: true,
    },
    voucherId: String,
    voucherName: {
      type: String,
      maxlength: 200,
      required: true,
    },
    createdBy: {
      type: String,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: String,
      ref: 'User',
    },
  },
  { timestamps: true },
);
