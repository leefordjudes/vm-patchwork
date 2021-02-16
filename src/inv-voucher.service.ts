import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

import { URI } from './config';
import { round } from './utils/utils';

@Injectable()
export class Patch9Service {
  async acTrnsRound() {
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
      const connectdb = connection.db().databaseName;
      console.log(connectdb);
      const auditplusDB = await connection
        .db('auditplusdb')
        .collection('organizations')
        .findOne({ name: connectdb });
      const date = auditplusDB.bookBegin;
      date.setDate(date.getDate() - 1);
      console.log(date);
      const assetAccount: any = await connection
        .db()
        .collection('accounts')
        .findOne({ defaultName: 'INVENTORY_ASSET' });
      const user = await connection
        .db()
        .collection('users')
        .findOne({ isAdmin: true });
      const pipeLine = [
        {
          $addFields: {
            inventoryId: {
              $toObjectId: '$inventory',
            },
          },
        },
        {
          $lookup: {
            from: 'inventories',
            localField: 'inventoryId',
            foreignField: '_id',
            as: 'inventoryArr',
          },
        },
        {
          $unwind: {
            path: '$inventoryArr',
          },
        },
        {
          $addFields: {
            primaryUnit: [
              {
                unit: '$inventoryArr.unit',
                conversion: 1,
              },
            ],
            unitConversion: '$inventoryArr.unitConversion',
            unitId: {
              $toObjectId: '$unit.id',
            },
          },
        },
        {
          $addFields: {
            MergedArray: {
              $setUnion: ['$unitConversion', '$primaryUnit'],
            },
          },
        },
        {
          $addFields: {
            conversion: {
              $filter: {
                input: '$MergedArray',
                as: 'item',
                cond: {
                  $eq: ['$$item.unit', '$unitId'],
                },
              },
            },
          },
        },
        { $unwind: '$conversion' },
        {
          $addFields: {
            'unit.conversion': '$conversion.conversion',
            inventoryName: '$inventoryArr.name',
            unitPrecision: '$inventoryArr.precision',
          },
        },
        {
          $addFields: {
            branch: {
              $toObjectId: '$branch',
            },
          },
        },
        {
          $lookup: {
            from: 'branches',
            localField: 'branch',
            foreignField: '_id',
            as: 'branchArr',
          },
        },
        { $unwind: { path: '$branchArr' } },
        {
          $group: {
            _id: {
              inventoryId: '$inventory',
              branchId: '$branch',
              branchName: '$branchArr.name',
              inventoryName: '$inventoryName',
            },
            assetValue: {
              $sum: {
                $multiply: ['$qty', '$pRate'],
              },
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
                unitPrecision: '$unitPrecision',
              },
            },
          },
        },
        {
          $addFields: {
            inventoryName: '$_id.inventoryName',
            unitPrecision: '$_id.unitPrecision',
            inventoryId: '$_id.inventoryId',
            branchId: { $toString: '$_id.branchId' },
            branchName: '$_id.branchName',
            assetAccount: {
              id: assetAccount._id.toString(),
              name: assetAccount.name,
              displayName: assetAccount.displayName,
            },
            updatedBy: user._id.toString(),
            updatedAt: new Date('2021-02-17T00:00:00.000+0000'),
            date,
            voucherName: 'Inventory Opening',
            voucherType: 'INVENTORY_OPENING',
            assetAmount: { $round: ['$assetValue', 2] },
            pRateTaxInc: false,
            sRateTaxInc: true,
            fNo: 1,
          },
        },
        { $project: { _id: 0, assetValue: 0 } },
        { $out: 'inventory_openings_new' },
      ];
      console.log('inventory opening patch started');
      await connection
        .db()
        .collection('inventory_openings')
        .aggregate(pipeLine, { allowDiskUse: true })
        .toArray();
      console.log(
        'inventory opening new collection created as inventory_openings_new',
      );
      await connection
        .db()
        .collection('inventory_openings')
        .rename('inventory_openings_old');
      const invOpening = await connection
        .db()
        .collection('inventory_openings_new')
        .rename('inventory_openings');
      console.log('inventory_openings_new was renamed as inventory_openings');
      await invOpening.createIndex({ branchId: 1 });
      await invOpening.createIndex({ inventoryId: 1 });
      console.log('inventory_openings index was created');

