import { Schema } from 'mongoose';

export const stateSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  defaultName: {
    type: String,
    required: true,
    maxlength: 100,
  },
  code: {
    type: Number,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
}, { timestamps: true });
