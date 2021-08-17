import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

import * as _ from 'lodash';

import { URI } from './config';

@Injectable()
export class DataModifyService {
  async amount() {
    const connection = await new MongoClient(URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }).connect();
    if (!connection.isConnected) {
      return 'Connection failed';
    }

    enum CollectionName {
      SALE = 'sales',
      PURCHASE = 'purchases',
      INV_BRANCH_DETAIL = 'inv_branch_details',
    }
    const dbs = ['velavanstationery', 'velavanhm', 'ttgold', 'ttgoldpalace', 'auditplustech', 'ramasamy', 'velavanmedical', 'velavanmed', 'rkmedicals', 'testorg', 'omshakthi'];
    const mode = 'P';
    for (const db of dbs) {
      console.log(`${db} started...`);
      const pipe = [
        {
          $addFields: {
            sDisc: { $cond: ['$sDisc', { mode, amount: '$sDisc' }, '$$REMOVE'] },
            costMargin: { $cond: ['$sMargin', { mode, amount: '$sMargin' }, '$$REMOVE'] },
          },
        },
        {
          $unset: 'sMargin',
        },
        {
          $out: CollectionName.INV_BRANCH_DETAIL,
        },
      ];
      await connection.db(db).collection(CollectionName.INV_BRANCH_DETAIL).aggregate(pipe).toArray();
      const customerDiscs: any = await connection.db(db).collection(CollectionName.INV_BRANCH_DETAIL)
        .find({ sCustomerDisc: { $exists: true } }, { projection: { sCustomerDisc: 1 } }).toArray();
      const updateArr = [];
      for (const disc of customerDiscs) {
        const sCustomerDisc = {};
        for (const key in disc.sCustomerDisc) {
          const obj = {
            mode,
            amount: disc.sCustomerDisc[key],
          };
          _.assign(sCustomerDisc, { [key]: obj });
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
        await connection.db(db).collection(CollectionName.INV_BRANCH_DETAIL).bulkWrite(updateArr);
      }
      const saleVoucherPipe = [
        {
          $addFields: {
            invItems: {
              $map: {
                input: '$invItems',
                as: 'invItem',
                in: {
                  inventory: '$$invItem.inventory',
                  unitConv: '$$invItem.unitConv',
                  unitPrecision: '$$invItem.unitPrecision',
                  qty: '$$invItem.qty',
                  rate: '$$invItem.rate',
                  disc: { mode, amount: { $ifNull: ['$$invItem.disc', 0] } },
                  batch: '$$invItem.batch',
                  tax: '$$invItem.tax',
                  sInc: '$$invItem.sInc',
                },
              },
            },
          }
        },
        {
          $out: CollectionName.SALE,
        },
      ];
      const purchaseVoucherPipe = [
        {
          $addFields: {
            invItems: {
              $map: {
                input: '$invItems',
                as: 'invItem',
                in: {
                  inventory: '$$invItem.inventory',
                  unitConv: '$$invItem.unitConv',
                  unitPrecision: '$$invItem.unitPrecision',
                  rate: '$$invItem.rate',
                  sRate: '$$invItem.sRate',
                  qty: '$$invItem.qty',
                  freeQty: '$$invItem.freeQty',
                  tax: '$$invItem.tax',
                  mrp: '$$invItem.mrp',
                  disc: { mode, amount: { $ifNull: ['$$invItem.disc', 0] } },
                  batch: '$$invItem.batch',
                  batchNo: '$$invItem.batchNo',
                  expiry: '$$invItem.expiry',
                },
              },
            },
          }
        },
        {
          $out: CollectionName.PURCHASE,
        },
      ];
      console.log(`${db} sales Started...`);
      await connection.db(db).collection(CollectionName.SALE).aggregate(saleVoucherPipe).toArray();
      console.log(`${db} sales end **`);
      console.log(`${db} purchases Started...`);
      await connection.db(db).collection(CollectionName.PURCHASE).aggregate(purchaseVoucherPipe).toArray();
      console.log(`${db} purchases End**`);
      console.log(`${db} end...`);
    }
    console.log('All organizations priceConfig update sucessfully...');
    return 'All organizations priceConfig update sucessfully...';
  }
}
