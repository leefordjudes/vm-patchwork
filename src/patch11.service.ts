import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { Types } from 'mongoose';
import * as _ from 'lodash';

import { URI } from './config';
import { GST_TAXES } from './fixtures/gst-tax';
import { STATE } from './fixtures/state/state';
import { round } from './utils/utils';

@Injectable()
export class Patch11Service {
  async patch11() {
    try {
      var connection = await new MongoClient(URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }).connect();

      console.log('---connected---');
      console.log('1.account creation started');
      const connectdb = connection.db().databaseName;
      console.log(connectdb);
      const auditplusDB = await connection
        .db('auditplusdb')
        .collection('organizations')
        .findOne({ name: connectdb });
      const date = auditplusDB.bookBegin;
      date.setDate(date.getDate() - 1);
      const user = await connection.db().collection('users').findOne({ isAdmin: true });
      const customerPenddings: any = await connection.db().collection('customerpendings').find({}, { projection: { customer: 1 } }).toArray();
      const customerIds = _.uniq(customerPenddings.map((x) => x.customer)).map((y: any) => Types.ObjectId(y));
      console.log(`${customerIds.length} - Credit Customer found`);
      const customers: any = await connection.db().collection('customers').find({ _id: { $in: customerIds } }, { projection: { name: 1, contactInfo: 1 } }).toArray();
      console.log(`${customers.length} === ${customerIds.length}` ? 'get credit customer only' : 'Miss matched');
      const vendorPenddings: any = await connection.db().collection('vendorpendings').find({}, { projection: { vendor: 1 } }).toArray();
      const vendorIds = _.uniq(vendorPenddings.map((x) => x.vendor)).map((y: any) => Types.ObjectId(y));
      console.log(`${vendorIds.length} - Credit Vendor found`);
      const vendors: any = await connection.db().collection('vendors').find({ _id: { $in: vendorIds } }, { projection: { name: 1, contactInfo: 1 } }).toArray();
      console.log(`${vendors.length} === ${vendorIds.length}` ? 'get credit vendor only' : 'Miss matched');
      const bulkAccount = connection.db().collection('accounts').initializeOrderedBulkOp();
      const obj = {
        hide: false,
        aliasName: '',
        validateAliasName: '',
        parentAccount: null,
        parentIds: [],
        description: '',
        tdsApplicable: false,
        createdBy: user._id.toString(),
        updatedBy: user._id.toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      for (const item of customers) {
        const cust = {};
        _.assign(cust, {
          type: {
            name: 'Trade Receivable',
            defaultName: 'TRADE_RECEIVABLE',
          },
          party: item._id,
        });
        if (item.contactInfo?.mobile) {
          _.assign(cust,
            {
              name: `${item.name}-${item.contactInfo.mobile}`,
              displayName: `${item.name}-${item.contactInfo.mobile}`,
              validateName: `${item.name}-${item.contactInfo.mobile}`.replace(/[^a-z0-9]/gi, '').toLowerCase(),
            }
          );
        } else {
          _.assign(cust,
            {
              name: `${item.name}`,
              displayName: `${item.name}`,
              validateName: item.name.replace(/[^a-z0-9]/gi, '').toLowerCase(),
            }
          );
        }
        _.assign(cust, obj);
        bulkAccount.insert(cust);
      }
      for (const item of vendors) {
        const ven = {};
        _.assign(ven, {
          type: {
            name: 'Trade Payable',
            defaultName: 'TRADE_PAYABLE',
          },
          party: item._id,
        });
        if (item.contactInfo.mobile) {
          _.assign(ven,
            {
              name: `${item.name}-${item.contactInfo.mobile}`,
              displayName: `${item.name}-${item.contactInfo.mobile}`,
              validateName: `${item.name}-${item.contactInfo.mobile}`.replace(/[^a-z0-9]/gi, '').toLowerCase(),
            }
          );
        } else {
          _.assign(ven,
            {
              name: `${item.name}`,
              displayName: `${item.name}`,
              validateName: item.name.replace(/[^a-z0-9]/gi, '').toLowerCase(),
            }
          );
        }
        _.assign(ven, obj);
        bulkAccount.insert(ven);
      }
      const createAccount = await bulkAccount.execute();
      console.log(
        createAccount.nInserted === vendors.length + customers.length ?
          'All Credit Account created sucessfully' :
          'Credit account createion Something error'
      );
      console.log('1.account creation end....');
      const accOpeningPipeLine = [
        {
          $project: {
            _id: 0,
            accountId: { $toObjectId: '$account.id' },
            accountName: '$account.displayName',
            branchId: { $toObjectId: '$branch.id' },
            branchName: '$branch.displayName',
            date,
            trns: [
              {
                _id: '$_id',
                credit: '$credit',
                debit: '$debit',
              }
            ],
            voucherName: 'Account Opening',
            voucherType: 'ACCOUNT_OPENING',
            updatedBy: { $toObjectId: '$updatedBy' },
            updatedAt: new Date(),
          }
        },
        { $merge: 'accountopenings_new' },
      ];
      const customerOpeningPipeLine = [
        {
          $addFields: {
            customer: {
              $toObjectId: '$customer',
            },
            branch: {
              $toObjectId: '$branch',
            },
          },
        },
        {
          $lookup: {
            from: 'accounts',
            localField: 'customer',
            foreignField: 'party',
            as: 'accs',
          },
        },
        {
          $unwind: '$accs',
        },
        {
          $lookup: {
            from: 'branches',
            localField: 'branch',
            foreignField: '_id',
            as: 'brs',
          },
        },
        {
          $unwind: '$brs',
        },
        {
          $addFields: {
            accountId: '$accs._id',
            accountName: '$accs.displayName',
            branchId: '$brs._id',
            branchName: '$brs.displayName',
          },
        },
        {
          $group: {
            _id: {
              accountId: '$accountId',
              branchId: '$branchId',
            },
            branchName: { $last: '$branchName' },
            accountName: { $last: '$accountName' },
            trns: {
              $push: {
                _id: { $toObjectId: '$pending' },
                effDate: '$effDate',
                refNo: '$refNo',
                credit: '$credit',
                debit: '$debit',
              },
            },
          },
        },
        {
          $addFields: {
            accountId: '$_id.accountId',
            branchId: '$_id.branchId',
            date,
            voucherName: 'Account Opening',
            voucherType: 'ACCOUNT_OPENING',
            updatedBy: user._id,
            updatedAt: new Date(),
          }
        },
        { $project: { _id: 0 } },
        { $merge: 'accountopenings_new' },
      ];
      const vendorOpeningPipeLine = [
        {
          $addFields: {
            vendor: {
              $toObjectId: '$vendor',
            },
            branch: {
              $toObjectId: '$branch',
            },
          },
        },
        {
          $lookup: {
            from: 'accounts',
            localField: 'vendor',
            foreignField: 'party',
            as: 'accs',
          },
        },
        {
          $unwind: '$accs',
        },
        {
          $lookup: {
            from: 'branches',
            localField: 'branch',
            foreignField: '_id',
            as: 'brs',
          },
        },
        {
          $unwind: '$brs',
        },
        {
          $addFields: {
            accountId: '$accs._id',
            accountName: '$accs.displayName',
            branchId: '$brs._id',
            branchName: '$brs.displayName',
          },
        },
        {
          $group: {
            _id: {
              accountId: '$accountId',
              branchId: '$branchId',
            },
            branchName: { $last: '$branchName' },
            accountName: { $last: '$accountName' },
            trns: {
              $push: {
                _id: { $toObjectId: '$pending' },
                effDate: '$effDate',
                refNo: '$refNo',
                credit: '$credit',
                debit: '$debit',
              },
            },
          },
        },
        {
          $addFields: {
            accountId: '$_id.accountId',
            branchId: '$_id.branchId',
            date,
            voucherName: 'Account Opening',
            voucherType: 'ACCOUNT_OPENING',
            updatedBy: user._id,
            updatedAt: new Date(),
          }
        },
        { $project: { _id: 0 } },
        { $merge: 'accountopenings_new' },
      ];

      const accOpCount = await connection.db().collection('accountopenings').countDocuments();
      const cusOpCount = await connection.db().collection('customeropenings').countDocuments();
      const venOpCount = await connection.db().collection('vendoropenings').countDocuments();
      console.log({ accOpCount, cusOpCount, venOpCount });
      if (accOpCount > 0) {
        await connection.db().collection('accountopenings').aggregate(accOpeningPipeLine).toArray();
      } else {
        await connection.db().createCollection('accountopenings');
        console.log('No Account Openings Found');
      }
      if (cusOpCount > 0) {
        await connection.db().collection('customeropenings').aggregate(customerOpeningPipeLine).toArray();
      } else {
        console.log('No Customer Openings Found');
      }
      if (venOpCount > 0) {
        await connection.db().collection('vendoropenings').aggregate(vendorOpeningPipeLine).toArray();
      } else {
        console.log('No Vendoropenings Found');
      }
      await connection.db().collection('accountopenings').rename('accountopenings_old');
      const accOpening = await connection.db().collection('accountopenings_new').rename('accountopenings');
      await accOpening.createIndex({ accountId: 1 });
      await accOpening.createIndex({ branchId: 1 });
      console.log('Account opening merge Sucess');
      await connection.db().collection('customerpendingadjustments')
        .aggregate([
          { $merge: 'accountpendingadjustments' }
        ]).toArray();
      await connection.db().collection('vendorpendingadjustments')
        .aggregate([
          { $merge: 'accountpendingadjustments' }
        ]).toArray();

      const pendings: any = await connection.db().collection('accountpendingadjustments').find({}, { projection: { _id: 0, __v: 0 } }).toArray();
      const accounts: any = await connection.db().collection('accounts')
        .find({}, { projection: { party: 1, displayName: 1, type: 1 } })
        .map((elm: any) => {
          return {
            id: elm._id.toString(),
            displayName: elm.displayName,
            party: elm?.party?.toString(),
            type: elm.type.defaultName,
          }
        })
        .toArray();
      async function accVoucher(collectionName: string) {
        const count = await connection.db().collection(collectionName).countDocuments();
        if (count > 0) {
          console.log(`Total count of ${collectionName} was ${count}`);
          const limit = 1000;
          console.log(`${collectionName} START`);
          for (let skip = 0; skip <= count; skip = skip + limit) {
            const docs = [];
            const vouchers: any = await connection.db().collection(collectionName)
              .find({}, { projection: { cashRegister: 0 }, sort: { _id: 1 }, skip, limit }).toArray();
            for (const voucher of vouchers) {
              let voucherPending: string;
              let credit: number;
              let debit: number;
              let partyAcc: any;
              // let voucherName: string;
              const receiptCollections = ['customerreceipts', 'vendorreceipts', 'accountreceipts', 'incomes'];
              const paymentCollections = ['customerpayments', 'vendorpayments', 'accountpayments', 'expenses'];
              const creditCollections = ['customerpayments', 'customerreceipts', 'vendorpayments', 'vendorreceipts'];
              const accCollections = ['accountpayments', 'expenses', 'accountreceipts', 'incomes'];
              const contraCollection = ['cashdeposits', 'cashwithdrawals'];
              if (['customerpayments', 'customerreceipts'].includes(collectionName)) {
                voucherPending = voucher.customerPending;
              }
              if (['vendorpayments', 'vendorreceipts'].includes(collectionName)) {
                voucherPending = voucher.vendorPending;
              }
              if (paymentCollections.includes(collectionName)) {
                //voucherName = 'Payment';
                debit = voucher.amount;
                credit = 0;
              }
              if (receiptCollections.includes(collectionName)) {
                //voucherName = 'Receipt';
                credit = voucher.amount;
                debit = 0;
              }
              if (collectionName === 'cashdeposits') {
                credit = voucher.amount;
                debit = 0;
                //voucherName = 'Contra';
              }
              if (collectionName === 'cashwithdrawals') {
                debit = voucher.amount;
                credit = 0;
                //voucherName = 'Contra';
              }
              if (creditCollections.includes(collectionName)) {
                partyAcc = accounts.find((party) => party.party === voucher.toAccount.id);
              }
              if (accCollections.includes(collectionName)) {
                partyAcc = accounts.find((party) => party.id === voucher.toAccount.id);
              }
              let cashAcc = accounts.find((cash) => cash.id === voucher.byAccount.id);

              if (contraCollection.includes(collectionName)) {
                cashAcc = accounts.find((party) => party.id === voucher.toAccount.id);
                partyAcc = accounts.find((cash) => cash.id === voucher.byAccount.id);
              }
              const doc: any = {
                _id: voucher._id,
                branchId: Types.ObjectId(voucher.branch.id),
                branchName: voucher.branch.displayName,
                date: voucher.date,
                refNo: voucher.refNo,
                description: voucher.description,
                voucherNo: voucher.voucherNo,
                voucherName: voucher.voucherName,
                voucherType: voucher.voucherType,
                createdBy: Types.ObjectId(voucher.createdBy),
                updatedBy: Types.ObjectId(voucher.updatedBy),
                createdAt: voucher.createdAt,
                updatedAt: voucher.updatedAt,
              };
              let _id: any;
              if (creditCollections.includes(collectionName)) {
                const getPending = pendings
                  .find((pending: any) => (pending.byPending === voucherPending || pending.toPending === voucherPending));
                if (getPending) {
                  if (getPending.byPending > getPending.toPending) {
                    _id = Types.ObjectId(getPending.byPending);
                  } else {
                    _id = Types.ObjectId(getPending.toPending);
                  }
                }
                if (!getPending) {
                  _id = new Types.ObjectId();
                }
              } else {
                _id = new Types.ObjectId();
              }
              const acItems = [
                {
                  _id: new Types.ObjectId(),
                  accountId: Types.ObjectId(partyAcc.id),
                  accountName: partyAcc.displayName,
                  accountType: partyAcc.type,
                  debit,
                  credit,
                },
                {
                  _id: new Types.ObjectId(),
                  accountId: Types.ObjectId(cashAcc.id),
                  accountName: cashAcc.displayName,
                  accountType: cashAcc.type,
                  instNo: voucher.instNo,
                  instDate: voucher.instDate ? new Date(new Date(voucher.instDate).setUTCHours(0, 0, 0, 0)) : null,
                  debit: credit,
                  credit: debit,
                },
              ];
              const acTrns = [
                {
                  _id,
                  accountId: Types.ObjectId(partyAcc.id),
                  accountName: partyAcc.displayName,
                  branchId: Types.ObjectId(voucher.branch.id),
                  branchName: voucher.branch.displayName,
                  isAlt: true,
                  debit,
                  credit,
                },
                {
                  _id: new Types.ObjectId(),
                  accountId: Types.ObjectId(cashAcc.id),
                  accountName: cashAcc.displayName,
                  branchId: Types.ObjectId(voucher.branch.id),
                  branchName: voucher.branch.displayName,
                  isAlt: true,
                  debit: credit,
                  credit: debit,
                },
              ];
              _.assign(doc, { acItems });
              _.assign(doc, { acTrns });
              if (creditCollections.includes(collectionName)) {
                const acAdjs = pendings
                  .filter((pending) => (pending.byPending === voucherPending) && (pending.byPending > pending.toPending))
                  .map((p) => {
                    return {
                      _id: new Types.ObjectId(),
                      accountId: Types.ObjectId(partyAcc.id),
                      pendingId: Types.ObjectId(p.toPending),
                      amount: p.amount,
                    };
                  });
                _.assign(doc.acItems[0], { acAdjs });
                _.assign(doc.acItems[1], { acAdjs: [] });
                _.assign(doc.acTrns[0], { acAdjs, bwd: true });
                _.assign(doc.acTrns[1], { acAdjs: [], bwd: false });
              } else {
                _.assign(doc.acItems[0], { acAdjs: [] });
                _.assign(doc.acItems[1], { acAdjs: [] });
                _.assign(doc.acTrns[0], { acAdjs: [], bwd: false });
                _.assign(doc.acTrns[1], { acAdjs: [], bwd: false });
              }
              docs.push(doc);
            }
            console.log(`${skip} to ${limit + skip} new documents generated for ${collectionName}`);
            console.log(`${skip} to ${limit + skip} bulk insert started....`);
            await connection.db().collection('vouchers').insertMany(docs);
            console.log(`${skip} to ${limit + skip} bulk insert end for ${collectionName}....`);
          }
          console.log(`${collectionName} END`);
        } else {
          console.log(`${collectionName} Not Found`);
        }
      }

      const collectionNames = [
        'customerpayments', 'customerreceipts',
        'vendorpayments', 'vendorreceipts',
        'accountreceipts', 'accountpayments',
        'expenses', 'incomes',
        'cashdeposits', 'cashwithdrawals',
      ];

      for (const coll of collectionNames) {
        await accVoucher(coll);
      }

      console.log('journals Start');
      const journalsCount = await connection.db().collection('journals').countDocuments();
      if (journalsCount > 0) {
        const docs = [];
        const vouchers: any = await connection.db().collection('journals').find({}, { projection: { cashRegister: 0 } }).toArray();
        for (const voucher of vouchers) {
          const doc = {
            _id: voucher._id,
            branchId: Types.ObjectId(voucher.branch.id),
            branchName: voucher.branch.displayName,
            date: voucher.date,
            refNo: voucher.refNo,
            description: voucher.description,
            voucherNo: voucher.voucherNo,
            voucherName: 'Journal',
            voucherType: 'JOURNAL',
            createdBy: Types.ObjectId(voucher.createdBy),
            updatedBy: Types.ObjectId(voucher.updatedBy),
            createdAt: voucher.createdAt,
            updatedAt: voucher.updatedAt,
          };

          const acItems = voucher.transactions.map((trn) => {
            const acc = accounts.find(acc => trn.account.id === acc.id);
            return {
              _id: new Types.ObjectId(),
              accountId: Types.ObjectId(acc.id),
              accountName: acc.displayName,
              accountType: acc.type,
              debit: trn.debit,
              credit: trn.credit,
            }
          });

          const acTrns = voucher.transactions.map((trn) => {
            return {
              _id: new Types.ObjectId(),
              accountId: Types.ObjectId(trn.account.id),
              accountName: trn.account.displayName,
              branchId: Types.ObjectId(voucher.branch.id),
              branchName: voucher.branch.displayName,
              debit: trn.debit,
              credit: trn.credit,
            }
          });
          _.assign(doc, { acItems });
          _.assign(doc, { acTrns });
          docs.push(doc);
        }
        await connection.db().collection('vouchers').insertMany(docs);
      } else {
        console.log('No journals Found');
      }
      console.log('journals END');
      const purchasePipe = [
        {
          $unwind: '$invTrns'
        },
        { $project: { invTrns: 1, branch: 1 } },
        {
          $addFields: { batch: { $toObjectId: '$invTrns.batch' } }
        },
        {
          $lookup: {
            from: 'batches',
            localField: 'batch',
            foreignField: '_id',
            as: 'batchArr'
          }
        },
        {
          $unwind: '$batchArr',
        },
        {
          $addFields: {
            transactionId: '$invTrns._id',
            batch: '$invTrns.batch',
            branch: { $toObjectId: '$branch.id' },
            inventory: { $toObjectId: '$invTrns.inventory.id' },
            singleton: '$batchArr.singleton',
            allowNegativeStock: false,
            batchNo: { $ifNull: [{ $toUpper: '$invTrns.batchNo' }, 'N.A'] },
            voucherName: 'PURCHASE',
          },
        },
        {
          $project: {
            _id: 0, transactionId: 1, batch: 1, branch: 1, inventory: 1,
            singleton: 1, allowNegativeStock: 1, batchNo: 1, voucherName: 1
          }
        },
        { $merge: { into: 'batches_rearrange' } }
      ];
      const openingPipe = [
        { $project: { trns: 1, branchId: 1, inventoryId: 1 } },
        {
          $unwind: '$trns',
        },
        {
          $addFields: { batch: { $toObjectId: '$trns.batch' } }
        },
        {
          $lookup: {
            from: 'batches',
            localField: 'batch',
            foreignField: '_id',
            as: 'batchArr'
          }
        },
        {
          $unwind: '$batchArr',
        },
        {
          $addFields: {
            transactionId: '$trns._id',
            batch: '$trns.batch',
            singleton: '$batchArr.singleton',
            allowNegativeStock: '$batchArr.allowNegativeStock',
            batchNo: { $ifNull: [{ $toUpper: '$trns.batchNo' }, 'N.A'] },
            voucherName: 'OPENING',
            branch: { $toObjectId: '$branchId' },
            inventory: { $toObjectId: '$inventoryId' },
          },
        },
        {
          $project: {
            _id: 0, transactionId: 1, batch: 1, branch: 1, inventory: 1,
            singleton: 1, allowNegativeStock: 1, batchNo: 1, voucherName: 1
          }
        },
        { $merge: { into: 'batches_rearrange' } }
      ];
      const stockTransferPipe = [
        {
          $unwind: '$invTrns'
        },
        { $project: { invTrns: 1, targetBranch: 1 } },
        {
          $addFields:
          {
            targetBatch:
            {
              $cond: { if: { $eq: ["$targetBranch.id", '$invTrns.branch'] }, then: true, else: false }
            }
          }
        },
        {
          $match: { targetBatch: true }
        },
        {
          $addFields: { batch: { $toObjectId: '$invTrns.batch' } }
        },
        {
          $lookup: {
            from: 'batches',
            localField: 'batch',
            foreignField: '_id',
            as: 'batchArr',
          }
        },
        {
          $unwind: '$batchArr',
        },
        {
          $addFields: {
            transactionId: '$invTrns._id',
            batch: '$invTrns.batch',
            singleton: '$batchArr.singleton',
            allowNegativeStock: false,
            voucherName: 'TRANSFER',
            batchNo: { $ifNull: [{ $toUpper: '$invTrns.batchNo' }, 'N.A'] },
            branch: { $toObjectId: '$invTrns.branch' },
            inventory: { $toObjectId: '$invTrns.inventory.id' },
          },
        },
        {
          $project: {
            _id: 0, transactionId: 1, batch: 1, branch: 1, inventory: 1,
            singleton: 1, allowNegativeStock: 1, batchNo: 1, voucherName: 1
          }
        },
        { $merge: { into: 'batches_rearrange' } }
      ];
      console.log(`new collection batch_rearrage started...`);
      const newBatchStart = new Date().getTime();
      await connection.db().collection('purchases').aggregate(purchasePipe).toArray();
      await connection.db().collection('inventory_openings').aggregate(openingPipe).toArray();
      await connection.db().collection('stock_transfers').aggregate(stockTransferPipe).toArray();
      console.log(`DURATION for new Batch ${(new Date().getTime() - newBatchStart) / 1000}-sec`);
      console.log(`Convert duplicate batchNo as Uniq batchNo started...`);
      const reBatches: any = await connection.db().collection('batches_rearrange')
        .aggregate([
          {
            $group: {
              _id: { inventory: '$inventory', batchNo: '$batchNo', branch: '$branch' },
              count: { $sum: 1 },
              docIds: {
                $push: '$_id',
              }
            }
          },
          {
            $match: { count: { $gt: 1 } }
          },
          {
            $project: {
              _id: 0,
              batchNo: '$_id.batchNo',
              docIds: 1,
            }
          },
        ]).toArray();
      console.log(`count of duplicate batchNo`, reBatches.length);
      if (reBatches.length > 0) {
        const bulk = connection.db().collection('batches_rearrange').initializeOrderedBulkOp();
        for (const item of reBatches) {
          for (let i = 1; i < item.docIds.length; i++) {
            bulk.find({ _id: item.docIds[i] })
              .update({ $set: { batchNo: `${item.batchNo}-${Math.random().toString(36).substring(2, 6).toUpperCase()}` } });
          }
        }
        await bulk.execute();
      } else {
        console.log('There is no same batcNo');
      }
      const batches: any = await connection.db().collection('batches_rearrange')
        .find({}, { projection: { transactionId: 1, batch: 1, batchNo: 1, _id: 0 } })
        .map((elm: any) => {
          return {
            batch: elm.batch.toString(),
            transactionId: elm.transactionId,
            batchNo: elm.batchNo,
          }
        }).toArray();

      async function purchases(collectionName: string) {
        const count = await connection.db().collection(collectionName).countDocuments();
        if (count > 0) {
          const limit = 500;
          const begin = new Date().getTime();
          for (let skip = 0; skip <= count; skip = skip + limit) {
            const start = new Date().getTime();
            const bulkOperation = connection.db().collection('purchases_new').initializeOrderedBulkOp();
            const sttt = new Date().getTime();
            console.log(`bulkOperation initialzed Duration ${start - sttt}`);
            const vouchers: any = await connection.db().collection(collectionName)
              .find({},
                {
                  projection: { cashRegister: 0, warehouse: 0, fNo: 0, rcm: 0, taxInclusiveRate: 0 },
                  sort: { _id: 1 }, skip, limit,
                })
              .toArray();
            console.log(`get ${skip} to ${limit+skip} voucher duration ${new Date().getTime() - sttt}`);
            const afterGetVoucher = new Date().getTime();
            for (const voucher of vouchers) {
              const partyLoc = STATE.find((loc) => voucher.gstInfo.source.location.defaultName === loc.defaultName).code;
              const doc: any = {
                _id: voucher._id,
                date: voucher.date,
                billDate: voucher?.billDate ?? voucher.date,
                vendorId: Types.ObjectId(voucher.vendor.id),
                vendorName: voucher.vendor.displayName,
                branchId: Types.ObjectId(voucher.branch.id),
                branchName: voucher.branch.displayName,
                warehouseId: null,
                warehouseName: null,
                voucherType: voucher.voucherType,
                branchGst: {
                  regType: voucher.gstInfo.destination.regType.defaultName,
                  location: 33,
                  gstNo: voucher.gstInfo.destination.gstNo,
                },
                partyGst: {
                  regType: voucher.gstInfo.source.regType.defaultName,
                  location: partyLoc,
                  gstNo: voucher.gstInfo.source.gstNo,
                },
                refNo: voucher.refNo,
                description: voucher.description,
                rcm: false,
                pRateTaxInc: false,
                sRateTaxInc: true,
                cashAmount: 0,
                bankAmount: 0,
                bankAccount: null,
                creditAmount: 0,
                creditAccount: null,
                voucherNo: voucher.voucherNo,
                voucherName: voucher.voucherName,
                createdBy: Types.ObjectId(voucher.createdBy),
                updatedBy: Types.ObjectId(voucher.updatedBy),
                createdAt: voucher.createdAt,
                updatedAt: voucher.updatedAt,
                transactionMode: voucher.purchaseType,
                amount: round(voucher.amount),
                act: false,
                actHide: false,
              };
              const invItems = [];
              const invTrns = [];
              for (const item of voucher.invTrns) {
                const tax = GST_TAXES.find(tax => tax.ratio.igst === item.tax.gstRatio.igst).code;
                const a = new Date().getTime();
                const batch = batches.find((bat: any) => bat.batch === item.batch);
                // console.log(`Compare batch Duration ${new Date().getTime() - a}`);
                let expiry: any;
                if (item.expMonth && item.expMonth < 10) {
                  expiry = new Date(new Date(`${item.expYear}-${0}${item.expMonth}-01`).setUTCHours(0, 0, 0, 0));
                } else if (item.expMonth && item.expMonth > 9) {
                  expiry = new Date(new Date(`${item.expYear}-${item.expMonth}-01`).setUTCHours(0, 0, 0, 0));
                } else {
                  expiry = null;
                }

                const invItemObj = {
                  _id: new Types.ObjectId(),
                  batchNo: item.batchNo,
                  inventoryId: Types.ObjectId(item.inventory.id),
                  inventoryName: item.inventory.displayName,
                  qty: item.qty,
                  mrp: round(item.mrp),
                  rate: round(item.rate),
                  disc: round(item.discount),
                  unitPrecision: item.unitPrecision,
                  expiry,
                  hsnSac: item.hsnCode,
                  unitId: Types.ObjectId(item.unit.id),
                  unitName: item.unit.displayName,
                  unitConv: item.unit.conversion,
                  tax,
                  pRate: round(item.rate),
                };

                const invTrnObj = {
                  _id: batch.transactionId,
                  batch: batch.transactionId,
                  inventoryId: Types.ObjectId(item.inventory.id),
                  inventoryName: item.inventory.displayName,
                  outward: 0,
                  taxableAmount: round(item.taxableAmount),
                  sgstAmount: round(item.cgstAmount),
                  cgstAmount: round(item.sgstAmount),
                  igstAmount: round(item.igstAmount),
                  cessAmount: round(item.cessAmount),
                  assetAmount: round(item.assetAmount),
                  mrp: round(item.mrp),
                  batchNo: item.batchNo,
                  tax,
                  pRate: round(item.rate),
                  profitAmount: 0,
                  profitPercent: 0,
                  expiry,
                  hsnSac: item.hsnCode,
                  warehouseId: voucher.warehouse?.id ?? null,
                  warehouseName: voucher.warehouse?.displayName ?? null,
                  branchId: Types.ObjectId(voucher.branch.id),
                  branchName: voucher.branch.displayName,
                };
                if (collectionName === 'purchases') {
                  const freeQty = (item?.freeQty > 0) ? item.freeQty : 0;
                  const inward = (item.qty + freeQty) * item.unit.conversion;
                  const nlc = round(item.taxableAmount / (item.qty + (item?.freeQty || 0)) / item.unit.conversion);
                  _.assign(invItemObj, { freeQty, nlc, sRate: round(item.sRate) });
                  _.assign(invTrnObj, { inward });
                } else {
                  const inward = item.qty * item.unit.conversion * -1;
                  _.assign(invTrnObj, { inward });
                }
                invItems.push(invItemObj);
                invTrns.push(invTrnObj);
              }
              const roundOff = voucher.acTrns.find((acc: any) => (acc.account.defaultName === 'ROUNDED_OFF_SHORTAGE'));
              const acAdjs = {
                discount: voucher?.discount ?? 0,
                roundedOff: roundOff ? (roundOff.credit > 0 ? roundOff.credit * -1 : roundOff.debit) : 0,
              }
              const acItems = [];
              const ac = new Date().getTime();
              for (const item of voucher.acTrns) {
                if (item.account.defaultName === 'ROUNDED_OFF_SHORTAGE' || item.account.defaultName === 'DISCOUNT_RECEIVED') {
                  const account = accounts.find((acc: any) => acc.id === item.account.id);
                  const acItemObj = {
                    _id: new Types.ObjectId(),
                    accountId: account.id,
                    accountName: account.displayName,
                    accountType: account.type,
                    amount: item.credit > 0 ? -item.credit : item.debit,
                  }
                  acItems.push(acItemObj);
                }
              }
              const acTrns = [];
              for (const item of voucher.acTrns) {
                let account: any;
                let _id: any;
                let trnObj: any;
                if (item.account.defaultName === 'TRADE_PAYABLE') {
                  let adjs: any;
                  account = accounts.find((party) => party.party === voucher.vendor.id);
                  const getPending = pendings
                    .find((pending: any) => (pending.byPending === voucher.vendorPending || pending.toPending === voucher.vendorPending));
                  if (getPending) {
                    if (getPending.byPending > getPending.toPending) {
                      _id = Types.ObjectId(getPending.byPending);
                    } else {
                      _id = Types.ObjectId(getPending.toPending);
                    }
                    adjs = pendings
                      .filter((pending) => (pending.byPending === voucher.vendorPending) && (pending.byPending > pending.toPending))
                      .map((p) => {
                        return {
                          _id: new Types.ObjectId(),
                          accountId: Types.ObjectId(account.id),
                          pendingId: Types.ObjectId(p.toPending),
                          amount: round(p.amount),
                        };
                      });
                  } else if (!getPending) {
                    _id = new Types.ObjectId();
                    adjs = [];
                  }
                  trnObj = {
                    _id,
                    accountId: Types.ObjectId(account.id),
                    accountName: account.displayName,
                    branchId: Types.ObjectId(voucher.branch.id),
                    branchName: voucher.branch.displayName,
                    credit: round(item.credit),
                    debit: round(item.debit),
                    adjs,
                  }
                  _.assign(doc, { creditAdjs: adjs, creditAccount: Types.ObjectId(account.id), creditAmount: round(voucher.amount) });
                } else {
                  account = accounts.find((acc) => acc.id === item.account.id);
                  if (account.type === 'CASH') {
                    _.assign(doc, { cashAmount: (item.credit > 0) ? round(item.credit) : round(item.debit) });
                  }
                  if (account.type === 'BANK_ACCOUNT' || account.type === 'BANK_OD_ACCOUNT') {
                    _.assign(doc, { bankAmount: (item.credit > 0) ? round(item.credit) : round(item.debit), bankAccount: Types.ObjectId(account.id) });
                  }
                  trnObj = {
                    _id: item._id,
                    accountId: Types.ObjectId(account.id),
                    accountName: account.displayName,
                    branchId: Types.ObjectId(voucher.branch.id),
                    branchName: voucher.branch.displayName,
                    credit: round(item.credit),
                    debit: round(item.debit),
                  }
                }
                acTrns.push(trnObj);
              }
              _.assign(doc, { invTrns, invItems, acAdjs, acItems, acTrns });
              bulkOperation.insert(doc);
            }
            const start1 = new Date().getTime();
            console.log(`${skip} to ${limit + skip} object initialized DURATION ${(start1 - afterGetVoucher) / 1000}-sec`);
            console.log(`${skip} to ${limit + skip} patch object initialized`);
            console.log(`${skip} to ${limit + skip} bulk execution start....`);
            const result = await bulkOperation.execute();
            console.log(`DURATION for only insert execute  ${(new Date().getTime() - start1) / 1000}-sec`);
            console.log(`results are` + JSON.stringify({ insert: result.nInserted, err: result.hasWriteErrors() }));
            console.log(`Total DURATION for ${skip} to ${limit + skip}  ${(new Date().getTime() - start) / 1000}-sec`);
          }
          console.log(`END ALL ${collectionName} and DURATION ${(new Date().getTime() - begin) / (1000 * 60)}-min`);
        } else {
          console.log(`${collectionName} Not Found`);
        }
      }
      await purchases('purchases');
      await purchases('purchase_returns');
      await connection.close();
      return 'OK';
    } catch (err) {
      return false;
    }
  }

