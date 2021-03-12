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
      const customers: any = await connection.db().collection('customers').find({ _id: { $in: customerIds } }, { projection: { name: 1, contactInfo: 1 } }).toArray();

      const vendorPenddings: any = await connection.db().collection('vendorpendings').find({}, { projection: { vendor: 1 } }).toArray();
      const vendorIds = _.uniq(vendorPenddings.map((x) => x.vendor)).map((y: any) => Types.ObjectId(y));
      const vendors: any = await connection.db().collection('vendors').find({ _id: { $in: vendorIds } }, { projection: { name: 1, contactInfo: 1 } }).toArray();

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
        createdAt: new Date('2021-03-15T00:00:00.000+0000'),
        updatedAt: new Date('2021-03-15T00:00:00.000+0000'),
      };
      for (const item of customers) {
        const cust = {};
        _.assign(cust, {
          type: {
            name: 'Trade Receivable',
            defaultName: 'TRADE_RECEIVABLE'
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
      // console.log(createAccount);
      console.log('1.account creation end....');
      console.log('Merge pending collection start');
      await connection.db().collection('customerpendings').aggregate([
        {
          $lookup: {
            from: 'accounts',
            localField: 'customer',
            foreignField: 'party',
            as: 'acc',
          },
        },
        {
          $unwind: '$acc',
        },
        {
          $addFields: {
            accountType: 'TRADE_RECEIVABLE',
            accountId: { $toString: '$acc._id' },
            accountName: '$acc.name',
            branchId: '$branch',
          }
        },
        { $project: { acc: 0, adjusted: 0, branch: 0, closing: 0, customer: 0, customerName: 0 } },
        { $merge: { into: 'accountpendings' } },
      ]).toArray();
      console.log('customer pending finished');
      await connection.db().collection('vendorpendings').aggregate([
        {
          $lookup: {
            from: 'accounts',
            localField: 'vendor',
            foreignField: 'party',
            as: 'acc',
          },
        },
        {
          $unwind: '$acc',
        },
        {
          $addFields: {
            accountType: 'TRADE_PAYABLE',
            accountId: { $toString: '$acc._id' },
            accountName: '$acc.name',
            branchId: '$branch',
          }
        },
        { $project: { acc: 0, adjusted: 0, branch: 0, closing: 0, vendor: 0, vendorName: 0 } },
        { $merge: { into: 'accountpendings' } },
      ]).toArray();
      console.log('vendor pending finished');
      console.log('Merge vendor,customer pending finished and new collection as accountpendings');
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
          }
        },
        { $project: { _id: 0 } },
        { $merge: 'accountopenings_new' },
      ];
      await connection.db().collection('accountopenings').aggregate(accOpeningPipeLine).toArray();
      await connection.db().collection('customeropenings').aggregate(customerOpeningPipeLine).toArray();
      await connection.db().collection('vendoropenings').aggregate(vendorOpeningPipeLine).toArray();
      await connection.db().collection('accountopenings').rename('accountopenings_old');
      const accOpening = await connection.db().collection('accountopenings_new').rename('accountopenings');
      accOpening.createIndex({ accountId: 1 });
      accOpening.createIndex({ branchId: 1 });
      const limit = 1000;
      const openingCount = await connection.db().collection('accountopenings').countDocuments();
      if (openingCount > 0) {
        console.log('account_opening transactions patch object initialization started');
        const now = Date.now();
        for (let skip = 0; skip <= openingCount; skip = skip + limit) {
          const now1 = Date.now();
          const bulkOperation: any = connection.db().collection('accountopenings').initializeOrderedBulkOp();
          console.log({ skip, limit, openingCount });
          const openings: any = await connection.db()
            .collection('accountopenings').find({}, { projection: { trns: 1 }, sort: { _id: 1 }, skip, limit })
            .toArray();
          console.log('Records: ' + openings.length);
          for (const op of openings) {
            const trns = [];
            for (const trn of op.trns) {
              trns.push(_.assign(trn, { _id: new Types.ObjectId() }));
            }
            const io = {
              updateOne: {
                filter: { _id: op._id },
                update: {
                  $set: { trns, date, updatedAt: new Date('2021-03-15T00:00:00.000+0000') },
                },
              },

            };
            bulkOperation.raw(io);
          }
          console.log('account_opening transactions patch object initialized');
          console.log('account_opening transactions bulk execution start');
          var opResult = await bulkOperation.execute();
          console.log('bulk execution results are' + JSON.stringify(opResult));
          const delay1 = Date.now() - now1;
          console.log(`Slot execution time: ${delay1} milliseconds.`);
        }
        console.log('account_opening transactions patch finished');
        const delay = (Date.now() - now) / 60000;
        console.log(`Total execution time: ${delay} min.`);
      } else {
        console.log('No account openings found');
      }

      const pendings: any = await connection.db().collection('customerpendingadjustments').find({}, { projection: { _id: 0, __v: 0 } }).toArray();
      const accounts: any = await connection.db().collection('accounts').find({}, { projection: { party: 1, name: 1, type: 1 } }).toArray();
      console.log('1');
      const customerpaymentsCount = await connection.db().collection('customerpayments').countDocuments();
      if (customerpaymentsCount > 0) {
        const docs = [];
        const vouchers: any = await connection.db().collection('customerpayments').find({}, { projection: { cashRegister: 0 } }).toArray();
        for (const voucher of vouchers) {
          console.log(voucher);
          let doc = {
            _id: voucher._id,
            branchId: voucher.branch.id,
            branchName: voucher.branch.name,
            date: voucher.date,
            refNo: voucher.refNo,
            fNo: 1,
            description: voucher.description,
            voucherNo: voucher.voucherNo,
            voucherName: voucher.voucherName,
            voucherType: voucher.voucherType,
            createdBy: voucher.createdBy,
            updatedBy: voucher.updatedBy,
            createdAt: voucher.createdAt,
            updatedAt: voucher.updatedAt,
          };
          const partyAcc = accounts.find((party) => party.party === voucher.toAccount.id);
          const cashAcc = accounts.find((cash) => cash._id.toString() === voucher.byAccount.id);
          const trns = [
            {
              accountId: partyAcc._id.toString(),
              accountName: partyAcc.name,
              accountType: partyAcc.type.defaultName,
              pendingId: voucher.customerPending,
              debit: voucher.amount,
              credit: 0,
            },
            {
              accountId: cashAcc._id.toString(),
              accountName: cashAcc.name,
              accountType: cashAcc.type.defaultName,
              instNo: voucher.instNo,
              instDate: voucher.instDate,
              debit: 0,
              credit: voucher.amount,
            },
          ];
          _.assign(doc, { trns });
          const acAdjs = pendings.filter((pending) => (pending.byPending === voucher.customerPending) && (pending.byPending > pending.toPending)).map((p) => {
            return { accountId: partyAcc._id.toString(), pendingId: p.toPending, amount: p.amount };
          });
          console.log('2');
          _.assign(doc, { acAdjs });
          docs.push(doc);
        }
        await connection.db().collection('vouchers').insertMany(docs);
      } else {
        console.log('No Customer Payment Found');
      }
      console.log('3');
      const customerreceiptsCount = await connection.db().collection('customerreceipts').countDocuments();
      if (customerreceiptsCount > 0) {
        const docs = [];
        const vouchers: any = await connection.db().collection('customerreceipts').find({}, { projection: { cashRegister: 0 } }).toArray();
        console.log('4');
        for (const voucher of vouchers) {
          let doc = {
            _id: voucher._id,
            branchId: voucher.branch.id,
            branchName: voucher.branch.name,
            date: voucher.date,
            refNo: voucher.refNo,
            fNo: 1,
            description: voucher.description,
            voucherNo: voucher.voucherNo,
            voucherName: voucher.voucherName,
            voucherType: voucher.voucherType,
            createdBy: voucher.createdBy,
            updatedBy: voucher.updatedBy,
            createdAt: voucher.createdAt,
            updatedAt: voucher.updatedAt,
          };
          const partyAcc = accounts.find((party) => party.party === voucher.toAccount.id);
          const cashAcc = accounts.find((cash) => cash._id.toString() === voucher.byAccount.id);
          const trns = [
            {
              accountId: partyAcc._id.toString(),
              accountName: partyAcc.name,
              accountType: partyAcc.type.defaultName,
              pendingId: voucher.customerPending,
              debit: 0,
              credit: voucher.amount,
            },
            {
              accountId: cashAcc._id.toString(),
              accountName: cashAcc.name,
              accountType: cashAcc.type.defaultName,
              instNo: voucher.instNo,
              instDate: voucher.instDate,
              debit: voucher.amount,
              credit: 0,
            },
          ];
          _.assign(doc, { trns });
          const acAdjs = pendings.filter((pending) => (pending.byPending === voucher.customerPending) && (pending.byPending > pending.toPending)).map((p) => {
            return { accountId: partyAcc._id.toString(), pendingId: p.toPending, amount: p.amount };
          });
          _.assign(doc, { acAdjs });
          docs.push(doc);
        }
        await connection.db().collection('vouchers').insertMany(docs);
      } else {
        console.log('No Customer receipt Found');
      }

      const vendorpaymentsCount = await connection.db().collection('vendorpayments').countDocuments();
      if (vendorpaymentsCount > 0) {
        const docs = [];
        const vouchers: any = await connection.db().collection('vendorpayments').find({}, { projection: { cashRegister: 0 } }).toArray();
        for (const voucher of vouchers) {
          console.log(voucher);
          let doc = {
            _id: voucher._id,
            branchId: voucher.branch.id,
            branchName: voucher.branch.name,
            date: voucher.date,
            refNo: voucher.refNo,
            fNo: 1,
            description: voucher.description,
            voucherNo: voucher.voucherNo,
            voucherName: voucher.voucherName,
            voucherType: voucher.voucherType,
            createdBy: voucher.createdBy,
            updatedBy: voucher.updatedBy,
            createdAt: voucher.createdAt,
            updatedAt: voucher.updatedAt,
          };
          const partyAcc = accounts.find((party) => party.party === voucher.toAccount.id);
          const cashAcc = accounts.find((cash) => cash._id.toString() === voucher.byAccount.id);
          const trns = [
            {
              accountId: partyAcc._id.toString(),
              accountName: partyAcc.name,
              accountType: partyAcc.type.defaultName,
              pendingId: voucher.customerPending,
              debit: voucher.amount,
              credit: 0,
            },
            {
              accountId: cashAcc._id.toString(),
              accountName: cashAcc.name,
              accountType: cashAcc.type.defaultName,
              instNo: voucher.instNo,
              instDate: voucher.instDate,
              debit: 0,
              credit: voucher.amount,
            },
          ];
          _.assign(doc, { trns });
          const acAdjs = pendings.filter((pending) => (pending.byPending === voucher.customerPending) && (pending.byPending > pending.toPending)).map((p) => {
            return { accountId: partyAcc._id.toString(), pendingId: p.toPending, amount: p.amount };
          });
          console.log('2');
          _.assign(doc, { acAdjs });
          docs.push(doc);
        }
        await connection.db().collection('vouchers').insertMany(docs);
      } else {
        console.log('No Vendor Payment Found');
      }
      console.log('3');
      const vendorreceiptsCount = await connection.db().collection('vendorreceipts').countDocuments();
      if (vendorreceiptsCount > 0) {
        const docs = [];
        const vouchers: any = await connection.db().collection('vendorreceipts').find({}, { projection: { cashRegister: 0 } }).toArray();
        console.log('4');
        for (const voucher of vouchers) {
          let doc = {
            _id: voucher._id,
            branchId: voucher.branch.id,
            branchName: voucher.branch.name,
            date: voucher.date,
            refNo: voucher.refNo,
            fNo: 1,
            description: voucher.description,
            voucherNo: voucher.voucherNo,
            voucherName: voucher.voucherName,
            voucherType: voucher.voucherType,
            createdBy: voucher.createdBy,
            updatedBy: voucher.updatedBy,
            createdAt: voucher.createdAt,
            updatedAt: voucher.updatedAt,
          };
          const partyAcc = accounts.find((party) => party.party === voucher.toAccount.id);
          const cashAcc = accounts.find((cash) => cash._id.toString() === voucher.byAccount.id);
          const trns = [
            {
              accountId: partyAcc._id.toString(),
              accountName: partyAcc.name,
              accountType: partyAcc.type.defaultName,
              pendingId: voucher.customerPending,
              debit: 0,
              credit: voucher.amount,
            },
            {
              accountId: cashAcc._id.toString(),
              accountName: cashAcc.name,
              accountType: cashAcc.type.defaultName,
              instNo: voucher.instNo,
              instDate: voucher.instDate,
              debit: voucher.amount,
              credit: 0,
            },
          ];
          _.assign(doc, { trns });
          const acAdjs = pendings.filter((pending) => (pending.byPending === voucher.customerPending) && (pending.byPending > pending.toPending)).map((p) => {
            return { accountId: partyAcc._id.toString(), pendingId: p.toPending, amount: p.amount };
          });
          _.assign(doc, { acAdjs });
          docs.push(doc);
        }
        await connection.db().collection('vouchers').insertMany(docs);
      } else {
        console.log('No Vendor Receipt Found');
      }

      const collNames = [
        'customerreceipts',
        'customerpayments',
        'accountpayments',
        'accountreceipts',
        'cashdeposits',
        'cashwithdrawals',
        'expenses',
        'incomes',
        'vendorpayments',
        'vendorreceipts',
      ];
      console.log('5');
      const accBook = await connection.db().collection('accountbooks')
        .updateMany({ collectionName: { $in: collNames } }, { $set: { collectionName: 'vouchers' } });
      // DELETE COLLECTIONS
      // await connection.db().collection('accountopenings_old').drop();
      // await connection.db().collection('accountpayments').drop();
      // await connection.db().collection('accountreceipts').drop();
      // await connection.db().collection('accountpayments').drop();
      // await connection.db().collection('accountopenings_old').drop();
      // await connection.db().collection('accountpayments').drop();

      // await connection.db().collection('customeropenings').drop();
      // await connection.db().collection('customerbooks').drop();
      // await connection.db().collection('customerpayments').drop();

      // await connection.db().collection('customerpendingadjustments').drop();
      // await connection.db().collection('customerpendings').drop();
      // await connection.db().collection('customerreceipts').drop();
      // await connection.db().collection('customeropenings').drop();

      // await connection.db().collection('accountpayments').drop();
      // await connection.db().collection('customeropenings').drop();
      // await connection.db().collection('customerbooks').drop();
      // await connection.db().collection('customeropenings').drop();  
      await connection.close();
      return 'OK';
    } catch (err) {
      return false;
    }
  }
}
