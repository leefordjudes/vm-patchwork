import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

import { URI } from './config';
import { round } from './utils/utils';

@Injectable()
export class Patch9Service {
  async acTrnsRound(data: any) {
    const { fromDate, toDate } = data;
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

      const arrayObj = [];
      const sales: any = await connection.db()
        .collection('sales').find({ date: { $gte: new Date(fromDate), $lte: new Date(toDate) } }, { projection: { acTrns: 1 } })
        .toArray();
      console.log('Total sales to patch: ' + sales.length);
      console.log('3. sale patch object generate start');
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
          arrayObj.push(obj);
        }
      }
      console.log('3. sales patch object generate end, Total patch Objects: ' + arrayObj.length);
      if (arrayObj.length > 0) {
        console.log('sales patch start');
        var saleResult = await connection
          .db()
          .collection('sales')
          .bulkWrite(arrayObj);
        arrayObj.length = 0;  
        arrayObj.length = 0;  
        console.log('--sales patch done--');
      } else {
        console.log('No sales patched');
      }

      const saleReturns: any = await connection.db()
        .collection('sale_returns').find({ date: { $gte: new Date(fromDate), $lte: new Date(toDate) } }, { projection: { acTrns: 1 } })
        .toArray();
      console.log('Total sale returns to patch: ' + saleReturns.length);
      console.log('3. sale returns patch object generate start');
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
          arrayObj.push(obj);
        }
      }
      console.log('3. sale_returns patch object generate end, Total patch Objects: ' + arrayObj.length);
      if (arrayObj.length > 0) {
        console.log('sale_returns patch start');
        var saleReturnResult = await connection
          .db()
          .collection('sale_returns')
          .bulkWrite(arrayObj);
        arrayObj.length = 0;  
        console.log('--sale_returns patch done--');
      } else {
        console.log('No sale_returns patched');
      }

      const purchases: any = await connection.db()
        .collection('purchases').find({ date: { $gte: new Date(fromDate), $lte: new Date(toDate) } }, { projection: { acTrns: 1 } })
        .toArray();
      console.log('Total purchases to patch: ' + purchases.length);
      console.log('3. purchases patch object generate start');
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
          arrayObj.push(obj);
        }
      }
      console.log('3. purchases patch object generate end, Total patch Objects: ' + arrayObj.length);
      if (arrayObj.length > 0) {
        console.log('purchases patch start');
        var purchaseResult = await connection
          .db()
          .collection('purchases')
          .bulkWrite(arrayObj);
        arrayObj.length = 0;  
        console.log('--purchases patch done--');
      } else {
        console.log('No purchases patched');
      }

      const purchaseReturns: any = await connection.db()
        .collection('purchase_returns').find({ date: { $gte: new Date(fromDate), $lte: new Date(toDate) } }, { projection: { acTrns: 1 } })
        .toArray();
      console.log('Total purchase_returns to patch: ' + purchaseReturns.length);
      console.log('3. purchase_returns patch object generate start');
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
          arrayObj.push(obj);
        }
      }
      console.log('3. purchase_returns patch object generate end, Total patch Objects: ' + arrayObj.length);
      if (arrayObj.length > 0) {
        console.log('purchase_returns patch start');
        var purchaseReturnResult = await connection
          .db()
          .collection('purchase_returns')
          .bulkWrite(arrayObj);
        arrayObj.length = 0;  
        console.log('--purchase_returns patch done--');
      } else {
        console.log('No purchase_returns patched');
      }

      const materialConversions: any = await connection.db()
        .collection('material_conversions').find({ date: { $gte: new Date(fromDate), $lte: new Date(toDate) } }, { projection: { acTrns: 1 } })
        .toArray();
      console.log('Total stock Adjustments to patch: ' + materialConversions.length);
      console.log('3. stock Adjustments patch object generate start');
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
          arrayObj.push(obj);
        }
      }
      console.log('3. material Conversions patch object generate end, Total patch Objects: ' + arrayObj.length);
      if (arrayObj.length > 0) {
        console.log('material_conversions patch start');
        var materialConversionResult = await connection
          .db()
          .collection('material_conversions')
          .bulkWrite(arrayObj);
        arrayObj.length = 0;  
        console.log('--material_conversions patch done--');
      } else {
        console.log('No material_conversions patched');
      }

      const stockAdjs: any = await connection.db()
        .collection('stock_adjustments').find({ date: { $gte: new Date(fromDate), $lte: new Date(toDate) } }, { projection: { acTrns: 1 } })
        .toArray();
      console.log('Total stock Adjustments to patch: ' + stockAdjs.length);
      console.log('3. stock Adjustments patch object generate start');
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
          arrayObj.push(obj);
        }
      }
      console.log('3. stock Adjustments patch object generate end, Total patch Objects: ' + arrayObj.length);
      if (arrayObj.length > 0) {
        console.log('stock_adjustments patch start');
        var stockAdjResult = await connection
          .db()
          .collection('stock_adjustments')
          .bulkWrite(arrayObj);
        arrayObj.length = 0;  
        console.log('--stock_adjustments patch done--');
      } else {
        console.log('No stock_adjustments patched');
      }

      const stockTransfers: any = await connection.db()
        .collection('stock_transfers').find({ date: { $gte: new Date(fromDate), $lte: new Date(toDate) } }, { projection: { acTrns: 1 } })
        .toArray();
      console.log('Total stock transfer to patch: ' + stockTransfers.length);
      console.log('3. stock transfer patch object generate start');
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
          arrayObj.push(obj);
        }
      }
      console.log('3. stock_transfers patch object generate end, Total patch Objects: ' + arrayObj.length);
      if (arrayObj.length > 0) {
        console.log('stock_transfers patch start');
        var stockTransferResult = await connection
          .db()
          .collection('stock_transfers')
          .bulkWrite(arrayObj);
        arrayObj.length = 0;  
        console.log('--stock_transfers patch done--');
      } else {
        console.log('No stock_transfers patched');
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
