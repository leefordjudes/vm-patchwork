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

      const stockTransferUpdateObj = [];
      const saleUpdateObj = [];
      const saleReturnsUpdateObj = [];
      const purchaseUpdateObj = [];
      const purchaseReturnUpdateObj = [];
      const materialConvUpdateObj = [];
      const stockAdjUpdateObj = [];

      const stockTransfers: any = await connection.db()
        .collection('stock_transfers').find({}, { projection: { acTrns: 1 } })
        .toArray();
      console.log('Total stock transfer to patch: ' + stockTransfers.length);
      console.log('3. stock transfer patch object generate start');
      for (const st of stockTransfers) {
        for (const item of st.acTrns) {
          const stUpdateObj1 = {
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
          stockTransferUpdateObj.push(stUpdateObj1);
        }
      }
      console.log('3. stock_transfers patch object generate end, Total patch Objects: ' + stockTransferUpdateObj.length);
      if (stockTransferUpdateObj.length > 0) {
        console.log('stock_transfers patch start');
        var result = await connection
          .db()
          .collection('stock_transfers')
          .bulkWrite(stockTransferUpdateObj);
        console.log('--stock_transfers patch done--');
      } else {
        console.log('No stock_transfers patched');
      }

      const sales: any = await connection.db()
        .collection('sales').find({}, { projection: { acTrns: 1 } })
        .toArray();
      console.log('Total sales to patch: ' + sales.length);
      console.log('3. sale patch object generate start');
      for (const st of sales) {
        for (const item of st.acTrns) {
          const stUpdateObj1 = {
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
          saleUpdateObj.push(stUpdateObj1);
        }
      }
      console.log('3. sales patch object generate end, Total patch Objects: ' + saleUpdateObj.length);
      if (saleUpdateObj.length > 0) {
        console.log('sales patch start');
        var result = await connection
          .db()
          .collection('sales')
          .bulkWrite(saleUpdateObj);
        console.log('--sales patch done--');
      } else {
        console.log('No sales patched');
      }

      const saleReturns: any = await connection.db()
        .collection('sale_returns').find({}, { projection: { acTrns: 1 } })
        .toArray();
      console.log('Total sale returns to patch: ' + saleReturns.length);
      console.log('3. sale returns patch object generate start');
      for (const st of saleReturns) {
        for (const item of st.acTrns) {
          const stUpdateObj1 = {
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
          saleReturnsUpdateObj.push(stUpdateObj1);
        }
      }
      console.log('3. sale_returns patch object generate end, Total patch Objects: ' + saleReturnsUpdateObj.length);
      if (saleReturnsUpdateObj.length > 0) {
        console.log('sale_returns patch start');
        var result = await connection
          .db()
          .collection('sale_returns')
          .bulkWrite(saleReturnsUpdateObj);
        console.log('--sale_returns patch done--');
      } else {
        console.log('No sale_returns patched');
      }

      const purchases: any = await connection.db()
        .collection('purchases').find({}, { projection: { acTrns: 1 } })
        .toArray();
      console.log('Total purchases to patch: ' + purchases.length);
      console.log('3. purchases patch object generate start');
      for (const st of purchases) {
        for (const item of st.acTrns) {
          const stUpdateObj1 = {
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
          purchaseUpdateObj.push(stUpdateObj1);
        }
      }
      console.log('3. purchases patch object generate end, Total patch Objects: ' + purchaseUpdateObj.length);
      if (purchaseUpdateObj.length > 0) {
        console.log('purchases patch start');
        var result = await connection
          .db()
          .collection('purchases')
          .bulkWrite(purchaseUpdateObj);
        console.log('--purchases patch done--');
      } else {
        console.log('No purchases patched');
      }

      const purchaseReturns: any = await connection.db()
        .collection('purchase_returns').find({}, { projection: { acTrns: 1 } })
        .toArray();
      console.log('Total purchase_returns to patch: ' + purchaseReturns.length);
      console.log('3. purchase_returns patch object generate start');
      for (const st of purchaseReturns) {
        for (const item of st.acTrns) {
          const stUpdateObj1 = {
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
          purchaseReturnUpdateObj.push(stUpdateObj1);
        }
      }
      console.log('3. purchase_returns patch object generate end, Total patch Objects: ' + purchaseReturnUpdateObj.length);
      if (purchaseReturnUpdateObj.length > 0) {
        console.log('purchase_returns patch start');
        var result = await connection
          .db()
          .collection('purchase_returns')
          .bulkWrite(purchaseReturnUpdateObj);
        console.log('--purchase_returns patch done--');
      } else {
        console.log('No purchase_returns patched');
      }

      const materialConversions: any = await connection.db()
        .collection('material_conversions').find({}, { projection: { acTrns: 1 } })
        .toArray();
      console.log('Total stock Adjustments to patch: ' + materialConversions.length);
      console.log('3. stock Adjustments patch object generate start');
      for (const st of materialConversions) {
        for (const item of st.acTrns) {
          const stUpdateObj1 = {
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
         stockAdjUpdateObj.push(stUpdateObj1);
        }
      }
      console.log('3. material Conversions patch object generate end, Total patch Objects: ' + stockAdjUpdateObj.length);
      if (stockAdjUpdateObj.length > 0) {
        console.log('material_conversions patch start');
        var result = await connection
          .db()
          .collection('material_conversions')
          .bulkWrite(stockAdjUpdateObj);
        console.log('--material_conversions patch done--');
      } else {
        console.log('No material_conversions patched');
      }

      const stockAdjs: any = await connection.db()
        .collection('stock_adjustments').find({}, { projection: { acTrns: 1 } })
        .toArray();
      console.log('Total stock Adjustments to patch: ' + stockAdjs.length);
      console.log('3. stock Adjustments patch object generate start');
      for (const st of stockAdjs) {
        for (const item of st.acTrns) {
          const stUpdateObj1 = {
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
         materialConvUpdateObj.push(stUpdateObj1);
        }
      }
      console.log('3. stock Adjustments patch object generate end, Total patch Objects: ' + materialConvUpdateObj.length);
      if (materialConvUpdateObj.length > 0) {
        console.log('stock_adjustments patch start');
        var result = await connection
          .db()
          .collection('stock_adjustments')
          .bulkWrite(materialConvUpdateObj);
        console.log('--stock_adjustments patch done--');
      } else {
        console.log('No stock_adjustments patched');
      }

    } catch (err) {
      console.log(err.message);
      return err;
    }
    await connection.close();
    return { result };
  }
}
