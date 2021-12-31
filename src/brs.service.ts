import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

import * as _ from 'lodash';

import { DBS, URI } from './config';

@Injectable()
export class BankReconciliationStatementService {
  async patch() {
    const connection = await new MongoClient(URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }).connect();
    if (!connection.isConnected) {
      return 'Connection failed';
    }
    const accTypes = ['BANK_ACCOUNT', 'BANK_OD_ACCOUNT'];
    async function bank_transactions(db: string, collection: string) {
      const bulkOperation = connection.db(db).collection('bank_transactions').initializeOrderedBulkOp();
      const vouchers = await connection.db(db).collection(collection)
        .find(
          { acTrns: { $elemMatch: { accountType: { $in: accTypes } } } },
          { projection: { _id: 1, branch: 1, acTrns: 1, date: 1, voucherName: 1, voucherType: 1, voucherNo: 1 } })
        .toArray();
      const voucherLength = vouchers.length;
      // let i = 0;
      if (voucherLength > 0) {
        console.log(`${db} - ${collection} Operation initialize started...`);
        for (const voucher of vouchers) {
          // console.log(`${db} - ${collection} voucher ${++i} of ${voucherLength}`);
          const acTrns = voucher.acTrns as any[];
          const crAlt = _.maxBy(acTrns, 'debit');
          const drAlt = _.maxBy(acTrns, 'credit');
          for (const acTrn of acTrns.filter(x => accTypes.includes(x.accountType))) {
            const initialDoc = {
              _id: acTrn._id,
              date: voucher.date,
              branch: voucher.branch,
              bankDate: voucher.date,
              account: acTrn.account,
              partyAccount: collection === 'account_openings' ? undefined : acTrn.chequeDetail?.partyAccount ?? acTrn.credit > 0 ? crAlt.account : drAlt.account,
              instNo: acTrn.chequeDetail?.instNo,
              instDate: acTrn.chequeDetail?.instDate,
              inFavourOf: acTrn.chequeDetail?.inFavourOf,
              accountType: acTrn.accountType,
              debit: acTrn.debit,
              credit: acTrn.credit,
              voucherId: collection === 'account_openings' ? undefined : voucher._id,
              voucherNo: voucher.voucherNo,
              voucherName: voucher.voucherName,
              voucherType: voucher.voucherType,
            };
            const doc = _.pickBy(initialDoc, (key) => key !== null && key !== undefined && key !== '');
            bulkOperation.insert(doc);
          }
        }
        vouchers.length = 0;
        console.log(`${db} - ${collection} Operation initialize End...`);
        console.log(`${db} - ${collection} execute started...`);
        await bulkOperation.execute();
        console.log(`${db} - ${collection} execute end...`);
      } else {
        console.log(`${db} - ${collection} not found...`);
      }
    }
    for (const db of DBS) {
      console.log(`${db} - started`);
      const collections = ['account_openings', 'vouchers', 'sales', 'purchases'];
      for (const collection of collections) {
        await bank_transactions(db, collection);
      }
      console.log(`${db} - end`);
    }
    console.log('All organizations bank_transactions created successfully');
    return 'All organizations bank_transactions created successfully';
  }
}
