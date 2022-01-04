import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

import * as moment from 'moment';

import { URI } from './config';
import { GST_TAXES } from './fixtures/gst-tax';
import { Types } from 'mongoose';
import { round } from './utils/utils';

@Injectable()
export class InventoryImportService {
  async patch() {
    const connection = await new MongoClient(URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }).connect();
    if (!connection.isConnected) {
      return 'Connection failed';
    }
    const db = 'swarnastores';
    const date = new Date();
    const head = (await connection.db(db).collection('inventory_heads').findOne({ defaultName: 'DEFAULT' }))._id;
    const user = (await connection.db(db).collection('users').findOne({ isAdmin: true }))._id;
    const branch = (await connection.db(db).collection('branches').findOne({}))._id;
    const org = await connection.db('auditplusdb').collection('organizations').findOne({ name: db });
    const orgBookBegin = moment(org.bookBegin).subtract(1, 'day').toDate();
    const sectionArr = [
      {
        name: 'GENERAL',
        displayName: 'GENERAL',
        validateName: 'general',
        createdBy: user,
        updatedBy: user,
        createdAt: date,
        updatedAt: date,
      },
      {
        name: 'MILK',
        displayName: 'MILK',
        validateName: 'milk',
        createdBy: user,
        updatedBy: user,
        createdAt: date,
        updatedAt: date,
      },
      {
        name: 'ONELINE SALE',
        displayName: 'ONELINE SALE',
        validateName: 'onelinesale',
        createdBy: user,
        updatedBy: user,
        createdAt: date,
        updatedAt: date,
      },
      {
        name: 'SNACKS',
        displayName: 'SNACKS',
        validateName: 'snacks',
        createdBy: user,
        updatedBy: user,
        createdAt: date,
        updatedAt: date,
      },
      {
        name: 'VEGETABLES',
        displayName: 'VEGETABLES',
        validateName: 'vegetables',
        createdBy: user,
        updatedBy: user,
        createdAt: date,
        updatedAt: date,
      },
      {
        name: 'XEROX',
        displayName: 'XEROX',
        validateName: 'xerox',
        createdBy: user,
        updatedBy: user,
        createdAt: date,
        updatedAt: date,
      },
    ];
    await connection.db(db).collection('sections').insertMany(sectionArr);
    const unitArr = [
      {
        name: 'GMS',
        displayName: 'GMS',
        validateName: 'gms',
        symbol: 'GMS',
        uqc: 'GMS',
        createdBy: user,
        updatedBy: user,
        createdAt: date,
        updatedAt: date,
      },
      {
        name: 'KGS',
        displayName: 'KGS',
        validateName: 'kgs',
        symbol: 'KGS',
        uqc: 'KGS',
        createdBy: user,
        updatedBy: user,
        createdAt: date,
        updatedAt: date,
      },
      {
        name: 'LTR',
        displayName: 'LTR',
        validateName: 'ltr',
        symbol: 'LTR',
        uqc: 'OTH',
        createdBy: user,
        updatedBy: user,
        createdAt: date,
        updatedAt: date,
      },
      {
        name: 'ML',
        displayName: 'ML',
        validateName: 'ml',
        symbol: 'ML',
        uqc: 'OTH',
        createdBy: user,
        updatedBy: user,
        createdAt: date,
        updatedAt: date,
      },
      {
        name: 'NOS',
        displayName: 'NOS',
        validateName: 'nos',
        symbol: 'NOS',
        uqc: 'NOS',
        createdBy: user,
        updatedBy: user,
        createdAt: date,
        updatedAt: date,
      },
      {
        name: 'OTHERS',
        displayName: 'OTHERS',
        validateName: 'others',
        symbol: 'OTH',
        uqc: 'OTH',
        createdBy: user,
        updatedBy: user,
        createdAt: date,
        updatedAt: date,
      },
    ];
    await connection.db(db).collection('units').insertMany(unitArr);
    const units = await connection.db(db).collection('units').find({}, { projection: { _id: 1, displayName: 1 } }).toArray();
    const sections = await connection.db(db).collection('sections').find({}, { projection: { _id: 1, displayName: 1 } }).toArray();
    const invBulkOperation = connection.db(db).collection('inventories').initializeOrderedBulkOp();
    const invOpeningBulkOperation = connection.db(db).collection('inventory_openings').initializeOrderedBulkOp();
    const invTrnsBulkOperation = connection.db(db).collection('inventory_transactions').initializeOrderedBulkOp();
    const vouchers = await connection.db(db).collection('inv-import').find({}).toArray();
    for (const voucher of vouchers) {
      const tax = Number(voucher.PM_GSTPER) === 0 ? 'gst0' : GST_TAXES.find((t) => t.ratio.igst === Number(voucher.PM_GSTPER)).code;
      const unit = units.find((u) => u.displayName === voucher.PMUNIT);
      const section = sections.find((s) => s.displayName === voucher.PMGROUP);
      const invDoc = {
        _id: voucher._id,
        name: voucher.PMNAME,
        displayName: voucher.PMNAME,
        validateName: voucher.PMNAME.replace(/[^a-z0-9]/gi, '').toLowerCase(),
        tax,
        bwd: true,
        head,
        allowNegativeStock: true,
        precision: 0,
        createdBy: user,
        updatedBy: user,
        createdAt: date,
        updatedAt: date,
        units: [{
          preferredForSale: true,
          preferredForPurchase: true,
          conversion: 1,
          unitId: unit._id,
          unitName: unit.displayName,
        }],
        sectionId: section._id,
        sectionName: section.displayName,
      };
      const barcode = new Types.ObjectId();
      const batch = new Types.ObjectId();
      const rate = round(voucher.PMPURATE * 1);
      const sRate = round(voucher.PMSARATE * 1);
      const mrp = round(voucher.PMMRRATE * 1);
      const invOpeningDoc = {
        assetAmount: rate,
        sRateTaxInc: true,
        date: orgBookBegin,
        inventory: voucher._id,
        branch: branch,
        invTrns: [
          {
            _id: new Types.ObjectId(),
            outward: 0,
            inward: 1,
            unitPrecision: 0,
            inventory: voucher._id,
            assetAmount: rate,
            batch,
            batchNo: '1',
            rate: rate,
            barcode,
            pRate: rate,
            sRate: sRate,
            mrp,
            unitConv: 1,
            nlc: rate,
            pRateTaxInc: false,
            sRateTaxInc: true,
            qty: 1,
          }
        ],
        updatedBy: user,
        updatedAt: date,
      };
      const invTrnDoc = {
        outward: 0,
        inward: 1,
        isOpening: true,
        actHide: false,
        act: false,
        date: orgBookBegin,
        branch,
        createdBy: user,
        updatedBy: user,
        createdAt: date,
        updatedAt: date,
        inventory: voucher._id,
        assetValue: rate,
        batchNo: '1',
        barcode,
        batch,
        adjBatch: batch,
        opening: 1,
        unitConv: 1,
        mrp,
        nlc: rate,
        rate: rate,
        pRate: rate,
        sRate: sRate,
        pRateTaxInc: false,
        sRateTaxInc: true,
      };
      invBulkOperation.insert(invDoc);
      invOpeningBulkOperation.insert(invOpeningDoc);
      invTrnsBulkOperation.insert(invTrnDoc);

    }
    console.log(`${db} Operation initialize End...`);
    console.log(`${db} inv execute started...`);
    await invBulkOperation.execute();
    console.log(`${db} -inv execute end...`);
    console.log(`${db} inv opening execute started...`);
    await invOpeningBulkOperation.execute();
    console.log(`${db} -inv opening execute end...`);
    console.log(`${db} -inv trns execute started...`);
    await invTrnsBulkOperation.execute();
    console.log(`${db} - inv-trns execute end...`);
    const assetAccount = (await connection.db(db).collection('accounts').findOne({ accountType: 'STOCK' }))._id;
    const acTrnObj = {
      _id: new Types.ObjectId(),
      actHide: false,
      act: false,
      credit: 0,
      debit: 299491.81,
      date: orgBookBegin,
      effDate: orgBookBegin,
      isOpening: true,
      account: assetAccount,
      accountType: 'STOCK',
      branch: branch,
      createdBy: user,
      updatedBy: user,
      createdAt: date,
      updatedAt: date,
    };
    await connection.db(db).collection('account_transactions').insertOne(acTrnObj);
    await connection.db(db).collection('inv-import').drop();
    console.log(`${db} - inv-import succesfully...`);
    return `${db} - inv-import succesfully...`;
  }
}
