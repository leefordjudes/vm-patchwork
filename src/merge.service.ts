import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

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
    @InjectModel('SaleReturn')
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
    @InjectModel('PurchaseReturn')
    private readonly purchaseReturnModel: Model<iface.PurchaseReturn>
  ) { }

  async m2Merge() {
    await this.m2CashSaleModel.aggregate([{ $addFields: { saleType: 'cash' } }, { $merge: this.saleModel.collection.name }]);
    await this.m2CreditSaleModel.aggregate([{ $addFields: { saleType: 'credit' } }, { $merge: this.saleModel.collection.name }]);

    await this.m2CashSaleReturnModel.aggregate([{ $addFields: { saleType: 'cash' } }, { $merge: this.saleReturnModel.collection.name }]);
    await this.m2CreditSaleReturnModel.aggregate([{ $addFields: { saleType: 'credit' } }, { $merge: this.saleReturnModel.collection.name }]);

    await this.m2CashPurchaseModel.aggregate([{ $addFields: { purchaseType: 'cash' } }, { $merge: this.purchaseModel.collection.name }]);
    await this.m2CreditPurchaseModel.aggregate([{ $addFields: { purchaseType: 'credit' } }, { $merge: this.purchaseModel.collection.name }]);

    await this.m2CashPurchaseReturnModel.aggregate([{ $addFields: { purchaseType: 'cash' } }, { $merge: this.purchaseReturnModel.collection.name }]);
    await this.m2CreditPurchaseReturnModel.aggregate([{ $addFields: { purchaseType: 'credit' } }, { $merge: this.purchaseReturnModel.collection.name }]);
    return 'medical merge done';
  }

  async m1Merge() {
    await this.m1CashSaleModel.aggregate([{ $addFields: { saleType: 'cash' } }, { $merge: this.saleModel.collection.name }]);
    await this.m1CreditSaleModel.aggregate([{ $addFields: { saleType: 'credit' } }, { $merge: this.saleModel.collection.name }]);

    await this.m1CashSaleReturnModel.aggregate([{ $addFields: { saleType: 'cash' } }, { $merge: this.saleReturnModel.collection.name }]);
    await this.m1CreditSaleReturnModel.aggregate([{ $addFields: { saleType: 'credit' } }, { $merge: this.saleReturnModel.collection.name }]);

    await this.m1CashPurchaseModel.aggregate([{ $addFields: { purchaseType: 'cash' } }, { $merge: this.purchaseModel.collection.name }]);
    await this.m1CreditPurchaseModel.aggregate([{ $addFields: { purchaseType: 'credit' } }, { $merge: this.purchaseModel.collection.name }]);

    await this.m1CashPurchaseReturnModel.aggregate([{ $addFields: { purchaseType: 'cash' } }, { $merge: this.purchaseReturnModel.collection.name }]);
    await this.m1CreditPurchaseReturnModel.aggregate([{ $addFields: { purchaseType: 'credit' } }, { $merge: this.purchaseReturnModel.collection.name }]);
    return 'stationery merge done';
  }

  async m1DeleteCollections() {
    await this.m1CashSaleModel.db.dropCollection(this.m1CashSaleModel.collection.name);
    await this.m1CreditSaleModel.db.dropCollection(this.m1CreditSaleModel.collection.name);
    await this.m1CashSaleReturnModel.db.dropCollection(this.m1CashSaleReturnModel.collection.name);
    await this.m1CreditSaleReturnModel.db.dropCollection(this.m1CreditSaleReturnModel.collection.name);
    await this.m1CashPurchaseModel.db.dropCollection(this.m1CashPurchaseModel.collection.name);
    await this.m1CreditPurchaseModel.db.dropCollection(this.m1CreditPurchaseModel.collection.name);
    await this.m1CashPurchaseReturnModel.db.dropCollection(this.m1CashPurchaseReturnModel.collection.name);
    await this.m1CreditPurchaseReturnModel.db.dropCollection(this.m1CreditPurchaseReturnModel.collection.name);
    return 'delete stationery collection';
  }

  async m2DeleteCollections() {
    await this.m2CashSaleModel.db.dropCollection(this.m2CashSaleModel.collection.name);
    await this.m2CreditSaleModel.db.dropCollection(this.m2CreditSaleModel.collection.name);
    await this.m2CashSaleReturnModel.db.dropCollection(this.m2CashSaleReturnModel.collection.name);
    await this.m2CreditSaleReturnModel.db.dropCollection(this.m2CreditSaleReturnModel.collection.name);
    await this.m2CashPurchaseModel.db.dropCollection(this.m2CashPurchaseModel.collection.name);
    await this.m2CreditPurchaseModel.db.dropCollection(this.m2CreditPurchaseModel.collection.name);
    await this.m2CashPurchaseReturnModel.db.dropCollection(this.m2CashPurchaseReturnModel.collection.name);
    await this.m2CreditPurchaseReturnModel.db.dropCollection(this.m2CreditPurchaseReturnModel.collection.name);
    return 'delete medical collection';
  }
}
