import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

import * as _ from 'lodash';

import { URI } from './config';

const collectionName = 'inventory_transactions';
@Injectable()
export class DataModifyService {
  async contact() {
    const connection = await new MongoClient(URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }).connect();
    if (!connection.isConnected) {
      return 'Connection failed';
    }

    async function writeBook(db: string, collection: string, party: string) {
      const partyId = `${party}Id`;
      console.log({ db, collection }, `update started...`);
      const vouchers = await connection.db(db).collection(collection).find({ [party]: { $exists: true } }, { projection: { [party]: 1, _id: 1 } }).toArray();
      const bulk = connection.db(db).collection(collectionName).initializeOrderedBulkOp();
      for (const voucher of vouchers) {
        if (voucher[party]) {
          bulk.find({ voucherId: voucher._id }).update({ $set: { [partyId]: voucher[party] } });
        }
      }
      if (vouchers.length > 0) {
        await bulk.execute();
        vouchers.length = 0;
      }
      console.log({ db, collection }, `update end ***`);
    }

    const dbs = ['velavanstationery', 'velavanhm', 'ttgold', 'ttgoldpalace', 'auditplustech', 'ramasamy', 'velavanmedical', 'velavanmed', 'rkmedicals', 'testorg', 'omshakthi'];
    // const dbs = ['velavanmedical'];
    for (const db of dbs) {
      console.log(`${db} STARTED...`);
      const collectionArr = [
        { collectionName: 'sales', party: 'customer' },
        { collectionName: 'purchases', party: 'vendor' },
      ];
      for (const coll of collectionArr) {
        await writeBook(db, coll.collectionName, coll.party);
      }
      console.log(`${db} END****`);
    }
    console.log('All organizations inventory_transactions partyId update sucessfully...');
    return 'All organizations inventory_transactions partyId update sucessfully...';
  }
}
