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
      const inventories = await connection.db(db).collection(collectionName).find({ barcode: { $exists: true } }, { projection: { barcode: 1, _id: 1 } }).toArray();
      const arr = [];
      for (const inv of inventories) {
        if (inv.barcode) {
          const obj = {
            updateOne: {
              filter: { _id: inv._id },
              update: {
                $set: { barcodes: [inv.barcode] },
              },
            },
          };
          arr.push(obj);
        }
      }
      if (arr.length > 0) {
        await connection.db(db).collection(collectionName).bulkWrite(arr);
      }
      await connection.db(db).collection(collectionName).updateMany({ barcode: { $exists: true } }, { $unset: { barcode: 1 } });
      try {
        await connection.db(db).collection(collectionName).dropIndex('barcode_1');
        console.log('barcode index dropped from inventories');
      } catch (err) {
        console.log('barcode index not found from inventories');
      }
      console.log(`${db} inventories barcode update end...`);
    }
    console.log('All organizations inventories barcode update sucessfully...');
    return 'All organizations inventories barcode update sucessfully...';
  }
}