      await connection
        .db()
        .collection('sales')
        .updateMany({}, { $set: { fNo: 1 } });
      await connection
        .db()
        .collection('purchases')
        .updateMany({}, { $set: { fNo: 1 } });
      await connection
        .db()
        .collection('purchase_returns')
        .updateMany({}, { $set: { fNo: 1 } });
      await connection
        .db()
        .collection('sale_returns')
        .updateMany({}, { $set: { fNo: 1 } });
      await connection
        .db()
        .collection('stock_transfers')
        .updateMany({}, { $set: { fNo: 1 } });
      await connection
        .db()
        .collection('stock_adjustments')
        .updateMany({}, { $set: { fNo: 1 } });
      await connection
        .db()
        .collection('material_conversions')
        .updateMany({}, { $set: { fNo: 1 } });
      await connection
        .db()
        .collection('accountpayments')
        .updateMany({}, { $set: { fNo: 1 } });
      await connection
        .db()
        .collection('accountreceipts')
        .updateMany({}, { $set: { fNo: 1 } });
      await connection
        .db()
        .collection('cashdeposits')
        .updateMany({}, { $set: { fNo: 1 } });
      await connection
        .db()
        .collection('cashwithdrawals')
        .updateMany({}, { $set: { fNo: 1 } });
      await connection
        .db()
        .collection('customerpayments')
        .updateMany({}, { $set: { fNo: 1 } });
      await connection
        .db()
        .collection('customerreceipts')
        .updateMany({}, { $set: { fNo: 1 } });
      await connection
        .db()
        .collection('expenses')
        .updateMany({}, { $set: { fNo: 1 } });
      await connection
        .db()
        .collection('incomes')
        .updateMany({}, { $set: { fNo: 1 } });
      await connection
        .db()
        .collection('journals')
        .updateMany({}, { $set: { fNo: 1 } });
      await connection
        .db()
        .collection('vendorpayments')
        .updateMany({}, { $set: { fNo: 1 } });
      await connection
        .db()
        .collection('vendorreceipts')
        .updateMany({}, { $set: { fNo: 1 } });
      await connection
        .db()
        .collection('financialyears')
        .updateOne({}, { $set: { fNo: 1, fSync: false } });
      await connection
        .db()
        .collection('batches')
        .updateMany({}, { $unset: { closing: true, sold: true } });
      /*
      const limit = 25000;
      const saleCount = await connection.db().collection('sales').countDocuments();
      if (saleCount > 0) {
        const bulkSale: any = connection.db().collection('sales').initializeOrderedBulkOp();
        for (let skip = 0; skip <= saleCount; skip = skip + limit) {
          console.log({ skip, limit, saleCount });
          const sales: any = await connection.db()
            .collection('sales').find({}, { projection: { acTrns: 1, invTrns: 1 }, sort: { _id: 1 }, skip, limit })
            .toArray();
          console.log('sale patch object initialization started');
          for (const st of sales) {
            for (const item of st.acTrns) {
              const acTrnsobj = {
                updateOne: {
                  filter: { _id: st._id, acTrns: { $elemMatch: { _id: item._id } } },
                  update: {
                    $set: {
                      'acTrns.$[elm].debit': round(item.debit),
                      'acTrns.$[elm].credit': round(item.credit),
                    },
                  },
                  arrayFilters: [{ 'elm._id': item._id }],
                },
              };
              bulkSale.raw(acTrnsobj);
            }
            for (const item of st.invTrns) {
              const invTrnsobj = {
                updateOne: {
                  filter: { _id: st._id, invTrns: { $elemMatch: { _id: item._id } } },
                  update: {
                    $set: {
                      'invTrns.$[elm].assetAmount': round(item.assetAmount),
                    },
                  },
                  arrayFilters: [{ 'elm._id': item._id }],
                },
              };
              bulkSale.raw(invTrnsobj);
            }
          }
        }
        console.log('sale patch object initialized');
        console.log('sales bulk execution start');
        var saleResult = await bulkSale.execute();
        console.log('sales bulk execution end, results are' + JSON.stringify(saleResult));
      } else {
        saleResult = 'No sale found';
        console.log(saleResult);
      }

      const saleReturnCount = await connection.db().collection('sale_returns').countDocuments();
      if (saleReturnCount > 0) {
        const saleReturns: any = await connection.db()
          .collection('sale_returns')
          .find({}, { projection: { acTrns: 1, invTrns: 1 } })
          .toArray();
        console.log('Total sale returns to patch: ' + saleReturns.length);
        const bulkSaleReturn: any = connection.db().collection('sale_returns').initializeOrderedBulkOp();
        console.log('3. sale returns patch object initialization started');
        for (const st of saleReturns) {
          for (const item of st.acTrns) {
            const obj = {
              updateOne: {
                filter: { _id: st._id, acTrns: { $elemMatch: { _id: item._id } } },
                update: {
                  $set: {
                    'acTrns.$[elm].debit': round(item.debit),
                    'acTrns.$[elm].credit': round(item.credit),
                  },
                },
                arrayFilters: [{ 'elm._id': item._id }],
              },
            };
            bulkSaleReturn.raw(obj);
          }
          for (const item of st.invTrns) {
            const invTrnsobj = {
              updateOne: {
                filter: { _id: st._id, invTrns: { $elemMatch: { _id: item._id } } },
                update: {
                  $set: {
                    'invTrns.$[elm].assetAmount': round(item.assetAmount),
                  },
                },
                arrayFilters: [{ 'elm._id': item._id }],
              },
            };
            bulkSaleReturn.raw(invTrnsobj);
          }
        }
        console.log('sale_returns patch object generate end');
        console.log('sale_returns bulk execution start');
        var saleReturnResult = await bulkSaleReturn.execute();
        console.log('sale_return bulk execution end, results are' + JSON.stringify(saleReturnResult));
      } else {
        saleReturnResult = 'No sale_returns Found';
        console.log(saleReturnResult);
      }

      const purchaseCount = await connection.db().collection('purchases').countDocuments();
      if (purchaseCount > 0) {
        const purchases: any = await connection.db()
          .collection('purchases').find({}, { projection: { acTrns: 1, invTrns: 1 } })
          .toArray();
        const bulkPurchase: any = connection.db().collection('purchases').initializeOrderedBulkOp();
        console.log('Total purchases to patch: ' + purchases.length);
        console.log('3. purchases patch object initialization started');
        for (const st of purchases) {
          for (const item of st.acTrns) {
            const obj = {
              updateOne: {
                filter: { _id: st._id, acTrns: { $elemMatch: { _id: item._id } } },
                update: {
                  $set: {
                    'acTrns.$[elm].debit': round(item.debit),
                    'acTrns.$[elm].credit': round(item.credit),
                  },
                },
                arrayFilters: [{ 'elm._id': item._id }],
              },
            };
            bulkPurchase.raw(obj);
          }
          for (const item of st.invTrns) {
            const invTrnsobj = {
              updateOne: {
                filter: { _id: st._id, invTrns: { $elemMatch: { _id: item._id } } },
                update: {
                  $set: {
                    'invTrns.$[elm].assetAmount': round(item.assetAmount),
                  },
                },
                arrayFilters: [{ 'elm._id': item._id }],
              },
            };
            bulkPurchase.raw(invTrnsobj);
          }
        }
        console.log('purchases patch object generate end');
        console.log('purchases bulk execution start');
        var purchaseResult = await bulkPurchase.execute();
        console.log('purchases bulk execution end, results are' + JSON.stringify(purchaseResult));
      } else {
        purchaseResult = 'No Purchase found';
        console.log(purchaseResult);
      }

      const purchaseReturnCount = await connection.db().collection('purchase_returns').countDocuments();
      if (purchaseReturnCount > 0) {
        const purchaseReturns: any = await connection.db()
          .collection('purchase_returns').find({}, { projection: { acTrns: 1, invTrns: 1 } })
          .toArray();
        console.log('Total purchase_returns to patch: ' + purchaseReturns.length);
        const bulkPurchaseReturn: any = connection.db().collection('purchase_returns').initializeOrderedBulkOp();
        console.log('3. purchase_returns patch object initialization started');
        for (const st of purchaseReturns) {
          for (const item of st.acTrns) {
            const obj = {
              updateOne: {
                filter: { _id: st._id, acTrns: { $elemMatch: { _id: item._id } } },
                update: {
                  $set: {
                    'acTrns.$[elm].debit': round(item.debit),
                    'acTrns.$[elm].credit': round(item.credit),
                  },
                },
                arrayFilters: [{ 'elm._id': item._id }],
              },
            };
            bulkPurchaseReturn.raw(obj);
          }
          for (const item of st.invTrns) {
            const invTrnsobj = {
              updateOne: {
                filter: { _id: st._id, invTrns: { $elemMatch: { _id: item._id } } },
                update: {
                  $set: {
                    'invTrns.$[elm].assetAmount': round(item.assetAmount),
                  },
                },
                arrayFilters: [{ 'elm._id': item._id }],
              },
            };
            bulkPurchaseReturn.raw(invTrnsobj);
          }
        }
        console.log('purchase_returns patch object generate end');
        console.log('purchase_returns bulk execution start');
        var purchaseReturnResult = await bulkPurchaseReturn.execute();
        console.log('purchase_returns bulk execution end, results are' + JSON.stringify(purchaseReturnResult));
      } else {
        purchaseReturnResult = 'No Purchase-return found';
        console.log(purchaseResult);
      }

      const materialConversionCount = await connection.db().collection('material_conversions').countDocuments();
      if (materialConversionCount > 0) {
        const materialConversions: any = await connection.db()
          .collection('material_conversions').find({}, { projection: { acTrns: 1 } })
          .toArray();
        console.log('Total material_conversions to patch: ' + materialConversions.length);
        const bulkMaterialConversion: any = connection.db().collection('material_conversions').initializeOrderedBulkOp();
        console.log('material_conversions patch object initialization started');
        for (const st of materialConversions) {
          for (const item of st.acTrns) {
            const obj = {
              updateOne: {
                filter: { _id: st._id, acTrns: { $elemMatch: { _id: item._id } } },
                update: {
                  $set: {
                    'acTrns.$[elm].debit': round(item.debit),
                    'acTrns.$[elm].credit': round(item.credit),
                  },
                },
                arrayFilters: [{ 'elm._id': item._id }],
              },
            };
            bulkMaterialConversion.raw(obj);
          }
        }
        console.log('material_conversions patch object generate end');
        console.log('material_conversions bulk execution start');
        var materialConversionResult = await bulkMaterialConversion.execute();
        console.log('material_conversions bulk execution end, results are' + JSON.stringify(materialConversionResult));
      } else {
        materialConversionResult = 'No  materialConversion found';
        console.log(materialConversionResult);
      }

      const stockAdjustmentCount = await connection.db().collection('stock_adjustments').countDocuments();
      if (stockAdjustmentCount > 0) {
        const stockAdjs: any = await connection.db()
          .collection('stock_adjustments').find({}, { projection: { acTrns: 1, amount: 1, invTrns: 1 } })
          .toArray();
        console.log('Total stock Adjustments to patch: ' + stockAdjs.length);
        console.log('Stock Adjustments patch object initialization started');
        const bulkstockAdjs: any = connection.db().collection('stock_adjustments').initializeOrderedBulkOp();
        for (const st of stockAdjs) {
          const obj1 = {
            updateOne: {
              filter: { _id: st._id },
              update: {
                $set: {
                  amount: round(st.amount),
                },
              },
            },
          };
          bulkstockAdjs.raw(obj1);
          for (const item of st.acTrns) {
            const obj2 = {
              updateOne: {
                filter: { _id: st._id, acTrns: { $elemMatch: { _id: item._id } } },
                update: {
                  $set: {
                    'acTrns.$[elm].debit': round(item.debit),
                    'acTrns.$[elm].credit': round(item.credit),
                  },
                },
                arrayFilters: [{ 'elm._id': item._id }],
              },
            };
            bulkstockAdjs.raw(obj2);
          }
          for (const item of st.invTrns) {
            const invTrnsobj = {
              updateOne: {
                filter: { _id: st._id, invTrns: { $elemMatch: { _id: item._id } } },
                update: {
                  $set: {
                    'invTrns.$[elm].amount': round(item.amount),
                  },
                },
                arrayFilters: [{ 'elm._id': item._id }],
              },
            };
            bulkstockAdjs.raw(invTrnsobj);
          }
        }
        console.log('stock_adjustments patch object generate end');
        console.log('stock_adjustments bulk execution start');
        var stockAdjResult = await bulkstockAdjs.execute();
        console.log('stock_adjustments bulk execution end, results are' + JSON.stringify(stockAdjResult));
      } else {
        stockAdjResult = { message: 'Records not found' };
      }
      const stockTransferCount = await connection.db().collection('stock_transfers').countDocuments();
      if (stockTransferCount > 0) {
        const stockTransfers: any = await connection.db()
          .collection('stock_transfers').find({}, { projection: { acTrns: 1, amount: 1 } })
          .toArray();
        console.log('Total stock transfer to patch: ' + stockTransfers.length);
        console.log('Stock Adjustments patch object initialization started');
        const bulkstockTrns: any = connection.db().collection('stock_transfers').initializeOrderedBulkOp();
        for (const st of stockTransfers) {
          const obj1 = {
            updateOne: {
              filter: { _id: st._id },
              update: {
                $set: {
                  amount: round(st.amount),
                },
              },
            },
          };
          bulkstockTrns.raw(obj1);
          for (const item of st.acTrns) {
            const obj2 = {
              updateOne: {
                filter: { _id: st._id, acTrns: { $elemMatch: { _id: item._id } } },
                update: {
                  $set: {
                    'acTrns.$[elm].debit': round(item.debit),
                    'acTrns.$[elm].credit': round(item.credit),
                  },
                },
                arrayFilters: [{ 'elm._id': item._id }],
              },
            };
            bulkstockTrns.raw(obj2);
          }
        }
        console.log('stock_transfers patch object generate end');
        console.log('stock_transfers bulk execution start');
        var stockTransferResult = await bulkstockTrns.execute();
        console.log('stock_transfers bulk execution end, results are' + JSON.stringify(stockTransferResult));
      } else {
        stockTransferResult = 'No Stock Adjustment found';
        console.log(stockTransferResult);
      }
      
      */

