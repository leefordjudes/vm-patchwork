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
  ) { }
  async discountConfig() {
    try {
      const connection = await new MongoClient(URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }).connect();

      const inventoryUpdateObj = [];

      const inventories = await this.inventoryModel.find({}, { _id: 1, sDisc: 1 });
      for (const inv of inventories) {
        for (const sd of inv.sDisc) {
          const updateObj = {
            updateMany: {
              filter: { _id: inv._id },
              update: {
                $addToSet: {
                  priceConfig: { pricingType: 'discount', branch: sd.branch, discount: { defaultDiscount: sd.ratio } }
                },
              },
            },
          };
          inventoryUpdateObj.push(updateObj);
        }
      }
      const result = await connection
        .db()
        .collection('inventories')
        .bulkWrite(inventoryUpdateObj);
      console.log('inventory patch done');

      const obj1 = {
        updateMany: {
          filter: { collectionName: { $in: ['m2stocktransfers', 'm1stocktransfers'] } },
          update: {
            $set: { collectionName: 'stock_transfers' },
          },
        },
      };
      const obj2 = {
        updateMany: {
          filter: { collectionName: { $in: ['m2stockadjustments', 'm1stockadjustments'] } },
          update: {
            $set: { collectionName: 'stock_adjustments' },
          },
        },
      };
      const accBooks = await connection.db().collection('accountbooks').bulkWrite([obj1, obj2]);
      const invBooks = await connection.db().collection('inventorybooks').bulkWrite([obj1, obj2]);
      const branchBooks = await connection.db().collection('branchbooks').bulkWrite([obj1, obj2]);
      console.log('Books updated');

      await connection.close();
      return {result, accBooks, invBooks, branchBooks};
    } catch (err) {
      return err;
    }
  }
}
