import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

import { URI } from './config';
import { round } from './utils/utils';

@Injectable()
export class Patch7Service {
  async stockTranfer() {
    try {
      console.log('1.connect to mongodb server using mongo client');
      var connection = await new MongoClient(URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }).connect();
      console.log('2. connected');
    } catch (err) {
      console.log(err.message);
      return err;
    }
    try {
      const stockTransferUpdateObj = [];
      const accountBookUpdateObj = [];
      const branchBookUpdateObj = [];
      const stockTranfers: any = await connection.db()
        .collection('stock_transfers').find({}, { projection: { acTrns: 1, branch: 1, targetBranch: 1, amount: 1, approved: 1 } })
        .toArray();
      console.log('Total stock transfer to patch: ' + stockTranfers.length);
      console.log('3. stock transfer patch object generate start');
      for (const st of stockTranfers) {
        const voucherId = st._id.toString();
        // const sourceBranch = st.branch.id;
        // const targetBranch = st.targetBranch.id;
        const amount = round(st.amount);
        const stUpdateObj1 = {
          updateMany: {
            filter: { _id: st._id, acTrns: { $elemMatch: { 'account.name': 'Branch Payable', 'debit': { $gt: 0 } } } },
            update: {
              $set: { 'acTrns.$[elm].debit': amount },
            },
            arrayFilters: [{ 'elm.debit': { $gt: 0 }, 'elm.account.name': 'Branch Payable' }],
          },
        };
        stockTransferUpdateObj.push(stUpdateObj1);
        const stUpdateObj2 = {
          updateMany: {
            filter: { _id: st._id, acTrns: { $elemMatch: { 'account.name': 'Branch Payable', 'credit': { $gt: 0 } } } },
            update: {
              $set: { 'acTrns.$[elm].credit': amount },
            },
            arrayFilters: [{ 'elm.credit': { $gt: 0 }, 'elm.account.name': 'Branch Payable' }],
          },
        };
        if (st.approved) {
          stockTransferUpdateObj.push(stUpdateObj2);
        }
        const bookUpdateObj1 = {
          updateMany: {
            filter: { voucherId, accountName: 'Branch Payable', debit: { $gt: 0 } },
            update: {
              $set: { debit: amount },
            },
          },
        };
        const bookUpdateObj2 = {
          updateMany: {
            filter: { voucherId, accountName: 'Branch Payable', credit: { $gt: 0 } },
            update: {
              $set: { credit: amount },
            },
          },
        };
        accountBookUpdateObj.push(bookUpdateObj1);
        accountBookUpdateObj.push(bookUpdateObj2);
        const branchUpdateObj1 = {
          updateMany: {
            filter: { voucherId, debit: { $gt: 0 } },
            update: {
              $set: { debit: amount },
            },
          },
        };
        const branchUpdateObj2 = {
          updateMany: {
            filter: { voucherId, credit: { $gt: 0 } },
            update: {
              $set: { credit: amount },
            },
          },
        };
        branchBookUpdateObj.push(branchUpdateObj1);
        branchBookUpdateObj.push(branchUpdateObj2);
      }
      console.log('3. stock_transfers patch object generate end, Total patch Objects: ' + stockTransferUpdateObj.length);
      if (stockTransferUpdateObj.length > 0) {
        console.log('stock_transfers patch start');
        var result = await connection
          .db()
          .collection('stock_transfers')
          .bulkWrite(stockTransferUpdateObj);
        console.log('--stock_transfers patch done--');
      } else {
        console.log('No stock_transfers patched');
      }
      console.log('4 accountbooks patch object generate end, Total patch Objects: ' + accountBookUpdateObj.length);
      if (accountBookUpdateObj.length > 0) {
        console.log('account patch start');
        var accBook = await connection.db().collection('accountbooks')
          .bulkWrite(accountBookUpdateObj);
        console.log('--account book patch done--');
      } else {
        console.log('No account book patched');
      }
      console.log('5 branchbooks patch object generate end, Total patch Objects: ' + branchBookUpdateObj.length);
      if (branchBookUpdateObj.length > 0) {
        console.log('branch book patch start');
        var brBook = await connection.db().collection('branchbooks')
          .bulkWrite(branchBookUpdateObj);
        console.log('--branch book patch done--');
      } else {
        console.log('No branch book patched');
      }
    } catch (err) {
      console.log(err.message);
      return err;
    }
    await connection.close();
    return { result, accBook, brBook };
  }
}
