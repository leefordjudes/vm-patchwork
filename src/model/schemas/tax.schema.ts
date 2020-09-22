import * as mongoose from 'mongoose';

export const taxSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 50,
    },
    validateName: {
      type: String,
      trim: true,
      minlength: 1,
    },
    displayName: {
      type: String,
      maxlength: 50,
    },
    defaultName: {
      type: String,
    },
    hide: {
      type: Boolean,
      default: false,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    taxType: {
      type: {
        name: { type: String },
        defaultName: { type: String },
      },
      required: true,
    },
    gstRatio: {
      cgst: { type: Number, max: 100, min: 0 },
      igst: { type: Number, max: 100, min: 0 },
      sgst: { type: Number, max: 100, min: 0 },
      cess: { type: Number, max: 100, min: 0 },
    },
    createdBy: {
      type: String,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: String,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);
