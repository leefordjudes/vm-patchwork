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
      console.log('Unset sDisc & priceConfig started');
      const unset = await connection
        .db()
        .collection('inventories').updateMany({}, { $unset: { sDisc: true, priceConfig: true } });
      console.log('$$$$$ Unset sDisk & priceConfig end $$$$');

      const dateRestriction = [
        {
          "code": "001",
          "caption": "Today",
          "description": "Restrict user to Create & modify current day material conversion transactions only",
          "entity": "today",
          "category": "Material Conversion"
        },
        {
          "code": "002",
          "caption": "7 days",
          "description": "Restrict user to Create & modify past 7 days material conversion transactions",
          "entity": "past",
          "category": "Material Conversion"
        },
        {
          "code": "003",
          "caption": "30 days",
          "description": "Restrict user to Create & modify past 30 days material conversion transactions",
          "entity": "past",
          "category": "Material Conversion"
        },
        {
          "code": "004",
          "caption": "365 days",
          "description": "Restrict user to Create & modify past 365 days material conversion transactions",
          "entity": "past",
          "category": "Material Conversion"
        },
        {
          "code": "005",
          "caption": "All days",
          "description": "Restrict user to Create & modify all past days material conversion transactions",
          "entity": "past",
          "category": "Material Conversion"
        },
        {
          "code": "006",
          "caption": "7 days",
          "description": "Restrict user to Create & modify future 7 days material conversion transactions",
          "entity": "future",
          "category": "Material Conversion"
        },
        {
          "code": "007",
          "caption": "30 days",
          "description": "Restrict user to Create & modify future 30 days material conversion transactions",
          "entity": "future",
          "category": "Material Conversion"
        },
        {
          "code": "008",
          "caption": "365 days",
          "description": "Restrict user to Create & modify future 365 days material conversion transactions",
          "entity": "future",
          "category": "Material Conversion"
        },
        {
          "code": "009",
          "caption": "All days",
          "description": "Restrict user to Create & modify all future material conversion transactions",
          "entity": "future",
          "category": "Material Conversion"
        }
      ];
      const dateRestrictionResult = await connection
      .db()
      .collection('daterestrictions').insertMany(dateRestriction);
      console.log('daterestrictions record inserted');
      try {
        await connection.db().dropCollection('dashboardconfigs');
        console.log('dashboardconfigs dropped');
      } catch (err) {
        console.log('dashboardconfigs collection not found');
      }
      await connection.close();
      return { result, unset, dateRestrictionResult};
    } catch (err) {
      return err;
    }
  }
}
