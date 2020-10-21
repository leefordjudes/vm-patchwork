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
