import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import * as _ from 'lodash';

import { URI } from './config';
import { round } from './utils/utils';
import { Types } from 'mongoose';

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
      const assetAccount: any = await connection.db().collection('accounts')
        .findOne({ defaultName: 'INVENTORY_ASSET' });
      const user = await connection.db().collection('users')
        .findOne({});
      const aggregate = await connection.db().collection('inventory_openings').aggregate([
        {
          $addFields: {
            inventoryId: {
              $toObjectId: '$inventory'
            }
          }
        },
        {
          $lookup: {
            from: 'inventories',
            localField: 'inventoryId',
            foreignField: '_id',
            as: 'inventoryArr'
          }
        },
        {
          $unwind: {
            path: '$inventoryArr'
          }
        },
        {
          $addFields: {
            primaryUnit: [
              {
                unit: '$inventoryArr.unit',
                conversion: 1
              }
            ],
            unitConversion: '$inventoryArr.unitConversion',
            unitId: {
              $toObjectId: '$unit.id'
            }
          }
        },
        {
          $addFields: {
            MergedArray: {
              $setUnion: [
                '$unitConversion',
                '$primaryUnit'
              ]
            }
          }
        },
        {
          $addFields: {
            conversion: {
              $filter: {
                input: '$MergedArray',
                as: 'item',
                cond: {
                  $eq: [
                    '$$item.unit',
                    '$unitId'
                  ]
                }
              }
            }
          }
        },
        { $unwind: '$conversion' },
        {
          $addFields: {
            'unit.conversion': '$conversion.conversion',
            inventoryName: '$inventoryArr.name',
            unitPrecision: '$inventoryArr.precision',
          }
        },
        {
          $addFields: {
            branch: {
              $toObjectId: '$branch'
            }
          }
        },
        {
          $lookup: {
            from: 'branches',
            localField: 'branch',
            foreignField: '_id',
            as: 'branchArr'
          }
        },
        { $unwind: { path: '$branchArr' } },
        {
          $group: {
            _id: {
              inventoryId: '$inventory',
              branchId: '$branch',
              branchName: '$branchArr.name',
              inventoryName: '$inventoryName',
              unitPrecision: '$unitPrecision',
            },
            assetValue: {
              $sum: {
                $multiply: [
                  '$qty',
                  '$pRate'
                ]
              }
            },
            trns: {
              $push: {
                batch: '$batch',
                batchNo: '$batchNo',
                qty: '$qty',
                mrp: '$mrp',
                pRate: '$pRate',
                sRate: '$sRate',
                expYear: '$expYear',
                expMonth: '$expMonth',
                unit: '$unit'
              }
            }
          },
        },
        {
          $addFields: {
            inventoryName: '$_id.inventoryName',
            unitPrecision: '$_id.unitPrecision',
            inventoryId: '$_id.inventoryId',
            branchId: { '$toString': '$_id.branchId' },
            branchName: '$_id.branchName',
            assetAccountId: assetAccount._id.toString(),
            assetAccountName: assetAccount.name,
            updatedBy: user._id.toString(),
            updatedAt: new Date('2021-02-01T00:00:00.000+0000'),
            date: new Date('2020-03-31T00:00:00.000+0000'),
            voucherName: 'Inventory Opening',
            voucherType: 'INVENTORY_OPENING',
            assetAmount: { $round: ['$assetValue', 2] },
            pRateTaxInc: false,
            sRateTaxInc: true,
          }
        },
        { $project: { _id: 0, assetValue: 0 } },
        { $out: 'inventory_openings_new' }
      ], { allowDiskUse: true }).toArray();
      return { message: 'new collection --inventory_openings_new-- created ' };
    }
    catch (err) {
      console.log(err)
      return err;
    }
  }
}
