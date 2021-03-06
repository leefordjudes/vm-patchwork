import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoClient } from 'mongodb';

import * as iface from './model/interfaces';

@Injectable()
export class MergeService {
  constructor(
    @InjectModel('M1CashSale')
    private readonly m1CashSaleModel: Model<iface.M1CashSale>,
    @InjectModel('M1CreditSale')
    private readonly m1CreditSaleModel: Model<iface.M1CreditSale>,
    @InjectModel('M2CashSale')
    private readonly m2CashSaleModel: Model<iface.M2CashSale>,
    @InjectModel('M2CreditSale')
    private readonly m2CreditSaleModel: Model<iface.M2CreditSale>,
    @InjectModel('Sale')
    private readonly saleModel: Model<iface.Sale>,
    @InjectModel('M1CashSaleReturn')
    private readonly m1CashSaleReturnModel: Model<iface.M1CashSaleReturn>,
    @InjectModel('M1CreditSaleReturn')
    private readonly m1CreditSaleReturnModel: Model<iface.M1CreditSaleReturn>,
    @InjectModel('M2CashSaleReturn')
    private readonly m2CashSaleReturnModel: Model<iface.M2CashSaleReturn>,
    @InjectModel('M2CreditSaleReturn')
    private readonly m2CreditSaleReturnModel: Model<iface.M2CreditSaleReturn>,
    @InjectModel('Sale_Return')
    private readonly saleReturnModel: Model<iface.SaleReturn>,
    @InjectModel('M1CashPurchase')
    private readonly m1CashPurchaseModel: Model<iface.M1CashPurchase>,
    @InjectModel('M1CreditPurchase')
    private readonly m1CreditPurchaseModel: Model<iface.M1CreditPurchase>,
    @InjectModel('M2CashPurchase')
    private readonly m2CashPurchaseModel: Model<iface.M2CashPurchase>,
    @InjectModel('M2CreditPurchase')
    private readonly m2CreditPurchaseModel: Model<iface.M2CreditPurchase>,
    @InjectModel('Purchase')
    private readonly purchaseModel: Model<iface.Purchase>,
    @InjectModel('M1CashPurchaseReturn')
    private readonly m1CashPurchaseReturnModel: Model<
      iface.M1CashPurchaseReturn
    >,
    @InjectModel('M1CreditPurchaseReturn')
    private readonly m1CreditPurchaseReturnModel: Model<
      iface.M1CreditPurchaseReturn
    >,
    @InjectModel('M2CashPurchaseReturn')
    private readonly m2CashPurchaseReturnModel: Model<
      iface.M2CashPurchaseReturn
    >,
    @InjectModel('M2CreditPurchaseReturn')
    private readonly m2CreditPurchaseReturnModel: Model<
      iface.M2CreditPurchaseReturn
    >,
    @InjectModel('Purchase_Return')
    private readonly purchaseReturnModel: Model<iface.PurchaseReturn>,
    @InjectModel('Inventory_Head')
    private readonly inventoryHeadModel: Model<iface.InventoryHead>,
    @InjectModel('Branch')
    private readonly branchModel: Model<iface.Branch>,
    @InjectModel('Inventory')
    private readonly inventoryModel: Model<iface.Inventory>,
    @InjectModel('Preference')
    private readonly preferenceModel: Model<iface.Preference>,
  ) {}

  async preference() {
    const preferences = await this.preferenceModel.find({});
    const branches = await this.branchModel.find({});
    await this.preferenceModel.deleteMany({});
    const bids = branches.map(x => x.id);
    let arr = [];
    for (const bid of bids) {
      const pre = preferences.map(x => {
        return {
          code: x.code,
          config: x.config,
          branch: bid,
        };
      });
      arr.push(...pre);
    }
    return await this.preferenceModel.insertMany(arr);
  }

