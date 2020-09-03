import * as mongoose from 'mongoose';

export const userSchema = new mongoose.Schema({
  username: {
    type: String,
    maxlength: 50,
    trim: true,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    minlength: 5,
    maxlength: 1024,
  },
  isAdmin: {
    type: Boolean,
    default: false,
    required: false,
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true,
  },
  settings: {
    appearance: {
      theme: {
        type: String,
        default: 'Light',
      },
    },
  },
  allowRemoteAccess: {
    type: Boolean,
    default: false,
    required: true,
  },
  displayName: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    maxlength: 50,
  },
  mobile: {
    type: String,
    maxlength: 20,
  },
  address: {
    type: String,
    maxlength: 75,
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {timestamps: true});
