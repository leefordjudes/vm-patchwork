import * as mongoose from 'mongoose';

export const tempInventoryBookSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    inventoryId: {
      type: String,
      required: true,
    },
    inventoryName: {
      type: String,
      required: true,
    },
    contactId: String,
    contactName: String,
    branchId: {
      type: String,
      required: true,
    },
    branchName: {
      type: String,
      required: true,
    },
    warehouseId: String,
    warehouseName: String,
    inward: {
      type: Number,
      required: true,
    },
    outward: {
      type: Number,
      required: true,
    },
    narration: {
      type: String,
    },
    saleValue: {
      type: Number,
      default: 0,
    },
    assetValue: {
      type: Number,
      default: 0,
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
