import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import * as schema from './model/schemas';

// const URI = 'mongodb+srv://username:password@host/database?retryWrites=true&w=majority';
const URI = 'mongodb://localhost/velavanmedical1';
// const URI = 'mongodb://localhost/medical';

@Module({
  imports: [
    MongooseModule.forRoot(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }),
    MongooseModule.forFeature([
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
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
