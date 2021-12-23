import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

import * as _ from 'lodash';

import { DBS, URI } from './config';
import { Types } from 'mongoose';
import { round } from './utils/utils';
import { GST_TAXES } from './fixtures/gst-tax';

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

    for (const db of DBS) {
      console.log(`${db} started...`);
      await invOpening(db);
      await purchase(db);
      await purchaseReturn(db);
      await gstVoucher(db);
      console.log(`${db} end...`);
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

    async function invOpening(db: string) {
      const bulkOperationInvOpening: any = connection.db(db).collection('inventory_openings').initializeOrderedBulkOp();
      const bulkOperationInventoryTrns = connection.db(db).collection('inventory_transactions').initializeOrderedBulkOp();
      const vouchers: any = await connection.db(db).collection('inventory_openings')
        .find({}, { projection: { invTrns: 1, branch: 1 } })
        .toArray();
      let i = 0;
      const len = vouchers.length;
      if (len > 0) {
        console.log('PURCHASE Operation initialize started...');
        for (const voucher of vouchers) {
          console.log(`${db}-inventory_openings ${++i} of ${len}`);
          let assetValue = 0;
          for (const invTrn of voucher.invTrns) {
            const nlc = round(invTrn.nlc ?? invTrn.rate / invTrn.unitConv);
            const rowAmount = round(invTrn.inward * nlc);
            assetValue += rowAmount;
            const invTrnsObj = {
              updateOne: {
                filter: { _id: voucher._id, invTrns: { $elemMatch: { _id: invTrn._id } } },
                update: {
                  $set: {
                    'invTrns.$[elm].nlc': nlc,
                    'invTrns.$[elm].assetAmount': rowAmount,
                  },
                },
                arrayFilters: [{ 'elm._id': invTrn._id }],
              },
            };
            bulkOperationInvOpening.raw(invTrnsObj);
            bulkOperationInventoryTrns
              .find({ voucherType: null, inventory: invTrn.inventory, adjBatch: invTrn.batch, inward: invTrn.inward, branch: voucher.branch, rate: invTrn.rate })
              .update({ $set: { assetValue: rowAmount, nlc } });
          }
          bulkOperationInvOpening.find({ _id: voucher._id }).updateOne({ $set: { assetAmount: assetValue } });
        }
        vouchers.length = 0;
        console.log('Operation initialized end...');
        console.log('Opening execute started');
        await bulkOperationInvOpening.execute();
        console.log('Opening execute end');
        console.log('Opening Inventory Trns execute started');
        await bulkOperationInventoryTrns.execute();
        console.log('Opening Inventory Trns execute end');
      } else {
        console.log('Inventory Opening Not found');
      }
    }

    async function purchase(db: string) {
      const bulkOperationPurchase: any = connection.db(db).collection('purchases').initializeOrderedBulkOp();
      const bulkOperationInventoryTrns = connection.db(db).collection('inventory_transactions').initializeOrderedBulkOp();
      const bulkOperationAccountTrns = connection.db(db).collection('account_transactions').initializeOrderedBulkOp();
      const vouchers: any = await connection.db(db).collection('purchases')
        .find({ voucherType: 'PURCHASE' }, { projection: { invTrns: 1 } })
        .toArray();
      const voucherLength = vouchers.length;
      let i = 0;
      if (voucherLength > 0) {
        console.log('PURCHASE Operation initialize started...');
        for (const voucher of vouchers) {
          console.log(`${db}-PURCHASE voucher ${++i} of ${voucherLength}`);
          let assetValue = 0;
          for (const invTrn of voucher.invTrns) {
            const rowAmount = round(invTrn.inward * (invTrn.nlc ?? 0));
            assetValue += rowAmount;
            const invTrnsObj = {
              updateOne: {
                filter: { _id: voucher._id, invTrns: { $elemMatch: { _id: invTrn._id } } },
                update: {
                  $set: {
                    'invTrns.$[elm].assetAmount': rowAmount,
                  },
                },
                arrayFilters: [{ 'elm._id': invTrn._id }],
              },
            };
            bulkOperationPurchase.raw(invTrnsObj);
            bulkOperationInventoryTrns
              .find({ voucherId: voucher._id, inventory: invTrn.inventory, adjBatch: invTrn.batch, inward: invTrn.inward, rate: invTrn.rate })
              .update({ $set: { assetValue: rowAmount } });
          }
          const acTrnsObj = {
            updateOne: {
              filter: { _id: voucher._id, acTrns: { $elemMatch: { accountType: 'STOCK' } } },
              update: {
                $set: {
                  'acTrns.$[elm].debit': round(assetValue),
                },
              },
              arrayFilters: [{ 'elm.accountType': 'STOCK' }],
            },
          };
          bulkOperationPurchase.raw(acTrnsObj);
          bulkOperationAccountTrns.find({ voucherId: voucher._id, accountType: 'STOCK' }).updateOne({ $set: { debit: round(assetValue) } });
        }
        vouchers.length = 0;
        console.log('Operation initialized end...');
        console.log('purchase execute started');
        await bulkOperationPurchase.execute();
        console.log('purchase execute end');
        console.log('purchase Inventory Trns execute started');
        await bulkOperationInventoryTrns.execute();
        console.log('purchase Inventory Trns execute end');
        console.log('purchase Account Trns execute started');
        await bulkOperationAccountTrns.execute();
        console.log('purchase Account Trns execute end');
      } else {
        console.log('No purchase fount');
      }
    }

    async function purchaseReturn(db: string) {
      console.log(`DEBIT_NOTE nlc unset started`);
      await connection.db(db).collection('inventory_transactions').updateMany({ voucherType: 'DEBIT_NOTE', nlc: { $exists: true } }, { $unset: { nlc: 1 } });
      await connection.db(db).collection('purchases').updateMany({ voucherType: 'DEBIT_NOTE', 'invTrns.nlc': { $exists: true } }, { $unset: { 'invTrns.$[].nlc': 1 } });
      console.log(`DEBIT_NOTE nlc unset end`);
      const bulkOperationPurchase: any = connection.db(db).collection('purchases').initializeOrderedBulkOp();
      const bulkOperationInventoryTrns = connection.db(db).collection('inventory_transactions').initializeOrderedBulkOp();
      const bulkOperationAccountTrns = connection.db(db).collection('account_transactions').initializeOrderedBulkOp();
      const vouchers: any = await connection.db(db).collection('purchases')
        .find({ voucherType: 'DEBIT_NOTE' }, { projection: { invTrns: 1, branch: 1, date: 1 } })
        .toArray();
      let i = 0;
      const voclen = vouchers.length;
      if (voclen > 0) {
        console.log('DEBIT_NOTE Operation initialize started...');
        for (const voucher of vouchers) {
          console.log(`${db}-DEBIT_NOTE voucher ${++i} of ${voclen}`);
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
        vouchers.length = 0;
        console.log('Operation initialized end...');
        console.log('purchase Return execute started');
        await bulkOperationPurchase.execute();
        console.log('purchase Return execute end');
        console.log('purchase Return Inventory Trns execute started');
        await bulkOperationInventoryTrns.execute();
        console.log('purchase Return Inventory Trns execute end');
        console.log('purchase Return Account Trns execute started');
        await bulkOperationAccountTrns.execute();
        console.log('purchase Return Account Trns execute end');
      } else {
        console.log('No purchase return found');
      }
    }

    async function gstVoucher(db: string) {
      console.log(`${db}-gst vouchers end`);
      const bulkOperationGstVoucher: any = connection.db(db).collection('gst_vouchers').initializeOrderedBulkOp();
      const vouchers: any = await connection.db(db).collection('gst_vouchers')
        .find({}, { projection: { partyGst: 1, trns: 1 } })
        .toArray();
      let i = 0;
      const voclen = vouchers.length;
      if (voclen > 0) {
        console.log('gst_vouchers Operation initialize started...');
        for (const voucher of vouchers) {
          console.log(`${db}-gst_vouchers ${++i} of ${voclen}`);
          let localTax = true;
          if (voucher.partyGst && voucher.partyGst.location && voucher.partyGst.location !== '33') {
            localTax = false;
          }
          for (const trn of voucher.trns) {
            let gstAmount = 0;
            let igstAmount = 0;
            const gst = GST_TAXES.find((x) => x.code === trn.tax).ratio;
            if (localTax) {
              gstAmount = round(trn.rate * (gst.cgst / 100));
            } else {
              igstAmount = round(trn.rate * (gst.igst / 100));
            }
            const trnObj = {
              updateOne: {
                filter: { _id: voucher._id, trns: { $elemMatch: { _id: trn._id } } },
                update: {
                  $set: {
                    'trns.$[elm].taxableAmount': trn.rate,
                    'trns.$[elm].cgstAmount': gstAmount,
                    'trns.$[elm].sgstAmount': gstAmount,
                    'trns.$[elm].igstAmount': igstAmount,
                  },
                },
                arrayFilters: [{ 'elm._id': trn._id }],
              },
            };
            bulkOperationGstVoucher.raw(trnObj);
          }
        }
        bulkOperationGstVoucher.find({ voucherName: 'GST Expense' }).update({ $set: { partyType: 'VENDOR' } });
        bulkOperationGstVoucher.find({ voucherName: 'GST Income' }).update({ $set: { partyType: 'CUSTOMER' } });
        await bulkOperationGstVoucher.execute();
        console.log(`${db}-gst vouchers end`);
      } else {
        console.log(`No gst vouchers found`);
      }
    }
    console.log('All organizations update sucessfully...');
    return 'All organizations update sucessfully...';
  }
}