      console.log('delete INVENTORY_OPENING from inventorybooks started.');
      await connection
        .db()
        .collection('inventorybooks')
        .deleteMany({ voucherType: 'INVENTORY_OPENING' });
      console.log('delete INVENTORY_OPENING from inventorybooks finished.');
      await connection.close();
    } catch (err) {
      console.log(err.message);
      return err;
    }
    // return {
    //   saleResult, saleReturnResult,
    //   purchaseResult, purchaseReturnResult,
    //   materialConversionResult, stockTransferResult, stockAdjResult
    // };
  }

  async postAccountBookUpdate() {
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
      const connectdb = connection.db().databaseName;
      console.log({ database: connectdb });
      console.log('accountbooks update for opening records started.');
      await connection
        .db()
        .collection('accountbooks')
        .updateMany(
          { voucherType: /.*OPENING.*/i },
          { $set: { fNo: 1, fSync: false, isOpening: true } },
        );
      console.log('accountbooks update for opening records finished.');
      console.log('accountbooks update for other records started.');
      await connection
        .db()
        .collection('accountbooks')
        .updateMany(
          { voucherType: { $not: /.*OPENING.*/i } },
          { $set: { fNo: 1, fSync: false, isOpening: false } },
        );
      console.log('accountbooks update for other records finished.');
    } catch (err) {
      console.log(err.message);
      return err;
    }
    console.log('patch9 controller post account book update end.');
  }
}
