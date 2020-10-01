import * as mongoose from 'mongoose';

export const printTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 50,
    },
    code: {
      type: String,
      required: true,
      maxlength: 50,
    },
    config: {
      type: String,
      required: true,
    },
    context: {
      type: {
        pageSize: String,
      },
      required: true,
    },
    category: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true },
);
