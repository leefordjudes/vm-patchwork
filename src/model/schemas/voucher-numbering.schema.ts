import * as mongoose from 'mongoose';

export const voucherNumberingSchema = new mongoose.Schema(
  {
    voucherType: {
      type: {
        name: { type: String },
        defaultName: { type: String },
      },
      trim: true,
      required: true,
      maxlength: 50,
    },
    branch: {
      type: {
        id: String,
        name: String,
      },
      required: true,
    },
    fYear: {
      type: String,
      required: true,
    },
    prefix: {
      type: String,
      maxlength: 50,
    },
    sequence: {
      type: Number,
      maxlength: 50,
    },
    suffix: {
      type: String,
      maxlength: 50,
    },
  },
  { timestamps: true },
);
