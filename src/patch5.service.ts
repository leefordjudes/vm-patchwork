import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { URI } from './config';

const PRINT_CONFIG = {
  AT006:
    '{"header":{"showBillTitle":true,"showOrganizationName":true,"showOrganizationAddress":true,"showOrganizationPhone":true,"showOrganizationEmail":true,"showOrganizationDetails":true,"showCustomerInfo":false,"showContactInfo":true,"showInvoiceInfo":true},"transactionInfo":{"serialNo":{"width":5,"label":"SLNO","enabled":false},"item":{"width":32,"label":"PARTICULARS","enabled":true},"rackName":{"width":8,"label":"RACK","enabled":true},"hsnCode":{"width":8,"label":"HSN","enabled":false},"batchNo":{"width":11,"label":"BATCH","enabled":true},"qty":{"width":6,"label":"QTY","enabled":true},"mrp":{"width":11,"label":"MRP","enabled":true},"expPeriod":{"width":11,"label":"EXP","enabled":true},"rate":{"width":10,"label":"RATE","enabled":false},"taxableValue":{"width":8,"label":"T.VALUE","enabled":false},"tax":{"width":6,"label":"TAX","enabled":false},"taxAmount":{"width":6,"label":"TAMT","enabled":false},"discount":{"width":6,"label":"DISC","enabled":false},"dAmount":{"width":9,"label":"DISC.","enabled":true},"amount":{"width":12,"label":"AMOUNT","enabled":true}},"footer":{"showBillDetails":true,"showGSTSummary":true},"greetings":{"text":"Wish you a speedy recovery","enabled":true}}',
  AT009:
    '{"header":{"showBillTitle":true,"showOrganizationName":true,"showOrganizationAddress":true,"showOrganizationPhone":true,"showOrganizationEmail":true,"showOrganizationDetails":true,"showCustomerInfo":false,"showInvoiceInfo":true},"transactionInfo":{"serialNo":{"width":5,"label":"SLNO","enabled":false},"item":{"width":32,"label":"PARTICULARS","enabled":true},"rackName":{"width":8,"label":"RACK","enabled":true},"hsnCode":{"width":8,"label":"HSN","enabled":false},"batchNo":{"width":12,"label":"BATCH","enabled":true},"qty":{"width":6,"label":"QTY","enabled":true},"mrp":{"width":11,"label":"MRP","enabled":true},"expPeriod":{"width":10,"label":"EXP","enabled":true},"rate":{"width":10,"label":"RATE","enabled":false},"taxableValue":{"width":8,"label":"T.VALUE","enabled":false},"tax":{"width":6,"label":"TAX","enabled":false},"taxAmount":{"width":6,"label":"TAMT","enabled":false},"discount":{"width":9,"label":"DISC","enabled":true},"dAmount":{"width":6,"label":"DAMT","enabled":false},"amount":{"width":12,"label":"AMOUNT","enabled":true}},"footer":{"showBillDetails":true,"showGSTSummary":true},"greetings":{"text":"**Wish you a speedy recovery**","enabled":true}}',
  AT010:
    '{"header":{"showOrganizationName":true,"showOrganizationAddress":true,"showOrganizationPhone":true,"showOrganizationDetails":true,"showCustomerInfo":false,"showContactInfo":false,"showInvoiceInfo":true},"transactionInfo":{"serialNo":{"width":5,"label":"SLNO","enabled":false},"item":{"width":32,"label":"PARTICULARS","enabled":true},"rackName":{"width":10,"label":"RACK","enabled":false},"hsnCode":{"width":8,"label":"HSN","enabled":false},"batchNo":{"width":10,"label":"BATCH","enabled":false},"qty":{"width":10,"label":"QTY","enabled":true},"mrp":{"width":19,"label":"MRP","enabled":true},"expPeriod":{"width":13,"label":"EXP","enabled":false},"rate":{"width":19,"label":"RATE","enabled":true},"taxableValue":{"width":8,"label":"T.VALUE","enabled":false},"tax":{"width":6,"label":"TAX","enabled":false},"taxAmount":{"width":6,"label":"TAMT","enabled":false},"discount":{"width":6,"label":"DISC","enabled":false},"dAmount":{"width":6,"label":"DAMT","enabled":false},"amount":{"width":20,"label":"AMT","enabled":true}},"footer":{"showGSTSummary":true,"showBillDiscount":true,"greetings":{"text":"Thank you..Visit Us Again....","enabled":true}}}',
  AT011:
    '{"header":{"showBillTitle":true,"showOrganizationName":true,"showOrganizationAddress":true,"showOrganizationPhone":true,"showOrganizationDetails":true,"showCustomerInfo":true,"showContactInfo":true,"showInvoiceInfo":true},"transactionInfo":{"serialNo":{"width":3,"label":"#","enabled":true},"item":{"width":30,"label":"PARTICULARS","enabled":true},"rackName":{"width":10,"label":"RACK","enabled":false},"hsnCode":{"width":9,"label":"HSN","enabled":true},"batchNo":{"width":10,"label":"BATCH","enabled":false},"qty":{"width":5,"label":"QTY","enabled":true},"price":{"width":8,"label":"MRP","enabled":true},"expPeriod":{"width":13,"label":"EXP","enabled":false},"rate":{"width":8,"label":"RATE","enabled":true},"taxableValue":{"width":10,"label":"TAXABLE VALUE","enabled":true},"tax":{"width":7,"label":"TAX %","enabled":true},"taxAmount":{"width":10,"label":"TAX AMT.","enabled":true},"discount":{"width":6,"label":"DISC","enabled":false},"dAmount":{"width":6,"label":"DAMT","enabled":false},"amount":{"width":10,"label":"AMOUNT","enabled":true}},"footer":{"showBillDetails":true,"showGSTSummary":true,"showBalanceDetails":true,"showBankDetails":{"enabled":true,"bankName":"TAMILNAD MERCANTILE BANK","acName":"VELAVAN HYPERMARKET BOOKS & STATIONERY","acNo":"106700150950164","ifscCode":"TMBL0000106","panNo":"AIVPV0468N"},"signature":{"for":"For MY BOOKS & STATIONERY","text":"Authorized signature","enabled":true},"custSignature":{"text":"Receiver signature","enabled":true}},"greetings":{"text":"Thank you..Visit Us Again....","enabled":true}}',
  AT012:
    '{"header":{"showBillTitle":true,"showOrganizationName":true,"showOrganizationAddress":true,"showOrganizationPhone":true,"showOrganizationDetails":true,"showCustomerInfo":true,"showInvoiceInfo":true},"transactionInfo":{"serialNo":{"width":3,"label":"#","enabled":true},"item":{"width":30,"label":"PARTICULARS","enabled":true},"rackName":{"width":10,"label":"RACK","enabled":false},"hsnCode":{"width":9,"label":"HSN","enabled":true},"batchNo":{"width":10,"label":"BATCH","enabled":false},"qty":{"width":5,"label":"QTY","enabled":true},"price":{"width":8,"label":"MRP","enabled":true},"expPeriod":{"width":13,"label":"EXP","enabled":false},"rate":{"width":8,"label":"RATE","enabled":true},"taxableValue":{"width":10,"label":"TAXABLE VALUE","enabled":true},"tax":{"width":7,"label":"TAX %","enabled":true},"taxAmount":{"width":10,"label":"TAX AMT.","enabled":true},"discount":{"width":6,"label":"DISC","enabled":false},"dAmount":{"width":6,"label":"DAMT","enabled":false},"amount":{"width":10,"label":"AMOUNT","enabled":true}},"footer":{"showBillDetails":true,"showGSTSummary":true,"showBalanceDetails":true,"showBankDetails":{"enabled":true,"bankName":"TAMILNAD MERCANTILE BANK","acName":"VELAVAN HYPERMARKET BOOKS & STATIONERY","acNo":"106700150950164","ifscCode":"TMBL0000106","panNo":"AIVPV0468N"},"signature":{"for":"For MY BOOKS & STATIONERY","text":"Authorized signature","enabled":true}},"greetings":{"text":"Thank you..Visit Us Again....","enabled":true}}',
  AT013:
    '{"header":{"showOrganizationName":true,"showOrganizationAddress":true,"showOrganizationPhone":true,"showOrganizationDetails":true,"showCustomerInfo":false,"showInvoiceInfo":true},"transactionInfo":{"serialNo":{"width":5,"label":"SLNO","enabled":false},"item":{"width":32,"label":"PARTICULARS","enabled":true},"rackName":{"width":10,"label":"RACK","enabled":false},"hsnCode":{"width":8,"label":"HSN","enabled":false},"batchNo":{"width":10,"label":"BATCH","enabled":false},"qty":{"width":10,"label":"QTY","enabled":true},"mrp":{"width":19,"label":"MRP","enabled":true},"expPeriod":{"width":13,"label":"EXP","enabled":false},"rate":{"width":19,"label":"RATE","enabled":true},"taxableValue":{"width":8,"label":"T.VALUE","enabled":false},"tax":{"width":6,"label":"TAX","enabled":false},"taxAmount":{"width":6,"label":"TAMT","enabled":false},"discount":{"width":6,"label":"DISC","enabled":false},"dAmount":{"width":6,"label":"DAMT","enabled":false},"amount":{"width":20,"label":"AMT","enabled":true}},"footer":{"showGSTSummary":true,"showBillDiscount":true,"greetings":{"text":"Thank you..Visit Us Again....","enabled":true}}}',
  AT008:
    '{"header":{"showBillTitle":true,"showOrganizationName":true,"showOrganizationAddress":true,"showOrganizationPhone":true,"showOrganizationEmail":true,"showOrganizationDetails":true,"showInvoiceInfo":true},"transactionInfo":{"item":{"width":60,"label":"PARTICULARS","enabled":true},"batchNo":{"width":14,"label":"BATCH","enabled":true},"expPeriod":{"width":10,"label":"EXP","enabled":true},"mrp":{"width":10,"label":"MRP","enabled":true},"qty":{"width":6,"label":"QTY","enabled":true}}}',
};

