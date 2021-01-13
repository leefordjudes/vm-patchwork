import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import * as schema from './model/schemas';
import { Patch3Controller } from './patch3.controller';
import { Patch4Controller } from './patch4.controller';
import { Patch3Service } from './patch3.service';
import { MergeController } from './merge.controller';
import { MergeService } from './merge.service';
import { Patch4Service } from './patch4.service';
import { GSTFilingController } from './gst-filing.controller';
import { GSTFilingService } from './gst-filing.service';
import { Patch5Controller } from './patch5.controller';
import { Patch5Service } from './patch5.service';
import { URI } from './config';
import { Patch6Controller } from './patch6.controller';
import { Patch6Service } from './patch6.service';
import { Patch7Controller } from './patch7.controller';
import { Patch7Service } from './patch7.service';

// const URI = 'mongodb+srv://username:password@host/database?retryWrites=true&w=majority';
// const URI =  `mongodb://admin:12345678@192.168.1.20:27017/velavanmedical1?authSource=admin`;
// const URI = `mongodb://localhost/velavanstationery`;
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
      {
        name: 'VendorPending',
        schema: schema.vendorPendingSchema,
      },
      {
        name: 'CustomerPending',
        schema: schema.customerPendingSchema,
      },
      {
        name: 'GST_Filing',
        schema: schema.gstFilingSchema,
        collection: 'gst_filings',
      },
    ]),
  ],
  controllers: [
    AppController,
    Patch3Controller,
    MergeController,
    Patch4Controller,
    GSTFilingController,
    Patch5Controller,
    Patch6Controller,
    Patch7Controller,
  ],
  providers: [
    AppService,
    Patch3Service,
    MergeService,
    Patch4Service,
    GSTFilingService,
    Patch5Service,
    Patch6Service,
    Patch7Service,
  ],
})
export class AppModule {}