  async merge(orgType: string) {
    if (orgType === 'm1') {
      return await this.m1Merge();
    } else if (orgType === 'm2') {
      return await this.m2Merge();
    } else {
      return 'Accept only m1 or m2';
    }
  }

  async m2Merge() {
    await this.m2CashSaleModel.aggregate([
      { $addFields: { saleType: 'cash' } },
      { $merge: { into: this.saleModel.collection.name } },
    ]);
    await this.m2CreditSaleModel.aggregate([
      { $addFields: { saleType: 'credit' } },
      { $merge: { into: this.saleModel.collection.name } },
    ]);

    await this.m2CashSaleReturnModel.aggregate([
      { $addFields: { saleType: 'cash' } },
      { $merge: { into: this.saleReturnModel.collection.name } },
    ]);
    await this.m2CreditSaleReturnModel.aggregate([
      { $addFields: { saleType: 'credit' } },
      { $merge: { into: this.saleReturnModel.collection.name } },
    ]);

    await this.m2CashPurchaseModel.aggregate([
      { $addFields: { purchaseType: 'cash' } },
      { $merge: { into: this.purchaseModel.collection.name } },
    ]);
    await this.m2CreditPurchaseModel.aggregate([
      { $addFields: { purchaseType: 'credit' } },
      { $merge: { into: this.purchaseModel.collection.name } },
    ]);

    await this.m2CashPurchaseReturnModel.aggregate([
      { $addFields: { purchaseType: 'cash' } },
      { $merge: { into: this.purchaseReturnModel.collection.name } },
    ]);
    await this.m2CreditPurchaseReturnModel.aggregate([
      { $addFields: { purchaseType: 'credit' } },
      { $merge: { into: this.purchaseReturnModel.collection.name } },
    ]);
    return 'medical merge done';
  }

  async m1Merge() {
    await this.m1CashSaleModel.aggregate([
      { $addFields: { saleType: 'cash' } },
      { $merge: { into: this.saleModel.collection.name } },
    ]);
    await this.m1CreditSaleModel.aggregate([
      { $addFields: { saleType: 'credit' } },
      { $merge: { into: this.saleModel.collection.name } },
    ]);

    await this.m1CashSaleReturnModel.aggregate([
      { $addFields: { saleType: 'cash' } },
      { $merge: { into: this.saleReturnModel.collection.name } },
    ]);
    await this.m1CreditSaleReturnModel.aggregate([
      { $addFields: { saleType: 'credit' } },
      { $merge: { into: this.saleReturnModel.collection.name } },
    ]);

    await this.m1CashPurchaseModel.aggregate([
      { $addFields: { purchaseType: 'cash' } },
      { $merge: { into: this.purchaseModel.collection.name } },
    ]);
    await this.m1CreditPurchaseModel.aggregate([
      { $addFields: { purchaseType: 'credit' } },
      { $merge: { into: this.purchaseModel.collection.name } },
    ]);

    await this.m1CashPurchaseReturnModel.aggregate([
      { $addFields: { purchaseType: 'cash' } },
      { $merge: { into: this.purchaseReturnModel.collection.name } },
    ]);
    await this.m1CreditPurchaseReturnModel.aggregate([
      { $addFields: { purchaseType: 'credit' } },
      { $merge: { into: this.purchaseReturnModel.collection.name } },
    ]);
    return 'stationery merge done';
  }

