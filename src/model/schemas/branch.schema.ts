import * as mongoose from 'mongoose';

export const branchSchema = new mongoose.Schema(
  {
    validateName: {
      type: String,
      trim: true,
      minlength: 1,
      index: true,
    },
    validateAliasName: {
      type: String,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 50,
    },
    aliasName: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    displayName: {
      type: String,
      maxlength: 50,
    },
    contactInfo: {
      mobile: {
        type: String,
        maxlength: 15,
      },
      alternateMobile: {
        type: String,
        maxlength: 15,
      },
      telephone: {
        type: String,
        maxlength: 15,
      },
      email: {
        type: String,
        maxlength: 50,
      },
    },
    addressInfo: {
      address: {
        type: String,
        maxlength: 75,
      },
      city: {
        type: String,
        maxlength: 20,
      },
      state: {
        type: {
          id: String,
          name: String,
        },
      },
      pincode: {
        type: String,
        maxlength: 10,
      },
    },
    gstInfo: {
      type: {
        regType: {
          type: {
            id: String,
            name: String,
          },
        },
        gstNo: {
          type: String,
          maxlength: 15,
          minlength: 15,
        },
        location: {
          type: {
            id: String,
            name: String,
          },
        },
      },
    },
    otherInfo: {
      licenseNo: String,
    },
    features: {
      pharmacyRetail: Boolean,
    },
    inventoryHead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryHead',
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    desktopClients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DesktopClient',
      },
    ],
  },
  { timestamps: true },
);
