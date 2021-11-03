import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

import * as _ from 'lodash';

import { DBS, URI } from './config';

@Injectable()
export class StockTransferIssueFixService {
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
      await connection.db(db).collection('inventory_transactions')
        .updateMany(
          { voucherName: 'Stock Transfer', createdAt: { $gt: new Date('2021-10-26T00:00:00.000+0000') }, batchNo: { $exists: false }, batch: { $exists: true }, $expr: { $ne: ['$batch', '$inventory'] } },
          { $unset: { batch: 1 } }
        );
        console.log(`${db} end...`);
    }
    console.log('All organizations update sucessfully...');
    return 'All organizations update sucessfully...';
  }
}
