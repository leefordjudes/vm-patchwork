import * as mongoose from 'mongoose';
import * as _ from 'lodash';

const schema = new mongoose.Schema({
  validateName: {
    type: String,
    trim: true,
    minlength: 1,
  },
  validateAliasName: {
    type: String,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
    maxlength: 150,
    required: true,
  },
  displayName: {
    type: String,
    maxlength: 150,
  },
  aliasName: {
    type: String,
    trim: true,
    maxlength: 150,
  },
  barcode: String,
  precision: {
    type: Number,
    min: 0,
    max: 4,
    default: 0,
  },
  bwd: {
    type: Boolean,
    default: true,
  },
  allowNegativeStock: {
    type: Boolean,
    default: false,
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
  },
  manufacturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manufacturer',
  },
  preferredVendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
  },
  tax: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tax',
  },
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
  },
  hsnCode: {
    type: String,
    maxlength: 8,
  },
  unitConversion: [{
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
    },
    conversion: { type: Number },
    preferredForPurchase: {
      type: Boolean,
      default: false,
    },
    preferredForSale: {
      type: Boolean,
      default: false,
    },
    primary: {
      type: Boolean,
      default: false,
    },
  }],
  racks: [{
    branch: {
      type: String,
      required: true,
    },
    rack1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rack',
    },
    rack2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rack',
    },
    rack3: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rack',
    },
    rack4: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rack',
    },
  }],
  sDisc: [{
      ratio: Number,
      branch: {
        type: String,
        required: true,
      },
  }],
  salts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PharmaSalt',
  }],
  scheduleH: {type: Boolean, default: false, required: false },
  scheduleH1: {type: Boolean, default: false, required: false },
  narcotics: {type: Boolean, default: false, required: false },
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
}, { timestamps: true });

schema.virtual('allUnitConversion').get(function() {
  this.unitConversion.push({unit: this.unit, conversion: 1, primary: true});
  return this.unitConversion;
});

export const m2InventorySchema = schema;
