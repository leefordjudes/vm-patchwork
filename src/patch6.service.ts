import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoClient } from 'mongodb';
import { Model } from 'mongoose';

import * as iface from './model/interfaces';
import { URI } from './config';

@Injectable()
export class Patch6Service {
  constructor(
    @InjectModel('Inventory')
    private readonly inventoryModel: Model<iface.Inventory>,
  ) {}
  async discountConfig() {
    try {
      console.log('1.connect to mongodb server using mongo client');
      const connection = await new MongoClient(URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }).connect();
      console.log('2. connected');
      const inventoryUpdateObj = [];

      const inventories = await this.inventoryModel.find(
        {},
        { _id: 1, sDisc: 1 },
      );
      console.log('3. inventory patch object generate start');
      for (const inv of inventories) {
        const priceConfigObj = [];
        for (const sd of inv.sDisc) {
          const obj = {
            pricingType: 'discount',
            branch: sd.branch,
            discount: { defaultDiscount: sd.ratio },
          };
          priceConfigObj.push(obj);
        }
        const updateObj = {
          updateMany: {
            filter: { _id: inv._id },
            update: {
              $set: {
                priceConfig: priceConfigObj,
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
      console.log('5');
      console.log('inventory patch done');

      const obj1 = {
        updateMany: {
          filter: {
            collectionName: { $in: ['m2stocktransfers', 'm1stocktransfers'] },
          },
          update: {
            $set: { collectionName: 'stock_transfers' },
          },
        },
      };
      const obj2 = {
        updateMany: {
          filter: {
            collectionName: {
              $in: ['m2stockadjustments', 'm1stockadjustments'],
            },
          },
          update: {
            $set: { collectionName: 'stock_adjustments' },
          },
        },
      };
      console.log('6. stock_transfers,stock_adjustments object generated');
      const accBooks = await connection
        .db()
        .collection('accountbooks')
        .bulkWrite([obj1, obj2]);
      console.log('7.accountbooks');
      const invBooks = await connection
        .db()
        .collection('inventorybooks')
        .bulkWrite([obj1, obj2]);
      console.log('8.inventorybooks');
      const branchBooks = await connection
        .db()
        .collection('branchbooks')
        .bulkWrite([obj1, obj2]);
      console.log('9.branchbooks');
      console.log('Books updated');

      await connection.close();
      return { result, accBooks, invBooks, branchBooks };
    } catch (err) {
      return err;
    }
  }
}
