import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import * as _ from 'lodash';

import { URI } from './config';
import { round } from './utils/utils';

@Injectable()
export class RoughService {

  async update() {
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
      const updateArray = [];
      const invs: any = await connection.db().collection('inventories')
        .find({}, { projection: { name: 1, precision: 1 } }).toArray();
      const branches: any = await connection.db().collection('branches')
        .find({}, { projection: { name: 1 } }).toArray();
      const invOpenings: any = await connection.db().collection('inventory_openings')
        .find({}, { projection: { pRate: 1, qty: 1, branch: 1, inventory: 1 } }).toArray();
      const user = await connection.db().collection('users')
        .findOne({});
      const obj1 = {
        updateMany: {
          filter: {},
          update: {
            $set: {
              updatedBy: user._id.toString(),
              updatedAt: new Date('2021-02-01T00:00:00.000+0000'),
              date: new Date('2020-03-31T00:00:00.000+0000'),
            },
          },
        },
      };
      updateArray.push(obj1);
      for (const invOps of invOpenings) {
        const branchName = branches.find((branch: any) => branch._id.toString() === invOps.branch).name;
        const inventory = invs.find((inv: any) => inv._id.toString() === invOps.inventory);
        const obj2 = {
          updateOne: {
            filter: { _id: invOps._id },
            update: {
              $set: {
                assertAmt: round(invOps.pRate * invOps.qty),
                inventoryName: inventory.name,
                branchName,
                unitPrecision: inventory.precision,
              },
            },
          },
        };
        updateArray.push(obj2);
      }
      const result = await connection.db().collection('inventory_openings')
        .bulkWrite(updateArray);
      return result;
    }
    catch (err) {
      return err;
    }
  }
}
