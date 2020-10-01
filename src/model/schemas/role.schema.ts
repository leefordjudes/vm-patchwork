import * as mongoose from 'mongoose';

export const roleSchema = new mongoose.Schema(
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
      index: true,
    },
    displayName: {
      type: String,
      maxlength: 50,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
    },
    privileges: {
      type: Object,
    },
    dateRestrictions: {
      type: [
        {
          code: {
            type: String,
            required: true,
          },
          category: {
            type: String,
            required: true,
          },
          value: {
            type: Boolean,
            default: false,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);
