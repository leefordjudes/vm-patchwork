import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { Types } from 'mongoose';
import * as _ from 'lodash';

import { URI } from './config';
import { round } from './utils/utils';

@Injectable()
export class Patch10Service {

  async actAccount() {
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
      const tradeReceivable = await connection.db().collection('act_accounts').findOne({ defaultName: 'TRADE_RECEIVABLE' });
      const tradePayble = await connection.db().collection('act_accounts').findOne({ defaultName: 'TRADE_PAYABLE' });
      await connection.db().collection('act_accounts')
        .updateMany({ parentAccount: tradePayble._id }, { $set: { parentDefaultName: 'TRADE_PAYABLE' } });
      await connection.db().collection('act_accounts')
        .updateMany({ parentAccount: tradeReceivable._id }, { $set: { parentDefaultName: 'TRADE_RECEIVABLE' } });
      await connection.db().collection('act_gstregistrations').rename('act_gst_registrations');
    } catch (err) {
      console.log(err.message);
      return err;
    }
    await connection.close();
    return '$$$$$$ ALL FINISHED SUCESSFULLY $$$$$';
  }

  async inventoryOpening() {
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
      const limit = 10000;
      await connection.db().collection('inventory_openings').updateMany({ 'trns.sNo': { $exists: true } }, { $unset: { 'trns.$[].sNo': true } });
      await connection.db().collection('inventory_openings').updateMany({ createdAt: { $exists: true } }, { $unset: { createdAt: true } });
      const invOpeningCount = await connection.db().collection('inventory_openings').countDocuments();
      if (invOpeningCount > 0) {
        console.log('inventory_opening transactions patch object initialization started');
        const now = Date.now();
        for (let skip = 0; skip <= invOpeningCount; skip = skip + limit) {
          const now1 = Date.now();
          const bulkOperation: any = connection.db().collection('inventory_openings').initializeOrderedBulkOp();
          console.log({ skip, limit, invOpeningCount });
          const openings: any = await connection.db()
            .collection('inventory_openings').find({}, { projection: { trns: 1 }, sort: { _id: 1 }, skip, limit })
            .toArray();
          console.log('Records: ' + openings.length);
          for (const op of openings) {
            const trns = [];
            for (const trn of op.trns) {
              trns.push(_.assign(trn, { _id: new Types.ObjectId() }));
            }
            const io = {
              updateOne: {
                filter: { _id: op._id },
                update: {
                  $set: { trns },
                },
              },

            };
            bulkOperation.raw(io);
          }
          console.log('inventory_opening transactions patch object initialized');
          console.log('inventory_opening transactions bulk execution start');
          var opResult = await bulkOperation.execute();
          console.log('bulk execution results are' + JSON.stringify(opResult));
          const delay1 = Date.now() - now1;
          console.log(`Slot execution time: ${delay1} milliseconds.`);
        }
        console.log('inventory_opening transactions patch finished');
        const delay = (Date.now() - now) / 60000;
        console.log(`Total execution time: ${delay} min.`);
      } else {
        console.log('No inventory openings found');
      }

      const purchaseCount = await connection.db().collection('purchases').countDocuments();
      const arr = [];
      if (purchaseCount > 0) {
        const purchases: any = await connection.db().collection('purchases')
          .find({ 'invTrns.unitPrecision': null }, { projection: { invTrns: 1 } }).toArray();
        console.log(purchases.length);  
        let inventoryIds = [];
        for (const p of purchases) {
          const ids = _.map(p.invTrns, i => { 
            if(typeof i.unitPrecision === 'undefined' || i.unitPrecision === null) {
              return Types.ObjectId(i.inventory.id)
            }
          });
          inventoryIds.push(...ids);
        }
        inventoryIds = _.compact(_.uniq(inventoryIds));
        const inventories: any = await connection.db().collection('inventories')
              .find({ _id: {$in: inventoryIds} }, {projection: {precision: 1, name: 1}}).toArray();     
        for (const purchase of purchases) {
          for (const item of purchase.invTrns) {
            if (typeof item.unitPrecision === 'undefined' || item.unitPrecision === null) {
              const inventory = inventories.find(i => i._id.toString() === item.inventory.id);
              console.log({inventory})
              const invTrnsObj = {
                updateOne: {
                  filter: { _id: purchase._id, invTrns: { $elemMatch: { _id: item._id } } },
                  update: {
                    $set: {
                      'invTrns.$[elm].unitPrecision': inventory.precision,
                    },
                  },
                  arrayFilters: [{ 'elm._id': item._id }],
                },
              };
              arr.push(invTrnsObj);
            }
          }
        }
        await connection.db().collection('purchases')
          .bulkWrite(arr);
      } else {
        console.log('No Purchase Found');
      }

    } catch (err) {
      console.log(err.message);
      return err;
    }
    await connection.close();
    return '$$$$$$ ALL FINISHED SUCESSFULLY $$$$$';
  }

  async round() {
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
      const limit = 10000;
      const saleCount = await connection.db().collection('sales').countDocuments();
      if (saleCount > 0) {
        console.log('-----SALE PATCH START------');
        for (let skip = 0; skip <= saleCount; skip = skip + limit) {
          const bulkOperation: any = connection.db().collection('sales').initializeOrderedBulkOp();
          console.log({ skip, limit, saleCount });
          const datas: any = await connection.db()
            .collection('sales').find({}, { projection: { acTrns: 1, invTrns: 1 }, sort: { _id: 1 }, skip, limit })
            .toArray();
          console.log('object initialization started');
          for (const st of datas) {
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
              bulkOperation.raw(acTrnsobj);
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
              bulkOperation.raw(invTrnsobj);
            }
          }
          console.log(`${skip} to ${limit + skip} patch object initialized`);
          console.log(`${skip} to ${limit + skip} bulk execution start....`);
          const result = await bulkOperation.execute();
          console.log(`${skip} to ${limit + skip} bulk execution end`);
          console.log(`results are` + JSON.stringify(result));
          console.log('bulk execution end');
        }
        console.log('***SALE PATCH END***');
      } else {
        console.log('No sale found');
      }

      const saleReturnCount = await connection.db().collection('sale_returns').countDocuments();
      if (saleReturnCount > 0) {
        console.log('-----SALE RETURN PATCH START------');
        for (let skip = 0; skip <= saleReturnCount; skip = skip + limit) {
          const bulkOperation: any = connection.db().collection('sale_returns').initializeOrderedBulkOp();
          console.log({ skip, limit, saleReturnCount });
          const datas: any = await connection.db()
            .collection('sale_returns').find({}, { projection: { acTrns: 1, invTrns: 1 }, sort: { _id: 1 }, skip, limit })
            .toArray();
          console.log('object initialization started');
          for (const st of datas) {
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
              bulkOperation.raw(acTrnsobj);
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
              bulkOperation.raw(invTrnsobj);
            }
          }
          console.log(`${skip} to ${limit + skip} patch object initialized`);
          console.log(`${skip} to ${limit + skip} bulk execution start....`);
          const result = await bulkOperation.execute();
          console.log(`${skip} to ${limit + skip} bulk execution end`);
          console.log(`results are` + JSON.stringify(result));
          console.log('bulk execution end');
        }
        console.log('***SALE RETURN PATCH END***');
      } else {
        console.log('No sale Return found');
      }
      await connection.db().collection('purchases').updateMany({ 'invTrns.unitPrecision': null }, { $set: { 'invTrns.$[].unitPrecision': 0 } });
      const purchaseCount = await connection.db().collection('purchases').countDocuments();
      if (purchaseCount > 0) {
        console.log('-----PURCHASE PATCH START------');
        for (let skip = 0; skip <= purchaseCount; skip = skip + limit) {
          const bulkOperation: any = connection.db().collection('purchases').initializeOrderedBulkOp();
          console.log({ skip, limit, purchaseCount });
          const datas: any = await connection.db()
            .collection('purchases').find({}, { projection: { acTrns: 1, invTrns: 1 }, sort: { _id: 1 }, skip, limit })
            .toArray();
          console.log('object initialization started');
          for (const st of datas) {
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
              bulkOperation.raw(acTrnsobj);
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
              bulkOperation.raw(invTrnsobj);
            }
          }
          console.log(`${skip} to ${limit + skip} patch object initialized`);
          console.log(`${skip} to ${limit + skip} bulk execution start....`);
          const result = await bulkOperation.execute();
          console.log(`${skip} to ${limit + skip} bulk execution end`);
          console.log(`results are` + JSON.stringify(result));
          console.log('bulk execution end');
        }
        console.log('***PURCHASE PATCH END***');
      } else {
        console.log('No Purchase found');
      }

      const purchaseReturnCount = await connection.db().collection('purchase_returns').countDocuments();
      if (purchaseReturnCount > 0) {
        console.log('-----PURCHASE RETURN PATCH START------');
        for (let skip = 0; skip <= purchaseReturnCount; skip = skip + limit) {
          const bulkOperation: any = connection.db().collection('purchase_returns').initializeOrderedBulkOp();
          console.log({ skip, limit, purchaseReturnCount });
          const datas: any = await connection.db()
            .collection('purchase_returns').find({}, { projection: { acTrns: 1, invTrns: 1 }, sort: { _id: 1 }, skip, limit })
            .toArray();
          console.log('object initialization started');
          for (const st of datas) {
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
              bulkOperation.raw(acTrnsobj);
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
              bulkOperation.raw(invTrnsobj);
            }
          }
          console.log(`${skip} to ${limit + skip} patch object initialized`);
          console.log(`${skip} to ${limit + skip} bulk execution start....`);
          const result = await bulkOperation.execute();
          console.log(`${skip} to ${limit + skip} bulk execution end`);
          console.log(`results are` + JSON.stringify(result));
        }
        console.log('*****PURCHASE RETURN PATCH END****');
      } else {
        console.log('No Purchase Return found');
      }

      const stockTransferCount = await connection.db().collection('stock_transfers').countDocuments();
      if (stockTransferCount > 0) {
        console.log('-----STOCK TRANSFER PATCH START------');
        for (let skip = 0; skip <= stockTransferCount; skip = skip + limit) {
          const bulkOperation: any = connection.db().collection('stock_transfers').initializeOrderedBulkOp();
          console.log({ skip, limit, stockTransferCount });
          const datas: any = await connection.db()
            .collection('stock_transfers').find({}, { projection: { acTrns: 1, invTrns: 1, amount: 1 }, sort: { _id: 1 }, skip, limit })
            .toArray();
          console.log('object initialization started');
          for (const st of datas) {
            const amtObj = {
              updateOne: {
                filter: { _id: st._id },
                update: {
                  $set: { amount: round(st.amount) }
                }
              }
            };
            bulkOperation.raw(amtObj);
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
              bulkOperation.raw(acTrnsobj);
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
              bulkOperation.raw(invTrnsobj);
            }
          }
          console.log(`${skip} to ${limit + skip} patch object initialized`);
          console.log(`${skip} to ${limit + skip} bulk execution start....`);
          var stockTransferResult = await bulkOperation.execute();
          console.log(`${skip} to ${limit + skip} bulk execution end`);
          console.log(`results are` + stockTransferResult);
        }
        console.log('****STOCK TRANSFER PATCH END****');
      } else {
        stockTransferResult = 'No stock transfer Return found';
        console.log(stockTransferResult);
      }

      const stockAdjustmentCount = await connection.db().collection('stock_adjustments').countDocuments();
      if (stockAdjustmentCount > 0) {
        console.log('-----STOCK ADJUSTMENT PATCH START------');
        for (let skip = 0; skip <= stockAdjustmentCount; skip = skip + limit) {
          const bulkOperation: any = connection.db().collection('stock_adjustments').initializeOrderedBulkOp();
          console.log({ skip, limit, stockAdjustmentCount });
          const datas: any = await connection.db()
            .collection('stock_adjustments').find({}, { projection: { acTrns: 1, invTrns: 1, amount: 1 }, sort: { _id: 1 }, skip, limit })
            .toArray();
          console.log('object initialization started');
          for (const st of datas) {
            const amtObj = {
              updateOne: {
                filter: { _id: st._id },
                update: {
                  $set: { amount: round(st.amount) }
                }
              }
            };
            bulkOperation.raw(amtObj);
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
              bulkOperation.raw(acTrnsobj);
            }
            for (const item of st.invTrns) {
              const invTrnsobj = {
                updateOne: {
                  filter: { _id: st._id, invTrns: { $elemMatch: { _id: item._id } } },
                  update: {
                    $set: {
                      'invTrns.$[elm].cost': round(item.cost),
                      'invTrns.$[elm].amount': round(item.amount),
                    },
                  },
                  arrayFilters: [{ 'elm._id': item._id }],
                },
              };
              bulkOperation.raw(invTrnsobj);
            }
          }
          console.log(`${skip} to ${limit + skip} patch object initialized`);
          console.log(`${skip} to ${limit + skip} bulk execution start....`);
          const result = await bulkOperation.execute();
          console.log(`${skip} to ${limit + skip} bulk execution end`);
          console.log(`results are` + JSON.stringify(result));
        }
        console.log('*****STOCK TRANSFER END****');
      } else {
        console.log('No stock transfer Return found');
      }
      const materialConversionCount = await connection.db().collection('material_conversions').countDocuments();
      if (materialConversionCount > 0) {
        console.log('-----MATERIAL CONVERSION PATCH START------');
        for (let skip = 0; skip <= materialConversionCount; skip = skip + limit) {
          const bulkOperation: any = connection.db().collection('material_conversions').initializeOrderedBulkOp();
          console.log({ skip, limit, materialConversionCount });
          const datas: any = await connection.db()
            .collection('material_conversions').find({}, { projection: { acTrns: 1, invTrns: 1 }, sort: { _id: 1 }, skip, limit })
            .toArray();
          console.log('object initialization started');
          for (const st of datas) {
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
              bulkOperation.raw(acTrnsobj);
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
              bulkOperation.raw(invTrnsobj);
            }
          }
          console.log(`${skip} to ${limit + skip} patch object initialized`);
          console.log(`${skip} to ${limit + skip} bulk execution start....`);
          const result = await bulkOperation.execute();
          console.log(`${skip} to ${limit + skip} bulk execution end`);
          console.log(`results are` + JSON.stringify(result));
        }
        console.log('****MATERIAL CONVERSION PATCH END****');
      } else {
        console.log('No MATERIAL CONVERSION found');
      }
      console.log('$$$$$$ ALL FINISHED SUCESSFULLY $$$$$');
    } catch (err) {
      console.log(err.message);
      return err;
    }
    await connection.close();
    return '$$$$$$ ALL FINISHED SUCESSFULLY $$$$$';
  }
}