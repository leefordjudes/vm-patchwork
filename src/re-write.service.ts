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

    function applyTransactions(data: any) {
      const trns = _.cloneDeep(data.trns);
      const accountBook = [];
      const record = {
        date: data.date,
        effDate: data.effDate ? data.effDate : data.date,
        act: data.act ? data.act : false,
        actHide: data.actHide ? data.actHide : false,
        isOpening: data.isOpening ? data.isOpening : false,
        refNo: data.refNo,
        voucherId: data.voucherId,
        voucherNo: data.voucherNo,
        voucherName: data.voucherName,
        voucherType: data.voucherType,
        updatedBy: data.updatedBy,
      };
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
          trns.filter(v => v.account.toString() === trn.account.toString() && v.refNo === trn.refNo && trn._id),
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
      console.log({ accountBook });
      return accountBook;
      // const records = accountBook.map(x => new this.db.accountTransactionModel(x));
      // await this.db.accountTransactionModel.insertMany(records);
    }
    async function purchase(db: string) {
      const count = await connection.db(db).collection('purchases').countDocuments();
      if (count > 0) {
        const limit = 500;
        const begin = new Date().getTime();
        for (let skip = 0; skip <= count; skip = skip + limit) {
          console.log({ organization: db, collectionName: 'purchases' });
          const start = new Date().getTime();
          const acTrnsbulkOperation = connection.db(db).collection('account_transactions').initializeOrderedBulkOp();
          const invTrnsbulkOperation = connection.db(db).collection('inventory_transactions').initializeOrderedBulkOp();
          const sttt = new Date().getTime();
          console.log(`bulkOperation initialzed Duration ${start - sttt}`);
          const vouchers: any = await connection.db(db).collection('purchases')
            .find({}).toArray();
          console.log(`get ${skip} to ${skip + limit} voucher duration ${new Date().getTime() - sttt}`);
          const afterGetVoucher = new Date().getTime();
          for (const voucher of vouchers) {
            const accountBookData = {
              trns: voucher.acTrns,
              date: voucher.date,
              act: false,
              // actHide: false,
              // isOpening: false,
              // refNo: voucher.refNo,
              voucherId: voucher._id,
              voucherNo: voucher.voucherNo,
              voucherName: voucher.voucherName,
              voucherType: voucher.voucherType,
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
          await acTrnsbulkOperation.execute();
        }
      }
    }
    const dbs = ['velavanmedical'];
    for (const db of dbs) {
      const collections = ['purchases'];
      for (const collection of collections) {
        // const count = await connection.db(db).collection(collection).countDocuments();
        // if (count > 0) {
        //   const limit = 500;
        //   const begin = new Date().getTime();
        //   for (let skip = 0; skip <= count; skip = skip + limit) {
        //     console.log({ organization: db, collection });
        //   }
        // } else {
        //   console.log(`No ${collection}`)
        // }
        console.log(db);
        await purchase(db);
      }
    }
  }
}
