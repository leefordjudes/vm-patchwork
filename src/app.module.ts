import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import * as schema from './model/schemas';
import { Patch3Controller } from './patch3.controller';
import { Patch3Service } from './patch3.service';
import { MergeController } from './merge.controller';
import { MergeService } from './merge.service';

// const URI = 'mongodb+srv://username:password@host/database?retryWrites=true&w=majority';
const URI = 'mongodb://localhost/velavanmedical';
// const URI = 'mongodb://localhost/velavanstationery';

@Module({
  imports: [
    MongooseModule.forRoot(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }),
    MongooseModule.forFeature([
      { name: 'PrintTemplate', schema: schema.printTemplateSchema },
      { name: 'Role', schema: schema.roleSchema },
      { name: 'User', schema: schema.userSchema },
      { name: 'Tax', schema: schema.taxSchema },
      { name: 'Branch', schema: schema.branchSchema },
      { name: 'Account', schema: schema.accountSchema },
      { name: 'VoucherNumbering', schema: schema.voucherNumberingSchema },
      { name: 'Warehouse', schema: schema.warehouseSchema },
      { name: 'Customer', schema: schema.customerSchema },
      { name: 'Vendor', schema: schema.vendorSchema },
      { name: 'GSTOutward', schema: schema.gstOutwardSchema },
      { name: 'GSTtransaction', schema: schema.gstTransactionSchema },
      { name: 'State', schema: schema.stateSchema },
      { name: 'CustomerBook', schema: schema.customerBookSchema },
      { name: 'M1CashSale', schema: schema.m1CashSaleSchema },
      { name: 'M2CashSale', schema: schema.m2CashSaleSchema },
      { name: 'M1CreditSale', schema: schema.m1CreditSaleSchema },
      { name: 'M2CreditSale', schema: schema.m2CreditSaleSchema },
      { name: 'M1CashPurchase', schema: schema.m1CashPurchaseSchema },
      { name: 'M2CashPurchase', schema: schema.m2CashPurchaseSchema },
      { name: 'M1CreditPurchase', schema: schema.m1CreditPurchaseSchema },
      { name: 'M2CreditPurchase', schema: schema.m2CreditPurchaseSchema },
      { name: 'M1CashSaleReturn', schema: schema.m1CashSaleReturnSchema },
      { name: 'M2CashSaleReturn', schema: schema.m2CashSaleReturnSchema },
      { name: 'M1CreditSaleReturn', schema: schema.m1CreditSaleReturnSchema },
      { name: 'M2CreditSaleReturn', schema: schema.m2CreditSaleReturnSchema },
      {
        name: 'M1CashPurchaseReturn',
        schema: schema.m1CashPurchaseReturnSchema,
      },
      {
        name: 'M2CashPurchaseReturn',
        schema: schema.m2CashPurchaseReturnSchema,
      },
      {
        name: 'M1CreditPurchaseReturn',
        schema: schema.m1CreditPurchaseReturnSchema,
      },
      {
        name: 'M2CreditPurchaseReturn',
        schema: schema.m2CreditPurchaseReturnSchema,
      },
      {
        name: 'M1InventoryOpening',
        schema: schema.m1InventoryOpeningSchema,
      },
      {
        name: 'M2InventoryOpening',
        schema: schema.m2InventoryOpeningSchema,
      },
      {
        name: 'Sale',
        schema: schema.saleSchema,
        collection: 'sales',
      },
      {
        name: 'Sale_Return',
        schema: schema.saleReturnSchema,
        collection: 'sale_returns',
      },
      {
        name: 'Purchase',
        schema: schema.purchaseSchema,
        collection: 'purchases',
      },
      {
        name: 'Purchase_Return',
        schema: schema.purchaseReturnSchema,
        collection: 'purchase_returns',
      },
      {
        name: 'Inventory_Head',
        schema: schema.inventoryHeadSchema,
        collection: 'inventory_heads',
      },
      {
        name: 'Inventory',
        schema: schema.inventorySchema,
        collection: 'inventories',
      },
      {
        name: 'Preference',
        schema: schema.preferenceSchema,
      },
    ]),
  ],
  controllers: [AppController, Patch3Controller, MergeController],
  providers: [AppService, Patch3Service, MergeService],
})
export class AppModule {}
