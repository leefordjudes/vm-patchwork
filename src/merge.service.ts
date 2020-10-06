import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
    private readonly m1CashPurchaseReturnModel: Model<iface.M1CashPurchaseReturn>,
    @InjectModel('M1CreditPurchaseReturn')
    private readonly m1CreditPurchaseReturnModel: Model<iface.M1CreditPurchaseReturn>,
    @InjectModel('M2CashPurchaseReturn')
    private readonly m2CashPurchaseReturnModel: Model<iface.M2CashPurchaseReturn>,
    @InjectModel('M2CreditPurchaseReturn')
    private readonly m2CreditPurchaseReturnModel: Model<iface.M2CreditPurchaseReturn>,
    @InjectModel('Purchase_Return')
    private readonly purchaseReturnModel: Model<iface.PurchaseReturn>,
    @InjectModel('Inventory_Head')
    private readonly inventoryHeadModel: Model<iface.InventoryHead>,
    @InjectModel('Branch')
    private readonly branchModel: Model<iface.Branch>,
    @InjectModel('Inventorie')
    private readonly inventoryModel: Model<iface.Branch>,
  ) { }

  async m2Merge() {
    await this.m2CashSaleModel.aggregate([{ $addFields: { saleType: 'cash' } }, { $merge: { into: this.saleModel.collection.name } }]);
    await this.m2CreditSaleModel.aggregate([{ $addFields: { saleType: 'credit' } }, { $merge: { into: this.saleModel.collection.name } }]);

    await this.m2CashSaleReturnModel.aggregate([{ $addFields: { saleType: 'cash' } }, { $merge: { into: this.saleReturnModel.collection.name } }]);
    await this.m2CreditSaleReturnModel.aggregate([{ $addFields: { saleType: 'credit' } }, { $merge: { into: this.saleReturnModel.collection.name } }]);

    await this.m2CashPurchaseModel.aggregate([{ $addFields: { purchaseType: 'cash' } }, { $merge: { into: this.purchaseModel.collection.name } }]);
    await this.m2CreditPurchaseModel.aggregate([{ $addFields: { purchaseType: 'credit' } }, { $merge: { into: this.purchaseModel.collection.name } }]);

    await this.m2CashPurchaseReturnModel.aggregate([{ $addFields: { purchaseType: 'cash' } }, { $merge: { into: this.purchaseReturnModel.collection.name } }]);
    await this.m2CreditPurchaseReturnModel.aggregate([{ $addFields: { purchaseType: 'credit' } }, { $merge: { into: this.purchaseReturnModel.collection.name } }]);
    return 'medical merge done';
  }

  async m1Merge() {
    await this.m1CashSaleModel.aggregate([{ $addFields: { saleType: 'cash' } }, { $merge: { into: this.saleModel.collection.name } }]);
    await this.m1CreditSaleModel.aggregate([{ $addFields: { saleType: 'credit' } }, { $merge: { into: this.saleModel.collection.name } }]);

    await this.m1CashSaleReturnModel.aggregate([{ $addFields: { saleType: 'cash' } }, { $merge: { into: this.saleReturnModel.collection.name } }]);
    await this.m1CreditSaleReturnModel.aggregate([{ $addFields: { saleType: 'credit' } }, { $merge: { into: this.saleReturnModel.collection.name } }]);

    await this.m1CashPurchaseModel.aggregate([{ $addFields: { purchaseType: 'cash' } }, { $merge: { into: this.purchaseModel.collection.name } }]);
    await this.m1CreditPurchaseModel.aggregate([{ $addFields: { purchaseType: 'credit' } }, { $merge: { into: this.purchaseModel.collection.name } }]);

    await this.m1CashPurchaseReturnModel.aggregate([{ $addFields: { purchaseType: 'cash' } }, { $merge: { into: this.purchaseReturnModel.collection.name } }]);
    await this.m1CreditPurchaseReturnModel.aggregate([{ $addFields: { purchaseType: 'credit' } }, { $merge: { into: this.purchaseReturnModel.collection.name } }]);
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
        await connection.db().renameCollection('m1inventories', 'inventories');
        await connection.db().renameCollection('m1reorderanalyses', 'reorder_analysis');
        await connection.db().renameCollection('m1stockadjustments', 'stock_adjustments');
        await connection.db().renameCollection('m1stocktransfers', 'stock_transfers');
        await connection.db().renameCollection('m1inventoryopenings', 'inventory_openings');
        await connection.db().renameCollection('m1batches', 'batches');

        await connection.db().dropCollection('m2inventories');
        await connection.db().dropCollection('m2reorderanalyses');
        await connection.db().dropCollection('m2stockadjustments');
        await connection.db().dropCollection('m2stocktransfers');
        await connection.db().dropCollection('m2inventoryopenings');
        await connection.db().dropCollection('m2batches');

        await connection.db().dropCollection('m1cashpurchasereturns');
        await connection.db().dropCollection('m1cashpurchases');
        await connection.db().dropCollection('m1cashsalereturns');
        await connection.db().dropCollection('m1cashsales');
        await connection.db().dropCollection('m1creditpurchasereturns');
        await connection.db().dropCollection('m1creditpurchases');
        await connection.db().dropCollection('m1creditsales');
        await connection.db().dropCollection('m1creditsalereturns');

        await connection.db().dropCollection('m2cashpurchasereturns');
        await connection.db().dropCollection('m2cashpurchases');
        await connection.db().dropCollection('m2cashsalereturns');
        await connection.db().dropCollection('m2cashsales');
        await connection.db().dropCollection('m2creditpurchasereturns');
        await connection.db().dropCollection('m2creditpurchases');
        await connection.db().dropCollection('m2creditsalereturns');
        await connection.db().dropCollection('m2creditsales');

        await connection.db().dropCollection('accounttypes');
        await connection.db().dropCollection('countries');
        await connection.db().dropCollection('gstregistrations');
        await connection.db().dropCollection('privileges');
        await connection.db().dropCollection('states');
        await connection.db().dropCollection('taxtypes');
        await connection.db().dropCollection('templatelayouts');
        await connection.db().dropCollection('vouchertypes');
        await connection.close();
        return true;
      } catch (err) {
        return false;
      }
    } else if (orgType === 'm2') {
      try {
        const connection = await new MongoClient(uri, {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }).connect();
        await connection.db().renameCollection('m2inventories', 'inventories');
        await connection.db().renameCollection('m2reorderanalyses', 'reorder_analysis');
        await connection.db().renameCollection('m2stockadjustments', 'stock_adjustments');
        await connection.db().renameCollection('m2stocktransfers', 'stock_transfers');
        await connection.db().renameCollection('m2inventoryopenings', 'inventory_openings');
        await connection.db().renameCollection('m2batches', 'batches');

        await connection.db().dropCollection('m1inventories');
        await connection.db().dropCollection('m1reorderanalyses');
        await connection.db().dropCollection('m1stockadjustments');
        await connection.db().dropCollection('m1stocktransfers');
        await connection.db().dropCollection('m1inventoryopenings');
        await connection.db().dropCollection('m1batches');

        await connection.db().dropCollection('m1cashpurchasereturns');
        await connection.db().dropCollection('m1cashpurchases');
        await connection.db().dropCollection('m1cashsalereturns');
        await connection.db().dropCollection('m1cashsales');
        await connection.db().dropCollection('m1creditpurchasereturns');
        await connection.db().dropCollection('m1creditpurchases');
        await connection.db().dropCollection('m1creditsales');
        await connection.db().dropCollection('m1creditsalereturns');

        await connection.db().dropCollection('m2cashpurchasereturns');
        await connection.db().dropCollection('m2cashpurchases');
        await connection.db().dropCollection('m2cashsalereturns');
        await connection.db().dropCollection('m2cashsales');
        await connection.db().dropCollection('m2creditpurchasereturns');
        await connection.db().dropCollection('m2creditpurchases');
        await connection.db().dropCollection('m2creditsalereturns');
        await connection.db().dropCollection('m2creditsales');

        await connection.db().dropCollection('accounttypes');
        await connection.db().dropCollection('countries');
        await connection.db().dropCollection('gstregistrations');
        await connection.db().dropCollection('privileges');
        await connection.db().dropCollection('states');
        await connection.db().dropCollection('taxtypes');
        await connection.db().dropCollection('templatelayouts');
        await connection.db().dropCollection('vouchertypes');

        await connection.close();
        return true;
      } catch (err) {
        return false;
      }
    }
  }

  async head(data: any) {
    const defaultHead = await this.inventoryHeadModel.create({name: data.name});
    await this.branchModel.updateMany({}, {$set: {inventoryHead: defaultHead.id, "features": { "pharamacyRetail": true}}});
    await this.inventoryModel.updateMany({}, {$set: {head: defaultHead.id}})
  }
}
