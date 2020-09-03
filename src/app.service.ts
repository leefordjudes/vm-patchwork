import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as moment from 'moment';
import * as _ from 'lodash';
import { InventoryBook } from './model/interfaces/inventory-book.interface';
import { M2InventoryOpening } from './model/interfaces/m2-inventory-opening.interface';
import { User } from './model/interfaces/user.interface';
import { Branch } from './model/interfaces/branch.interface';
import { M2Inventory } from './model/interfaces/m2-inventory.interface';

@Injectable()
export class AppService {
  constructor(
    @InjectModel('InventoryBook')
    private readonly inventoryBookModel: Model<InventoryBook>,
    @InjectModel('M2InventoryOpening')
    private readonly m2InventoryOpeningModel: Model<M2InventoryOpening>,
    @InjectModel('User')
    private readonly userModel: Model<User>,
    @InjectModel('Branch')
    private readonly branchModel: Model<Branch>,
    @InjectModel('M2Inventory')
    private readonly m2InventoryModel: Model<M2Inventory>,
  ) {}

  async patchM2InventoryBookFromM2InventoryOpening() {
    const queryPipeline = (
      outputCollectionName: string,
      openingDate: Date,
      userId: string,
      createdUpdatedDate: Date,
    ) => {
      return [
        { $addFields: { rowAssetValue: { $multiply: ['$pRate', '$qty'] } } },
        {
          $group: {
            _id: { inventoryId: '$inventory', branchId: '$branch' },
            inward: { $sum: '$qty' },
            assetValue: { $sum: '$rowAssetValue' },
          },
        },
        {
          $project: {
            _id: 0,
            inventoryId: { $toObjectId: '$_id.inventoryId' },
            branchId: { $toObjectId: '$_id.branchId' },
            inward: 1,
            assetValue: 1,
          },
        },
        {
          $lookup: {
            from: this.m2InventoryModel.collection.name,
            localField: 'inventoryId',
            foreignField: '_id',
            as: 'inventory',
          },
        },
        { $unwind: { path: '$inventory', preserveNullAndEmptyArrays: true } },
        {
          $set: {
            inventoryId: { $toString: '$inventoryId' },
            inventoryName: '$inventory.name',
          },
        },
        { $unset: 'inventory' },
        {
          $lookup: {
            from: this.branchModel.collection.name,
            localField: 'branchId',
            foreignField: '_id',
            as: 'branch',
          },
        },
        { $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } },
        {
          $set: {
            branchId: { $toString: '$branch._id' },
            branchName: '$branch.name',
          },
        },
        { $unset: 'branch' },
        {
          $addFields: {
            saleValue: 0,
            outward: 0,
            date: openingDate,
            refNo: '',
            voucherNo: '',
            createdAt: createdUpdatedDate,
            updatedAt: createdUpdatedDate,
            createdBy: userId,
            updatedBy: userId,
            voucherId: null,
            voucherType: 'INVENTORY_OPENING',
            voucherName: 'Inventory Opening',
            warehouseId: null,
            warehouseName: null,
            collectionName: this.m2InventoryOpeningModel.collection.name,
            __v: 0,
          },
        },
        {
          $merge: {
            into: outputCollectionName,
          },
        },
      ];
    };

    const user = await this.userModel.findOne({ username: 'admin' });
    const userId = (user._id as any).toString();
    const tempCollectionName = 'InventoryBook2';
    const openingDate = new Date(Date.UTC(2020, 7, 23, 0, 0, 0, 0)); // jan = 0
    const createdUpdatedDate = new Date(Date.UTC(2020, 8, 3, 0, 0, 0, 0));
    await this.m2InventoryOpeningModel.aggregate(
      queryPipeline(
        tempCollectionName,
        openingDate,
        userId,
        createdUpdatedDate,
      ),
    );
  }
}
