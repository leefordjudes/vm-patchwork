import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import * as _ from 'lodash';

import { URI } from './config';

@Injectable()
export class ReWriteService {
  async reWrite() {
    const connection = await new MongoClient(URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }).connect();
    if (connection.isConnected()) {
      function applyTransactions(data: any) {
        const trns = _.cloneDeep(data.trns);
        const accountBook = [];
        const record = {
          date: data.date,
          effDate: data.effDate ? data.effDate : data.date,
          act: false,
          actHide: false,
          isOpening: data.isOpening ? data.isOpening : false,
          voucherId: data.voucherId,
          voucherNo: data.voucherNo,
          voucherName: data.voucherName,
          voucherType: data.voucherType,
          updatedBy: data.updatedBy,
        };
        if (data.refNo) {
          _.assign(record, { refNo: data.refNo });
        }
        const crAlt: any = _.maxBy(
          trns.filter(x => x.accountType !== 'STOCK'),
          'debit',
        );
        const drAlt: any = _.maxBy(
          trns.filter(x => x.accountType !== 'STOCK'),
          'credit',
        );
        for (const trn of trns) {
          const opening = _.reduce(
            trns.filter(v => v.account.toString() === trn.account.toString() && trn._id),
            (s, x) => s + x.debit - x.credit,
            0,
          );
          for (const adj of trn?.adjs || []) {
            if (adj.amount !== 0) {
              const adjObj = {
                account: trn.account,
                accountType: trn.accountType,
                branch: trn.branch,
                credit: trn.credit > 0 ? Math.abs(adj.amount) : 0,
                debit: trn.debit > 0 ? adj.amount : 0,
                altAccount: trn.credit > 0 ? crAlt.account ?? undefined : drAlt.account ?? undefined,
              };
              if (trn._id) {
                _.assign(adjObj, { pending: trn._id, adjPending: adj.pending, opening });
              }
              accountBook.push(_.assign({}, record, adjObj));
            }
            trn.debit = trn.debit > 0 ? trn.debit - adj.amount : trn.debit;
            trn.credit = trn.credit > 0 ? trn.credit - Math.abs(adj.amount) : trn.credit;
          }
          if (trn.credit !== 0 || trn.debit !== 0) {
            const obj = {
              account: trn.account,
              accountType: trn.accountType,
              branch: trn.branch,
              credit: trn.credit,
              debit: trn.debit,
              altAccount: trn.credit > 0 ? crAlt.account ?? undefined : drAlt.account ?? undefined,
            };
            if (trn._id) {
              _.assign(obj, { pending: trn._id, adjPending: trn._id, opening });
            }
            accountBook.push(_.assign({}, record, obj));
          }
        }
        return accountBook;
      }

      async function reWriteVouchers(db: string, collection: string) {
        const count = await connection.db(db).collection(collection).countDocuments();
        if (count > 0) {
          const limit = 500;
          for (let skip = 0; skip <= count; skip = skip + limit) {
            console.log({ organization: db, collectionName: collection });
            const start = new Date().getTime();
            const acTrnsbulkOperation = connection.db(db).collection('account_transactions').initializeOrderedBulkOp();
            const sttt = new Date().getTime();
            console.log(`bulkOperation initialzed Duration ${start - sttt}`);
            const vouchers: any = await connection.db(db).collection(collection)
              .find({}, { sort: { _id: 1 }, skip, limit }).toArray();
            console.log(`get ${skip} to ${skip + limit} voucher duration ${new Date().getTime() - sttt}`);
            for (const voucher of vouchers) {
              const accountBookData = {
                trns: voucher.acTrns,
                date: voucher.date,
                act: false,
                actHide: false,
                isOpening: false,
                voucherId: voucher._id,
                voucherNo: voucher.voucherNo,
                voucherName: voucher.voucherName,
                voucherType: voucher.voucherType,
                createdBy: voucher.createdBy,
                updatedBy: voucher.updatedBy,
              };
              if (voucher.refNo) {
                _.assign(accountBookData, { refNo: voucher.refNo })
              }
              const acTrns = applyTransactions(accountBookData);
              for (const doc of acTrns) {
                acTrnsbulkOperation.insert(doc);
              }
            }
            console.log(`insert started for  ${skip} to ${skip + limit}`);
            const startTime = new Date().getTime();
            await acTrnsbulkOperation.execute();
            console.log(`insert ended for  ${skip} to ${skip + limit}`);
            console.log(`Duration for ${skip} to ${skip + limit} was ${(new Date().getTime() - startTime) / 1000}-sec`)
          }
        }
      }
      const dbs = ['velavanmedical'];
      for (const db of dbs) {
        const collections = ['vouchers'];
        for (const collection of collections) {
          await reWriteVouchers(db, collection);
        }
      }
      return 're-write completed';
    } else {
      return 'connection failed';
    }
  }
}