  async delete() {
    try {
      var connection = await new MongoClient(URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }).connect();
      const deleteCollectionList = [
        'accountopenings_old', 'accountpayments', 'accountpendingadjustments', 'accountreceipts',
        'act_account_map', 'act_account_openings', 'act_accountbooks', 'act_accounts',
        'act_gst_registrations', 'act_import_field_map', 'act_import_sessions', 'act_inventories',
        'act_inventory_details', 'act_inventory_openings', 'act_inventorybooks', 'act_vouchers',
        'cashdeposits', 'cashregisterbooks', 'cashwithdrawals', 'configurations',
        'currentpreferences', 'customerbooks', 'customeropenings', 'customerpayments',
        'customerpendingadjustments', 'customerpendings', 'customerreceipts', 'expenses',
        'gstoutwards', 'gsttransactions', 'incomes', 'inventory_openings_old',
        'journals', 'reviews', 'vendorbooks', 'vendoropenings',
        'vendorpayments', 'vendorpendingadjustments', 'vendorpendings', 'vendorreceipts',
      ];
      console.log('---connected---');
      // const list = await connection.db().listCollections().toArray();
      // for (const item of list) {
      //   for (const x of deleteCollectionList) {
      //     if (item.name === x) {
      //       console.log(`${item.name} collection deleted`);
      //       await connection.db().dropCollection(x);
      //     }
      //   };
      // }

      const batches: any = await connection.db().collection('batches_rearrange')
        .find({}, { projection: { _id: 0, batch: 1 } }).map((c: any) => c.batch.toString()).toArray();
      // const arr = await connection.db().collection('batches').find({ _id: { $nin: batches } }).map((a: any) => {
      //   return a._id.toString()
      // }).toArray();

      // console.log(arr.length, arr);
      // const before = process.memoryUsage().heapUsed / 1024 / 1024;
      // console.log(`The script uses approximately before get batch table ${Math.round(before * 100) / 100} MB`);

      // const after = process.memoryUsage().heapUsed / 1024 / 1024;
      // console.log(`The script uses approximately after get batch table ${Math.round(after * 100) / 100} MB`);

      const vouchers: any = await connection.db().collection('sales')
        .find({ invTrns: { $elemMatch: { batch: { $nin: batches } } } }, { projection: { invTrns: 1, voucherNo: 1 } }).toArray();
      console.log(vouchers.length);
      for (const item of vouchers) {
        console.log(item.voucherNo);
      }
      await connection.close();
      return 'unnecessary collection dropped successfully';
    } catch (err) {
      console.log(err)
      return err.message;
    }
  }
}

