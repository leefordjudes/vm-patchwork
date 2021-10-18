import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

import * as _ from 'lodash';

import { URI } from './config';
import { Types } from 'mongoose';

@Injectable()
export class DataModifyService {
  async trns() {
    const connection = await new MongoClient(URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }).connect();
    if (!connection.isConnected) {
      return 'Connection failed';
    }

    const dbs = ['velavanstationery', 'velavanhm', 'ttgold', 'ttgoldpalace', 'auditplustech', 'ramasamy', 'velavanmedical', 'velavanmed', 'rkmedicals', 'testorg', 'omshakthi'];
    const collections = ['purchases', 'sales', 'stock_adjustments', 'stock_transfers', 'inventory_openings'];
    for (const db of dbs) {
      console.log(`${db} organization STARTED...`);
      for (const collection of collections) {
        let items = 'invItems';
        if (collection === 'inventory_openings') {
          items = 'items';
        }
        const count = await connection.db(db).collection(collection).countDocuments();
        console.log(`Total ${collection} count was ${count}`);
        if (count > 0) {
          const limit = 100000;
          for (let skip = 0; skip <= count; skip = skip + limit) {
            console.log({ organization: db, collection });
            const bulkOperation = connection.db(db).collection(collection).initializeOrderedBulkOp();
            const sttt = new Date().getTime();
            const vouchers: any = await connection.db(db).collection(collection).find({},
              {
                projection: { invTrns: 1, [items]: 1, acTrns: 1 },
                sort: { _id: 1 }, skip, limit,
              }
            ).toArray();
            console.log(`get ${skip} to ${limit + skip} voucher duration ${(new Date().getTime() - sttt) / 1000}-sec`);
            for (const voucher of vouchers) {
              const invTrns = voucher.invTrns.map((elm) => {
                let item;
                if (collection === 'inventory_openings') {
                  item = voucher[items].find((item) => {
                    if (elm.batchNo && (item.batchNo === elm.batchNo)) {
                      return item;
                    } else if (elm.batch && item.batch && (item.batch.toString() === elm.batch.toString())) {
                      return item;
                    }
                  });
                } else {
                  item = voucher[items].find((item) => {
                    if ((elm.inventory.toString() === item.inventory.toString()) && elm.batchNo && (item.batchNo === elm.batchNo)) {
                      return item;
                    } else if ((elm.inventory.toString() === item.inventory.toString()) && elm.batch && item.batch && (item.batch.toString() === elm.batch.toString())) {
                      return item;
                    }
                  });
                }
                const obj = {
                  _id: new Types.ObjectId(),
                  inventory: elm.inventory,
                  inward: elm.inward,
                  outward: elm.outward,
                  taxableAmount: elm.taxableAmount,
                  assetAmount: elm.assetAmount,
                  cgstAmount: elm.cgstAmount,
                  sgstAmount: elm.sgstAmount,
                  igstAmount: elm.igstAmount,
                  profitAmount: elm.profitAmount,
                  barcode: elm.barcode,
                  batch: elm._id ? elm._id : elm.batch,
                  batchNo: elm.batchNo,
                  mrp: elm.mrp,
                  rate: elm.rate,
                  pRate: elm.pRate,
                  sRate: elm.sRate,
                  nlc: elm.nlc,
                  expiry: elm.expiry,
                  unitConv: elm.unitConv,
                  pRateTaxInc: elm.pRateTaxInc,
                  sRateTaxInc: elm.sRateTaxInc,

                  tax: item.tax,
                  qty: elm.outward > 0 && collection === 'stock_adjustments' ? item.qty * -1 : item.qty,
                  unitPrecision: item.unitPrecision,
                  freeQty: item.freeQty,
                  disc: item.disc,
                  sInc: item.sInc,
                  cost: item.cost,
                };
                return (_.pickBy(obj, v => v !== null && v !== undefined && v !== ''));
              });
              const acTrns = voucher.acTrns?.map((acTrn) => {
                const acTrnObj = {
                  _id: new Types.ObjectId(),
                  pending: acTrn._id,
                  account: acTrn.account,
                  accountType: acTrn.accountType,
                  adjs: acTrn.adjs?.length > 0 ? acTrn.adjs : null,
                  credit: acTrn.credit,
                  debit: acTrn.debit,
                };
                return (_.pickBy(acTrnObj, v => v !== null && v !== undefined && v !== ''));
              });
              if (acTrns && acTrns.length > 0) {
                bulkOperation.find({ _id: voucher._id }).updateOne({ $set: { invTrns, acTrns }, $unset: { [items]: 1 } });
              } else {
                bulkOperation.find({ _id: voucher._id }).updateOne({ $set: { invTrns }, $unset: { [items]: 1 } });
              }
            }
            await bulkOperation.execute();
            vouchers.length = 0;
            console.log(`${skip + limit}...completed, duration ${(new Date().getTime() - sttt) / 1000}-sec`);
          }
        } else {
          console.log(`${collection} not found`);
        }
        console.log(`${collection} END****`);
      }
      console.log(`gst-voucher started...`);
      const gstVouchers: any = await connection.db(db).collection('gst_vouchers')
        .find({}, { projection: { trns: 1, acTrns: 1 } }).toArray();
      const bulkGstOperation = connection.db(db).collection('gst_vouchers').initializeOrderedBulkOp();
      for (const gstVoucher of gstVouchers) {
        const acTrns = gstVoucher.acTrns.map((elm) => {
          const trnItem = gstVoucher.trns.find((trn) => trn.account.toString() === elm.account.toString());
          const acTrnObj = {
            _id: new Types.ObjectId(),
            pending: elm._id,
            account: elm.account,
            accountType: elm.accountType,
            adjs: elm.adjs?.length > 0 ? elm.adjs : null,
            rate: trnItem.rate,
            tax: trnItem.tax,
            credit: elm.credit,
            debit: elm.debit,
          };
          return (_.pickBy(acTrnObj, v => v !== null && v !== undefined && v !== ''));
        });
        bulkGstOperation.find({ _id: gstVoucher._id }).updateOne({ $set: { acTrns }, $unset: { trns: 1 } });
      }
      if (gstVouchers.length > 0) {
        await bulkGstOperation.execute();
      }
      gstVouchers.length = 0;
      console.log(`gst-voucher end...`);
      const accCollections = ['vouchers', 'account_openings'];
      for (const accCollection of accCollections) {
        console.log(`${accCollection} started...`);
        const accVouchers: any = await connection.db(db).collection(accCollection)
          .find({}, { projection: { acTrns: 1 } }).toArray();
        const bulkAccOperation = connection.db(db).collection(accCollection).initializeOrderedBulkOp();
        for (const accVoucher of accVouchers) {
          const acTrns = accVoucher.acTrns.map((elm) => {
            const acTrnObj = {
              _id: new Types.ObjectId(),
              pending: elm._id,
              account: elm.account,
              accountType: elm.accountType,
              adjs: elm.adjs?.length > 0 ? elm.adjs : null,
              chequeDetail: elm.chequeDetail ? elm.chequeDetail : null,
              effDate: elm.effDate,
              refNo: elm.refNo,
              credit: elm.credit,
              debit: elm.debit,
            };
            return (_.pickBy(acTrnObj, v => v !== null && v !== undefined && v !== ''));
          });
          bulkAccOperation.find({ _id: accVoucher._id }).updateOne({ $set: { acTrns }, $unset: { trns: 1, items: 1 } });
        }
        if (accVouchers.length > 0) {
          await bulkAccOperation.execute();
        }
        console.log(`${accCollection} end...`);
        accVouchers.length = 0;
      }

      console.log(`${db} organization END...`);
      await connection.db(db).collection('inventory_transactions').updateMany({ voucherName: 'Stock Adjustment', __v: { $exists: true } }, { $unset: { pRate: 1 } });
    }
    console.log('All organizations inventory vouchers update sucessfully...');
    return 'All organizations inventory vouchers update sucessfully...';
  }
}
