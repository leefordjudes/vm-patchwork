import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

import * as _ from 'lodash';

import { DBS, URI } from './config';
import { Types } from 'mongoose';
import { round } from './utils/utils';

@Injectable()
export class StockValueIssueFixService {
  async trns() {
    const connection = await new MongoClient(URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }).connect();
    if (!connection.isConnected) {
      return 'Connection failed';
    }
    async function getBatchInfo(db: string, branchId: Types.ObjectId, invIds: Types.ObjectId[], batchIds: Types.ObjectId[], date: Date) {
      const matchObj = { date: { $lte: date }, inventory: { $in: invIds }, branch: branchId, adjBatch: { $in: batchIds } };
      const pipeline = [
        {
          $match: matchObj,
        },
        {
          $group: {
            _id: { batch: '$adjBatch', inventory: '$inventory', branch: '$branch' },
            nlc: { $avg: '$nlc' },
          },
        },
        {
          $project: {
            _id: 0,
            inventory: '$_id.inventory',
            branch: '$_id.branch',
            batch: '$_id.batch',
            nlc: 1,
          },
        },
      ];
      return await connection.db(db).collection('inventory_transactions').aggregate(pipeline).toArray();
    }

    for (const db of DBS) {
      console.log(`${db} started...`);
      const bulkOperationPurchase: any = connection.db(db).collection('purchases').initializeOrderedBulkOp();
      const bulkOperationInventoryTrns = connection.db(db).collection('inventory_transactions').initializeOrderedBulkOp();
      const bulkOperationAccountTrns = connection.db(db).collection('account_transactions').initializeOrderedBulkOp();
      const vouchers: any = await connection.db(db).collection('purchases')
        .find({ voucherType: 'DEBIT_NOTE' }, { projection: { invTrns: 1, branch: 1, date: 1, acTrns: 1 } })
        .toArray();
      let i = 0;
      let voclen = vouchers.length;
      for (const voucher of vouchers) {
        console.log(`voucher ${++i} of ${voclen}`);
        const batchInfo = await getBatchInfo(db, voucher.branch, voucher.invTrns.map((trn) => trn.inventory), voucher.invTrns.map((trn) => trn.batch), voucher.date);

        let assetValue = 0;
        for (const invTrn of voucher.invTrns) {
          const nlc = batchInfo.find((x) => x.inventory.toString() === invTrn.inventory.toString() && x.batch.toString() === invTrn.batch.toString());
          const rowAmt = round(Math.abs(invTrn.inward) * nlc.nlc ?? 0);
          assetValue += rowAmt;
          const invTrnsObj = {
            updateOne: {
              filter: { _id: voucher._id, invTrns: { $elemMatch: { inventory: invTrn.inventory, batch: invTrn.batch, inward: invTrn.inward } } },
              update: {
                $set: {
                  'invTrns.$[elm].assetAmount': rowAmt,
                },
              },
              arrayFilters: [{ 'elm.inventory': invTrn.inventory, 'elm.batch': invTrn.batch, 'elm.inward': invTrn.inward }],
            },
          };
          bulkOperationPurchase.raw(invTrnsObj);
          bulkOperationInventoryTrns.find({ voucherId: voucher._id, inventory: invTrn.inventory, adjBatch: invTrn.batch, inward: invTrn.inward })
            .update({ $set: { assetValue: rowAmt } });
        }
        const acTrnsObj = {
          updateOne: {
            filter: { _id: voucher._id, acTrns: { $elemMatch: { accountType: 'STOCK' } } },
            update: {
              $set: {
                'acTrns.$[elm].credit': round(assetValue),
              },
            },
            arrayFilters: [{ 'elm.accountType': 'STOCK' }],
          },
        };
        bulkOperationPurchase.raw(acTrnsObj);
        bulkOperationAccountTrns.find({ voucherId: voucher._id, accountType: 'STOCK' })
          .updateOne({ $set: { credit: round(assetValue) } });
      }
      console.log('purchase exec');
      await bulkOperationPurchase.execute();
      console.log('Inventory Trns exec');
      await bulkOperationInventoryTrns.execute();
      console.log('Account Trns exec');
      await bulkOperationAccountTrns.execute();
      console.log(`${db} end...`);
    }
    console.log('All organizations update sucessfully...');
    return 'All organizations update sucessfully...';
  }
}
