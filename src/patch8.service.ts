import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

import { URI } from './config';

@Injectable()
export class Patch8Service {
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
      console.log('-----sale patch start----');
      await connection.db()
        .collection('sales').aggregate([
          { $match: { saleType: 'cash' } },
          { $set: { cashAmount: '$amount' } },
          { $merge: 'sales' },
        ]).toArray();
      await connection.db()
        .collection('sales').aggregate([
          { $match: { saleType: 'credit' } },
          { $set: { creditAmount: '$amount' } },
          { $merge: 'sales' },
        ]).toArray();
      await connection.db()
        .collection('sales').updateMany({}, { $unset: { cashRegisterApproved: true } });
      console.log('-----sale patch end----');

      console.log('-----sale-return patch start----');
      await connection.db()
        .collection('sale_returns').aggregate([
          { $match: { saleType: 'cash' } },
          { $set: { cashAmount: '$amount' } },
          { $merge: 'sale_returns' },
        ]).toArray();
      await connection.db()
        .collection('sale_returns').aggregate([
          { $match: { saleType: 'credit' } },
          { $set: { creditAmount: '$amount' } },
          { $merge: 'sale_returns' },
        ]).toArray();
      console.log('-----sale-return patch end----');

      console.log('-----purchases patch start----');
      await connection.db()
        .collection('purchases').aggregate([
          { $match: { purchaseType: 'cash' } },
          { $set: { cashAmount: '$amount' } },
          { $merge: 'purchases' },
        ]).toArray();
      await connection.db()
        .collection('purchases').aggregate([
          { $match: { purchaseType: 'credit' } },
          { $set: { creditAmount: '$amount' } },
          { $merge: 'purchases' },
        ]).toArray();
      console.log('-----purchases patch end----');

      console.log('-----purchase-returns patch start----');
      await connection.db()
        .collection('purchase_returns').aggregate([
          { $match: { purchaseType: 'cash' } },
          { $set: { cashAmount: '$amount' } },
          { $merge: 'purchase_returns' },
        ]).toArray();
      await connection.db()
        .collection('purchase_returns').aggregate([
          { $match: { purchaseType: 'credit' } },
          { $set: { creditAmount: '$amount' } },
          { $merge: 'purchase_returns' },
        ]).toArray();
      console.log('-----purchase-returns patch end----');

      const cashBookObj1 = {
        updateMany: {
          filter: { voucherName: 'Customer Receipt' },
          update: { $set: { voucherType: 'RECEIPT' } }
        }
      }
      const cashBookObj2 = {
        updateMany: {
          filter: { voucherName: 'Cash Transfer' },
          update: { $set: { voucherType: 'JOURNAL' } }
        }
      }
      console.log('-----cashregister books patch start----');
      await connection.db().collection('cashregisterbooks')
        .bulkWrite([cashBookObj1, cashBookObj2]);
      console.log('-----cashregister books patch END----');

    } catch (err) {
      console.log(err.message);
      return err;
    }
    await connection.close();
    return { message: 'patched sucessfully' };
  }
}
