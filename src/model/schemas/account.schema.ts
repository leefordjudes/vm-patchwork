import * as mongoose from 'mongoose';

export const accountSchema = new mongoose.Schema(
  {
    validateName: {
      type: String,
      trim: true,
      minlength: 1,
    },
    validateAliasName: {
      type: String,
      trim: true,
    },
    type: {
      type: {
        name: { type: String },
        defaultName: { type: String },
      },
      required: true,
      maxlength: 50,
    },
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 50,
    },
    defaultName: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    displayName: {
      type: String,
      maxlength: 50,
    },
    aliasName: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    parentAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
    },
    parentIds: [String],
    hide: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      maxlength: 200,
    },
    tdsApplicable: {
      type: Boolean,
    },
    tdsRatio: {
      type: {
        individual: {
          type: Number,
          max: 100,
          min: 0,
        },
        Business: {
          type: Number,
          max: 100,
          min: 0,
        },
      },
    },
    tdsApplicableType: {
      type: String,
      maxlength: 20,
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
