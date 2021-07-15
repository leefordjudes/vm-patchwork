import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { Types } from 'mongoose';

import * as _ from 'lodash';

import { URI } from './config';
import { VOUCHER_TYPE } from './fixtures/voucher-type/voucher-type';

@Injectable()
export class OrgCloneService {

  async clone() {
    const connection = await new MongoClient(URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }).connect();
    if (!connection.isConnected) {
      return 'Connection Failed';
    }
    const newOrg = 'velavanmed';
    const oldOrg = 'velavanmedical';
    const date = new Date();
    const branch = Types.ObjectId('5f414f9f6daef187462bbe03');
    const user = (await connection.db(newOrg).collection('users').findOne({ isAdmin: true }))._id;
    const invHead = await connection.db(oldOrg).collection('inventory_heads').findOne({ name: 'Default' });
    await connection.db(newOrg).collection('inventory_heads').drop();
    await connection.db(newOrg).collection('inventory_heads').insertOne(invHead);

    const oldBranch = await connection.db(oldOrg).collection('branches').findOne({ _id: branch });
    oldBranch.desktopClients = [];
    oldBranch.users = [user];
    await connection.db(newOrg).collection('branches').insertOne(oldBranch);

    const newBranchAccDoc = {
      _id: oldBranch.account,
      name: oldBranch.displayName,
      displayName: oldBranch.displayName,
      validateName: oldBranch.validateName,
      accountType: 'BRANCH_TRANSFER',
      hide: false,
      createdBy: user,
      updatedBy: user,
      createdAt: date,
      updatedAt: date,
    };
    await connection.db(newOrg).collection('accounts').insertOne(newBranchAccDoc);

    const invClonePipe = [
      {
        $addFields: {
          createdBy: user,
          updatedBy: user,
          createdAt: date,
          updatedAt: date,
        }
      },
      {
        $project: {
          vendorId: 0,
          vendorName: 0,
        }
      },
      {
        $merge: { into: { db: newOrg, coll: 'inventories' } }
      },
    ];
    await connection.db(oldOrg).collection('inventories').aggregate(invClonePipe).toArray();

    const rackClonePipe = [
      {
        $addFields: {
          createdBy: user,
          updatedBy: user,
          createdAt: date,
          updatedAt: date,
        }
      },
      {
        $merge: { into: { db: newOrg, coll: 'racks' } }
      },
    ];
    await connection.db(oldOrg).collection('racks').aggregate(rackClonePipe).toArray();

    const saltClonePipe = [
      {
        $addFields: {
          createdBy: user,
          updatedBy: user,
          createdAt: date,
          updatedAt: date,
        }
      },
      {
        $merge: { into: { db: newOrg, coll: 'pharma_salts' } }
      },
    ];
    await connection.db(oldOrg).collection('pharma_salts').aggregate(saltClonePipe).toArray();

    const sectionClonePipe = [
      {
        $addFields: {
          createdBy: user,
          updatedBy: user,
          createdAt: date,
          updatedAt: date,
        }
      },
      {
        $merge: { into: { db: newOrg, coll: 'sections' } }
      },
    ];
    await connection.db(oldOrg).collection('sections').aggregate(sectionClonePipe).toArray();

    const manufacturerClonePipe = [
      {
        $addFields: {
          createdBy: user,
          updatedBy: user,
          createdAt: date,
          updatedAt: date,
        }
      },
      {
        $merge: { into: { db: newOrg, coll: 'manufacturers' } }
      },
    ];
    await connection.db(oldOrg).collection('manufacturers').aggregate(manufacturerClonePipe).toArray();

    const unitClonePipe = [
      {
        $addFields: {
          createdBy: user,
          updatedBy: user,
          createdAt: date,
          updatedAt: date,
        }
      },
      {
        $merge: { into: { db: newOrg, coll: 'units' } }
      },
    ];
    await connection.db(oldOrg).collection('units').aggregate(unitClonePipe).toArray();

    const invBranchDetailClonePipe = [
      {
        $match: {
          branch
        }
      },
      {
        $merge: { into: { db: newOrg, coll: 'inv_branch_details' } }
      },
    ];
    await connection.db(oldOrg).collection('inv_branch_details').aggregate(invBranchDetailClonePipe).toArray();

    const fYear = (await connection.db(newOrg).collection('financial_years').findOne({}))._id;
    const voucherNumberingArr = VOUCHER_TYPE.map((elm) => {
      return {
        voucherType: elm.defaultName,
        branch,
        sequence: 1,
        prefix: 'TG',
        suffix: '',
        fYear,
        createdAt: date,
        updatedAt: date,
      }
    });
    await connection.db(newOrg).collection('voucher_numberings').insertMany(voucherNumberingArr);

    console.log('CLONE DONE');
    return 'CLONE DONE';
  }
}
