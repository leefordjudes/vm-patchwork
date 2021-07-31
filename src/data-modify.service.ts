import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

import * as _ from 'lodash';

import { URI } from './config';

@Injectable()
export class DataModifyService {
  async gstReg() {
    const connection = await new MongoClient(URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }).connect();
    if (!connection.isConnected) {
      return 'Connection failed';
    }
    const dbs = ['velavanstationery', 'velavanhm', 'ttgold', 'ttgoldpalace', 'auditplustech', 'ramasamy', '10velavanmedical', 'velavanmed', 'rkmedicals', 'testorg', 'omshakthi', 'praba'];
    for (const db of dbs) {
      console.log(`${db} update started...`);
      const gstRegArray = [];
      const branches: any = await connection.db(db).collection('branches').find({}, { projection: { gstInfo: 1, validateName: 1 } }).toArray();
      const gstReg = _.groupBy(branches, (x) => x.gstInfo.gstNo);
      for (const gstNo in gstReg) {
        gstRegArray.push(
          {
            regType: 'REGULAR',
            stateCode: '33',
            gstNo,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        );
      }
      if (gstRegArray.length > 0) {
        await connection.db(db).collection('gst_registrations').insertMany(gstRegArray);
      }
      const branchUpdateArray = [];
      const voucherNumberingArray = [];
      for (const branch of branches) {
        branchUpdateArray.push(
          {
            updateOne: {
              filter: { _id: branch._id },
              update: {
                $set: { isGstRegistered: true, voucherNoPrefix: branch.validateName.substring(0, 3).toUpperCase() },
              },
            },
          },
        );
        voucherNumberingArray.push(
          {
            updateMany: {
              filter: { branch: branch._id },
              update: {
                $set: { voucherNoPrefix: branch.validateName.substring(0, 3).toUpperCase() },
              },
            },
          },
        );
      }
      if (branchUpdateArray.length > 0) {
        await connection.db(db).collection('branches').bulkWrite(branchUpdateArray);
      }
      if (voucherNumberingArray.length > 0) {
        await connection.db(db).collection('voucher_numberings').bulkWrite(voucherNumberingArray);
      }
      const masterArray = [
        {
          updateMany: {
            filter: { 'gstInfo.location': '1' },
            update: {
              $set: { 'gstInfo.location': '01' },
            },
          },
        },
        {
          updateMany: {
            filter: { 'gstInfo.location': '2' },
            update: {
              $set: { 'gstInfo.location': '02' },
            },
          },
        },
        {
          updateMany: {
            filter: { 'gstInfo.location': '3' },
            update: {
              $set: { 'gstInfo.location': '03' },
            },
          },
        },
        {
          updateMany: {
            filter: { 'gstInfo.location': '4' },
            update: {
              $set: { 'gstInfo.location': '04' },
            },
          },
        },
        {
          updateMany: {
            filter: { 'gstInfo.location': '5' },
            update: {
              $set: { 'gstInfo.location': '05' },
            },
          },
        },
        {
          updateMany: {
            filter: { 'gstInfo.location': '6' },
            update: {
              $set: { 'gstInfo.location': '06' },
            },
          },
        },
        {
          updateMany: {
            filter: { 'gstInfo.location': '7' },
            update: {
              $set: { 'gstInfo.location': '07' },
            },
          },
        },
        {
          updateMany: {
            filter: { 'gstInfo.location': '8' },
            update: {
              $set: { 'gstInfo.location': '08' },
            },
          },
        },
        {
          updateMany: {
            filter: { 'gstInfo.location': '9' },
            update: {
              $set: { 'gstInfo.location': '09' },
            },
          },
        },
      ];
      const voucherArray = [
        {
          updateMany: {
            filter: { 'partyGst.location': '1' },
            update: {
              $set: { 'partyGst.location': '01' },
            },
          },
        },
        {
          updateMany: {
            filter: { 'partyGst.location': '2' },
            update: {
              $set: { 'partyGst.location': '02' },
            },
          },
        },
        {
          updateMany: {
            filter: { 'partyGst.location': '3' },
            update: {
              $set: { 'partyGst.location': '03' },
            },
          },
        },
        {
          updateMany: {
            filter: { 'partyGst.location': '4' },
            update: {
              $set: { 'partyGst.location': '04' },
            },
          },
        },
        {
          updateMany: {
            filter: { 'partyGst.location': '5' },
            update: {
              $set: { 'partyGst.location': '05' },
            },
          },
        },
        {
          updateMany: {
            filter: { 'partyGst.location': '6' },
            update: {
              $set: { 'partyGst.location': '06' },
            },
          },
        },
        {
          updateMany: {
            filter: { 'partyGst.location': '7' },
            update: {
              $set: { 'partyGst.location': '07' },
            },
          },
        },
        {
          updateMany: {
            filter: { 'partyGst.location': '8' },
            update: {
              $set: { 'partyGst.location': '08' },
            },
          },
        },
        {
          updateMany: {
            filter: { 'partyGst.location': '9' },
            update: {
              $set: { 'partyGst.location': '09' },
            },
          },
        },
      ];
      await connection.db(db).collection('customers').bulkWrite(masterArray);
      await connection.db(db).collection('vendors').bulkWrite(masterArray);
      await connection.db(db).collection('sales').bulkWrite(voucherArray);
      await connection.db(db).collection('purchases').bulkWrite(voucherArray);
      console.log(`${db} update end...`);
    }
    console.log('All organizations update sucessfully...');
    return 'All organizations update sucessfully...';
  }
}
