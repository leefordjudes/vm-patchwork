import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

import * as _ from 'lodash';

import { URI } from './config';

const collectionName = 'inventories';
@Injectable()
export class DataModifyService {
  async barcode() {
    const connection = await new MongoClient(URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }).connect();
    if (!connection.isConnected) {
      return 'Connection failed';
    }

    const dbs = ['velavanstationery', 'velavanhm', 'ttgold', 'ttgoldpalace', 'auditplustech', 'ramasamy', 'velavanmedical', 'velavanmed', 'rkmedicals', 'testorg', 'omshakthi'];
    // const dbs = ['velavanstationery'];
    for (const db of dbs) {
      console.log(`${db} STARTED...`);
      console.log(`${db} inventories barcode update started...`);
      const pipeLine = [
        {
          $addFields: {
            barcodes: { $cond: ['$barcode', ['$barcode'], '$$REMOVE'] },
          },
        },
        {
          $unset: 'barcode',
        },
        {
          $out: collectionName,
        }
      ];
      await connection.db(db).collection(collectionName).aggregate(pipeLine).toArray();
      console.log(`${db} inventories barcode update end...`);
    }
    console.log('All organizations tax-sum update sucessfully...');
    return 'All organizations tax-sum update sucessfully...';
  }
}
