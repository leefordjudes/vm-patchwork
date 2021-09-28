import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

import * as _ from 'lodash';

import { URI } from './config';

@Injectable()
export class DataModifyService {
  async contact() {
    const connection = await new MongoClient(URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }).connect();
    if (!connection.isConnected) {
      return 'Connection failed';
    }

    const dbs = ['velavanstationery', 'velavanhm', 'ttgold', 'ttgoldpalace', 'auditplustech', 'ramasamy', 'velavanmedical', 'velavanmed', 'rkmedicals', 'testorg', 'omshakthi'];
    // const dbs = ['velavanmedical'];
    const collectionNames = ['purchases', 'sales', 'stock_adjustments', 'stock_transfers', 'inventory_openings'];
    for (const db of dbs) {
      console.log(`${db} STARTED...`);
      for (const coll of collectionNames) {
        console.log(`${coll} started...`);
        let invItems = 'invItems';
        let andArr = [
          { $eq: ['$$invTrn.inventory', '$$invItem.inventory'] },
          { $cond: ['$$invTrn.batchNo', { $eq: ['$$invTrn.batchNo', '$$invItem.batchNo'] }, { $eq: ['$$invTrn.batch', '$$invItem.batch'] }] },
        ];
        if (coll === 'inventory_openings') {
          invItems = 'items';
          andArr = [
            { $cond: ['$$invTrn.batchNo', { $eq: ['$$invTrn.batchNo', '$$invItem.batchNo'] }, { $eq: ['$$invTrn.batch', '$$invItem.batch'] }] },
          ];
        }
        const pipeLine = [
          {
            $addFields: {
              invTrns: {
                $map: {
                  input: '$invTrns',
                  as: 'invTrn',
                  in: {
                    _id: '$$invTrn._id',
                    inventory: '$$invTrn.inventory',
                    inward: '$$invTrn.inward',
                    outward: '$$invTrn.outward',
                    taxableAmount: '$$invTrn.taxableAmount',
                    assetAmount: '$$invTrn.assetAmount',
                    cgstAmount: '$$invTrn.cgstAmount',
                    sgstAmount: '$$invTrn.sgstAmount',
                    igstAmount: '$$invTrn.igstAmount',
                    profitAmount: '$$invTrn.profitAmount',
                    barcode: '$$invTrn.barcode',
                    batch: '$$invTrn.batch',
                    batchNo: '$$invTrn.batchNo',
                    mrp: '$$invTrn.mrp',
                    rate: '$$invTrn.rate',
                    pRate: '$$invTrn.pRate',
                    sRate: '$$invTrn.sRate',
                    nlc: '$$invTrn.nlc',
                    expiry: '$$invTrn.expiry',
                    unitConv: '$$invTrn.unitConv',
                    pRateTaxInc: '$$invTrn.pRateTaxInc',
                    sRateTaxInc: '$$invTrn.sRateTaxInc',

                    items: {
                      $arrayElemAt: [{
                        $filter: {
                          input: `$${invItems}`,
                          as: 'invItem',
                          cond: {
                            $and: andArr,
                          },
                        }
                      }, 0]
                    },
                  },
                },
              },
            }
          },
          {
            $addFields: {
              invTrns: {
                $map: {
                  input: '$invTrns',
                  as: 'invTrn',
                  in: {
                    _id: '$$invTrn._id',
                    inventory: '$$invTrn.inventory',
                    inward: '$$invTrn.inward',
                    outward: '$$invTrn.outward',
                    taxableAmount: '$$invTrn.taxableAmount',
                    assetAmount: '$$invTrn.assetAmount',
                    cgstAmount: '$$invTrn.cgstAmount',
                    sgstAmount: '$$invTrn.sgstAmount',
                    igstAmount: '$$invTrn.igstAmount',
                    profitAmount: '$$invTrn.profitAmount',
                    barcode: '$$invTrn.barcode',
                    batch: '$$invTrn.batch',
                    batchNo: '$$invTrn.batchNo',
                    mrp: '$$invTrn.mrp',
                    rate: '$$invTrn.rate',
                    pRate: '$$invTrn.pRate',
                    sRate: '$$invTrn.sRate',
                    nlc: '$$invTrn.nlc',
                    expiry: '$$invTrn.expiry',
                    unitConv: '$$invTrn.unitConv',
                    pRateTaxInc: '$$invTrn.pRateTaxInc',
                    sRateTaxInc: '$$invTrn.sRateTaxInc',

                    tax: '$$invTrn.items.tax',
                    qty: {
                      $cond: [
                        { $and: [{ $gt: ['$$invTrn.outward', 0] }, { $eq: ['$voucherName', 'Stock Adjustment'] }] },
                        { $multiply: [{ $abs: '$$invTrn.items.qty' }, -1] },
                        { $abs: '$$invTrn.items.qty' },
                      ]
                    },
                    unitPrecision: '$$invTrn.items.unitPrecision',
                    freeQty: '$$invTrn.items.freeQty',
                    disc: '$$invTrn.items.disc',
                    sInc: '$$invTrn.items.sInc',
                    cost: '$$invTrn.items.cost',
                  }
                }
              }
            }
          },
          { $unset: invItems },
          {
            $out: coll
          },
        ];
        await connection.db(db).collection(coll).aggregate(pipeLine).toArray();
        console.log(`${coll} end`);
      }
      console.log(`NLC field UNSET in DEBIT_NOTE, stock_adjustments, and inventory_transactions started...`);
      await connection.db(db).collection('purchases').updateMany({ voucherType: 'DEBIT_NOTE' }, { $unset: { 'invTrns.$[].nlc': 1 } });
      await connection.db(db).collection('stock_adjustments').updateMany({ invTrns: { $elemMatch: { _id: { $exists: false } } } }, { $unset: { 'invTrns.$[].nlc': 1 } });

      await connection.db(db).collection('inventory_transactions').updateMany({ voucherType: 'DEBIT_NOTE' }, { $unset: { nlc: 1 } });
      await connection.db(db).collection('inventory_transactions').updateMany({ voucherName: 'Stock Adjustment', batch: { $exists: false } }, { $unset: { nlc: 1 } });
      console.log(`NLC field UNSET in DEBIT_NOTE, stock_adjustments, and inventory_transactions ended...`);



      // const vouchers = await connection.db(db).collection('material_conversions').find({}, { projection: { invItems: 1, invTrns: 1, _id: 1 } }).toArray();
      // const bulkOp = connection.db(db).collection('material_conversions').initializeOrderedBulkOp();
      // for (const voucher of vouchers) {
      //   bulkOp.find({ _id: voucher._id }).updateOne({ $set: voucher.invTrns });
      // }
      // if (vouchers.length > 0) {
      //  await bulkOp.execute();
      //  vouchers.length = 0;
      // }
      console.log(`${db} END****`);
    }
    console.log('All organizations update sucessfully...');
    return 'All organizations update sucessfully...';
  }
}
