import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { Types } from 'mongoose';
import * as _ from 'lodash';

import { URI } from './config';

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
      console.log(`${vendors.length} === ${vendorIds.length}` ? 'get credit customer only' : 'Miss matched');
      const newAccounts = [];
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
          party: item._id.toString(),
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
        newAccounts.push(cust);
      }
      for (const item of vendors) {
        const ven = {};
        _.assign(ven, {
          type: {
            name: 'Trade Payable',
            defaultName: 'TRADE_PAYABLE',
          },
          party: item._id.toString(),
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
        newAccounts.push(ven);
      }
      const createAccount = await connection.db().collection('accounts').insertMany(newAccounts);
      console.log(
        createAccount.insertedCount === vendors.length + customers.length ?
          'All Credit Account created sucessfully' :
          'Credit account createion Something error'
      );
      console.log('1.account creation end....');
      const accOpeningPipeLine = [
        {
          $addFields: {
            accountId: {
              $toObjectId: '$account.id',
            },
          },
        },
        {
          $lookup: {
            from: 'accounts',
            localField: 'accountId',
            foreignField: '_id',
            as: 'accs',
          },
        },
        {
          $unwind: '$accs',
        },
        {
          $addFields: {
            accountId: { $toString: '$accs._id' },
            accountName: '$accs.name',
            branchId: '$branch.id',
            branchName: '$branch.name',
            updatedBy: '$updatedBy',
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
            updatedBy: { $last: '$updatedBy' },
            trns: {
              $push: {
                _id: '$_id',
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
            voucherName: 'Account Opening',
            voucherType: 'ACCOUNT_OPENING',
            updatedAt: new Date(),
          }
        },
        { $project: { _id: 0 } },
        { $merge: 'accountopenings_new' },
      ];
      const customerOpeningPipeLine = [
        {
          $addFields: {
            accountId: {
              $toObjectId: '$account.id',
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
            accountId: { $toString: '$accs._id' },
            accountName: '$accs.name',
            branchId: { $toString: '$brs._id' },
            branchName: '$brs.name',
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
                _id: '$_id',
                pending: '$pending',
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
            voucherName: 'Account Opening',
            voucherType: 'ACCOUNT_OPENING',
            updatedBy: user._id.toString(),
            updatedAt: new Date(),
          }
        },
        { $project: { _id: 0 } },
        { $merge: 'accountopenings_new' },
      ];
      const vendorOpeningPipeLine = [
        {
          $addFields: {
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
            accountId: { $toString: '$accs._id' },
            accountName: '$accs.name',
            branchId: { $toString: '$brs._id' },
            branchName: '$brs.name',
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
                _id: '$_id',
                pending: '$pending',
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
            voucherName: 'Account Opening',
            voucherType: 'ACCOUNT_OPENING',
            updatedBy: user._id.toString(),
            updatedAt: new Date(),
          }
        },
        { $project: { _id: 0 } },
        { $merge: 'accountopenings_new' },
      ];

      const accOpCount = await connection.db().collection('accountopenings').countDocuments();
      const cusOpCount = await connection.db().collection('accountopenings').countDocuments();
      const venOpCount = await connection.db().collection('accountopenings').countDocuments();
      console.log({ accOpCount, cusOpCount, venOpCount });
      if (accOpCount > 0) {
        await connection.db().collection('accountopenings').aggregate(accOpeningPipeLine).toArray();
      } else {
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
      const accountcoll: any = await connection.db().collection('accounts').find({}, { projection: { party: 1, name: 1, displayName: 1, type: 1 } }).toArray();
      const accounts = accountcoll.map((acc) => {
        return {
          id: acc._id.toString(),
          name: acc.name,
          displayName: acc.displayName,
          party: acc?.party,
          type: acc.type.defaultName,
        }
      });

      async function accVoucher(collectionName: string) {
        const count = await connection.db().collection(collectionName).countDocuments();
        if (count > 0) {
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
              let voucherName: string;
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
                voucherName = 'Payment';
                debit = voucher.amount;
                credit = 0;
              }
              if (receiptCollections.includes(collectionName)) {
                voucherName = 'Receipt';
                credit = voucher.amount;
                debit = 0;
              }
              if (collectionName === 'cashdeposits') {
                credit = voucher.amount;
                debit = 0;
                voucherName = voucher.voucherName;
              }
              if (collectionName === 'cashwithdrawals') {
                debit = voucher.amount;
                credit = 0;
                voucherName = voucher.voucherName;
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
              const doc = {
                _id: voucher._id,
                branchId: voucher.branch.id,
                branchName: voucher.branch.name,
                date: voucher.date,
                refNo: voucher.refNo,
                fNo: 1,
                description: voucher.description,
                voucherNo: voucher.voucherNo,
                voucherName,
                voucherType: voucher.voucherType,
                createdBy: voucher.createdBy,
                updatedBy: voucher.updatedBy,
                createdAt: voucher.createdAt,
                updatedAt: voucher.updatedAt,
              };
              const _id = new Types.ObjectId();
              const trns = [
                {
                  _id,
                  accountId: partyAcc.id,
                  accountName: partyAcc.displayName,
                  accountType: partyAcc.type,
                  debit,
                  credit,
                },
                {
                  _id: new Types.ObjectId(),
                  accountId: cashAcc.id,
                  accountName: cashAcc.displayName,
                  accountType: cashAcc.type,
                  instNo: voucher.instNo,
                  instDate: voucher.instDate,
                  debit: credit,
                  credit: debit,
                },
              ];
              _.assign(doc, { trns });
              if (creditCollections.includes(collectionName)) {
                const acAdjs = pendings.filter((pending) => (pending.byPending === voucherPending) && (pending.byPending > pending.toPending))
                  .map((p) => {
                    return {
                      _id: new Types.ObjectId(),
                      accountId: partyAcc.id,
                      pendingId: _id.toHexString(),
                      amount: p.amount,
                    };
                  });
                _.assign(doc, { acAdjs });
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

      await accVoucher('customerpayments');
      await accVoucher('customerreceipts');
      await accVoucher('vendorpayments');
      await accVoucher('vendorreceipts');

      await accVoucher('accountreceipts');
      await accVoucher('accountpayments');
      await accVoucher('expenses');
      await accVoucher('incomes');

      await accVoucher('cashdeposits');
      await accVoucher('cashwithdrawals');

      console.log('journals Start');
      const journalsCount = await connection.db().collection('journals').countDocuments();
      if (journalsCount > 0) {
        const docs = [];
        const vouchers: any = await connection.db().collection('journals').find({}, { projection: { cashRegister: 0 } }).toArray();
        for (const voucher of vouchers) {
          const doc = {
            _id: voucher._id,
            branchId: voucher.branch.id,
            branchName: voucher.branch.name,
            date: voucher.date,
            refNo: voucher.refNo,
            fNo: 1,
            description: voucher.description,
            voucherNo: voucher.voucherNo,
            voucherName: 'Journal',
            voucherType: 'JOURNAL',
            createdBy: voucher.createdBy,
            updatedBy: voucher.updatedBy,
            createdAt: voucher.createdAt,
            updatedAt: voucher.updatedAt,
          };

          const trns = voucher.transactions.map((trn) => {
            const type = accounts.find(acc => trn.account.id === acc.id);
            return {
              _id: new Types.ObjectId(),
              accountId: trn.account.id,
              accountName: trn.account.displayName,
              accountType: type.type,
              debit: trn.debit,
              credit: trn.credit,
            }
          });
          _.assign(doc, { trns });
          docs.push(doc);
        }
        await connection.db().collection('vouchers').insertMany(docs);
      } else {
        console.log('No journals Found');
      }
      console.log('journals END');
      console.log('Account book collection name set as vouchers Start');

      const collNames = [
        'accountpayments',
        'accountreceipts',
        'cashdeposits',
        'cashwithdrawals',
        'customerreceipts',
        'customerpayments',
        'expenses',
        'incomes',
        'vendorpayments',
        'vendorreceipts',
        'journals',
      ];
      console.log('Account book set collectionName field value set as vouchers START...');
      const accBookstart = new Date().getTime();
      await connection.db().collection('accountbooks')
        .updateMany({ collectionName: { $in: collNames } }, { $set: { collectionName: 'vouchers' } });
      console.log(`Account book collection name set as vouchers END, DURATION ${new Date().getTime() - accBookstart}-ms`);

      async function purchaseVoucher(collectionName: string) {
        console.log(collectionName, 'START');
        const start = new Date().getTime();
        const limit = 1000;
        const count = await connection.db().collection(collectionName).find({ purchaseType: 'credit' }).count();
        if (count > 0) {
          for (let skip = 0; skip <= count; skip = skip + limit) {
            const start = new Date().getTime();
            const bulkOperation: any = connection.db().collection(collectionName).initializeOrderedBulkOp();
            const vouchers: any = await connection.db().collection(collectionName)
              .find({ purchaseType: 'credit' }, { projection: { acTrns: 1, vendorPending: 1, vendor: 1 }, sort: { _id: 1 }, skip, limit }).toArray();
            for (const voucher of vouchers) {
              const partyAcc = accounts.find(acc => voucher.vendor.id === acc.party);
              for (const item of voucher.acTrns) {
                if (item.account.defaultName === 'TRADE_PAYABLE') {
                  const acAdjs = pendings
                    .filter((pending) => (pending.byPending === voucher.vendorPending) && (pending.byPending > pending.toPending))
                    .map((p) => {
                      return { _id: new Types.ObjectId(), accountId: partyAcc.id, pendingId: item._id.toString(), amount: p.amount };
                    });
                  const acTrnsobj = {
                    updateOne: {
                      filter: { _id: voucher._id, acTrns: { $elemMatch: { 'account.defaultName': 'TRADE_PAYABLE' } } },
                      update: {
                        $set: {
                          acAdjs,
                          'acTrns.$[elm].account.id': partyAcc.id,
                          'acTrns.$[elm].account.name': partyAcc.name,
                          'acTrns.$[elm].account.displayName': partyAcc.displayName,
                        },
                      },
                      arrayFilters: [{ 'elm.account.defaultName': 'TRADE_PAYABLE' }],
                    },
                  };
                  bulkOperation.raw(acTrnsobj);
                }
              };
            }
            await bulkOperation.execute();
            const end = new Date().getTime();
            console.log(`Duration for ${collectionName}, ${skip} to ${limit + skip} was ${end - start}-ms`);
          }
        } else {
          console.log(`Credit ${collectionName} Not found`);
        }
        const end = new Date().getTime();
        console.log(`Total duration for ${collectionName} was  ${(end - start) / 1000}-sec`);
      }

      async function saleVoucher(collectionName: string) {
        const start = new Date().getTime();
        console.log(collectionName, 'START');
        const limit = 1000;
        const count = await connection.db().collection(collectionName).find({ saleType: 'credit' }).count();
        if (count > 0) {
          for (let skip = 0; skip <= count; skip = skip + limit) {
            const start = new Date().getTime();
            const bulkOperation: any = connection.db().collection(collectionName).initializeOrderedBulkOp();
            const vouchers: any = await connection.db().collection(collectionName)
              .find({ saleType: 'credit' }, { projection: { acTrns: 1, customerPending: 1, customer: 1 }, sort: { _id: 1 }, skip, limit }).toArray();
            for (const voucher of vouchers) {
              const partyAcc = accounts.find(acc => voucher.customer.id === acc.party);
              for (const item of voucher.acTrns) {
                if (item.account.defaultName === 'TRADE_RECEIVABLE') {
                  const acAdjs = pendings
                    .filter((pending) => (pending.byPending === voucher.customerPending) && (pending.byPending > pending.toPending))
                    .map((p) => {
                      return { _id: new Types.ObjectId(), accountId: partyAcc.id, pendingId: item._id.toString(), amount: p.amount };
                    });
                  const acTrnsobj = {
                    updateOne: {
                      filter: { _id: voucher._id, acTrns: { $elemMatch: { 'account.defaultName': 'TRADE_RECEIVABLE' } } },
                      update: {
                        $set: {
                          acAdjs,
                          'acTrns.$[elm].account.id': partyAcc.id,
                          'acTrns.$[elm].account.name': partyAcc.name,
                          'acTrns.$[elm].account.displayName': partyAcc.displayName,
                        },
                      },
                      arrayFilters: [{ 'elm.account.defaultName': 'TRADE_RECEIVABLE' }],
                    },
                  };
                  bulkOperation.raw(acTrnsobj);
                }
              };
            }
            await bulkOperation.execute();
            const end = new Date().getTime();
            console.log(`Duration for ${collectionName}, ${skip} to ${limit + skip} was ${end - start}-ms`);
          }
        } else {
          console.log(`Credit ${collectionName} Not found`);
        }
        const end = new Date().getTime();
        console.log(`Total duration for ${collectionName} was  ${(end - start) / 1000}-sec`);
      }

      await purchaseVoucher('purchases');
      await purchaseVoucher('purchase_returns');

      await saleVoucher('sales');
      await saleVoucher('sale_returns');

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
      const list = await connection.db().listCollections().toArray();
      for (const item of list) {
        for (const x of deleteCollectionList) {
          if (item.name === x) {
            console.log(`${item.name} collection deleted`);
            await connection.db().dropCollection(x);
          }
        };
      }
      await connection.close();
      return 'unnecessary collection dropped successfully';
    } catch (err) {
      console.log(err)
      return err.message;
    }
  }
}