@Injectable()
export class Patch5Service {
  constructor() {}

  async config() {
    try {
      const connection = await new MongoClient(URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }).connect();
      const obj1 = {
        updateMany: {
          filter: { collectionName: { $in: ['m2stocktransfers', 'm1stocktransfers'] } },
          update: {
            $set: { collectionName: 'stock_transfers' },
          },
        },
      };
      const obj2 = {
        updateMany: {
          filter: { collectionName: { $in: ['m2stockadjustments', 'm1stockadjustments'] } },
          update: {
            $set: { collectionName: 'stock_adjustments' },
          },
        },
      };
      await connection.db().collection('accountbooks').bulkWrite([obj1, obj2]);
      await connection.db().collection('inventorybooks').bulkWrite([obj1, obj2]);
      await connection.db().collection('branchbooks').bulkWrite([obj1, obj2]);
      const invBookData = [
        {
          'saleValue': 0,
          'assetValue': 0,
          'inventoryId': '5f416bb86daef125612fda3c',
          'inventoryName': 'ACCUSURE PULSE MACHINE',
          'outward': 0,
          'inward': 6,
          'date': new Date('2020-08-26T00:00:00.000+0000'),
          'refNo': null,
          'voucherNo': 'GF27',
          'createdAt': new Date('2020-08-26T11:57:56.924+0000'),
          'updatedAt': new Date('2020-08-26T13:13:22.256+0000'),
          'createdBy': '5f421c5c6daef1c99f37a555',
          'updatedBy': '5f41548a6daef15c692bbe9a',
          'voucherId': '5f464e440632a59f9e2b71a0',
          'voucherType': 'STOCK_JOURNAL',
          'branchId': '5f4146b4600c4a425e22ed9d',
          'branchName': 'PALAY MARKET BRANCH',
          'warehouseId': null,
          'warehouseName': null,
          'collectionName': 'stock_transfers',
          'voucherName': 'Stock Transfer',
          '__v': 0,
        },
        {
          'saleValue': 0,
          'assetValue': 0,
          'inventoryId': '5f44a7beb622c5db479fc8ef',
          'inventoryName': 'PULSE OXIMETER POINT OF CARE',
          'outward': 2,
          'inward': 0,
          'date': new Date('2020-08-26T00:00:00.000+0000'),
          'refNo': null,
          'voucherNo': 'GF26',
          'createdAt': new Date('2020-08-26T11:44:35.776+0000'),
          'updatedAt': new Date('2020-08-26T12:05:08.418+0000'),
          'createdBy': '5f3b800758ec352a10c12e78',
          'updatedBy': '5f377382f777b3554ba5994e',
          'voucherId': '5f464b230632a5d8a02b6cc8',
          'voucherType': 'STOCK_JOURNAL',
          'branchId': '5f361b7366f8ad60f4020b5a',
          'branchName': 'GF ROAD BRANCH',
          'warehouseId': null,
          'warehouseName': null,
          'collectionName': 'stock_transfers',
          'voucherName': 'Stock Transfer',
          '__v': 0
        }
      ];
      const result = await connection.db().collection('inventorybooks').insertMany(invBookData);
      try {
        await connection.db().dropCollection('dashboardconfigs');
        console.log('dashboardconfigs dropped');
      } catch (err) {
        console.log('dashboardconfigs collection not found');
      }
      await connection.close();
      return result;
    } catch (err) {
      return false;
    }
  }
  async printConfig() {
    // const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;
    // const URI = `mongodb://localhost/velavanstationery`;
    try {
      const connection = await new MongoClient(URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }).connect();
      const printtemplateUpdateObj = [];
      for (const key of Object.keys(PRINT_CONFIG)) {
        const updateObj = {
          updateMany: {
            filter: { code: key },
            update: {
              $set: {
                config: PRINT_CONFIG[key],
              },
            },
          },
        };
        printtemplateUpdateObj.push(updateObj);
      }

      const result = await connection
        .db()
        .collection('printtemplates')
        .bulkWrite(printtemplateUpdateObj);

      console.log('Print templates patch done');
      try {
        await connection.db().dropCollection('defaultprinttemplates');
        console.log('defaultprinttemplates dropped');
      } catch (err) {
        console.log('defaultprinttemplates collection not found');
      }
      try {
        await connection
          .db()
          .collection('users')
          .dropIndex('actCode');
        console.log('actCode index dropped from users');
      } catch (err) {
        console.log('actCode index not found in users');
      }
      await connection.close();
      return result;
    } catch (err) {
      return false;
    }
  }
}
