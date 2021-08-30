import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

import * as _ from 'lodash';

import { URI } from './config';
import { GST_TAXES } from './fixtures/gst-tax';
import { round } from './utils/utils';

function buildTaxSummary(invItems: any, partyGst: any) {
  const taxSummary = [];
  for (const invItem of invItems) {
    const qty = invItem.qty ?? 1;
    const rowAmount = invItem.rate * qty;

    const gstRatio = getGstRatio(partyGst, invItem.tax);
    const amounts = processAmount(gstRatio, rowAmount, invItem.disc, qty);

    const taxItem = taxSummary.find((t) => t.tax === invItem.tax);
    if (taxItem) {
      taxItem.taxableAmount += amounts.taxableAmount;
      taxItem.cgstAmount += amounts.cgstAmount ?? 0;
      taxItem.sgstAmount += amounts.sgstAmount ?? 0;
      taxItem.igstAmount += amounts.igstAmount ?? 0;
    } else {
      taxSummary.push({
        tax: invItem.tax,
        taxableAmount: amounts.taxableAmount,
        cgstAmount: amounts.cgstAmount ?? 0,
        sgstAmount: amounts.sgstAmount ?? 0,
        igstAmount: amounts.igstAmount ?? 0,
      });
    }
  }
  return taxSummary;
}

function getGstRatio(partyGst: any, tax: string) {
  const gstTax = GST_TAXES.find((g) => g.code === tax);
  const gstRatio: any = {};
  const cgst = tax ? gstTax.ratio.cgst : 0;
  const sgst = tax ? gstTax.ratio.sgst : 0;
  const igst = tax ? gstTax.ratio.igst : 0;
  if (partyGst && partyGst.location === '33') {
    _.assign(gstRatio, { igst: 0, cgst, sgst, natureOfTrn: 'Regular' });
  } else if (!partyGst) {
    _.assign(gstRatio, { igst: 0, cgst, sgst, natureOfTrn: 'Regular' });
  } else {
    _.assign(gstRatio, { igst, cgst: 0, sgst: 0, natureOfTrn: 'Regular' });
  }
  return gstRatio;
}

const processAmount = (gstRatio: any, amount: number, amountInfo: any, qty: number) => {
  let pValue: number;
  if (amountInfo && amountInfo.mode === 'P' && amountInfo.amount) {
    const discAmt = round(amount * (amountInfo.amount / 100));
    pValue = amount - discAmt;
  } else if (amountInfo && amountInfo.mode === 'V' && amountInfo.amount) {
    pValue = amount - round(amountInfo.amount * qty);
  } else {
    pValue = amount;
  }
  const amts: any = {};
  amts.taxableAmount = round(pValue);
  amts.cgstAmount = round(amts.taxableAmount * (gstRatio.cgst / 100));
  amts.sgstAmount = round(amts.taxableAmount * (gstRatio.sgst / 100));
  amts.igstAmount = round(amts.taxableAmount * (gstRatio.igst / 100));
  return amts;
};

enum COLLECTIONS {
  PURCHASE = 'purchases',
  GST_VOUCHER = 'gst_vouchers',
}

@Injectable()
export class DataModifyService {
  async taxSum() {
    const connection = await new MongoClient(URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }).connect();
    if (!connection.isConnected) {
      return 'Connection failed';
    }

    const dbs = ['velavanstationery', 'velavanhm', 'ttgold', 'ttgoldpalace', 'auditplustech', 'ramasamy', 'velavanmedical', 'velavanmed', 'rkmedicals', 'testorg', 'omshakthi'];
    // const dbs = ['velavanmedical'];
    for (const db of dbs) {
      console.log(`${db} purchases Started...`);
      const purchaseBulkOp = connection.db(db).collection(COLLECTIONS.PURCHASE).initializeOrderedBulkOp();
      const purchaseVouchers = await connection.db(db).collection(COLLECTIONS.PURCHASE).find({}, { projection: { invItems: 1, partyGst: 1, _id: 1 } }).toArray();
      for (const voucher of purchaseVouchers) {
        const result = buildTaxSummary(voucher.invItems, voucher.partyGst);
        const taxSummary = result.map((elm) => {
          return {
            tax: elm.tax,
            taxableAmount: round(elm.taxableAmount),
            cgstAmount: round(elm.cgstAmount),
            sgstAmount: round(elm.sgstAmount),
            igstAmount: round(elm.igstAmount),
          }
        });
        purchaseBulkOp.find({ _id: voucher._id }).updateOne({ $set: { taxSummary } });
      }
      if (purchaseVouchers.length > 0) {
        await purchaseBulkOp.execute();
        purchaseVouchers.length = 0;
      } else {
        console.log(`${db} PURCHASE VOUCHER NOT FOUND...`);
      }
      console.log(`${db} purchases End**`);
      console.log(`${db} GST Voucher Started...`);
      const gstVulkOp = connection.db(db).collection(COLLECTIONS.GST_VOUCHER).initializeOrderedBulkOp();
      const gstVouchers = await connection.db(db).collection(COLLECTIONS.GST_VOUCHER).find({}, { projection: { trns: 1, partyGst: 1, _id: 1 } }).toArray();
      for (const voucher of gstVouchers) {
        const result = buildTaxSummary(voucher.trns, voucher.partyGst);
        const taxSummary = result.map((elm) => {
          return {
            tax: elm.tax,
            taxableAmount: round(elm.taxableAmount),
            cgstAmount: round(elm.cgstAmount),
            sgstAmount: round(elm.sgstAmount),
            igstAmount: round(elm.igstAmount),
          }
        });
        gstVulkOp.find({ _id: voucher._id }).updateOne({ $set: { taxSummary } });
      }
      if (gstVouchers.length > 0) {
        await gstVulkOp.execute();
        console.log(`${db} GST Voucher End***`);
      } else {
        console.log(`${db} GST VOUCHER NOT FOUND...`);
      }
    }
    console.log('All organizations priceConfig update sucessfully...');
    return 'All organizations priceConfig update sucessfully...';
  }
}
