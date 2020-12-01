import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

import { URI } from './config';

@Injectable()
export class Patch6Service {
  async discountConfig() {
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
      const inventoryUpdateObj = [];
      const inventories: any = await connection.db().collection('inventories').find(
        { priceConfig: { $exists: true } },
        { projection: { priceConfig: 1 } },
      ).toArray();
      console.log('Total inventory to patch: '+ inventories.length);
      console.log('3. inventory patch object generate start');
      for (const inv of inventories) {
        const sDiscount = {};
        if (inv?.priceConfig && Object.keys(inv.priceConfig).length) {
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
      }
      console.log('3a. inventory patch object generate end, Total patch Objects: '+inventoryUpdateObj.length);
      if (inventoryUpdateObj.length) {
        console.log('4. inventory patch start');
      var result = await connection
        .db()
        .collection('inventories')
        .bulkWrite(inventoryUpdateObj);
        console.log('--inventory patch done--');
      } else {
        console.log('No inventories patched');
      }
      
      console.log('Unset sDisc & priceConfig started');
      var unset = await connection
        .db()
        .collection('inventories').updateMany({}, { $unset: { sDisc: true, priceConfig: true } });
      console.log('$$$$$ Unset sDisk & priceConfig end $$$$');
    } catch (err) {
      console.log(err.message);
      return err;
    }
    try {
      await connection.db().dropCollection('daterestrictions');
      console.log('daterestrictions dropped');
    } catch (err) {
      console.log('daterestrictions collection not found');
    }
    try {
      await connection.db().dropCollection('dashboardconfigs');
      console.log('dashboardconfigs dropped');
    } catch (err) {
      console.log('dashboardconfigs collection not found');
    }
    await connection.close();
    return { result, unset };
  }
}
