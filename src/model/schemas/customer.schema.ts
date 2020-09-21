import * as mongoose from 'mongoose';

export const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 150,
    },
    aliasName: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    validateName: {
      type: String,
      trim: true,
      minlength: 1,
    },
    validateAliasName: {
      type: String,
      trim: true,
    },
    displayName: {
      type: String,
      maxlength: 150,
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
      contactPerson: {
        type: String,
        trim: true,
      },
    },
    addressInfo: {
      address: {
        type: String,
        maxlength: 300,
      },
      city: {
        type: String,
        maxlength: 50,
      },
      state: {
        type: {
          name: String,
          defaultName: String,
        },
      },
      country: {
        type: {
          name: String,
          defaultName: String,
        },
      },
      pincode: {
        type: String,
        maxlength: 10,
      },
      contactPerson: {
        type: String,
        trim: true,
      },
    },
    gstInfo: {
      type: {
        gstTreatment: {
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
        placeOfSupply: {
          type: {
            name: String,
            defaultName: String,
          },
        },
      },
    },
    otherInfo: {
      aadharNo: {
        type: String,
        maxlength: 12,
        minlength: 12,
      },
      panNo: {
        type: String,
        maxlength: 10,
        minlength: 10,
      },
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
