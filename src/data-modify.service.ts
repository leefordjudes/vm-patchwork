import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

import * as _ from 'lodash';

import { URI } from './config';

@Injectable()
export class DataModifyService {
  async price() {
    const connection = await new MongoClient(URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }).connect();
    if (!connection.isConnected) {
      return 'Connection failed';
    }
    const dbs = ['velavanstationery', 'velavanhm', 'ttgold', 'ttgoldpalace', 'auditplustech', 'ramasamy', 'velavanmedical', 'velavanmed', 'rkmedicals', 'testorg', 'omshakthi', 'praba'];
    for (const db of dbs) {
      console.log(`${db} started...`);
      const pipe = [
        {
          $addFields: {
            sDisc: { $cond: ['$sDisc', { mode: 'p', amount: '$sDisc' }, '$$REMOVE'] },
            costMargin: { $cond: ['$sMargin', { mode: 'p', amount: '$sMargin' }, '$$REMOVE'] },
          },
        },
        {
          $unset: 'sMargin',
        },
        {
          $out: { db, coll: 'inv_branch_details' },
        },
      ];
      await connection.db(db).collection('inv_branch_details').aggregate(pipe).toArray();
      const customerDiscs: any = await connection.db(db).collection('inv_branch_details')
        .find({ sCustomerDisc: { $exists: true } }, { projection: { sCustomerDisc: 1 } }).toArray();
      const updateArr = [];
      for (const disc of customerDiscs) {
        const sCustomerDisc = {};
        for (const key in disc.sCustomerDisc) {
          const obj = {
            mode: 'p',
            amount: disc.sCustomerDisc[key],
          };
          _.assign(sCustomerDisc, { [key]: obj });
        }
        const updateObj = {
          updateOne: {
            filter: { _id: disc._id },
            update: {
              $set: {
                sCustomerDisc,
              },
            },
          },
        };
        updateArr.push(updateObj);
      }
      if (updateArr.length > 0) {
        await connection.db(db).collection('inv_branch_details').bulkWrite(updateArr);
      }
      console.log(`${db} end...`);
    }
    console.log('All organizations priceConfig update sucessfully...');
    return 'All organizations priceConfig update sucessfully...';
  }
}
