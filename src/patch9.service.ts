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
      const sales: any = await connection.db()
        .collection('sales').find({}, { projection: { acTrns: 1 } })
        .toArray();
      console.log('Total sales to patch: ' + sales.length);
      console.log('sale patch object initialization started');
      const bulkSale: any = connection.db().collection('sales').initializeOrderedBulkOp();
      for (const st of sales) {
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
          bulkSale.raw(obj);
        }
      }
      console.log('sale patch object initialized');
      console.log('sales bulk execution start');
      if (bulkSale.length > 0) {
        var saleResult = await bulkSale.execute();
        console.log('sales bulk execution end, results are' + saleResult);
      } else {
        saleResult = { message: 'Record not Found' };
      }

      const saleReturns: any = await connection.db()
        .collection('sale_returns').find({}, { projection: { acTrns: 1 } })
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
      }
      console.log('sale_returns patch object generate end');
      console.log('sale_returns bulk execution start');
      if (bulkSaleReturn.length > 0) {
        var saleReturnResult = await bulkSaleReturn.execute();
        console.log('sale_return bulk execution end, results are' + saleReturnResult);
      } else {
        saleReturnResult = { message: 'Record not Found' };
      }

      const purchases: any = await connection.db()
        .collection('purchases').find({}, { projection: { acTrns: 1 } })
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
      }
      console.log('purchases patch object generate end');
      console.log('purchases bulk execution start');
      if (bulkPurchase.length > 0) {
        var purchaseResult = await bulkPurchase.execute();
        console.log('purchases bulk execution end, results are' + bulkPurchase);
      } else {
        purchaseResult = { message: 'Records Not Found' };
      }

      const purchaseReturns: any = await connection.db()
        .collection('purchase_returns').find({}, { projection: { acTrns: 1 } })
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
      }
      console.log('purchase_returns patch object generate end');
      console.log('purchase_returns bulk execution start');
      if (bulkPurchaseReturn.length > 0) {
        var purchaseReturnResult = await bulkPurchaseReturn.execute();
        console.log('purchase_returns bulk execution end, results are' + purchaseReturnResult);
      }
      else {
        purchaseReturnResult = { message: 'Records Not Found' };
      }

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
      if (bulkMaterialConversion.length > 0) {
        var materialConversionResult = await bulkMaterialConversion.execute();
        console.log('material_conversions bulk execution end, results are' + materialConversionResult);
      } else {
        materialConversionResult = { message: 'records Not found' };
        console.log('records Not found');
      }

      const stockAdjs: any = await connection.db()
        .collection('stock_adjustments').find({}, { projection: { acTrns: 1 } })
        .toArray();
      console.log('Total stock Adjustments to patch: ' + stockAdjs.length);
      console.log('Stock Adjustments patch object initialization started');
      const bulkstockAdjs: any = connection.db().collection('stock_adjustments').initializeOrderedBulkOp();
      for (const st of stockAdjs) {
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
          bulkstockAdjs.raw(obj);
        }
      }
      console.log('stock_adjustments patch object generate end');
      console.log('stock_adjustments bulk execution start');
      if (bulkstockAdjs.length > 0) {
        var stockAdjResult = await bulkstockAdjs.execute();
        console.log('stock_adjustments bulk execution end, results are' + stockAdjResult);
      } else {
        stockAdjResult = { message: 'Records not found' };
      }

      const stockTransfers: any = await connection.db()
        .collection('stock_transfers').find({}, { projection: { acTrns: 1 } })
        .toArray();
      console.log('Total stock transfer to patch: ' + stockTransfers.length);
      console.log('Stock Adjustments patch object initialization started');
      const bulkstockTrns: any = connection.db().collection('stock_transfers').initializeOrderedBulkOp();
      for (const st of stockTransfers) {
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
          bulkstockTrns.raw(obj);
        }
      }
      console.log('stock_transfers patch object generate end');
      console.log('stock_transfers bulk execution start');
      if (bulkstockTrns.length > 0) {
        var stockTransferResult = await bulkstockTrns.execute();
        console.log('stock_transfers bulk execution end, results are' + stockTransferResult);
      } else {
        stockTransferResult = { message: 'Records not found' };
      }

    } catch (err) {
      console.log(err.message);
      return err;
    }
    await connection.close();
    return {
      saleResult, saleReturnResult,
      purchaseResult, purchaseReturnResult,
      materialConversionResult, stockTransferResult, stockAdjResult
    };
  }
}
