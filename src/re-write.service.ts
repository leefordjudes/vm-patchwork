import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import * as _ from 'lodash';

import { URI } from './config';
import { round } from './utils/utils';

@Injectable()
export class ReWriteService {
  async reWrite() {
    const connection = await new MongoClient(URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }).connect();
    if (connection.isConnected()) {
      function applyInvTransactions(data: any) {
        const trns = _.cloneDeep(data.trns);
        const inventoryBook = [];
        const record = {
          date: data.date,
          branch: data.branch,
          act: false,
          actHide: false,
          isOpening: data.isOpening,
          altAccount: data.altAccount,
          updatedBy: data.updatedBy,
          warehouse: data.warehouse,
          refNo: data.refNo,
          voucherId: data.voucherId,
          voucherNo: data.voucherNo,
          voucherName: data.voucherName,
          voucherType: data.voucherType,
        };
        for (const trn of trns) {
          const opening = trn.inward - trn.outward;
          const obj = {
            inventory: trn.inventory,
            inward: trn.inward,
            outward: trn.outward,

            saleValue: trn.taxableAmount ?? undefined,
            assetValue: trn.assetAmount ?? undefined,
            profitPercent: trn.profitPercent ?? undefined,
            profitValue: trn.profitAmount ?? undefined,

            batchNo: trn.batchNo ?? undefined,
            batch: trn?._id ? trn._id : undefined,
            adjBatch: trn.batchNo ? trn._id : trn.batch ? trn.batch : undefined,
            opening: data.isOpening ? opening : trn.batchNo ? opening : undefined,
            unitConv: trn.unitConv ?? undefined,

            mrp: trn.mrp ?? undefined,
            nlc: trn.nlc ?? undefined,
            rate: trn.rate ?? undefined,
            pRate: trn.pRate ?? undefined,
            sRate: trn.sRate ?? undefined,
            expiry: trn.expiry ?? undefined,

            pRateTaxInc: trn.pRateTaxInc ?? undefined,
            sRateTaxInc: trn.sRateTaxInc ?? undefined,
          };
          const doc = _.pickBy(_.assign({}, record, obj), v => v !== null && v !== undefined);
          inventoryBook.push(doc);
        }
        return inventoryBook;
      }

      function applyAccTransactions(data: any) {
        const trns = _.cloneDeep(data.trns);
        const accountBook = [];
        const record = {
          date: data.date,
          effDate: data.effDate ? data.effDate : data.date,
          act: false,
          actHide: false,
          isOpening: data.isOpening,
          branch: data.branch,
          updatedBy: data.updatedBy,
          voucherId: data.voucherId,
          voucherNo: data.voucherNo,
          voucherName: data.voucherName,
          voucherType: data.voucherType,
          refNo: data.refNo,
        };
        const crAlt: any = _.maxBy(
          trns.filter(x => x.accountType !== 'STOCK'),
          'debit',
        );
        const drAlt: any = _.maxBy(
          trns.filter(x => x.accountType !== 'STOCK'),
          'credit',
        );
        for (const trn of trns) {
          let opening: number;
          if (!data.isOpening) {
            opening = _.reduce(
              trns.filter(v => v.account.toString() === trn.account.toString() && trn._id),
              (s, x) => s + x.debit - x.credit,
              0,
            );
          }
          for (const adj of trn?.adjs || []) {
            if (adj.amount !== 0) {
              const adjObj = {
                account: trn.account,
                accountType: trn.accountType,
                credit: trn.credit > 0 ? Math.abs(adj.amount) : 0,
                debit: trn.debit > 0 ? adj.amount : 0,
                altAccount: trn.credit > 0 ? crAlt.account ?? undefined : drAlt.account ?? undefined,
              };
              if (trn._id) {
                _.assign(adjObj, { pending: trn._id, adjPending: adj.pending, opening: round(opening) });
              }
              const doc = _.pickBy(_.assign({}, record, adjObj), v => v !== null && v !== undefined && v !== '');
              accountBook.push(doc);
            }
            trn.debit = trn.debit > 0 ? trn.debit - adj.amount : trn.debit;
            trn.credit = trn.credit > 0 ? trn.credit - Math.abs(adj.amount) : trn.credit;
          }
          if (trn.credit !== 0 || trn.debit !== 0) {
            const obj = {
              account: trn.account,
              accountType: trn.accountType,
              credit: trn.credit,
              debit: trn.debit,
              altAccount: trn.credit > 0 ? crAlt.account ?? undefined : drAlt.account ?? undefined,
            };
            if (data.isOpening) {
              if (trn.refNo) {
                _.assign(obj, { refNo: trn.refNo });
              }
              if (trn.effDate) {
                _.assign(obj, { effDate: trn.effDate });
              }
              opening = trn.debit - trn.credit;
              delete obj.altAccount;
            }
            if (trn._id) {
              _.assign(obj, { pending: trn._id, adjPending: trn._id, opening: round(opening) });
            }
            const doc = _.pickBy(_.assign({}, record, obj), v => v !== null && v !== undefined);
            accountBook.push(doc);
          }
        }
        return accountBook;
      }

      async function reWriteVouchers(db: string, collection: string) {
        const count = await connection.db(db).collection(collection).countDocuments();
        if (count > 0) {
          const limit = 500;
          for (let skip = 0; skip <= count; skip = skip + limit) {
            console.log({ organization: db, collectionName: collection });
            const start = new Date().getTime();
            const acTrnsbulkOperation = connection.db(db).collection('account_transactions').initializeOrderedBulkOp();
            const invTrnsbulkOperation = connection.db(db).collection('inventory_transactions').initializeOrderedBulkOp();
            const sttt = new Date().getTime();
            console.log(`bulkOperation initialzed Duration ${start - sttt}`);
            const vouchers: any = await connection.db(db).collection(collection)
              .find({}, { sort: { _id: 1 }, skip, limit }).toArray();
            console.log(`get ${skip} to ${skip + limit} voucher duration ${new Date().getTime() - sttt}`);
            for (const voucher of vouchers) {
              let bookObj = {};
              let invTxn = [];
              let accTxn = [];
              const colls = ['sales', 'purchases', 'stock_adjustments'];
              if (collection === 'vouchers') {
                bookObj = {
                  trns: voucher.acTrns,
                  date: voucher.date,
                  isOpening: false,
                  branch: voucher.branch,
                  voucherId: voucher._id,
                  voucherNo: voucher.voucherNo,
                  voucherName: voucher.voucherName,
                  voucherType: voucher.voucherType,
                  createdBy: voucher.createdBy,
                  updatedBy: voucher.updatedBy,
                  refNo: voucher.refNo,
                };
                accTxn = applyAccTransactions(bookObj);
              }
              if (collection === 'inventory_openings') {
                bookObj = {
                  trns: voucher.invTrns,
                  date: voucher.date,
                  isOpening: true,
                  branch: voucher.branch,
                  updatedBy: voucher.updatedBy,
                };
                invTxn = applyInvTransactions(bookObj);
              }
              if (collection === 'account_openings') {
                bookObj = {
                  trns: voucher.acTrns,
                  date: voucher.date,
                  branch: voucher.branch,
                  isOpening: true,
                  updatedBy: voucher.updatedBy,
                };
                accTxn = applyAccTransactions(bookObj);
              }
              if (colls.includes(collection)) {
                bookObj = {
                  date: voucher.date,
                  isOpening: false,
                  branch: voucher.branch,
                  warehouse: voucher.warehouse,
                  voucherId: voucher._id,
                  voucherNo: voucher.voucherNo,
                  voucherName: voucher.voucherName,
                  voucherType: voucher.voucherType,
                  createdBy: voucher.createdBy,
                  updatedBy: voucher.updatedBy,
                  refNo: voucher.refNo,
                };
                accTxn = applyAccTransactions(_.assign(bookObj, { trns: voucher.acTrns }));
                invTxn = applyInvTransactions(_.assign(bookObj, { trns: voucher.invTrns }));
              }

              if (accTxn.length > 0) {
                for (const doc of accTxn) {
                  acTrnsbulkOperation.insert(doc);
                }
              }
              if (invTxn.length > 0) {
                for (const doc of invTxn) {
                  invTrnsbulkOperation.insert(doc);
                }
              }
            }

            console.log(`insert started for  ${skip} to ${skip + limit}`);
            const startTime = new Date().getTime();
            const acTrnsColls = ['account_openings', 'vouchers', 'sales', 'purchases', 'stock_adjustments'];
            const invTrnsColls = ['inventory_openings', 'sales', 'purchases', 'stock_adjustments'];
            if (invTrnsColls.includes(collection)) {
              await invTrnsbulkOperation.execute();
            }
            if (acTrnsColls.includes(collection)) {
              await acTrnsbulkOperation.execute();
            }
            console.log(`insert ended for  ${skip} to ${skip + limit}`);
            console.log(`Duration for ${skip} to ${skip + limit} was ${(new Date().getTime() - startTime) / 1000}-sec`)
          }
        }
      }
      const dbs = ['velavanmedical1'];
      for (const db of dbs) {
        const collections = ['vouchers', 'account_openings', 'inventory_openings', 'sales', 'purchases'];
        // const collections = ['sales', 'purchases']; // checking
        for (const collection of collections) {
          await reWriteVouchers(db, collection);
        }
      }
      return 're-write completed';
    } else {
      return 'connection failed';
    }
  }
}
