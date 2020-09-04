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
import { TemporaryInventoryBook } from './model/interfaces/temp-inventory-book.interface';
import { VendorPending } from './model/interfaces/vendor-pending.interface';

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
    @InjectModel('TemporaryInventoryBook')
    private readonly temporaryInventoryBookModel: Model<TemporaryInventoryBook>,
    @InjectModel('VendorPending')
    private readonly vendorPendingModel: Model<VendorPending>,
  ) {}

  async setTempM2InventoryBookFromM2InventoryOpening() {
    const queryPipeline = (
      outputCollectionName: string,
      openingDate: Date,
      userId: string,
      createdUpdatedDate: Date,
    ) => {
      return [
        {
          $addFields: {
            rowAssetValue: {
              $round: [
                {
                  $multiply: [
                    { $subtract: ['$pRate', { $multiply: ['$pRate', 0.1] }] },
                    '$qty',
                  ],
                },
                2,
              ],
            },
          },
        },
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
    const tempCollectionName = this.temporaryInventoryBookModel.collection.name;
    const openingDate = new Date(Date.UTC(2020, 7, 23, 0, 0, 0, 0)); // jan = 0
    const createdUpdatedDate = new Date(Date.UTC(2020, 8, 3, 0, 0, 0, 0));
    await this.m2InventoryOpeningModel.deleteMany({
      inventory: '5f416bc26daef1963b317c63',
    });
    await this.m2InventoryOpeningModel.aggregate(
      queryPipeline(
        tempCollectionName,
        openingDate,
        userId,
        createdUpdatedDate,
      ),
    );

    const count = await this.temporaryInventoryBookModel.collection.countDocuments();
    return {
      message: `${count} documents created in ${this.temporaryInventoryBookModel.collection.name}`,
    };
  }

  async patchM2InventoryBookFromM2InventoryOpening() {
    const tempInvBooks = await this.temporaryInventoryBookModel.find({});
    const invBooks = await this.inventoryBookModel.find(
      { voucherType: 'INVENTORY_OPENING' },
      { _id: 1, inventoryId: 1, branchId: 1 },
    );
    const updateEntries = [];
    const insertEntries = [];
    const errorEntries = [];
    for (const tempInvBook of tempInvBooks) {
      const entry = invBooks.find(
        i =>
          i.inventoryId === tempInvBook.inventoryId &&
          i.branchId === tempInvBook.branchId,
      );
      if (entry) {
        const updateObj = {
          updateOne: {
            filter: {
              inventoryId: tempInvBook.inventoryId,
              branchId: tempInvBook.branchId,
            },
            update: {
              $set: {
                inventoryId: tempInvBook.inventoryId,
                inventoryName: tempInvBook.inventoryName,
                branchId: tempInvBook.branchId,
                branchName: tempInvBook.branchName,
                assetValue: tempInvBook.assetValue,
                inward: tempInvBook.inward,
                saleValue: 0,
                outward: 0,
                date: tempInvBook.date,
                refNo: '',
                voucherNo: '',
                createdAt: tempInvBook.createdAt,
                updatedAt: tempInvBook.updatedAt,
                createdBy: tempInvBook.createdBy,
                updatedBy: tempInvBook.updatedBy,
                voucherId: null,
                voucherType: 'INVENTORY_OPENING',
                voucherName: 'Inventory Opening',
                warehouseId: null,
                warehouseName: null,
                collectionName: this.m2InventoryOpeningModel.collection.name,
              },
            },
          },
        };
        updateEntries.push(updateObj);
      } else {
        if (tempInvBook.inventoryName) {
          const insertObj = {
            inventoryId: tempInvBook.inventoryId,
            inventoryName: tempInvBook.inventoryName,
            branchId: tempInvBook.branchId,
            branchName: tempInvBook.branchName,
            assetValue: tempInvBook.assetValue,
            inward: tempInvBook.inward,
            saleValue: 0,
            outward: 0,
            date: tempInvBook.date,
            refNo: '',
            voucherNo: '',
            createdAt: tempInvBook.createdAt,
            updatedAt: tempInvBook.updatedAt,
            createdBy: tempInvBook.createdBy,
            updatedBy: tempInvBook.updatedBy,
            voucherId: null,
            voucherType: 'INVENTORY_OPENING',
            voucherName: 'Inventory Opening',
            warehouseId: null,
            warehouseName: null,
            collectionName: this.m2InventoryOpeningModel.collection.name,
          };
          insertEntries.push(insertObj);
        } else {
          errorEntries.push({
            inventoryId: tempInvBook.inventoryId,
            inventoryName: tempInvBook.inventoryName,
            branchId: tempInvBook.branchId,
            branchName: tempInvBook.branchName,
          });
        }
      }
    }
    console.log('bulkWrite starts...');
    await this.inventoryBookModel.bulkWrite(updateEntries);
    console.log('insertMany starts...');
    await this.inventoryBookModel.insertMany(insertEntries);

    return {
      UpdatedEntries: updateEntries.length,
      NewEntries: insertEntries.length,
      ErrorEntries: JSON.stringify(errorEntries),
    };
  }

  async copyM2InventoryBook() {
    const queryPipeline = (outputCollectionName: string) => {
      return [
        { $match: { voucherType: 'INVENTORY_OPENING' } },
        {
          $merge: {
            into: outputCollectionName,
          },
        },
      ];
    };

    await this.inventoryBookModel.aggregate(
      queryPipeline('inventorybooksexisting'),
    );
    return {
      message:
        'existing inventory opening records copied from inventorybooks to inventorybooks_existing',
    };
  }

  async adjustVendorPending() {
    const queryPipeline = () => {
      return [
        {
          $addFields: { opening_adjusted: { $sum: ['$opening', '$adjusted'] } },
        },
        {
          $addFields: {
            opening_adjusted_closing: {
              $subtract: ['$opening_adjusted', '$closing'],
            },
          },
        },
        {
          $match: { opening_adjusted_closing: { $ne: 0 } },
        },
        {
          $project: {
            _id: 1,
            opening: 1,
            adjusted: 1,
            closing: 1,
            vendor: 1,
            opening_adjusted: 1,
          },
        },
      ];
    };

    const vendorPendings = await this.vendorPendingModel.aggregate(
      queryPipeline(),
    );
    const vendorPendingUpdateObj = [];
    for (const vp of vendorPendings) {
      const updateObj = {
        updateOne: {
          filter: { _id: vp._id },
          update: {
            $set: { closing: vp.opening_adjusted },
          },
        },
      };
      vendorPendingUpdateObj.push(updateObj);
    }
    await this.vendorPendingModel.bulkWrite(vendorPendingUpdateObj);
    return { message: `${vendorPendingUpdateObj.length} records updated` };
  }

  async updateInventoryBookDate() {
    const openingDate = new Date(Date.UTC(2020, 2, 31, 0, 0, 0, 0)); // jan = 0, 31-Mar-2020 00:00:00
    await this.inventoryBookModel.updateMany(
      { voucherType: 'INVENTORY_OPENING' },
      { $set: { date: openingDate } },
    );
  }
}
