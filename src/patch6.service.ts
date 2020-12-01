import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

import { URI } from './config';

@Injectable()
export class Patch6Service {
  async discountConfig() {
    try {
      console.log('1.connect to mongodb server using mongo client');
      const connection = await new MongoClient(URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }).connect();
      console.log('2. connected');
      const inventoryUpdateObj = [];
      const inventories: any = await connection.db().collection('inventories').find(
        {},
        { projection: { priceConfig: 1 } },
      ).toArray();
      console.log('3. inventory patch object generate start');
      for (const inv of inventories) {
        console.log(inv)
        const sDiscount = {};
        for (const sd of inv.priceConfig) {
          sDiscount[sd.branch] = { ratio: sd.discount.defaultDiscount, cRatio: null };
        }
        const updateObj = {
          updateMany: {
            filter: { _id: inv._id },
            update: {
              $set: {
                sDiscount, sMargin: null,
              },
            },
          },
        };
        inventoryUpdateObj.push(updateObj);
      }
      console.log('3a. inventory patch object generate end');
      console.log('4. inventory patch start');
      const result = await connection
        .db()
        .collection('inventories')
        .bulkWrite(inventoryUpdateObj);
      console.log('--inventory patch done--');
      console.log('Unset sDisk & priceConfig started');
      const unset = await connection
        .db()
        .collection('inventories').updateMany({}, { $unset: { sDisk: true, priceConfig: true } });
      console.log('$$$$$ Unset sDisk & priceConfig end $$$$');
      try {
        await connection.db().dropCollection('dashboardconfigs');
        console.log('dashboardconfigs dropped');
      } catch (err) {
        console.log('dashboardconfigs collection not found');
      }
      await connection.close();
      return { result, unset };
    } catch (err) {
      return err;
    }
  }
}
