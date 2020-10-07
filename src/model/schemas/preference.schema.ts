import { Schema } from 'mongoose';

export const preferenceSchema = new Schema({
  code: {
    type: String,
    required: true,
    index: true,
  },
  branch: {
    type: String,
    required: true,
  },
  config: {
    type: String,
    required: true,
  }
});
