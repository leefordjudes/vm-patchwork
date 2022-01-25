import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

import * as _ from 'lodash';

import { DBS, URI } from './config';

@Injectable()
export class BankReconciliationStatementService {
  async patch() {
    const connection = await new MongoClient(URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }).connect();
    if (!connection.isConnected) {
      return 'Connection failed';
    }
    for (const db of DBS) {
      console.log(`${db} started..`);
      await connection.db(db).collection('inv_branch_details').dropIndex('inventory_1').catch((x) => console.log(x.message));

      await connection.db(db).collection('account_openings').dropIndex('account_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('account_openings').dropIndex('branch_1').catch((x) => console.log(x.message));

      await connection.db(db).collection('inventory_openings').dropIndex('inventory_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('inventory_openings').dropIndex('branch_1').catch((x) => console.log(x.message));

      await connection.db(db).collection('bank_transactions').dropIndex('date_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('bank_transactions').dropIndex('bankDate_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('bank_transactions').dropIndex('date_1_account_1_branch_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('bank_transactions').dropIndex('bankDate_1_account_1_branch_1').catch((x) => console.log(x.message));

      await connection.db(db).collection('account_transactions').dropIndex('date_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('account_transactions').dropIndex('effDate_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('account_transactions').dropIndex('pending_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('account_transactions').dropIndex('adjPending_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('account_transactions').dropIndex('account_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('account_transactions').dropIndex('accountType_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('account_transactions').dropIndex('branch_1').catch((x) => console.log(x.message));

      await connection.db(db).collection('account_transactions').dropIndex('date_1_branch_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('account_transactions').dropIndex('date_1_branch_1_account_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('account_transactions').dropIndex('date_1_branch_1_voucherType_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('account_transactions').dropIndex('date_1_branch_1_accountType_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('account_transactions').dropIndex('account_1_branch_1').catch((x) => console.log(x.message));

      await connection.db(db).collection('inventory_transactions').dropIndex('date_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('inventory_transactions').dropIndex('adjBatch_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('inventory_transactions').dropIndex('branch_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('inventory_transactions').dropIndex('inventory_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('inventory_transactions').dropIndex('expiry_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('inventory_transactions').dropIndex('voucherType_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('inventory_transactions').dropIndex('createdBy_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('inventory_transactions').dropIndex('updatedBy_1').catch((x) => console.log(x.message));

      await connection.db(db).collection('inventory_transactions').dropIndex('date_1_branch_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('inventory_transactions').dropIndex('date_1_branch_1_inventory_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('inventory_transactions').dropIndex('date_1_branch_1_voucherType_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('inventory_transactions').dropIndex('inventory_1_branch_1').catch((x) => console.log(x.message));

      await connection.db(db).collection('sales').dropIndex('date_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('sales').dropIndex('branch_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('sales').dropIndex('voucherNo_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('sales').dropIndex('updatedAt_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('sales').dropIndex('date_1_branch_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('sales').dropIndex('date_1_branch_1_voucherType_1').catch((x) => console.log(x.message));

      await connection.db(db).collection('purchases').dropIndex('date_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('purchases').dropIndex('branch_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('purchases').dropIndex('voucherNo_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('purchases').dropIndex('updatedAt_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('purchases').dropIndex('date_1_branch_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('purchases').dropIndex('date_1_branch_1_voucherType_1').catch((x) => console.log(x.message));

      await connection.db(db).collection('vouchers').dropIndex('date_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('vouchers').dropIndex('branch_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('vouchers').dropIndex('voucherNo_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('vouchers').dropIndex('updatedAt_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('vouchers').dropIndex('date_1_branch_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('vouchers').dropIndex('date_1_branch_1_voucherType_1').catch((x) => console.log(x.message));

      await connection.db(db).collection('gst_vouchers').dropIndex('date_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('gst_vouchers').dropIndex('voucherNo_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('gst_vouchers').dropIndex('updatedAt_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('gst_vouchers').dropIndex('date_1_branch_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('gst_vouchers').dropIndex('date_1_branch_1_partyType_1').catch((x) => console.log(x.message));

      await connection.db(db).collection('stock_adjustments').dropIndex('date_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('stock_adjustments').dropIndex('branch_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('stock_adjustments').dropIndex('voucherNo_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('stock_adjustments').dropIndex('updatedAt_1').catch((x) => console.log(x.message));

      await connection.db(db).collection('stock_transfers').dropIndex('date_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('stock_transfers').dropIndex('branch_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('stock_transfers').dropIndex('voucherNo_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('stock_transfers').dropIndex('updatedAt_1').catch((x) => console.log(x.message));

      await connection.db(db).collection('material_conversions').dropIndex('date_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('material_conversions').dropIndex('branch_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('material_conversions').dropIndex('voucherNo_1').catch((x) => console.log(x.message));
      await connection.db(db).collection('material_conversions').dropIndex('updatedAt_1').catch((x) => console.log(x.message));
      console.log(`${db} end..`);
    }
    console.log('All organizations unnecessary index remove successfully');
    return 'All organizations unnecessary index remove successfully';
  }
}
