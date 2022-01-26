import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

import * as _ from 'lodash';

import { URI, DBS } from './config';

@Injectable()
export class PriceConfigService {
  async patch() {
    const connection = await new MongoClient(URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }).connect();
    if (!connection.isConnected) {
      return 'Connection failed';
    }

    const collectionNames = ['purchases', 'sales'];
    for (const db of DBS) {
      console.log(`${db} STARTED...`);
      console.log(`inv_branch_details update STARTED...`);
      const pipe = [
        {
          $addFields: {
            sDisc: { $cond: ['$sDisc', [{ mode: '$sDisc.mode', amount: '$sDisc.amount' }], '$$REMOVE'] },
            costMargin: { $cond: ['$costMargin', [{ mode: '$costMargin.mode', amount: '$costMargin.amount' }], '$$REMOVE'] },
          },
        },
        {
          $out: 'inv_branch_details',
        },
      ];
      await connection.db(db).collection('inv_branch_details').aggregate(pipe).toArray();
      const customerDiscs: any = await connection.db(db).collection('inv_branch_details')
        .find({ sCustomerDisc: { $exists: true } }, { projection: { sCustomerDisc: 1 } }).toArray();
      const updateArr = [];
      for (const disc of customerDiscs) {
        const sCustomerDisc = {};
        const arr = [];
        for (const key in disc.sCustomerDisc) {
          const obj = {
            mode: disc.sCustomerDisc[key].mode,
            amount: disc.sCustomerDisc[key].amount,
          };
          arr.push(obj);
          _.assign(sCustomerDisc, { [key]: arr });
        }
        const updateObj = {
          updateOne: {
            filter: { _id: disc._id },
            update: {
              $set: {
                sCustomerDisc,
              },
            },
          },
        };
        updateArr.push(updateObj);
      }
      if (updateArr.length > 0) {
        await connection.db(db).collection('inv_branch_details').bulkWrite(updateArr);
      }
      console.log(`inv_branch_details update STARTED...`);
      for (const coll of collectionNames) {
        console.log(`${coll} started...`);
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
                    tax: '$$invTrn.tax',
                    qty: '$$invTrn.qty',
                    unitPrecision: '$$invTrn.unitPrecision',
                    freeQty: '$$invTrn.freeQty',
                    disc: [{ mode: '$$invTrn.disc.mode', amount: '$$invTrn.disc.amount' }],
                    sInc: '$$invTrn.sInc',
                    cost: '$$invTrn.cost',
                  }
                }
              }
            }
          },
          {
            $out: coll
          },
        ];
        await connection.db(db).collection(coll).aggregate(pipeLine).toArray();
        console.log(`${coll} end`);
      }
      console.log(`${db} END****`);
    }
    console.log('All organizations price-config update sucessfully...');
    return 'All organizations price-config update sucessfully...';
  }
}
