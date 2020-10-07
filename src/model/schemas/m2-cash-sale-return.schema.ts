import { Schema } from 'mongoose';

export const m2CashSaleReturnSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    refNo: {
      type: String,
      maxlength: 50,
    },
    customer: {
      type: {
        id: { type: String },
        name: { type: String },
        displayName: { type: String },
      },
    },
    branch: {
      type: {
        id: { type: String },
        name: { type: String },
        displayName: { type: String },
      },
      required: true,
    },
    warehouse: {
      type: {
        id: { type: String },
        name: { type: String },
        displayName: { type: String },
      },
      required: false,
    },
    taxInclusiveRate: {
      type: Boolean,
      default: false,
    },
    gstInfo: {
      destination: {
        type: {
          regType: {
            type: {
              defaultName: String,
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
              name: String,
              defaultName: String,
            },
          },
        },
      },
      source: {
        type: {
          regType: {
            type: {
              defaultName: String,
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
              name: String,
              defaultName: String,
            },
          },
        },
      },
    },
    cashRegister: {
      type: {
        id: { type: String },
        name: { type: String },
        displayName: { type: String },
      },
    },
    description: {
      type: String,
      maxlength: 200,
    },
    customerPending: {
      type: String,
    },
    voucherNo: {
      type: String,
      required: true,
      maxlength: 50,
    },
    amount: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    invTrns: [
      {
        inventory: {
          type: {
            id: String,
            name: String,
            displayName: String,
            bwd: Boolean,
          },
          required: true,
        },
        expYear: Number,
        expMonth: Number,
        batch: String,
        batchNo: String,
        hsnCode: String,
        serialNo: Number,
        unit: {
          id: String,
          name: String,
          displayName: String,
          conversion: Number,
        },
        qty: Number,
        rate: Number,
        sRateTaxInc: Boolean,
        mrp: Number,
        discount: {
          type: Number,
          default: 0,
        },
        unitPrecision: Number,
        tax: {
          type: {
            id: String,
            name: String,
            displayName: String,
            gstRatio: {
              cgst: Number,
              sgst: Number,
              igst: Number,
              cess: Number,
            },
          },
        },
        natureOfTrn: String,
        cgstAmount: {
          type: Number,
          default: 0,
        },
        sgstAmount: {
          type: Number,
          default: 0,
        },
        igstAmount: {
          type: Number,
          default: 0,
        },
        cessAmount: {
          type: Number,
          default: 0,
        },
        taxableAmount: {
          type: Number,
          default: 0,
        },
        assetAmount: {
          type: Number,
          default: 0,
        },
      },
    ],
    acTrns: [
      {
        account: {
          type: {
            id: String,
            name: String,
            displayName: String,
            defaultName: String,
          },
          required: true,
        },
        credit: {
          type: Number,
        },
        debit: {
          type: Number,
        },
      },
    ],
    createdBy: {
      type: String,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: String,
      ref: 'User',
    },
    approvedBy: {
      type: String,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);
