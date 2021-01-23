import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

import { URI } from './config';
import { round } from './utils/utils';

@Injectable()
export class Patch8Service {
  async stockTranfer() {
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
      console.log('----sale patch start----');
      const cashSaleobj = {
        updateMany: {
          filter: { saleType: 'cash' },
          update: { $set: { voucherName: 'Cash Sale' } }
        }
      };
      const creditSaleobj = {
        updateMany: {
          filter: { saleType: 'credit' },
          update: { $set: { voucherName: 'Credit Sale' } }
        }
      };
      const allSaleobj = {
        updateMany: {
          filter: {},
          update: { $set: { voucherType: 'SALE' } }
        }
      };
      const saleAcTrns = {
        updateMany: {
          filter: { acTrns: { $elemMatch: { 'account.defaultName': { $in: ['CASH', 'TRADE_RECEIVABLE', 'SALES'] } } } },
          update: {
            $set: { 'acTrns.$[elm].isAlt': true },
          },
          arrayFilters: [{ 'elm.account.defaultName': { $in: ['CASH', 'TRADE_RECEIVABLE', 'SALES'] } }],
        },
      };

      var sale = await connection.db()
        .collection('sales').bulkWrite([saleAcTrns, cashSaleobj, creditSaleobj, allSaleobj]);

      console.log('-----sale patch end----');

      console.log('----sale-returns patch start----');
      const cashSaleReturnobj = {
        updateMany: {
          filter: { saleType: 'cash' },
          update: { $set: { voucherName: 'Cash Sale Return' } }
        }
      };
      const creditSaleReturnobj = {
        updateMany: {
          filter: { saleType: 'credit' },
          update: { $set: { voucherName: 'Credit Sale Return' } }
        }
      };
      const allSaleReturnobj = {
        updateMany: {
          filter: {},
          update: { $set: { voucherType: 'CREDIT_NOTE' } }
        }
      };

      var saleReturn = await connection.db().collection('sale_returns')
        .bulkWrite([saleAcTrns, cashSaleReturnobj, creditSaleReturnobj, allSaleReturnobj]);

      console.log('-----sale patch end----');

      console.log('-----purchases patch start----');
      const cashPurchaseobj = {
        updateMany: {
          filter: { purchaseType: 'cash' },
          update: { $set: { voucherName: 'Cash Purchase' } }
        }
      };
      const creditPurchaseobj = {
        updateMany: {
          filter: { purchaseType: 'credit' },
          update: { $set: { voucherName: 'Credit Purchase' } }
        }
      };
      const allPurchaseobj = {
        updateMany: {
          filter: {},
          update: { $set: { voucherType: 'PURCHASE' } }
        }
      };
      const purchaseAcTrns = {
        updateMany: {
          filter: { acTrns: { $elemMatch: { 'account.defaultName': { $in: ['CASH', 'TRADE_PAYABLE', 'PURCHASES'] } } } },
          update: {
            $set: { 'acTrns.$[elm].isAlt': true },
          },
          arrayFilters: [{ 'elm.account.defaultName': { $in: ['CASH', 'TRADE_PAYABLE', 'PURCHASES'] } }],
        },
      };

      var purchase = await connection.db()
        .collection('purchases').bulkWrite([purchaseAcTrns, cashPurchaseobj, creditPurchaseobj, allPurchaseobj]);

      console.log('-----purchases patch end----');

      console.log('-----purchase-retrun patch start----');
      const cashPurchaseReturnobj = {
        updateMany: {
          filter: { purchaseType: 'cash' },
          update: { $set: { voucherName: 'Cash Purchase Return' } }
        }
      };
      const creditPurchaseReturnobj = {
        updateMany: {
          filter: { purchaseType: 'credit' },
          update: { $set: { voucherName: 'Credit Purchase Return' } }
        }
      };
      const allPurchaseReturnobj = {
        updateMany: {
          filter: {},
          update: { $set: { voucherType: 'DEBIT_NOTE' } }
        }
      };

      var purchaseReurn = await connection.db()
        .collection('purchase_returns').bulkWrite([purchaseAcTrns, cashPurchaseReturnobj, creditPurchaseReturnobj, allPurchaseReturnobj]);

      console.log('-----purchase-returns patch end----');
      const cashBookObj1 = {
        updateMany: {
          filter: { voucherName: 'Customer Receipt' },
          update: { $set: { voucherType: 'RECEIPT' } }
        }
      };
      const cashBookObj2 = {
        updateMany: {
          filter: { voucherName: 'Cash Transfer' },
          update: { $set: { voucherType: 'JOURNAL' } }
        }
      };
      const accBookObj = {
        updateMany: {
          filter: { voucherName: { $in: ['Cash Purchase Return', 'Credit Purchase Return'] } },
          update: { $set: { voucherType: 'DEBIT_NOTE' } }
        }
      };
      console.log('-----cashregister books patch start----');
      var cashRegBook = await connection.db().collection('cashregisterbooks')
        .bulkWrite([cashBookObj1, cashBookObj2]);
      console.log('-----cashregister books patch END----');

      console.log('-----account books patch start----');
      var accBook = await connection.db().collection('accountbooks')
        .bulkWrite([accBookObj]);
      console.log('-----account books patch END----');

      console.log('ALL tranaction collection update started----');

      var accountOpening = await connection.db().collection('accountopenings')
        .updateMany({}, { $set: { voucherName: 'Account Opening', voucherType: 'ACCOUNT_OPENING' } });
      var customerOpening = await connection.db().collection('customeropenings')
        .updateMany({}, { $set: { voucherName: 'Customer Opening', voucherType: 'CUSTOMER_OPENING' } });
      var inventoryOpening = await connection.db().collection('inventory_openings')
        .updateMany({}, { $set: { voucherName: 'Inventory Opening', voucherType: 'INVENTORY_OPENING' } });
      var vendorOpening = await connection.db().collection('vendoropenings')
        .updateMany({}, { $set: { voucherName: 'Vendor Opening', voucherType: 'VENDOR_OPENING' } });
      var accountPayment = await connection.db().collection('accountpayments')
        .updateMany({}, { $set: { voucherName: 'Account Payment', voucherType: 'PAYMENT' } });
      var accountReceipt = await connection.db().collection('accountreceipts')
        .updateMany({}, { $set: { voucherName: 'Account Receipt', voucherType: 'RECEIPT' } });
      var cashDeposit = await connection.db().collection('cashdeposits')
        .updateMany({}, { $set: { voucherName: 'Cash Deposit', voucherType: 'CONTRA' } });
      var cashTransfer = await connection.db().collection('cashtransfers')
        .updateMany({}, { $set: { voucherName: 'Cash Transfer', voucherType: 'JOURNAL' } });
      var cashWithdrawal = await connection.db().collection('cashwithdrawals')
        .updateMany({}, { $set: { voucherName: 'Cash Withdrawal', voucherType: 'CONTRA' } });
      var customerPayment = await connection.db().collection('customerpayments')
        .updateMany({}, { $set: { voucherName: 'Customer Payment', voucherType: 'PAYMENT' } });
      var customerreceipts = await connection.db().collection('customerreceipts')
        .updateMany({}, { $set: { voucherName: 'Customer Receipt', voucherType: 'RECEIPT' } });
      var expenses = await connection.db().collection('expenses')
        .updateMany({}, { $set: { voucherName: 'Expense Payment', voucherType: 'PAYMENT' } });
      var incomes = await connection.db().collection('incomes')
        .updateMany({}, { $set: { voucherName: 'Income Receipt', voucherType: 'RECEIPT' } });
      var materialConversions = await connection.db().collection('material_conversions')
        .updateMany({}, { $set: { voucherName: 'Material Conversion', voucherType: 'STOCK_JOURNAL' } });
      var stockAdjustments = await connection.db().collection('stock_adjustments')
        .updateMany({}, { $set: { voucherName: 'Stock Adjustment', voucherType: 'STOCK_JOURNAL' } });
      var stockTransfers = await connection.db().collection('stock_transfers')
        .updateMany({}, { $set: { voucherName: 'Stock Transfer', voucherType: 'STOCK_JOURNAL' } });
      var vendorpayments = await connection.db().collection('vendorpayments')
        .updateMany({}, { $set: { voucherName: 'Vendor Payment', voucherType: 'PAYMENT' } });
      var vendorreceipts = await connection.db().collection('vendorreceipts')
        .updateMany({}, { $set: { voucherName: 'Vendor Receipt', voucherType: 'RECEIPT' } });

      console.log('ALL tranaction collection update end----');
      const stockTransferUpdateObj = [];
      const accountBookUpdateObj = [];
      const branchBookUpdateObj = [];
      const stockTranfers: any = await connection.db()
        .collection('stock_transfers').find({}, { projection: { acTrns: 1, branch: 1, targetBranch: 1, amount: 1, approved: 1 } })
        .toArray();
      console.log('Total stock transfer to patch: ' + stockTranfers.length);
      console.log('3. stock transfer patch object generate start');
      for (const st of stockTranfers) {
        const voucherId = st._id.toString();
        // const sourceBranch = st.branch.id;
        // const targetBranch = st.targetBranch.id;
        const amount = round(st.amount);
        const stUpdateObj1 = {
          updateOne: {
            filter: { _id: st._id, acTrns: { $elemMatch: { 'account.name': 'Branch Payable', 'debit': { $gt: 0 } } } },
            update: {
              $set: { 'acTrns.$[elm].debit': amount },
            },
            arrayFilters: [{ 'elm.debit': { $gt: 0 }, 'elm.account.name': 'Branch Payable' }],
          },
        };
        stockTransferUpdateObj.push(stUpdateObj1);
        const stUpdateObj2 = {
          updateOne: {
            filter: { _id: st._id, acTrns: { $elemMatch: { 'account.name': 'Branch Payable', 'credit': { $gt: 0 } } } },
            update: {
              $set: { 'acTrns.$[elm].credit': amount },
            },
            arrayFilters: [{ 'elm.credit': { $gt: 0 }, 'elm.account.name': 'Branch Payable' }],
          },
        };
        if (st.approved) {
          stockTransferUpdateObj.push(stUpdateObj2);
        }
        const bookUpdateObj1 = {
          updateOne: {
            filter: { voucherId, accountName: 'Branch Payable', debit: { $gt: 0 } },
            update: {
              $set: { debit: amount },
            },
          },
        };
        const bookUpdateObj2 = {
          updateOne: {
            filter: { voucherId, accountName: 'Branch Payable', credit: { $gt: 0 } },
            update: {
              $set: { credit: amount },
            },
          },
        };
        accountBookUpdateObj.push(bookUpdateObj1);
        accountBookUpdateObj.push(bookUpdateObj2);
        const branchUpdateObj1 = {
          updateOne: {
            filter: { voucherId, debit: { $gt: 0 } },
            update: {
              $set: { debit: amount },
            },
          },
        };
        const branchUpdateObj2 = {
          updateOne: {
            filter: { voucherId, credit: { $gt: 0 } },
            update: {
              $set: { credit: amount },
            },
          },
        };
        branchBookUpdateObj.push(branchUpdateObj1);
        branchBookUpdateObj.push(branchUpdateObj2);
      }
      console.log('3. stock_transfers patch object generate end, Total patch Objects: ' + stockTransferUpdateObj.length);
      if (stockTransferUpdateObj.length > 0) {
        console.log('stock_transfers patch start');
        var stockTransfersAcTrns = await connection
          .db()
          .collection('stock_transfers')
          .bulkWrite(stockTransferUpdateObj);
        console.log('--stock_transfers patch done--');
      } else {
        console.log('No stock_transfers patched');
      }
      console.log('4 accountbooks patch object generate end, Total patch Objects: ' + accountBookUpdateObj.length);
      if (accountBookUpdateObj.length > 0) {
        console.log('account patch start');
        var accBook1 = await connection.db().collection('accountbooks')
          .bulkWrite(accountBookUpdateObj);
        console.log('--account book patch done--');
      } else {
        console.log('No account book patched');
      }
      console.log('5 branchbooks patch object generate end, Total patch Objects: ' + branchBookUpdateObj.length);
      if (branchBookUpdateObj.length > 0) {
        console.log('branch book patch start');
        var brBook = await connection.db().collection('branchbooks')
          .bulkWrite(branchBookUpdateObj);
        console.log('--branch book patch done--');
      } else {
        console.log('No branch book patched');
      }

    } catch (err) {
      console.log(err.message);
      return err;
    }
    await connection.close();
    return {
      sale, saleReturn, purchase, purchaseReurn, cashRegBook, accBook,
      accountOpening, customerOpening, inventoryOpening, vendorOpening,
      accountPayment, accountReceipt, cashDeposit, cashTransfer,
      cashWithdrawal, customerPayment, customerreceipts, expenses,
      incomes, materialConversions, stockAdjustments, stockTransfers,
      vendorpayments, vendorreceipts, stockTransfersAcTrns, accBook1, brBook
    };
  }
}
