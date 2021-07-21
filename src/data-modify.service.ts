import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { Types } from 'mongoose';

import * as _ from 'lodash';

import { URI } from './config';
import { GST_TAXES } from './fixtures/gst-tax';
import { STATE } from './fixtures/state/state';
import { round } from './utils/utils';

@Injectable()
export class DataModifyService {

  async acv() {
    const connection = await new MongoClient(URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }).connect();
    if (!connection.isConnected) {
      return 'Connection failed';
    }
    const dbs = ['velavanstationery', 'velavanhm', 'ttgold', 'ttgoldpalace', 'auditplustech', 'ramasamy', 'velavanmedical', 'velavanmed'];
    for (const db of dbs) {
      const vendorAccounts: any = await connection.db(db).collection('accounts')
        .find({ party: { $exists: true }, accountType: 'TRADE_PAYABLE' }, { projection: { party: 1 } }).toArray();
      const vendorArr = [];
      for (const ven of vendorAccounts) {
        const obj = {
          updateOne: {
            filter: { _id: ven.party },
            update: {
              $set: { creditAccount: ven._id },
            },
          },
        };
        vendorArr.push(obj);
      }
      if (vendorArr.length > 0) {
        await connection.db(db).collection('vendors').bulkWrite(vendorArr);
        vendorArr.length = 0;
      }

      const customerAccounts: any = await connection.db(db).collection('accounts')
        .find({ party: { $exists: true }, accountType: 'TRADE_RECEIVABLE' }, { projection: { party: 1 } }).toArray();
      const customerArr = [];
      for (const cus of customerAccounts) {
        const obj = {
          updateOne: {
            filter: { _id: cus.party },
            update: {
              $set: { creditAccount: cus._id },
            },
          },
        };
        customerArr.push(obj);
      }
      if (customerArr.length > 0) {
        await connection.db(db).collection('customers').bulkWrite(customerArr);
        customerArr.length = 0;
      }
      await connection.db(db).collection('accounts').updateMany({ party: { $exists: true } }, { $unset: { party: 1 } });
      console.log(`${db} org finished`);
    }
    console.log(`All organization finished`);
    return true;
  }
  // async gst() {
  //   const connection = await new MongoClient(URI, {
  //     useUnifiedTopology: true,
  //     useNewUrlParser: true,
  //   }).connect();
  //   if (!connection.isConnected) {
  //     return 'Connection failed';
  //   }

  //   const dbs = ['velavanmedical'];
  //   for (const db of dbs) {
  //     const arr = [
  //       {
  //         updateMany: {
  //           filter: { voucherType: 'SALE', 'partyGst.regType': 'REGULAR', 'partyGst.location': '33' },
  //           update: {
  //             $set: { gstFileInfo: { invoiceType: 'R', supplyType: 'INTRA', particular: 'B2B' } },
  //           },
  //         },
  //       },
  //       {
  //         updateMany: {
  //           filter: { voucherType: 'SALE', 'partyGst.regType': 'REGULAR', 'partyGst.location': { $ne: '33' } },
  //           update: {
  //             $set: { gstFileInfo: { invoiceType: 'R', supplyType: 'INTER', particular: 'B2B' } },
  //           },
  //         },
  //       },
  //       {
  //         updateMany: {
  //           filter: { voucherType: 'SALE', 'partyGst.regType': 'SPECIAL_ECONOMIC_ZONE', lut: true },
  //           update: {
  //             $set: { gstFileInfo: { invoiceType: 'SEWOP', supplyType: 'INTER', particular: 'B2B' } },
  //           },
  //         },
  //       },
  //       {
  //         updateMany: {
  //           filter: { voucherType: 'SALE', 'partyGst.regType': 'SPECIAL_ECONOMIC_ZONE', lut: false },
  //           update: {
  //             $set: { gstFileInfo: { invoiceType: 'SEWP', supplyType: 'INTER', particular: 'B2B' } },
  //           },
  //         },
  //       },
  //       {
  //         updateMany: {
  //           filter: { voucherType: 'SALE', 'partyGst.regType': 'CONSUMER', 'partyGst.location': '33' },
  //           update: {
  //             $set: { gstFileInfo: { invoiceType: 'R', supplyType: 'INTRA', particular: 'B2C(S)' } },// askig invoiceType
  //           },
  //         },
  //       },
  //       {
  //         updateMany: {
  //           filter: { voucherType: 'SALE', 'partyGst.regType': 'CONSUMER', 'partyGst.location': { $ne: '33' }, amount: { $gt: 250000 } },
  //           update: {
  //             $set: { gstFileInfo: { invoiceType: 'R', supplyType: 'INTER', particular: 'B2C(L)' } },// askig invoiceType
  //           },
  //         },
  //       },
  //       {
  //         updateMany: {
  //           filter: { voucherType: 'SALE', 'partyGst.regType': 'CONSUMER', 'partyGst.location': { $ne: '33' }, amount: { $lte: 250000 } },
  //           update: {
  //             $set: { gstFileInfo: { invoiceType: 'R', supplyType: 'INTER', particular: 'B2C(S)' } },// askig invoiceType
  //           },
  //         },
  //       },
  //       {
  //         updateMany: {
  //           filter: { voucherType: 'SALE', partyGst: { $exists: false } },
  //           update: {
  //             $set: { gstFileInfo: { invoiceType: 'R', supplyType: 'INTRA', particular: 'B2C(S)' } },// askig invoiceType
  //           },
  //         },
  //       },
  //       {
  //         updateMany: {
  //           filter: { voucherType: 'SALE', 'partyGst.regType': 'OVERSEAS', lut: true },
  //           update: {
  //             $set: { gstFileInfo: { invoiceType: 'WOPAY', supplyType: 'INTER', particular: 'EXP' } },
  //           },
  //         },
  //       },
  //       {
  //         updateMany: {
  //           filter: { voucherType: 'SALE', 'partyGst.regType': 'OVERSEAS', lut: false },
  //           update: {
  //             $set: { gstFileInfo: { invoiceType: 'WPAY', supplyType: 'INTER', particular: 'EXP' } },
  //           },
  //         },
  //       },
  //       // {
  //       //   updateMany: {
  //       //     filter: { taxSummary: { $elemMatch: { tax: 'gst0' } } },
  //       //     update: {
  //       //       $set: { 'taxSummary.$.taxRatio': 0 },
  //       //     },
  //       //   },
  //       // },
  //       // {
  //       //   updateMany: {
  //       //     filter: { taxSummary: { $elemMatch: { tax: 'gst0p1' } } },
  //       //     update: {
  //       //       $set: { 'taxSummary.$.taxRatio': 0.1 },
  //       //     },
  //       //   },
  //       // },
  //       // {
  //       //   updateMany: {
  //       //     filter: { taxSummary: { $elemMatch: { tax: 'gst0p25' } } },
  //       //     update: {
  //       //       $set: { 'taxSummary.$.taxRatio': 0.25 },
  //       //     },
  //       //   },
  //       // },
  //       // {
  //       //   updateMany: {
  //       //     filter: { taxSummary: { $elemMatch: { tax: 'gst1' } } },
  //       //     update: {
  //       //       $set: { 'taxSummary.$.taxRatio': 1 },
  //       //     },
  //       //   },
  //       // },
  //       // {
  //       //   updateMany: {
  //       //     filter: { taxSummary: { $elemMatch: { tax: 'gst3' } } },
  //       //     update: {
  //       //       $set: { 'taxSummary.$.taxRatio': 3 },
  //       //     },
  //       //   },
  //       // },
  //       // {
  //       //   updateMany: {
  //       //     filter: { taxSummary: { $elemMatch: { tax: 'gst5' } } },
  //       //     update: {
  //       //       $set: { 'taxSummary.$.taxRatio': 5 },
  //       //     },
  //       //   },
  //       // },
  //       // {
  //       //   updateMany: {
  //       //     filter: { taxSummary: { $elemMatch: { tax: 'gst7p5' } } },
  //       //     update: {
  //       //       $set: { 'taxSummary.$.taxRatio': 7.5 },
  //       //     },
  //       //   },
  //       // },
  //       // {
  //       //   updateMany: {
  //       //     filter: { taxSummary: { $elemMatch: { tax: 'gst12' } } },
  //       //     update: {
  //       //       $set: { 'taxSummary.$.taxRatio': 12 },
  //       //     },
  //       //   },
  //       // },
  //       // {
  //       //   updateMany: {
  //       //     filter: { taxSummary: { $elemMatch: { tax: 'gst18' } } },
  //       //     update: {
  //       //       $set: { 'taxSummary.$.taxRatio': 18 },
  //       //     },
  //       //   },
  //       // },
  //       // {
  //       //   updateMany: {
  //       //     filter: { taxSummary: { $elemMatch: { tax: 'gst28' } } },
  //       //     update: {
  //       //       $set: { 'taxSummary.$.taxRatio': 28 },
  //       //     },
  //       //   },
  //       // },
  //       // {
  //       //   updateMany: {
  //       //     filter: { taxSummary: { $elemMatch: { tax: 'gstna' } } },
  //       //     update: {
  //       //       $set: { 'taxSummary.$.taxRatio': 0 },
  //       //     },
  //       //   },
  //       // },
  //       // {
  //       //   updateMany: {
  //       //     filter: { taxSummary: { $elemMatch: { tax: 'gstnr' } } },
  //       //     update: {
  //       //       $set: { 'taxSummary.$.taxRatio': 0 },
  //       //     },
  //       //   },
  //       // },
  //       // {
  //       //   updateMany: {
  //       //     filter: { taxSummary: { $elemMatch: { tax: 'gstex' } } },
  //       //     update: {
  //       //       $set: { 'taxSummary.$.taxRatio': 0 },
  //       //     },
  //       //   },
  //       // },
  //       // {
  //       //   updateMany: {
  //       //     filter: { taxSummary: { $elemMatch: { tax: 'gstngs' } } },
  //       //     update: {
  //       //       $set: { 'taxSummary.$.taxRatio': 0 },
  //       //     },
  //       //   },
  //       // },
  //     ];
  //     const sales = await connection.db(db).collection('sales').bulkWrite(arr);
  //     return { modifiedCount: sales.modifiedCount, matchedCount: sales.matchedCount };
  //   }
  // }

}