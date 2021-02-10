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
      await connection.db().collection('sales').updateMany({}, { $set: { fNo: 1 } });
      await connection.db().collection('purchases').updateMany({}, { $set: { fNo: 1 } });
      await connection.db().collection('purchase_returns').updateMany({}, { $set: { fNo: 1 } });
      await connection.db().collection('sale_returns').updateMany({}, { $set: { fNo: 1 } });
      await connection.db().collection('stock_transfers').updateMany({}, { $set: { fNo: 1 } });
      await connection.db().collection('stock_adjustments').updateMany({}, { $set: { fNo: 1 } });
      await connection.db().collection('material_conversions').updateMany({}, { $set: { fNo: 1 } });
      await connection.db().collection('accountpayments').updateMany({}, { $set: { fNo: 1 } });
      await connection.db().collection('accountreceipts').updateMany({}, { $set: { fNo: 1 } });
      await connection.db().collection('cashdeposits').updateMany({}, { $set: { fNo: 1 } });
      await connection.db().collection('cashwithdrawals').updateMany({}, { $set: { fNo: 1 } });
      await connection.db().collection('customerpayments').updateMany({}, { $set: { fNo: 1 } });
      await connection.db().collection('customerreceipts').updateMany({}, { $set: { fNo: 1 } });
      await connection.db().collection('expenses').updateMany({}, { $set: { fNo: 1 } });
      await connection.db().collection('incomes').updateMany({}, { $set: { fNo: 1 } });
      await connection.db().collection('journals').updateMany({}, { $set: { fNo: 1 } });
      await connection.db().collection('vendorpayments').updateMany({}, { $set: { fNo: 1 } });
      await connection.db().collection('vendorreceipts').updateMany({}, { $set: { fNo: 1 } });

      const assetAccount: any = await connection.db().collection('accounts')
        .findOne({ defaultName: 'INVENTORY_ASSET' });
      const user = await connection.db().collection('users')
        .findOne({ isAdmin: true });
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
                unit: '$unit',
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
            assetAccount: { id: assetAccount._id.toString(), name: assetAccount.name, displayName: assetAccount.displayName },
            updatedBy: user._id.toString(),
            updatedAt: new Date('2021-02-01T00:00:00.000+0000'),
            date: new Date('2020-03-31T00:00:00.000+0000'),
            voucherName: 'Inventory Opening',
            voucherType: 'INVENTORY_OPENING',
            assetAmount: { $round: ['$assetValue', 2] },
            pRateTaxInc: false,
            sRateTaxInc: true,
            fNo: 1,
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
