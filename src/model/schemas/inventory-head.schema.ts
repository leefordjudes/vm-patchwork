import * as mongoose from 'mongoose';

export const inventoryHeadSchema = new mongoose.Schema(
  {
    name: String,
    createdBy: String,
    updatedBy: String,
  },
  { timestamps: true },
);