  async rename(orgType: string, dbName: string) {
    //const uri = `mongodb+srv://username:password@host/${dbName}?retryWrites=true&w=majority`;
    const uri = `mongodb://localhost/${dbName}`;
    if (orgType === 'm1') {
      try {
        const connection = await new MongoClient(uri, {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }).connect();
        console.log('==================Print Collection====================');
        await connection
          .db()
          .collection('printtemplates')
          .updateMany(
            { category: { $in: ['CASH-SALE', 'CREDIT-SALE'] } },
            { $set: { category: ['SALE'] } },
          );
        await connection
          .db()
          .collection('printtemplates')
          .updateMany(
            { category: { $in: ['CASH-SALE-RETURN', 'CREDIT-SALE-RETURN'] } },
            { $set: { category: ['SALE-RETURN'] } },
          );
        console.log('Print templates category value updated sucessfully');

        console.log('==================Rename Collection====================');
        await connection.db().renameCollection('m1inventories', 'inventories');
        console.log('m1inventories', 'inventories');
        await connection
          .db()
          .renameCollection('m1reorderanalyses', 'reorder_analysis');
        console.log('m1reorderanalyses', 'reorder_analysis');
        await connection
          .db()
          .renameCollection('m1stockadjustments', 'stock_adjustments');
        console.log('m1stockadjustments', 'stock_adjustments');
        await connection
          .db()
          .renameCollection('m1stocktransfers', 'stock_transfers');
        console.log('m1stocktransfers', 'stock_transfers');
        await connection
          .db()
          .renameCollection('m1inventoryopenings', 'inventory_openings');
        console.log('m1inventoryopenings', 'inventory_openings');
        await connection.db().renameCollection('m1batches', 'batches');
        console.log('m1batches', 'batches');

        console.log('=================Drop collection============');
        await connection.db().dropCollection('m2inventories');
        console.log('m2inventories');
        await connection.db().dropCollection('m2reorderanalyses');
        console.log('m2reorderanalyses');
        await connection.db().dropCollection('m2stockadjustments');
        console.log('m2stockadjustments');
        await connection.db().dropCollection('m2stocktransfers');
        console.log('m2stocktransfers');
        await connection.db().dropCollection('m2inventoryopenings');
        console.log('m2inventoryopenings');
        await connection.db().dropCollection('m2batches');
        console.log('m2batches');

        await connection.db().dropCollection('m1cashpurchasereturns');
        console.log('m1cashpurchasereturns');
        await connection.db().dropCollection('m1cashpurchases');
        console.log('m1cashpurchases');
        await connection.db().dropCollection('m1cashsalereturns');
        console.log('m1cashsalereturns');
        await connection.db().dropCollection('m1cashsales');
        console.log('m1cashsales');
        await connection.db().dropCollection('m1creditpurchasereturns');
        console.log('m1creditpurchasereturns');
        await connection.db().dropCollection('m1creditpurchases');
        console.log('m1creditpurchases');
        await connection.db().dropCollection('m1creditsales');
        console.log('m1creditsales');
        await connection.db().dropCollection('m1creditsalereturns');
        console.log('m1creditsalereturns');

        await connection.db().dropCollection('m2cashpurchasereturns');
        console.log('m2cashpurchasereturns');
        await connection.db().dropCollection('m2cashpurchases');
        console.log('m2cashpurchases');
        await connection.db().dropCollection('m2cashsalereturns');
        console.log('m2cashsalereturns');
        await connection.db().dropCollection('m2cashsales');
        console.log('m2cashsales');
        await connection.db().dropCollection('m2creditpurchasereturns');
        console.log('m2creditpurchasereturns');
        await connection.db().dropCollection('m2creditpurchases');
        console.log('m2creditpurchases');
        await connection.db().dropCollection('m2creditsalereturns');
        console.log('m2creditsalereturns');
        await connection.db().dropCollection('m2creditsales');
        console.log('m2creditsales');

        await connection.db().dropCollection('accounttypes');
        console.log('accounttypes');
        await connection.db().dropCollection('countries');
        console.log('countries');
        await connection.db().dropCollection('gstregistrations');
        console.log('gstregistrations');
        await connection.db().dropCollection('privileges');
        console.log('privileges');
        await connection.db().dropCollection('states');
        console.log('states');
        await connection.db().dropCollection('taxtypes');
        console.log('taxtypes');
        await connection.db().dropCollection('vouchertypes');
        console.log('vouchertypes');
        await connection.db().dropCollection('inventoryopenings');
        console.log('inventoryopenings');
        await connection.db().dropCollection('m1dashboardconfigs');
        console.log('m1dashboardconfigs');
        await connection.db().dropCollection('userconfigs');
        console.log('userconfigs');
        await connection.db().dropCollection('configurations');
        console.log('configurations');

        const bookObj = [];
        const openingObj1 = {
          updateMany: {
            filter: { collectionName: 'inventoryopenings' },
            update: {
              $set: { collectionName: 'inventory_openings' },
            },
          },
        };
        bookObj.push(openingObj1);
        const openingObj2 = {
          updateMany: {
            filter: { collectionName: 'm1inventoryopenings' },
            update: {
              $set: { collectionName: 'inventory_openings' },
            },
          },
        };
        bookObj.push(openingObj2);
        const saleObj1 = {
          updateMany: {
            filter: { collectionName: 'm1cashsales' },
            update: {
              $set: { collectionName: 'sales' },
            },
          },
        };
        bookObj.push(saleObj1);
        const saleObj2 = {
          updateMany: {
            filter: { collectionName: 'm1creditsales' },
            update: {
              $set: { collectionName: 'sales' },
            },
          },
        };
        bookObj.push(saleObj2);
        const saleReturnObj1 = {
          updateMany: {
            filter: { collectionName: 'm1cashsalereturns' },
            update: {
              $set: { collectionName: 'sale_returns' },
            },
          },
        };
        bookObj.push(saleReturnObj1);
        const saleReturnObj2 = {
          updateMany: {
            filter: { collectionName: 'm1creditsalereturns' },
            update: {
              $set: { collectionName: 'sale_returns' },
            },
          },
        };
        bookObj.push(saleReturnObj2);
        const purchaseObj1 = {
          updateMany: {
            filter: { collectionName: 'm1cashpurchases' },
            update: {
              $set: { collectionName: 'purchases' },
            },
          },
        };
        bookObj.push(purchaseObj1);
        const purchaseObj2 = {
          updateMany: {
            filter: { collectionName: 'm1creditpurchases' },
            update: {
              $set: { collectionName: 'purchases' },
            },
          },
        };
        bookObj.push(purchaseObj2);
        const purchaseReturnObj1 = {
          updateMany: {
            filter: { collectionName: 'm1cashpurchasereturns' },
            update: {
              $set: { collectionName: 'purchase_returns' },
            },
          },
        };
        bookObj.push(purchaseReturnObj1);
        const purchaseReturnObj2 = {
          updateMany: {
            filter: { collectionName: 'm1creditpurchasereturns' },
            update: {
              $set: { collectionName: 'purchase_returns' },
            },
          },
        };
        bookObj.push(purchaseReturnObj2);

        await connection
          .db()
          .collection('inventorybooks')
          .bulkWrite(bookObj);
        console.log('inventorybooks collection name updated');
        await connection
          .db()
          .collection('accountbooks')
          .bulkWrite(bookObj);
        console.log('accountbooks collection name updated');
        await connection
          .db()
          .collection('customerbooks')
          .bulkWrite(bookObj);
        console.log('customerbooks collection name updated');
        await connection
          .db()
          .collection('vendorbooks')
          .bulkWrite(bookObj);
        console.log('vendorbooks collection name updated');
        await connection
          .db()
          .collection('cashregisterbooks')
          .bulkWrite(bookObj);
        console.log('cashregisterbooks collection name updated');
        await connection.close();
        return true;
      } catch (err) {
        console.log(err);
        return false;
      }
    } else if (orgType === 'm2') {
      try {
        const connection = await new MongoClient(uri, {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }).connect();
        console.log('==================Print Collection====================');
        await connection
          .db()
          .collection('printtemplates')
          .updateMany(
            { category: { $in: ['CASH-SALE', 'CREDIT-SALE'] } },
            { $set: { category: ['SALE'] } },
          );
        await connection
          .db()
          .collection('printtemplates')
          .updateMany(
            { category: { $in: ['CASH-SALE-RETURN', 'CREDIT-SALE-RETURN'] } },
            { $set: { category: ['SALE-RETURN'] } },
          );
        console.log('Print templates category value updated sucessfully');
        console.log('==================Rename Collection====================');
        await connection.db().renameCollection('m2inventories', 'inventories');
        console.log('m2inventories', 'inventories');
        await connection
          .db()
          .renameCollection('m2reorderanalyses', 'reorder_analysis');
        console.log('m2reorderanalyses', 'reorder_analysis');
        await connection
          .db()
          .renameCollection('m2stockadjustments', 'stock_adjustments');
        console.log('m2stockadjustments', 'stock_adjustments');
        await connection
          .db()
          .renameCollection('m2stocktransfers', 'stock_transfers');
        console.log('m2stocktransfers', 'stock_transfers');
        await connection
          .db()
          .renameCollection('m2inventoryopenings', 'inventory_openings');
        console.log('m2inventoryopenings', 'inventory_openings');
        await connection.db().renameCollection('m2batches', 'batches');
        console.log('m2batches', 'batches');

        console.log('=================Drop collection============');
        await connection.db().dropCollection('m1inventories');
        console.log('m1inventories');
        await connection.db().dropCollection('m1reorderanalyses');
        console.log('m1reorderanalyses');
        await connection.db().dropCollection('m1stockadjustments');
        console.log('m1stockadjustments');
        await connection.db().dropCollection('m1stocktransfers');
        console.log('m1stocktransfers');
        await connection.db().dropCollection('m1inventoryopenings');
        console.log('m1inventoryopenings');
        await connection.db().dropCollection('m1batches');
        console.log('m1batches');

        await connection.db().dropCollection('m1cashpurchasereturns');
        console.log('m1cashpurchasereturns');
        await connection.db().dropCollection('m1cashpurchases');
        console.log('m1cashpurchases');
        await connection.db().dropCollection('m1cashsalereturns');
        console.log('m1cashsalereturns');
        await connection.db().dropCollection('m1cashsales');
        console.log('m1cashsales');
        await connection.db().dropCollection('m1creditpurchasereturns');
        console.log('m1creditpurchasereturns');
        await connection.db().dropCollection('m1creditpurchases');
        console.log('m1creditpurchases');
        await connection.db().dropCollection('m1creditsales');
        console.log('m1creditsales');
        await connection.db().dropCollection('m1creditsalereturns');
        console.log('m1creditsalereturns');

        await connection.db().dropCollection('m2cashpurchasereturns');
        console.log('m2cashpurchasereturns');
        await connection.db().dropCollection('m2cashpurchases');
        console.log('m2cashpurchases');
        await connection.db().dropCollection('m2cashsalereturns');
        console.log('m2cashsalereturns');
        await connection.db().dropCollection('m2cashsales');
        console.log('m2cashsales');
        await connection.db().dropCollection('m2creditpurchasereturns');
        console.log('m2creditpurchasereturns');
        await connection.db().dropCollection('m2creditpurchases');
        console.log('m2creditpurchases');
        await connection.db().dropCollection('m2creditsalereturns');
        console.log('m2creditsalereturns');
        await connection.db().dropCollection('m2creditsales');
        console.log('m2creditsales');

        await connection.db().dropCollection('accounttypes');
        console.log('accounttypes');
        await connection.db().dropCollection('countries');
        console.log('countries');
        await connection.db().dropCollection('gstregistrations');
        console.log('gstregistrations');
        await connection.db().dropCollection('privileges');
        console.log('privileges');
        await connection.db().dropCollection('states');
        console.log('states');
        await connection.db().dropCollection('taxtypes');
        console.log('taxtypes');
        await connection.db().dropCollection('vouchertypes');
        console.log('vouchertypes');
        await connection.db().dropCollection('userconfigs');
        console.log('userconfigs');
        await connection.db().dropCollection('configurations');
        console.log('configurations');

        const bookObj = [];
        const openingObj1 = {
          updateMany: {
            filter: { collectionName: 'inventoryopenings' },
            update: {
              $set: { collectionName: 'inventory_openings' },
            },
          },
        };
        bookObj.push(openingObj1);
        const openingObj2 = {
          updateMany: {
            filter: { collectionName: 'm2inventoryopenings' },
            update: {
              $set: { collectionName: 'inventory_openings' },
            },
          },
        };
        bookObj.push(openingObj2);
        const saleObj1 = {
          updateMany: {
            filter: { collectionName: 'm2cashsales' },
            update: {
              $set: { collectionName: 'sales' },
            },
          },
        };
        bookObj.push(saleObj1);
        const saleObj2 = {
          updateMany: {
            filter: { collectionName: 'm2creditsales' },
            update: {
              $set: { collectionName: 'sales' },
            },
          },
        };
        bookObj.push(saleObj2);
        const saleReturnObj1 = {
          updateMany: {
            filter: { collectionName: 'm2cashsalereturns' },
            update: {
              $set: { collectionName: 'sale_returns' },
            },
          },
        };
        bookObj.push(saleReturnObj1);
        const saleReturnObj2 = {
          updateMany: {
            filter: { collectionName: 'm2creditsalereturns' },
            update: {
              $set: { collectionName: 'sale_returns' },
            },
          },
        };
        bookObj.push(saleReturnObj2);
        const purchaseObj1 = {
          updateMany: {
            filter: { collectionName: 'm2cashpurchases' },
            update: {
              $set: { collectionName: 'purchases' },
            },
          },
        };
        bookObj.push(purchaseObj1);
        const purchaseObj2 = {
          updateMany: {
            filter: { collectionName: 'm2creditpurchases' },
            update: {
              $set: { collectionName: 'purchases' },
            },
          },
        };
        bookObj.push(purchaseObj2);
        const purchaseReturnObj1 = {
          updateMany: {
            filter: { collectionName: 'm2cashpurchasereturns' },
            update: {
              $set: { collectionName: 'purchase_returns' },
            },
          },
        };
        bookObj.push(purchaseReturnObj1);
        const purchaseReturnObj2 = {
          updateMany: {
            filter: { collectionName: 'm2creditpurchasereturns' },
            update: {
              $set: { collectionName: 'purchase_returns' },
            },
          },
        };
        bookObj.push(purchaseReturnObj2);
        await connection
          .db()
          .collection('inventorybooks')
          .bulkWrite(bookObj);
        console.log('inventorybooks collection name updated');
        await connection
          .db()
          .collection('accountbooks')
          .bulkWrite(bookObj);
        console.log('accountbooks collection name updated');
        await connection
          .db()
          .collection('customerbooks')
          .bulkWrite(bookObj);
        console.log('customerbooks collection name updated');
        await connection
          .db()
          .collection('vendorbooks')
          .bulkWrite(bookObj);
        console.log('vendorbooks collection name updated');
        await connection
          .db()
          .collection('cashregisterbooks')
          .bulkWrite(bookObj);
        console.log('cashregisterbooks collection name updated');

        await connection.close();
        return true;
      } catch (err) {
        console.log(err);
        return false;
      }
    }
  }

  async head(data: any) {
    const defaultHead = await this.inventoryHeadModel.create({
      name: data.name,
    });
    await this.branchModel.updateMany(
      {},
      { $set: { inventoryHead: defaultHead.id } },
    );
    await this.branchModel.updateMany(
      {},
      { $set: { features: { pharmacyRetail: data.pharmacyRetail } } },
    );
    await this.inventoryModel.updateMany(
      {},
      { $set: { head: defaultHead.id } },
    );
    return {
      head: `new head ${defaultHead.name} created`,
      message: `inventory head updated in branch, inventory collection`,
    };
  }
}
