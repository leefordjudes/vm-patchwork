import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

import * as csvParse from 'csv-parse/lib/sync';

import { URI } from './config';
import { GST_TAXES } from './fixtures/gst-tax';
import { Types } from 'mongoose';
import { round } from './utils/utils';

@Injectable()
export class InventoryImportService {
  async invImport(files: any) {
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
    const orgBookBegin = new Date('2021-03-31T00:00:00.000+0000');
    const sectionArr = [
      {
        name: 'GENERAL',
        displayName: 'GENERAL',
        validateName: 'general',
        createdBy: user,
        updatedBy: user,
        createdAt: date,
        updatedAt: new Date(),
      },
      {
        name: 'MILK',
        displayName: 'MILK',
        validateName: 'milk',
        createdBy: user,
        updatedBy: user,
        createdAt: date,
        updatedAt: new Date(),
      },
      {
        name: 'ONELINE SALE',
        displayName: 'ONELINE SALE',
        validateName: 'onelinesale',
        createdBy: user,
        updatedBy: user,
        createdAt: date,
        updatedAt: new Date(),
      },
      {
        name: 'SNACKS',
        displayName: 'SNACKS',
        validateName: 'snacks',
        createdBy: user,
        updatedBy: user,
        createdAt: date,
        updatedAt: new Date(),
      },
      {
        name: 'VEGETABLES',
        displayName: 'VEGETABLES',
        validateName: 'vegetables',
        createdBy: user,
        updatedBy: user,
        createdAt: date,
        updatedAt: new Date(),
      },
      {
        name: 'XEROX',
        displayName: 'XEROX',
        validateName: 'xerox',
        createdBy: user,
        updatedBy: user,
        createdAt: date,
        updatedAt: new Date(),
      },
    ];
    await connection.db(db).collection('sections').insertMany(sectionArr);
    sectionArr.length = 0;
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
        updatedAt: new Date(),
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
        updatedAt: new Date(),
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
        updatedAt: new Date(),
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
        updatedAt: new Date(),
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
        updatedAt: new Date(),
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
        updatedAt: new Date(),
      },
    ];
    await connection.db(db).collection('units').insertMany(unitArr);
    unitArr.length = 0;
    const units = await connection.db(db).collection('units').find({}, { projection: { _id: 1, displayName: 1 } }).toArray();
    const sections = await connection.db(db).collection('sections').find({}, { projection: { _id: 1, displayName: 1 } }).toArray();
    const invBulkOperation = connection.db(db).collection('inventories').initializeOrderedBulkOp();
    const invOpeningBulkOperation = connection.db(db).collection('inventory_openings').initializeOrderedBulkOp();
    const invTrnsBulkOperation = connection.db(db).collection('inventory_transactions').initializeOrderedBulkOp();
    let inventoryRecords: any;
    try {
      inventoryRecords = csvParse(files.find(f => f.originalname === 'inv-import.csv').buffer.toString(),
        {
          delimiter: ',', columns: true, trim: true, relax_column_count: false, relax_column_count_more: true,
          skip_empty_lines: true, skip_lines_with_empty_values: true, skip_lines_with_error: false
        });
    } catch (err) {
      throw new Error(err);
    }
    for (const voucher of inventoryRecords) {
      const tax = Number(voucher.PM_GSTPER) === 0 ? 'gst0' : GST_TAXES.find((t) => t.ratio.igst === Number(voucher.PM_GSTPER)).code;
      const unit = units.find((u) => u.displayName === voucher.PMUNIT);
      const section = sections.find((s) => s.displayName === voucher.PMGROUP);
      const inventory = new Types.ObjectId();
      const invDoc = {
        _id: inventory,
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
        updatedAt: new Date(),
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
        inventory,
        branch,
        invTrns: [
          {
            _id: new Types.ObjectId(),
            outward: 0,
            inward: 1,
            unitPrecision: 0,
            inventory,
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
        updatedAt: new Date(),
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
        updatedAt: new Date(),
        inventory,
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
      updatedAt: new Date(),
    };
    await connection.db(db).collection('account_transactions').insertOne(acTrnObj);
    console.log(`${db} - inv-import succesfully...`);
    return `${db} - inv-import succesfully...`;
  }
}
