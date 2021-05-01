import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { Types } from 'mongoose';
import * as _ from 'lodash';

import { URI } from './config';
import { GST_TAXES } from './fixtures/gst-tax';
import { STATE } from './fixtures/state/state';
import { round } from './utils/utils';

@Injectable()
export class TestService {
  async test() {
    try {
      const connection = await new MongoClient(URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }).connect();
      console.log(connection.isConnected ? `Connected successfully` : `Connection Error`);
      async function customerMaster(db: string) {
        console.log({ organization: db, collectionName: 'customers' });
        const bulkCustomer = connection.db(db).collection('customers').initializeOrderedBulkOp();
        const custs: any = await connection.db(db).collection('customers')
          .find({}, { projection: { gstInfo: 1, createdBy: 1, updatedBy: 1, addressInfo: 1, contactInfo: 1, otherInfo: 1, deliveryAddress: 1 } }).toArray();
        for (const cus of custs) {
          const locationDefaultName = cus.gstInfo.location?.defaultName || 'TAMILNADU';
          const location = STATE.find((loc) => loc.defaultName === locationDefaultName).code;
          const gstInfo = {
            regType: cus.gstInfo.regType.defaultName,
            location,
          };
          if (cus.gstInfo.gstNo) {
            _.assign(gstInfo, { gstNo: cus.gstInfo.gstNo });
          }
          const $set = {
            gstInfo,
            createdBy: Types.ObjectId(cus.createdBy),
            updatedBy: Types.ObjectId(cus.updatedBy),
          };
          const $unset = {};
          if (cus.deliveryAddress?.length < 1) {
            _.assign($unset, { deliveryAddress: 1 });
          }
          if (cus.addressInfo) {
            if (!cus.addressInfo.address && !cus.addressInfo.city && !cus.addressInfo.contactPerson && !cus.addressInfo.pincode) {
              _.assign($unset, { addressInfo: 1 });
            } else {
              if (!cus.addressInfo.address) {
                _.assign($unset, { 'addressInfo.address': 1 });
              }
              if (!cus.addressInfo.city) {
                _.assign($unset, { 'addressInfo.city': 1 });
              }
              if (!cus.addressInfo.contactPerson) {
                _.assign($unset, { 'addressInfo.contactPerson': 1 });
              }
              if (!cus.addressInfo.pincode) {
                _.assign($unset, { 'addressInfo.pincode': 1 });
              }
              if (cus.addressInfo.state) {
                _.assign($set, { 'addressInfo.state': cus.addressInfo.state.defaultName });
              } else {
                _.assign($unset, { 'addressInfo.state': 1 });
              }
              if (cus.addressInfo.country) {
                _.assign($set, { 'addressInfo.country': cus.addressInfo.country.defaultName });
              } else {
                _.assign($unset, { 'addressInfo.country': 1 });
              }
            }
          }

          if (!cus.contactInfo.mobile && !cus.contactInfo.alternateMobile && !cus.contactInfo.telephone && !cus.contactInfo.contactPerson && !cus.contactInfo.email) {
            _.assign($unset, { contactInfo: 1 });
          } else {
            if (!cus.contactInfo.mobile) {
              _.assign($unset, { 'contactInfo.mobile': 1 });
            }
            if (!cus.contactInfo.alternateMobile) {
              _.assign($unset, { 'contactInfo.alternateMobile': 1 });
            }
            if (!cus.contactInfo.telephone) {
              _.assign($unset, { 'contactInfo.telephone': 1 });
            }
            if (!cus.contactInfo.contactPerson) {
              _.assign($unset, { 'contactInfo.contactPerson': 1 });
            }
            if (!cus.contactInfo.email) {
              _.assign($unset, { 'contactInfo.email': 1 });
            }
          }
          if (cus.otherInfo) {
            if (!cus.otherInfo.aadharNo && !cus.otherInfo.panNo) {
              _.assign($unset, { otherInfo: 1 });
            } else {
              if (!cus.otherInfo.aadharNo) {
                _.assign($unset, { 'otherInfo.aadharNo': 1 });
              }
              if (!cus.otherInfo.panNo) {
                _.assign($unset, { 'otherInfo.panNo': 1 });
              }
            }
          }
          bulkCustomer.find({ _id: cus._id }).updateOne({ $set, $unset });
        }
        bulkCustomer.find({ $or: [{ 'customerGroup': null }, { 'customerGroup': '' }] }).update({ $unset: { customerGroup: 1 } });
        bulkCustomer.find({}).update({ $unset: { __v: 1, aliasName: 1, validateAliasName: 1 } });
        await bulkCustomer.execute();
        console.log('Customer End');
      }

      async function vendorMaster(db: string) {
        console.log({ organization: db, collectionName: 'vendors' });
        const custs: any = await connection.db(db).collection('vendors')
          .find({}, { projection: { gstInfo: 1, createdBy: 1, updatedBy: 1, addressInfo: 1, contactInfo: 1, otherInfo: 1 } }).toArray();
        const bulkCustomer = connection.db(db).collection('vendors').initializeOrderedBulkOp();
        for (const cus of custs) {
          const location = STATE.find((loc) => loc.defaultName === cus.gstInfo.location.defaultName).code;
          const gstInfo = {
            regType: 'REGULAR',
            location,
            gstNo: cus.gstInfo.gstNo
          };
          const $set = {
            gstInfo,
            createdBy: Types.ObjectId(cus.createdBy),
            updatedBy: Types.ObjectId(cus.updatedBy),
          };
          const $unset = {};
          if (cus.addressInfo) {
            if (!cus.addressInfo.address && !cus.addressInfo.city && !cus.addressInfo.contactPerson && !cus.addressInfo.pincode) {
              _.assign($unset, { addressInfo: 1 });
            } else {
              if (!cus.addressInfo.address) {
                _.assign($unset, { 'addressInfo.address': 1 });
              }
              if (!cus.addressInfo.city) {
                _.assign($unset, { 'addressInfo.city': 1 });
              }
              if (!cus.addressInfo.contactPerson) {
                _.assign($unset, { 'addressInfo.contactPerson': 1 });
              }
              if (!cus.addressInfo.pincode) {
                _.assign($unset, { 'addressInfo.pincode': 1 });
              }
              if (cus.addressInfo.state) {
                _.assign($set, { 'addressInfo.state': cus.addressInfo.state.defaultName });
              } else {
                _.assign($unset, { 'addressInfo.state': 1 });
              }
              if (cus.addressInfo.country) {
                _.assign($set, { 'addressInfo.country': cus.addressInfo.country.defaultName });
              } else {
                _.assign($unset, { 'addressInfo.country': 1 });
              }
            }
          }
          if (!cus.contactInfo.mobile && !cus.contactInfo.alternateMobile && !cus.contactInfo.telephone && !cus.contactInfo.contactPerson && !cus.contactInfo.email) {
            _.assign($unset, { contactInfo: 1 });
          } else {
            if (!cus.contactInfo.mobile) {
              _.assign($unset, { 'contactInfo.mobile': 1 });
            }
            if (!cus.contactInfo.alternateMobile) {
              _.assign($unset, { 'contactInfo.alternateMobile': 1 });
            }
            if (!cus.contactInfo.telephone) {
              _.assign($unset, { 'contactInfo.telephone': 1 });
            }
            if (!cus.contactInfo.contactPerson) {
              _.assign($unset, { 'contactInfo.contactPerson': 1 });
            }
            if (!cus.contactInfo.email) {
              _.assign($unset, { 'contactInfo.email': 1 });
            }
          }
          if (cus.otherInfo) {
            if (!cus.otherInfo.aadharNo && !cus.otherInfo.panNo) {
              _.assign($unset, { otherInfo: 1 });
            } else {
              if (!cus.otherInfo.aadharNo) {
                _.assign($unset, { 'otherInfo.aadharNo': 1 });
              }
              if (!cus.otherInfo.panNo) {
                _.assign($unset, { 'otherInfo.panNo': 1 });
              }
            }
          }
          bulkCustomer.find({ _id: cus._id }).updateOne({ $set, $unset });
        }
        bulkCustomer.find({}).update({ $unset: { __v: 1, aliasName: 1, validateAliasName: 1 } });
        await bulkCustomer.execute();
        console.log('Vendor End');
      }

      async function accountMaster(db: string, user: Types.ObjectId) {
        console.log({ organization: db, collectionName: 'accounts' });
        console.log('1.account updatation start....');
        await connection.db(db).collection('accounts')
          .deleteMany({ defaultName: { $in: ['TRADE_RECEIVABLE', 'TRADE_PAYABLE', 'COST_OF_GOODS_SOLD'] } });
        const lists: any = await connection.db(db).collection('accounts').find({}, { projection: { createdAt: 0, updatedAt: 0, hide: 0 } }).toArray();
        const bulkAccountUpdate = connection.db(db).collection('accounts').initializeOrderedBulkOp();
        for (const acc of lists) {
          const $set = {
            createdBy: Types.ObjectId(acc.createdBy),
            updatedBy: Types.ObjectId(acc.updatedBy),
            accountType: acc.type.defaultName,
          };
          if (acc.defaultName === 'REPAIRS_AND_MAINTANANCE') {
            _.assign($set, {
              name: 'Repairs And Maintenance',
              validateName: 'repairsandmaintenance',
              displayName: 'Repairs And Maintenance',
              defaultName: 'REPAIRS_AND_MAINTENANCE',
            });
          }
          if (acc.defaultName === 'PRINTING_AND_STATIONARY') {
            _.assign($set, {
              name: 'Printing And Stationery',
              validateName: 'printingandstationery',
              displayName: 'Printing And Stationery',
              defaultName: 'PRINTING_AND_STATIONERY',
            });
          }
          if (acc.defaultName === 'FURNITUREANDEQUIPMENT') {
            _.assign($set, {
              defaultName: 'FURNITURE_AND_EQUIPMENT',
            });
          }
          if (acc.defaultName === 'Postage') {
            _.assign($set, {
              defaultName: 'POSTAGE',
            });
          }
          if (acc.parentIds?.length > 0) {
            _.assign($set, { parentIds: acc.parentIds.map((a) => Types.ObjectId(a)) });
            bulkAccountUpdate.find({ _id: acc._id }).updateOne({ $set });
          } else {
            bulkAccountUpdate.find({ _id: acc._id })
              .updateOne({
                $set,
                $unset: { parentAccount: 1, parentIds: 1 },
              });
          }
        }
        bulkAccountUpdate.find({ $or: [{ description: null }, { description: '' }] }).update({ $unset: { description: 1 } });
        const $unset = {
          aliasName: 1,
          validateAliasName: 1,
          tdsApplicable: 1,
          tdsRatio: 1,
          type: 1,
          __v: 1,
        }
        bulkAccountUpdate.find({}).update({ $unset });
        bulkAccountUpdate.execute();
        console.log('1.account updatation end....');
        console.log('1.account creation started....');

        const customerPenddings: any = await connection.db(db).collection('customerpendings').find({}, { projection: { customer: 1 } }).toArray();
        const customerIds = _.uniq(customerPenddings.map((x) => x.customer)).map((y: any) => Types.ObjectId(y));
        console.log(`${customerIds.length} - Credit Customer found`);
        const customers: any = await connection.db(db).collection('customers').find({ _id: { $in: customerIds } }, { projection: { name: 1, contactInfo: 1 } }).toArray();
        console.log(`${customers.length} === ${customerIds.length}` ? 'get credit customer only' : 'Miss matched');
        const vendorPenddings: any = await connection.db(db).collection('vendorpendings').find({}, { projection: { vendor: 1 } }).toArray();
        const vendorIds = _.uniq(vendorPenddings.map((x) => x.vendor)).map((y: any) => Types.ObjectId(y));
        console.log(`${vendorIds.length} - Credit Vendor found`);
        const vendors: any = await connection.db(db).collection('vendors').find({ _id: { $in: vendorIds } }, { projection: { name: 1, contactInfo: 1 } }).toArray();
        console.log(`${vendors.length} === ${vendorIds.length}` ? 'get credit vendor only' : 'Miss matched');
        const bulkAccountInsert = connection.db(db).collection('accounts').initializeOrderedBulkOp();
        const obj = {
          hide: false,
          createdBy: user,
          updatedBy: user,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        for (const item of customers) {
          const cust = {};
          _.assign(cust, {
            accountType: 'TRADE_RECEIVABLE',
            party: item._id,
          });
          if (item.contactInfo?.mobile) {
            _.assign(cust,
              {
                name: `${item.name}-${item.contactInfo.mobile}`,
                displayName: `${item.name}`,
                validateName: `${item.name}-${item.contactInfo.mobile}`.replace(/[^a-z0-9]/gi, '').toLowerCase(),
              }
            );
          } else {
            _.assign(cust,
              {
                name: `${item.name}`,
                displayName: `${item.name}`,
                validateName: item.name.replace(/[^a-z0-9]/gi, '').toLowerCase(),
              }
            );
          }
          _.assign(cust, obj);
          bulkAccountInsert.insert(cust);
        }
        for (const item of vendors) {
          const ven = {};
          _.assign(ven, {
            accountType: 'TRADE_PAYABLE',
            party: item._id,
          });
          if (item.contactInfo.mobile) {
            _.assign(ven,
              {
                name: `${item.name}-${item.contactInfo.mobile}`,
                displayName: `${item.name}`,
                validateName: `${item.name}-${item.contactInfo.mobile}`.replace(/[^a-z0-9]/gi, '').toLowerCase(),
              }
            );
          } else {
            _.assign(ven,
              {
                name: `${item.name}`,
                displayName: `${item.name}`,
                validateName: item.name.replace(/[^a-z0-9]/gi, '').toLowerCase(),
              }
            );
          }
          _.assign(ven, obj);
          bulkAccountInsert.insert(ven);
        }
        const createAccount = await bulkAccountInsert.execute();
        console.log(
          createAccount.nInserted === vendors.length + customers.length ?
            'All Credit Account created sucessfully' :
            'Credit account createion Something error'
        );
        console.log('1.account creation end....');
      }

      async function costCategoryMaster(db: string, user: Types.ObjectId) {
        await connection.db(db).collection('costcategories').updateOne({ defaultName: 'PRIMARY' }, { $set: { validateName: 'primary' } });
        await connection.db(db).collection('costcategories').updateMany({}, { $set: { updatedBy: user, createdBy: user }, $unset: { __v: 1, aliasName: 1, validateAliasName: 1 } });
      }

      async function costCentreMaster(db: string, user: Types.ObjectId) {
        await connection.db(db).collection('costcentres').updateMany({}, { $set: { updatedBy: user, createdBy: user }, $unset: { __v: 1, aliasName: 1, validateAliasName: 1 } });
      }

      async function branchMaster(db: string) {
        const branches: any = await connection.db(db).collection('branches')
          .find({}, { projection: { gstInfo: 1, otherInfo: 1, addressInfo: 1, contactInfo: 1 } }).toArray();
        const arr = [];
        for (const branch of branches) {
          const $unset = { __v: 1, aliasName: 1, validateAliasName: 1 };
          const $set = {
            gstInfo: {
              regType: 'REGULAR',
              location: '33',
              gstNo: branch.gstInfo.gstNo,
            }
          };
          if (branch.addressInfo) {
            if (!branch.addressInfo.address && !branch.addressInfo.city && !branch.addressInfo.pincode) {
              _.assign($unset, { addressInfo: 1 });
            } else {
              if (!branch.addressInfo.address) {
                _.assign($unset, { 'addressInfo.address': 1 });
              }
              if (!branch.addressInfo.city) {
                _.assign($unset, { 'addressInfo.city': 1 });
              }
              if (!branch.addressInfo.pincode) {
                _.assign($unset, { 'addressInfo.pincode': 1 });
              }
              if (branch.addressInfo.state) {
                _.assign($set, { 'addressInfo.state': branch.addressInfo.state.defaultName });
              } else {
                _.assign($unset, { 'addressInfo.state': 1 });
              }
            }
          }
          if (!branch.contactInfo.mobile && !branch.contactInfo.alternateMobile && !branch.contactInfo.telephone && !branch.contactInfo.email) {
            _.assign($unset, { contactInfo: 1 });
          } else {
            if (!branch.contactInfo.mobile) {
              _.assign($unset, { 'contactInfo.mobile': 1 });
            }
            if (!branch.contactInfo.alternateMobile) {
              _.assign($unset, { 'contactInfo.alternateMobile': 1 });
            }
            if (!branch.contactInfo.telephone) {
              _.assign($unset, { 'contactInfo.telephone': 1 });
            }
            if (!branch.contactInfo.email) {
              _.assign($unset, { 'contactInfo.email': 1 });
            }
          }
          if (!branch.otherInfo?.licenseNo) {
            _.assign($unset, { otherInfo: 1 });
          }
          const obj = {
            updateOne: {
              filter: { _id: branch._id },
              update: {
                $set,
                $unset,
              },
            },
          };
          arr.push(obj);
        }
        await connection.db(db).collection('branches').bulkWrite(arr);
      }

      async function cashRegisterMaster(db: string) {
        await connection.db(db).collection('cashregisters').updateMany({}, { $unset: { enabledFor: 1, __v: 1 } });
      }

      async function doctorMaster(db: string) {
        await connection.db(db).collection('doctors').updateMany({}, { $unset: { aliasName: 1, validateAliasName: 1, __v: 1 } });
      }

      async function financialYear(db: string) {
        await connection.db(db).collection('financialyears').updateMany({}, { $unset: { fSync: 1, fNo: 1, __v: 1 } });
      }

      async function manufacturerMaster(db: string, user: Types.ObjectId) {
        await connection.db(db).collection('manufacturers').updateMany({}, { $set: { createdBy: user, updatedBy: user }, $unset: { __v: 1 } });
      }

      async function sectionMaster(db: string, user: Types.ObjectId) {
        await connection.db(db).collection('sections').updateMany({}, { $set: { createdBy: user, updatedBy: user }, $unset: { __v: 1, aliasName: 1, validateAliasName: 1 } });
        await connection.db(db).collection('sections')
          .updateMany({ $or: [{ parentSection: null }, { parentSection: '' }] }, { $unset: { parentIds: 1, parentSection: 1 } });
      }

      async function unitMaster(db: string, user: Types.ObjectId) {
        await connection.db(db).collection('units').updateMany({}, { $set: { createdBy: user, updatedBy: user }, $unset: { __v: 1, aliasName: 1, validateAliasName: 1 } });
      }

      async function pharmaSaltMaster(db: string, user: Types.ObjectId) {
        await connection.db(db).collection('pharmasalts').updateMany({}, { $set: { createdBy: user, updatedBy: user }, $unset: { __v: 1, aliasName: 1, validateAliasName: 1 } });
      }

      async function rackMaster(db: string, user: Types.ObjectId) {
        await connection.db(db).collection('racks').updateMany({}, { $set: { createdBy: user, updatedBy: user }, $unset: { __v: 1, aliasName: 1, validateAliasName: 1 } });
      }

      async function roleMaster(db: string) {
        await connection.db(db).collection('roles').deleteOne({ name: 'Admin' });
        await connection.db(db).collection('roles').updateMany({}, { $unset: { isDefault: 1, __v: 1 } });
      }

      async function inventoryMaster(db: string, user: Types.ObjectId) {
        const count = await connection.db(db).collection('inventories').countDocuments();
        if (count > 0) {
          const st = new Date().getTime();
          const branches = await connection.db(db).collection('branches').find({}, { projection: { _id: 1 } }).toArray();
          console.log(`Total count of ${'inventories'} was ${count}`);
          const limit = 1000;
          console.log(`${'inventories'} START`);
          for (let skip = 0; skip <= count; skip = skip + limit) {
            const invBranchDetailBulk = connection.db(db).collection('inventory_branch_details').initializeOrderedBulkOp();
            const invBulk = connection.db(db).collection('inventories').initializeOrderedBulkOp();
            const inventories: any = await connection.db(db).collection('inventories')
              .find({}, { sort: { _id: 1 }, skip, limit }).toArray();
            const manufacturerIds = [];
            const taxIds = [];
            const sectionIds = [];

            for (const inventory of inventories) {
              taxIds.push(inventory.tax);
              if (inventory.manufacturer) {
                manufacturerIds.push(inventory.manufacturer);
              }
              if (inventory.section) {
                sectionIds.push(inventory.section);
              }
            }
            const taxes: any = await connection.db(db).collection('taxes').find({ _id: { $in: taxIds } }, { projection: { gstRatio: 1 } }).toArray();
            const sections: any = await connection.db(db).collection('sections').find({ _id: { $in: sectionIds } }, { projection: { displayName: 1 } }).toArray();
            const manufacturers: any = await connection.db(db).collection('manufacturers').find({ _id: { $in: manufacturerIds } }, { projection: { displayName: 1 } }).toArray();
            for (const inventory of inventories) {
              const exTax = taxes.find((a) => inventory.tax.toString() === a._id.toString()).gstRatio.igst;
              const tax = GST_TAXES.find((t) => t.ratio.igst === exTax).code;
              const units = [{
                unit: inventory.unit,
                conversion: 1,
                preferredForPurchase: false,
                preferredForSale: false,
              }];
              if (inventory.unitConversion.length > 0) {
                for (const item of inventory.unitConversion) {
                  if (!item.primary) {
                    units.push({
                      unit: item.unit, conversion: item.conversion,
                      preferredForPurchase: item.preferredForPurchase, preferredForSale: item.preferredForSale
                    });
                  }
                }
              }
              const $set = {
                tax,
                units,
                createdBy: user,
                updatedBy: user,
              };
              if (inventory.manufacturer) {
                const manufacturer = manufacturers.find((m) => m._id.toString() === inventory.manufacturer.toString());
                _.assign($set, { manufacturerId: manufacturer._id, manufacturerName: manufacturer.displayName });
              }
              if (inventory.section) {
                const section = sections.find((s) => s._id.toString() === inventory.section.toString());
                _.assign($set, { sectionId: section._id, sectionName: section.displayName });
              }
              const $unset = {
                section: 1,
                manufacturer: 1,
                unitConversion: 1,
                racks: 1,
                unit: 1,
                sDiscount: 1,
                sMargin: 1,
                __v: 1,
              };
              if (db === 'velavanmedical') {
                if (inventory.salts.length < 1) {
                  _.assign($unset, { salts: 1 });
                }
              } else {
                _.assign($unset, { scheduleH: 1, scheduleH1: 1, salts: 1, narcotics: 1 });
              }
              if (!inventory.barCode) {
                _.assign($unset, { barcode: 1 });
              }
              if (!inventory.aliasName) {
                _.assign($unset, { aliasName: 1, validateAliasName: 1 });
              }
              if (!inventory.hsnCode) {
                _.assign($unset, { hsnCode: 1 });
              }
              invBulk.find({ _id: inventory._id }).updateOne({ $set, $unset });
              for (const br of branches) {
                const obj = {
                  inventory: inventory._id,
                  branch: br._id,
                };
                if (inventory.sDiscount) {
                  for (const key of Object.keys(inventory.sDiscount)) {
                    if (br._id.toString() === key) {
                      _.assign(obj, { sDiscount: inventory.sDiscount[key].ratio });
                    }
                  }
                }
                if (inventory.sMargin) {
                  for (const key of Object.keys(inventory.sMargin)) {
                    if (br._id.toString() === key) {
                      _.assign(obj, { sMargin: inventory.sMargin[key] });
                    }
                  }
                }
                const racks = inventory.racks.find((b) => b.branch === br._id.toString());
                if (racks) {
                  const rack = _.pick(racks, 'rack1', 'rack2', 'rack3', 'rack4');
                  _.assign(obj, rack);
                }
                const doc = _.pickBy(obj, _.identity);
                invBranchDetailBulk.insert(doc);
              }
            }
            await invBulk.execute();
            await invBranchDetailBulk.execute();
          }
          console.log(`Duration for inventory update & inventory_branch_details ${new Date().getTime() - st}`);
        } else {
          console.log('Inventory Not found');
        }
      }

      async function accountOpeningMerge(db: string, user: Types.ObjectId) {
        console.log({ organization: db, collectionName: 'account_openings' });
        const auditplusDB = await connection.db('auditplusdb').collection('organizations').findOne({ name: db });
        const date = auditplusDB.bookBegin;
        date.setDate(date.getDate() - 1);
        const accOpeningPipeLine = [
          {
            $project: {
              _id: 0,
              account: { $toObjectId: '$account.id' },
              branch: { $toObjectId: '$branch.id' },
              date,
              items: [
                {
                  _id: '$_id',
                  credit: '$credit',
                  debit: '$debit',
                }
              ],
              acTrns: [
                {
                  _id: '$_id',
                  account: { $toObjectId: '$account.id' },
                  branch: { $toObjectId: '$branch.id' },
                  bwd: false,
                  credit: '$credit',
                  debit: '$debit',
                }
              ],
              updatedBy: { $toObjectId: '$updatedBy' },
              updatedAt: new Date(),
            }
          },
          { $merge: 'account_openings' },
        ];
        const customerOpeningPipeLine = [
          {
            $addFields: {
              customer: {
                $toObjectId: '$customer',
              },
            },
          },
          {
            $lookup: {
              from: 'accounts',
              localField: 'customer',
              foreignField: 'party',
              as: 'accs',
            },
          },
          {
            $unwind: '$accs',
          },
          {
            $addFields: {
              account: '$accs._id',
              branch: { $toObjectId: '$branch' },
            },
          },
          {
            $group: {
              _id: {
                account: '$account',
                branch: '$branch',
              },
              acTrns: {
                $push: {
                  _id: { $toObjectId: '$pending' },
                  account: '$account',
                  branch: '$branch',
                  bwd: true,
                  refNo: '$refNo',
                  credit: '$credit',
                  debit: '$debit',
                },
              },
              items: {
                $push: {
                  _id: '$_id',
                  effDate: '$effDate',
                  refNo: '$refNo',
                  credit: '$credit',
                  debit: '$debit',
                },
              },
            },
          },
          {
            $addFields: {
              account: '$_id.account',
              branch: '$_id.branch',
              date,
              voucherName: 'Account Opening',
              voucherType: 'ACCOUNT_OPENING',
              updatedBy: user,
              updatedAt: new Date(),
            }
          },
          { $project: { _id: 0 } },
          { $merge: 'account_openings' },
        ];
        const vendorOpeningPipeLine = [
          {
            $addFields: {
              vendor: {
                $toObjectId: '$vendor',
              },
            },
          },
          {
            $lookup: {
              from: 'accounts',
              localField: 'vendor',
              foreignField: 'party',
              as: 'accs',
            },
          },
          {
            $unwind: '$accs',
          },
          {
            $addFields: {
              account: '$accs._id',
              branch: { $toObjectId: '$branch' },
            },
          },
          {
            $group: {
              _id: {
                account: '$account',
                branch: '$branch',
              },
              acTrns: {
                $push: {
                  _id: { $toObjectId: '$pending' },
                  account: '$account',
                  branch: '$branch',
                  bwd: true,
                  refNo: '$refNo',
                  credit: '$credit',
                  debit: '$debit',
                },
              },
              items: {
                $push: {
                  _id: '$_id',
                  effDate: '$effDate',
                  refNo: '$refNo',
                  credit: '$credit',
                  debit: '$debit',
                },
              },
            },
          },
          {
            $addFields: {
              account: '$_id.account',
              branch: '$_id.branch',
              date,
              voucherName: 'Account Opening',
              voucherType: 'ACCOUNT_OPENING',
              updatedBy: user,
              updatedAt: new Date(),
            }
          },
          { $project: { _id: 0 } },
          { $merge: 'account_openings' },
        ];

        const accOpCount = await connection.db(db).collection('accountopenings').countDocuments();
        const cusOpCount = await connection.db(db).collection('customeropenings').countDocuments();
        const venOpCount = await connection.db(db).collection('vendoropenings').countDocuments();
        console.log({ accOpCount, cusOpCount, venOpCount });
        if (accOpCount > 0) {
          await connection.db(db).collection('accountopenings').aggregate(accOpeningPipeLine).toArray();
        } else {
          console.log('No Account Openings Found');
        }
        if (cusOpCount > 0) {
          await connection.db(db).collection('customeropenings').aggregate(customerOpeningPipeLine).toArray();
        } else {
          console.log('No Customer Openings Found');
        }
        if (venOpCount > 0) {
          await connection.db(db).collection('vendoropenings').aggregate(vendorOpeningPipeLine).toArray();
        } else {
          console.log('No Vendoropenings Found');
        }
        console.log('Account opening merge Sucess');
      }
      async function mergePendingAdjustment(db: string) {
        console.log({ organization: db, collectionName: 'accountpendingadjustments' });
        await connection.db(db).collection('customerpendingadjustments')
          .aggregate([
            { $merge: 'accountpendingadjustments' }
          ]).toArray();
        await connection.db(db).collection('vendorpendingadjustments')
          .aggregate([
            { $merge: 'accountpendingadjustments' }
          ]).toArray();
      }

      async function accVoucher(db: string, collectionName: string, accounts: any, pendings?: any) {
        const count = await connection.db(db).collection(collectionName).countDocuments();
        if (count > 0) {
          console.log(`Total count of ${collectionName} was ${count}`);
          const limit = 1000;
          console.log(`${collectionName} START`);
          for (let skip = 0; skip <= count; skip = skip + limit) {
            console.log({ organization: db, collectionName });
            const bulkVOuchers = connection.db(db).collection('vouchers').initializeOrderedBulkOp();
            const docs = [];
            const vouchers: any = await connection.db(db).collection(collectionName)
              .find({}, { projection: { cashRegister: 0 }, sort: { _id: 1 }, skip, limit }).toArray();
            for (const voucher of vouchers) {
              let voucherPending: string;
              let credit: number;
              let debit: number;
              let partyAcc: any;
              // let voucherName: string;
              const receiptCollections = ['customerreceipts', 'vendorreceipts', 'accountreceipts', 'incomes'];
              const paymentCollections = ['customerpayments', 'vendorpayments', 'accountpayments', 'expenses'];
              const creditCollections = ['customerpayments', 'customerreceipts', 'vendorpayments', 'vendorreceipts'];
              const accCollections = ['accountpayments', 'expenses', 'accountreceipts', 'incomes'];
              const contraCollection = ['cashdeposits', 'cashwithdrawals'];
              if (['customerpayments', 'customerreceipts'].includes(collectionName)) {
                voucherPending = voucher.customerPending;
              }
              if (['vendorpayments', 'vendorreceipts'].includes(collectionName)) {
                voucherPending = voucher.vendorPending;
              }
              if (paymentCollections.includes(collectionName)) {
                //voucherName = 'Payment';
                debit = round(voucher.amount);
                credit = 0;
              }
              if (receiptCollections.includes(collectionName)) {
                //voucherName = 'Receipt';
                credit = round(voucher.amount);
                debit = 0;
              }
              if (collectionName === 'cashdeposits') {
                credit = round(voucher.amount);
                debit = 0;
                //voucherName = 'Contra';
              }
              if (collectionName === 'cashwithdrawals') {
                debit = round(voucher.amount);
                credit = 0;
                //voucherName = 'Contra';
              }
              if (creditCollections.includes(collectionName)) {
                partyAcc = accounts.find((party) => party.party === voucher.toAccount.id);
              }
              if (accCollections.includes(collectionName)) {
                partyAcc = accounts.find((party) => party.id === voucher.toAccount.id);
              }
              let cashAcc = accounts.find((cash) => cash.id === voucher.byAccount.id);

              if (contraCollection.includes(collectionName)) {
                cashAcc = accounts.find((party) => party.id === voucher.toAccount.id);
                partyAcc = accounts.find((cash) => cash.id === voucher.byAccount.id);
              }
              const doc: any = {
                _id: voucher._id,
                branch: Types.ObjectId(voucher.branch.id),
                date: voucher.date,
                act: false,
                voucherNo: voucher.voucherNo,
                voucherName: voucher.voucherName,
                voucherType: voucher.voucherType,
                createdBy: Types.ObjectId(voucher.createdBy),
                updatedBy: Types.ObjectId(voucher.updatedBy),
                createdAt: voucher.createdAt,
                updatedAt: voucher.updatedAt,
              };
              if (voucher.refNo) {
                _.assign(doc, { refNo: voucher.refNo });
              }
              if (voucher.description) {
                _.assign(doc, { description: voucher.description });
              }
              let _id: any;
              if (creditCollections.includes(collectionName)) {
                const getPending = pendings
                  .find((pending: any) => (pending.byPending === voucherPending || pending.toPending === voucherPending));
                if (getPending) {
                  if (getPending.byPending > getPending.toPending) {
                    _id = Types.ObjectId(getPending.byPending);
                  } else {
                    _id = Types.ObjectId(getPending.toPending);
                  }
                }
                if (!getPending) {
                  _id = new Types.ObjectId();
                }
              } else {
                _id = new Types.ObjectId();
              }
              const trns: any = [
                {
                  _id: new Types.ObjectId(),
                  account: Types.ObjectId(partyAcc.id),
                  debit,
                  credit,
                },
                {
                  _id: new Types.ObjectId(),
                  account: Types.ObjectId(cashAcc.id),
                  debit: credit,
                  credit: debit,
                },
              ];
              const acTrns: any = [
                {
                  _id,
                  account: Types.ObjectId(partyAcc.id),
                  branch: Types.ObjectId(voucher.branch.id),
                  debit,
                  credit,
                },
                {
                  _id: new Types.ObjectId(),
                  account: Types.ObjectId(cashAcc.id),
                  branch: Types.ObjectId(voucher.branch.id),
                  debit: credit,
                  credit: debit,
                },
              ];
              if (voucher.instNo) {
                trns[1].instNo = voucher.instNo;
                acTrns[1].instNo = voucher.instNo;
              }
              if (voucher.instDate) {
                trns[1].instDate = new Date(new Date(voucher.instDate).setUTCHours(0, 0, 0, 0));
                acTrns[1].instDate = new Date(new Date(voucher.instDate).setUTCHours(0, 0, 0, 0));
              }
              _.assign(doc, { trns });
              _.assign(doc, { acTrns });
              if (creditCollections.includes(collectionName)) {
                const adjs = pendings
                  .filter((pending) => (pending.byPending === voucherPending) && (pending.byPending > pending.toPending))
                  .map((p) => {
                    return {
                      _id: new Types.ObjectId(),
                      pending: Types.ObjectId(p.toPending),
                      amount: round(p.amount),
                    };
                  });
                if (adjs.length > 0) {
                  _.assign(doc.trns[0], { adjs });
                  _.assign(doc.acTrns[0], { adjs });
                }
                _.assign(doc.acTrns[0], { bwd: true });
                _.assign(doc.acTrns[1], { bwd: false });
              } else {
                _.assign(doc.acTrns[0], { bwd: false });
                _.assign(doc.acTrns[1], { bwd: false });
              }
              bulkVOuchers.insert(doc);
            }
            console.log(`${skip} to ${limit + skip} new documents generated for ${collectionName}`);
            console.log(`${skip} to ${limit + skip} bulk insert started....`);
            await bulkVOuchers.execute();
            console.log(`${skip} to ${limit + skip} bulk insert end for ${collectionName}....`);
          }
          console.log(`${collectionName} END`);
        } else {
          console.log(`${collectionName} Not Found`);
        }
      }

      async function journalVoucher(db: string, collectionName: string, accounts: any) {
        console.log({ organization: db, collectionName });
        console.log(`${collectionName} Start`);
        const journalsCount = await connection.db(db).collection(collectionName).countDocuments();
        if (journalsCount > 0) {
          const bulkJournal = connection.db(db).collection('vouchers').initializeOrderedBulkOp();
          const vouchers: any = await connection.db(db).collection(collectionName).find({}).toArray();
          for (const voucher of vouchers) {
            const doc = {
              _id: voucher._id,
              branch: Types.ObjectId(voucher.branch.id),
              date: voucher.date,
              description: voucher.description,
              createdBy: Types.ObjectId(voucher.createdBy),
              updatedBy: Types.ObjectId(voucher.updatedBy),
              createdAt: voucher.createdAt,
              updatedAt: voucher.updatedAt,
              voucherNo: voucher.voucherNo,
              voucherName: 'Journal',
              voucherType: 'JOURNAL',
            };

            if (voucher.refNo) {
              _.assign(doc, { refNo: voucher.refNo });
            }

            const trns = voucher.transactions.map((trn) => {
              const acc = accounts.find(acc => trn.account.id === acc.id);
              return {
                _id: new Types.ObjectId(),
                account: Types.ObjectId(acc.id),
                credit: round(trn.credit),
                debit: round(trn.debit),
              }
            });

            const acTrns = voucher.transactions.map((trn) => {
              return {
                _id: new Types.ObjectId(),
                account: Types.ObjectId(trn.account.id),
                branch: Types.ObjectId(voucher.branch.id),
                bwd: false,
                credit: round(trn.credit),
                debit: round(trn.debit),
              }
            });
            _.assign(doc, { trns });
            _.assign(doc, { acTrns });
            bulkJournal.insert(doc);
          }
          await bulkJournal.execute();
        } else {
          console.log('No journals Found');
        }
        console.log('journals END');
      }

      async function reArrangeBatch(db: string) {
        console.log({ organization: db, collectionName: 'create new batches_rearrange' });
        const openingPipe = [
          {
            $unwind: '$trns',
          },
          {
            $addFields: { batch: { $toObjectId: '$trns.batch' } }
          },
          {
            $lookup: {
              from: 'batches',
              localField: 'batch',
              foreignField: '_id',
              as: 'batchArr'
            }
          },
          {
            $unwind: '$batchArr',
          },
          {
            $project: {
              _id: 0,
              year: { $toString: '$trns.expYear' },
              month: { $toString: '$trns.expMonth' },
              unitConv: '$trns.unit.conversion',
              unitPrecision: '$trns.unitPrecision',
              qty: '$trns.qty',
              mrp: '$trns.mrp',
              rate: '$trns.pRate',
              sRate: '$trns.sRate',
              updatedBy: { $toObjectId: '$updatedBy' },
              updatedAt: '$updatedAt',
              assetAmount: '$assetAmount',
              transactionId: '$trns._id',
              batch: '$trns.batch',
              singleton: '$batchArr.singleton',
              allowNegativeStock: '$batchArr.allowNegativeStock',
              batchNo: { $ifNull: [{ $toUpper: '$trns.batchNo' }, 'N.A'] },
              voucherName: 'OPENING',
              branch: { $toObjectId: '$branchId' },
              inventory: { $toObjectId: '$inventoryId' },
            },
          },
          { $merge: { into: 'batches_rearrange' } }
        ];
        const purchasePipe = [
          {
            $unwind: '$invTrns'
          },
          { $project: { invTrns: 1, branch: 1 } },
          {
            $addFields: { batch: { $toObjectId: '$invTrns.batch' } }
          },
          {
            $lookup: {
              from: 'batches',
              localField: 'batch',
              foreignField: '_id',
              as: 'batchArr'
            }
          },
          {
            $unwind: '$batchArr',
          },
          {
            $addFields: {
              transactionId: '$invTrns._id',
              batch: '$invTrns.batch',
              branch: { $toObjectId: '$branch.id' },
              inventory: { $toObjectId: '$invTrns.inventory.id' },
              singleton: '$batchArr.singleton',
              allowNegativeStock: false,
              batchNo: { $ifNull: [{ $toUpper: '$invTrns.batchNo' }, 'N.A'] },
              voucherName: 'PURCHASE',
            },
          },
          {
            $project: {
              _id: 0, transactionId: 1, batch: 1, branch: 1, inventory: 1,
              singleton: 1, allowNegativeStock: 1, batchNo: 1, voucherName: 1
            }
          },
          { $merge: { into: 'batches_rearrange' } }
        ];

        const stockTransferPipe = [
          {
            $unwind: '$invTrns'
          },
          { $project: { invTrns: 1, targetBranch: 1 } },
          {
            $addFields:
            {
              targetBatch:
              {
                $cond: { if: { $eq: ["$targetBranch.id", '$invTrns.branch'] }, then: true, else: false }
              }
            }
          },
          {
            $match: { targetBatch: true }
          },
          {
            $addFields: { batch: { $toObjectId: '$invTrns.batch' } }
          },
          {
            $lookup: {
              from: 'batches',
              localField: 'batch',
              foreignField: '_id',
              as: 'batchArr',
            }
          },
          {
            $unwind: '$batchArr',
          },
          {
            $addFields: {
              transactionId: '$invTrns._id',
              batch: '$invTrns.batch',
              singleton: '$batchArr.singleton',
              allowNegativeStock: false,
              voucherName: 'TRANSFER',
              batchNo: { $ifNull: [{ $toUpper: '$invTrns.batchNo' }, 'N.A'] },
              branch: { $toObjectId: '$invTrns.branch' },
              inventory: { $toObjectId: '$invTrns.inventory.id' },
            },
          },
          {
            $project: {
              _id: 0, transactionId: 1, batch: 1, branch: 1, inventory: 1,
              singleton: 1, allowNegativeStock: 1, batchNo: 1, voucherName: 1
            }
          },
          { $merge: { into: 'batches_rearrange' } }
        ];
        console.log(`new collection batch_rearrage started...`);
        const newBatchStart = new Date().getTime();
        await connection.db(db).collection('inventory_openings').aggregate(openingPipe).toArray();
        await connection.db(db).collection('purchases').aggregate(purchasePipe).toArray();
        await connection.db(db).collection('stock_transfers').aggregate(stockTransferPipe).toArray();
        console.log(`DURATION for new Batch ${(new Date().getTime() - newBatchStart) / 1000}-sec`);
        console.log(`Convert duplicate batchNo as Uniq batchNo started...`);
        const reBatches: any = await connection.db(db).collection('batches_rearrange')
          .aggregate([
            {
              $group: {
                _id: { inventory: '$inventory', batchNo: '$batchNo', branch: '$branch' },
                count: { $sum: 1 },
                docIds: {
                  $push: '$_id',
                }
              }
            },
            {
              $match: { count: { $gt: 1 } }
            },
            {
              $project: {
                _id: 0,
                batchNo: '$_id.batchNo',
                docIds: 1,
              }
            },
          ]).toArray();
        console.log(`count of duplicate batchNo`, reBatches.length);
        if (reBatches.length > 0) {
          const bulk = connection.db(db).collection('batches_rearrange').initializeOrderedBulkOp();
          for (const item of reBatches) {
            for (let i = 1; i < item.docIds.length; i++) {
              bulk.find({ _id: item.docIds[i] })
                .update({ $set: { batchNo: `${item.batchNo}-${Math.random().toString(36).substring(2, 6).toUpperCase()}` } });
            }
          }
          await bulk.execute();
        } else {
          console.log('There is no duplicate batcNo');
        }
      }

      async function purchaseVoucher(db: string, collectionName: string, accounts: any, pendings: any, batches: any) {
        const count = await connection.db(db).collection(collectionName).countDocuments();
        console.log(`Total ${collectionName} count was ${count}`);
        if (count > 0) {
          const limit = 500;
          const begin = new Date().getTime();
          for (let skip = 3000; skip <= count; skip = skip + limit) {
            console.log({ organization: db, collectionName });
            const start = new Date().getTime();
            const bulkOperation = connection.db(db).collection('purchases_new').initializeOrderedBulkOp();
            const sttt = new Date().getTime();
            console.log(`bulkOperation initialzed Duration ${start - sttt}`);
            const vouchers: any = await connection.db(db).collection(collectionName)
              .find({},
                {
                  projection: { cashRegister: 0, fNo: 0, rcm: 0, taxInclusiveRate: 0 },
                  sort: { _id: 1 }, skip, limit,
                })
              .toArray();
            console.log(`get ${skip} to ${limit + skip} voucher duration ${new Date().getTime() - sttt}`);
            const afterGetVoucher = new Date().getTime();
            for (const voucher of vouchers) {
              const partyLoc = STATE.find((loc) => voucher.gstInfo.source.location.defaultName === loc.defaultName).code;
              const doc: any = {
                _id: voucher._id,
                date: voucher.date,
                billDate: voucher?.billDate ?? voucher.date,
                vendor: Types.ObjectId(voucher.vendor.id),
                branch: Types.ObjectId(voucher.branch.id),
                transactionMode: voucher.purchaseType,
                voucherType: voucher.voucherType,
                branchGst: {
                  regType: 'REGULAR',
                  location: '33',
                  gstNo: voucher.gstInfo.destination.gstNo,
                },
                partyGst: {
                  regType: 'REGULAR',
                  location: partyLoc,
                  gstNo: voucher.gstInfo.source.gstNo,
                },
                rcm: false,
                pRateTaxInc: false,
                sRateTaxInc: true,
                voucherNo: voucher.voucherNo,
                voucherName: voucher.voucherName,
                createdBy: Types.ObjectId(voucher.createdBy),
                updatedBy: Types.ObjectId(voucher.updatedBy),
                createdAt: voucher.createdAt,
                updatedAt: voucher.updatedAt,
                amount: round(voucher.amount),
                act: false,
              };
              if (voucher.warehouse?.id) {
                _.assign(doc, { warehouse: Types.ObjectId(voucher.warehouse.id) });
              }
              if (voucher.refNo) {
                _.assign(doc, { refNo: voucher.refNo });
              }
              if (voucher.description) {
                _.assign(doc, { description: voucher.description });
              }
              const invItems = [];
              const invTrns = [];
              for (const item of voucher.invTrns) {
                const tax = GST_TAXES.find(tax => tax.ratio.igst === item.tax.gstRatio.igst).code;
                const batch = batches.find((bat: any) => bat.batch === item.batch);
                let expiry: any;
                if (item.expMonth && item.expMonth < 10) {
                  expiry = new Date(new Date(`${item.expYear}-${0}${item.expMonth}-01`).setUTCHours(0, 0, 0, 0));
                } else if (item.expMonth && item.expMonth > 9) {
                  expiry = new Date(new Date(`${item.expYear}-${item.expMonth}-01`).setUTCHours(0, 0, 0, 0));
                }

                const invItemObj = {
                  _id: new Types.ObjectId(),
                  inventory: Types.ObjectId(item.inventory.id),
                  unitConv: item.unit.conversion,
                  qty: item.qty,
                  mrp: round(item.mrp),
                  rate: round(item.rate),
                  unitPrecision: item.unitPrecision,
                  tax,
                };
                if (item.discount > 0) {
                  _.assign(invItemObj, { disc: round(item.discount) });
                }

                const invTrnObj = {
                  inventory: Types.ObjectId(item.inventory.id),
                  taxableAmount: round(item.taxableAmount),
                  assetAmount: round(item.assetAmount),
                  mrp: round(item.mrp),
                  tax,
                  rate: round(item.rate),
                  branch: Types.ObjectId(voucher.branch.id),
                  outward: 0,
                };
                if (voucher.warehouse?.id) {
                  _.assign(invTrnObj, { warehouse: Types.ObjectId(voucher.warehouse.id) });
                }
                if (expiry) {
                  _.assign(invItemObj, { expiry });
                  _.assign(invTrnObj, { expiry });
                }
                if (item.cgstAmount > 0) {
                  _.assign(invTrnObj, { cgstAmount: round(item.igstAmount) });
                }
                if (item.sgstAmount > 0) {
                  _.assign(invTrnObj, { sgstAmount: round(item.igstAmount) });
                }
                if (item.igstAmount > 0) {
                  _.assign(invTrnObj, { igstAmount: round(item.igstAmount) });
                }
                if (item.cessAmount > 0) {
                  _.assign(invTrnObj, { cessAmount: round(item.cessAmount) });
                }
                if (collectionName === 'purchases') {
                  const freeQty = (item?.freeQty > 0) ? item.freeQty : 0;
                  const inward = (item.qty + freeQty) * item.unit.conversion;
                  const nlc = round(item.taxableAmount / (item.qty + (item?.freeQty || 0)) / item.unit.conversion);
                  _.assign(invItemObj, { batchNo: batch.batchNo, freeQty, sRate: round(item.sRate) });
                  _.assign(invTrnObj, { _id: batch.transactionId, nlc, batchNo: batch.batchNo, inward, sRate: round(item.sRate) });
                } else {
                  const inward = item.qty * item.unit.conversion * -1;
                  _.assign(invItemObj, { batch: batch.transactionId });
                  _.assign(invTrnObj, { inward, batch: batch.transactionId, _id: new Types.ObjectId() });
                }
                let orderedInvItem = {};
                _(invItemObj).keys().sort().each((key) => {
                  orderedInvItem[key] = invItemObj[key];
                });
                let orderedInvTrn = {};
                _(invTrnObj).keys().sort().each((key) => {
                  orderedInvTrn[key] = invTrnObj[key];
                });
                invItems.push(orderedInvItem);
                invTrns.push(orderedInvTrn);
              }
              const roundOff = voucher.acTrns.find((acc: any) => (acc.account.defaultName === 'ROUNDED_OFF_SHORTAGE'));
              const acAdjs = {};
              if (voucher.discount > 0) {
                _.assign(acAdjs, { discount: round(voucher.discount) });
              }
              if (roundOff) {
                _.assign(acAdjs, { roundedOff: roundOff.credit > 0 ? round(roundOff.credit * -1) : round(roundOff.debit) });
              }
              const acItems = [];
              const acTrns = [];
              for (const item of voucher.acTrns) {
                if (['ROUNDED_OFF_SHORTAGE', 'DISCOUNT_RECEIVED'].includes(item.account?.defaultName)) {
                  const itemAccount = accounts.find((acc: any) => acc.id === item.account.id);
                  const acItemObj = {
                    _id: new Types.ObjectId(),
                    account: Types.ObjectId(itemAccount.id),
                    accountType: itemAccount.type,
                    amount: item.credit > 0 ? -item.credit : item.debit,
                  }
                  acItems.push(acItemObj);
                }
                let account: any;
                let _id: any;
                let trnObj: any;
                if (item.account.defaultName === 'TRADE_PAYABLE') {
                  let adjs: any;
                  account = accounts.find((party) => party.party === voucher.vendor.id);
                  const getPending = pendings
                    .find((pending: any) => (pending.byPending === voucher.vendorPending || pending.toPending === voucher.vendorPending));
                  if (getPending) {
                    if (getPending.byPending > getPending.toPending) {
                      _id = Types.ObjectId(getPending.byPending);
                    } else {
                      _id = Types.ObjectId(getPending.toPending);
                    }
                    adjs = pendings
                      .filter((pending) => (pending.byPending === voucher.vendorPending) && (pending.byPending > pending.toPending))
                      .map((p) => {
                        return {
                          _id: new Types.ObjectId(),
                          amount: round(p.amount),
                          pending: Types.ObjectId(p.toPending),
                        };
                      });
                  } else if (!getPending) {
                    _id = new Types.ObjectId();
                    adjs = [];
                  }
                  trnObj = {
                    _id,
                    account: Types.ObjectId(account.id),
                    adjs,
                    branch: Types.ObjectId(voucher.branch.id),
                    credit: round(item.credit),
                    debit: round(item.debit),
                  }
                  _.assign(doc, { creditAdjs: adjs, creditAccount: Types.ObjectId(account.id), creditAmount: round(voucher.amount) });
                } else {
                  account = accounts.find((acc) => acc.id === item.account.id);
                  if (account.type === 'CASH') {
                    _.assign(doc, { cashAmount: (item.credit > 0) ? round(item.credit) : round(item.debit) });
                  }
                  if (account.type === 'BANK_ACCOUNT' || account.type === 'BANK_OD_ACCOUNT') {
                    _.assign(doc, { bankAmount: (item.credit > 0) ? round(item.credit) : round(item.debit), bankAccount: Types.ObjectId(account.id) });
                  }
                  trnObj = {
                    _id: item._id,
                    account: Types.ObjectId(account.id),
                    branch: Types.ObjectId(voucher.branch.id),
                    credit: round(item.credit),
                    debit: round(item.debit),
                  }
                }
                acTrns.push(trnObj);
              }
              _.assign(doc, { acAdjs, acItems, acTrns, invTrns, invItems });
              let orderedDoc = {};
              _(doc).keys().sort().each((key) => {
                orderedDoc[key] = doc[key];
              });
              bulkOperation.insert(orderedDoc);
            }
            const start1 = new Date().getTime();
            console.log(`${skip} to ${limit + skip} object initialized DURATION ${(start1 - afterGetVoucher) / 1000}-sec`);
            console.log(`${skip} to ${limit + skip} patch object initialized`);
            console.log(`${skip} to ${limit + skip} bulk execution start....`);
            const result = await bulkOperation.execute();
            console.log(`DURATION for only insert execute  ${(new Date().getTime() - start1) / 1000}-sec`);
            console.log(`results are` + JSON.stringify({ insert: result.nInserted, err: result.hasWriteErrors() }));
            console.log(`Total DURATION for ${skip} to ${limit + skip}  ${(new Date().getTime() - start) / 1000}-sec`);
          }
          console.log(`END ALL ${collectionName} and DURATION ${(new Date().getTime() - begin) / (1000 * 60)}-min`);
        } else {
          await connection.db(db).dropCollection(collectionName);
          await connection.db(db).createCollection(collectionName);
          console.log(`${collectionName} Not Found`);
        }
      }

      async function saleVoucher(db: string, collectionName: string, accounts: any, pendings: any, batches: any) {
        const count = await connection.db(db).collection(collectionName).countDocuments();
        if (count > 0) {
          const limit = 500;
          const begin = new Date().getTime();
          for (let skip = 0; skip <= count; skip = skip + limit) {
            console.log({ organization: db, collectionName });
            const start = new Date().getTime();
            const bulkOperation = connection.db(db).collection('sales_new').initializeOrderedBulkOp();
            const sttt = new Date().getTime();
            console.log(`bulkOperation initialzed Duration ${start - sttt}`);
            const vouchers: any = await connection.db(db).collection(collectionName)
              .find({ "_id": Types.ObjectId("60424c74410e1627663ce79f"), },
                {
                  projection: {
                    cashRegister: 0, fNo: 0,
                    __v: 0, cashRegisterApproved: 0,
                  },
                  sort: { _id: 1 }, skip, limit,
                }).toArray();

            console.log(`get ${skip} to ${skip + limit} voucher duration ${new Date().getTime() - sttt}`);
            const afterGetVoucher = new Date().getTime();
            for (const voucher of vouchers) {
              const initialDoc = {
                _id: voucher._id,
                date: voucher.date,
                branch: Types.ObjectId(voucher.branch.id),
                customer: voucher.customer ? Types.ObjectId(voucher.customer) : null,
                customerGroup: voucher.customer?.customerGroup ? Types.ObjectId(voucher.customer.customerGroup) : null,
                doctor: voucher.doctor ? Types.ObjectId(voucher.doctor.id) : null,
                patient: voucher.patient ? Types.ObjectId(voucher.patient.id) : null,
                branchGst: {
                  regType: 'REGULAR',
                  location: '33',
                  gstNo: voucher.gstInfo.source.gstNo,
                },
                lut: voucher?.lut ?? false,
                taxInclusiveRate: voucher.taxInclusiveRate,
                voucherNo: voucher.voucherNo,
                voucherType: voucher.voucherType,
                voucherName: voucher.voucherName,
                createdBy: Types.ObjectId(voucher.createdBy),
                updatedBy: Types.ObjectId(voucher.updatedBy),
                createdAt: voucher.createdAt,
                updatedAt: voucher.updatedAt,
                transactionMode: voucher.saleType,
                amount: round(voucher.amount),
                refNo: voucher.refNo,
                description: voucher.description,
                warehouse: voucher.warehouse?.id ? Types.ObjectId(voucher.warehouse.id) : null,
              };
              const doc = _.pickBy(initialDoc, (key) => key !== null && key !== undefined);
              if (voucher.customer) {
                const regType = voucher.gstInfo.destination.regType.defaultName;
                let partyGst = { regType };
                if (regType) {
                  if (regType != 'OVERSEAS') {
                    let location = STATE.find((loc) => voucher.gstInfo.destination.location.defaultName === loc.defaultName).code;
                    _.assign(partyGst, { location });
                  }
                  if (['REGULAR', 'SPECIAL_ECONOMIC_ZONE'].includes(regType)) {
                    const gstNo = voucher.gstInfo.destination.gstNo;
                    _.assign(partyGst, { gstNo });
                  }
                } else {
                  const custInfo = await connection.db(db).collection('customers').findOne({ _id: Types.ObjectId(voucher.customer.id) });
                  partyGst = {
                    regType: custInfo.gstInfo.regType,
                  }
                  if (custInfo.gstInfo.regType.defaultName != 'OVERSEAS') {
                    const location = STATE.find((loc) => custInfo.gstInfo.location.defaultName === loc.defaultName).code;
                    _.assign(partyGst, { location });
                  }
                  if (['REGULAR', 'SPECIAL_ECONOMIC_ZONE'].includes(custInfo.gstInfo.regType.defaultName)) {
                    _.assign(partyGst, { gstNo: custInfo.gstInfo.gstNo });
                  }
                }
                _.assign(doc, { partyGst });
              }
              const invItems = [];
              const invTrns = [];
              for (const item of voucher.invTrns) {
                const tax = GST_TAXES.find(tax => tax.ratio.igst === item.tax.gstRatio.igst).code;
                // const batch = batches.find((bat: any) => bat.batch === item.batch); later
                let batch = batches.find((bat: any) => bat.batch === item.batch);
                if (!batch) {
                  batch = {
                    voucherNo: voucher.voucherNo,
                    batch: item.batch,
                    batchNo: item.batchNo,
                    transactionId: item.batch,
                  };
                  const doc123 = {
                    voucherNo: voucher.voucherNo,
                    inventoryName: item.inventory.displayName,
                    inventoryId: item.inventory.id,
                    batch: item.batch,
                    batchNo: item.batchNo,
                    branch: voucher.branch.id,
                    branchName: voucher.branch.name,
                    qty: item.qty * item.unit.conversion,
                    rowNo: item.serialNo + 1,
                  };
                  await connection.db(db).collection('missing_batch').insertOne(doc123);
                }
                let expiry: any;
                if (item.expMonth && item.expMonth < 10) {
                  expiry = new Date(new Date(`${item.expYear}-${0}${item.expMonth}-01`).setUTCHours(0, 0, 0, 0));
                } else if (item.expMonth && item.expMonth > 9) {
                  expiry = new Date(new Date(`${item.expYear}-${item.expMonth}-01`).setUTCHours(0, 0, 0, 0));
                }
                const invItemObj = {
                  _id: new Types.ObjectId(),
                  batch: batch.transactionId,
                  inventory: Types.ObjectId(item.inventory.id),
                  qty: item.qty,
                  mrp: round(item.mrp),
                  rate: round(item.rate),
                  unitConv: item.unit.conversion,
                  unitPrecision: item.unitPrecision,
                  tax,
                };
                if (item.discount > 0) {
                  _.assign(invItemObj, { disc: round(item.discount) });
                }
                const invTrnObj = {
                  _id: new Types.ObjectId(),
                  batch: batch.transactionId,
                  inventory: Types.ObjectId(item.inventory.id),
                  inward: 0,
                  taxableAmount: round(item.taxableAmount),
                  assetAmount: round(item.assetAmount),
                  mrp: round(item.mrp),
                  tax,
                  rate: round(item.rate),
                  profitAmount: round(item.taxableAmount - item.assetAmount),
                  profitPercent: round((item.taxableAmount - item.assetAmount) / item.taxableAmount * 100),
                  branch: Types.ObjectId(voucher.branch.id),
                };
                if (item.cgstAmount > 0) {
                  _.assign(invTrnObj, { cgstAmount: round(item.cgstAmount) });
                }
                if (item.sgstAmount > 0) {
                  _.assign(invTrnObj, { sgstAmount: round(item.sgstAmount) });
                }
                if (item.igstAmount > 0) {
                  _.assign(invTrnObj, { igstAmount: round(item.igstAmount) });
                }

                if (voucher.warehouse?.id) {
                  _.assign(invTrnObj, { warehouse: Types.ObjectId(voucher.warehouse.id) });
                }
                if (expiry) {
                  _.assign(invItemObj, { expiry });
                  _.assign(invTrnObj, { expiry });
                }
                if (item.sInc) {
                  _.assign(invItemObj, { sInc: Types.ObjectId(item.sInc) });
                  _.assign(invTrnObj, { sInc: Types.ObjectId(item.sInc) });
                }
                if (collectionName === 'sales') {
                  _.assign(invTrnObj, { outward: item.qty * item.unit.conversion });
                } else {
                  _.assign(invTrnObj, { outward: item.qty * item.unit.conversion * -1 });
                }
                invTrns.push(invTrnObj);
                invItems.push(invItemObj);
              }

              const acAdjs = {};
              if (voucher.shippingInfo.tax?.id) {
                const shippingTax = GST_TAXES.find(t => t.ratio.igst === voucher.shippingInfo.tax.gstRatio.igst).code;
                _.assign(acAdjs, { shippingTax });
                const shippingInfo = {};
                if (voucher.shippingInfo.shipThrough) {
                  _.assign(shippingInfo, { shipThrough: voucher.shippingInfo.shipThrough });
                }
                if (voucher.shippingInfo.shippingDate) {
                  _.assign(shippingInfo, { shippingDate: voucher.shippingInfo.shippingDate });
                }
                if (voucher.shippingInfo.trackingNo) {
                  _.assign(shippingInfo, { trackingNo: voucher.shippingInfo.trackingNo });
                }
                const addressId = (await connection.db(db).collection('customers').findOne({ _id: Types.ObjectId(voucher.customer.id) })).deliveryAddress[0]._id;
                if (addressId) {
                  _.assign(shippingInfo, { deliveryAddress: addressId });
                }
                if (voucher.shippingInfo.shipThrough || voucher.shippingInfo.shippingDate || voucher.shippingInfo.trackingNo) {
                  _.assign(doc, { shippingInfo });
                }
              }
              const acTrns = [];
              const acItems = [];
              for (const item of voucher.acTrns) {
                let account = accounts.find((acc) => acc.id === item.account.id);
                if (['ROUNDED_OFF_SURPLUS', 'DISCOUNT_GIVEN', 'SHIPPING_CHARGE'].includes(item.account?.defaultName)) {
                  if (item.account.defaultName === 'ROUNDED_OFF_SURPLUS') {
                    _.assign(acAdjs, { roundedOff: item.credit > 0 ? round(-item.credit) : round(item.debit) });
                  }
                  if (item.account.defaultName === 'DISCOUNT_GIVEN') {
                    _.assign(acAdjs, { discount: item.credit > 0 ? round(-item.credit) : round(item.debit) });
                  }
                  if (item.account.defaultName === 'SHIPPING_CHARGE') {
                    _.assign(acAdjs, { shippingCharge: item.credit > 0 ? round(-item.credit) : round(item.debit) });
                  }
                  const acItemObj = {
                    _id: new Types.ObjectId(),
                    account: Types.ObjectId(account.id),
                    accountType: account.type,
                    amount: item.credit > 0 ? -item.credit : item.debit,
                  }
                  acItems.push(acItemObj);
                }
                let _id: any;
                let trnObj: any;
                if (item.account.defaultName === 'TRADE_RECEIVABLE') {
                  let adjs: any;
                  account = accounts.find((party) => party.party === voucher.customer.id);
                  const getPending = pendings
                    .find((pending: any) => (pending.byPending === voucher.customerPending || pending.toPending === voucher.customerPending));
                  if (getPending) {
                    if (getPending.byPending > getPending.toPending) {
                      _id = Types.ObjectId(getPending.byPending);
                    } else {
                      _id = Types.ObjectId(getPending.toPending);
                    }
                    adjs = pendings
                      .filter((pending) => (pending.byPending === voucher.customerPending) && (pending.byPending > pending.toPending))
                      .map((p) => {
                        return {
                          _id: new Types.ObjectId(),
                          pending: Types.ObjectId(p.toPending),
                          amount: round(p.amount),
                        };
                      });
                  } else if (!getPending) {
                    _id = new Types.ObjectId();
                  }
                  trnObj = {
                    _id,
                    account: Types.ObjectId(account.id),
                    branch: Types.ObjectId(voucher.branch.id),
                    credit: round(item.credit),
                    debit: round(item.debit),
                    bwd: true,
                  }
                  if (adjs.length > 0) {
                    _.assign(trnObj, { adjs });
                    _.assign(doc, { creditAdjs: adjs });
                  }
                  if (voucher.refNo) {
                    _.assign(trnObj, { refNo: voucher.refNo });
                  }
                  _.assign(doc, { creditAccount: Types.ObjectId(account.id), creditAmount: round(voucher.amount) });
                } else {
                  if (account.type === 'CASH') {
                    _.assign(doc, { cashAmount: (item.credit > 0) ? round(item.credit) : round(item.debit) });
                  }
                  if (account.type === 'BANK_ACCOUNT' || account.type === 'BANK_OD_ACCOUNT') {
                    _.assign(doc, { bankAmount: (item.credit > 0) ? round(item.credit) : round(item.debit), bankAccount: Types.ObjectId(account.id) });
                  }
                  if (account.type === 'EFT_ACCOUNT') {
                    _.assign(doc, { eftAmount: (item.credit > 0) ? round(item.credit) : round(item.debit), eftAccount: Types.ObjectId(account.id) });
                  }
                  trnObj = {
                    _id: item._id,
                    account: Types.ObjectId(account.id),
                    branch: Types.ObjectId(voucher.branch.id),
                    credit: round(item.credit),
                    debit: round(item.debit),
                    bwd: false,
                  }
                  if (voucher.refNo) {
                    _.assign(trnObj, { refNo: voucher.refNo });
                  }
                }
                acTrns.push(trnObj);
              }
              _.assign(doc, { acAdjs, acItems, acTrns, invTrns, invItems });
              bulkOperation.insert(doc);
            }

            const start1 = new Date().getTime();
            console.log(`${skip} to ${limit + skip} object initialized DURATION ${(start1 - afterGetVoucher) / 1000}-sec`);
            console.log(`${skip} to ${limit + skip} patch object initialized`);
            console.log(`${skip} to ${limit + skip} bulk execution start....`);
            const result = await bulkOperation.execute();
            console.log(`DURATION for only insert execute  ${(new Date().getTime() - start1) / 1000}-sec`);
            console.log(`results are` + JSON.stringify({ insert: result.nInserted, err: result.hasWriteErrors() }));
            console.log(`Total DURATION for ${skip} to ${limit + skip}  ${(new Date().getTime() - start) / 1000}-sec`);
          }
          console.log(`END ALL ${collectionName} and DURATION ${(new Date().getTime() - begin) / (1000 * 60)}-min`);
        } else {
          await connection.db(db).dropCollection(collectionName);
          await connection.db(db).createCollection(collectionName);
          console.log(`${collectionName} Not Found`);
        }
      }

      async function stockAdjustments(db: string, collectionName: string, accounts: any, batches: any) {
        const accId = accounts.find(x => x.type === 'STOCK').id;
        const count = await connection.db(db).collection(collectionName).countDocuments();
        console.log(`Total ${collectionName} count was ${count}`);
        if (count > 0) {
          const limit = 500;
          const begin = new Date().getTime();
          for (let skip = 0; skip <= count; skip = skip + limit) {
            console.log({ organization: db, collectionName });
            const start = new Date().getTime();
            const bulkOperation = connection.db(db).collection('stock_adjustments_new').initializeOrderedBulkOp();
            const sttt = new Date().getTime();
            console.log(`bulkOperation initialzed Duration ${start - sttt}`);
            const vouchers: any = await connection.db(db).collection(collectionName)
              .find({},
                {
                  projection: { __v: 0, fNo: 0 },
                  sort: { _id: 1 }, skip, limit,
                })
              .toArray();
            console.log(`get ${skip} to ${limit + skip} voucher duration ${new Date().getTime() - sttt}`);
            const afterGetVoucher = new Date().getTime();
            for (const voucher of vouchers) {
              const amount = round(voucher.amount);
              const doc: any = {
                _id: voucher._id,
                date: voucher.date,
                branch: Types.ObjectId(voucher.branch.id),
                warehouse: null,
                voucherType: voucher.voucherType,
                refNo: voucher.refNo,
                description: voucher.description,
                voucherNo: voucher.voucherNo,
                voucherName: voucher.voucherName,
                createdBy: Types.ObjectId(voucher.createdBy),
                updatedBy: Types.ObjectId(voucher.updatedBy),
                createdAt: voucher.createdAt,
                updatedAt: voucher.updatedAt,
                amount,
                act: false,
                actHide: false,
                acItems: [
                  {
                    _id: new Types.ObjectId(),
                    account: Types.ObjectId(accId),
                    accountType: 'STOCK',
                    amount,
                  }
                ],
                acTrns: [
                  {
                    _id: new Types.ObjectId(),
                    account: Types.ObjectId(accId),
                    branch: Types.ObjectId(voucher.branch.id),
                    credit: amount < 0 ? Math.abs(amount) : 0,
                    debit: amount > 0 ? amount : 0,
                    bwd: false,
                  }
                ]
              };
              const invItems = [];
              const invTrns = [];
              for (const item of voucher.invTrns) {
                // const batch = batches.find((bat: any) => bat.batch === item.batch); later
                let batch = batches.find((bat: any) => bat.batch === item.batch);
                if (!batch) {
                  batch = {
                    voucherNo: voucher.voucherNo,
                    inventoryName: item.inventory.displayName,
                    batch: item.batch,
                    batchNo: item.batchNo,
                    transactionId: item.batch,
                  };
                  const doc123 = {
                    voucherNo: voucher.voucherNo,
                    inventoryName: item.inventory.displayName,
                    inventoryId: item.inventory.id,
                    batch: item.batch,
                    batchNo: item.batchNo,
                    branch: voucher.branch.id,
                    branchName: voucher.branch.name,
                    qty: item.qty * item.unit.conversion,
                    voucherName: voucher.voucherName,
                  };
                  await connection.db(db).collection('missing_batch').insertOne(doc123);
                }
                let expiry: any;
                if (item.expMonth && item.expMonth < 10) {
                  expiry = new Date(new Date(`${item.expYear}-${0}${item.expMonth}-01`).setUTCHours(0, 0, 0, 0));
                } else if (item.expMonth && item.expMonth > 9) {
                  expiry = new Date(new Date(`${item.expYear}-${item.expMonth}-01`).setUTCHours(0, 0, 0, 0));
                } else {
                  expiry = null;
                }
                const invItemObj = {
                  _id: new Types.ObjectId(),
                  batch: batch.transactionId,
                  expiry,
                  inventory: Types.ObjectId(item.inventory.id),
                  mrp: round(item.mrp),
                  qty: item.qty,
                  rate: round(item.cost),
                  unit: Types.ObjectId(item.unit.id),
                  unitConv: item.unit.conversion,
                  unitPrecision: item.unitPrecision,
                };
                const value = item.qty * item.unit.conversion;

                const invTrnObj = {
                  _id: item._id,
                  assetAmount: round(item.amount),
                  batch: batch.transactionId,
                  branch: Types.ObjectId(voucher.branch.id),
                  expiry,
                  inventory: Types.ObjectId(item.inventory.id),
                  inward: value > 0 ? value : 0,
                  mrp: round(item.mrp),
                  profitAmount: 0,
                  profitPercent: 0,
                  rate: round(item.cost),
                  outward: value < 0 ? Math.abs(value) : 0,
                  warehouse: voucher.warehouse?.id ?? null,
                };
                invItems.push(invItemObj);
                invTrns.push(invTrnObj);
              }
              _.assign(doc, { invTrns, invItems });
              let orderedDoc = {};
              _(doc).keys().sort().each((key) => { orderedDoc[key] = doc[key] });
              bulkOperation.insert(orderedDoc);
            }
            const start1 = new Date().getTime();
            console.log(`${skip} to ${limit + skip} object initialized DURATION ${(start1 - afterGetVoucher) / 1000}-sec`);
            console.log(`${skip} to ${limit + skip} patch object initialized`);
            console.log(`${skip} to ${limit + skip} bulk execution start....`);
            const result = await bulkOperation.execute();
            console.log(`DURATION for only insert execute  ${(new Date().getTime() - start1) / 1000}-sec`);
            console.log(`results are` + JSON.stringify({ insert: result.nInserted, err: result.hasWriteErrors() }));
            console.log(`Total DURATION for ${skip} to ${limit + skip}  ${(new Date().getTime() - start) / 1000}-sec`);
          }
          console.log(`END ALL ${collectionName} and DURATION ${(new Date().getTime() - begin) / (1000 * 60)}-min`);
        } else {
          await connection.db(db).dropCollection(collectionName);
          await connection.db(db).createCollection(collectionName);
          console.log(`${collectionName} Not Found`);
        }
      }

      async function stockTransfer(db: string, collectionName: string, accounts: any, batches: any) {
        const accId = accounts.find(x => x.type === 'STOCK').id;
        const count = await connection.db(db).collection(collectionName).countDocuments();
        console.log(`Total ${collectionName} count was ${count}`);
        if (count > 0) {
          const limit = 500;
          const begin = new Date().getTime();
          for (let skip = 0; skip <= count; skip = skip + limit) {
            console.log({ organization: db, collectionName });
            const start = new Date().getTime();
            const bulkOperation = connection.db(db).collection('stock_transfers_new').initializeOrderedBulkOp();
            const sttt = new Date().getTime();
            console.log(`bulkOperation initialzed Duration ${start - sttt}`);
            const vouchers: any = await connection.db(db).collection(collectionName)
              .find({},
                {
                  projection: { __v: 0, fNo: 0 },
                  sort: { _id: 1 }, skip, limit,
                })
              .toArray();
            console.log(`get ${skip} to ${limit + skip} voucher duration ${new Date().getTime() - sttt}`);
            const afterGetVoucher = new Date().getTime();
            for (const voucher of vouchers) {
              const amount = round(voucher.amount);
              const doc: any = {
                _id: voucher._id,
                date: voucher.date,
                branch: Types.ObjectId(voucher.branch.id),
                targetBranch: Types.ObjectId(voucher.targetBranch.id),
                approved: voucher.approved,
                warehouse: null,
                voucherType: voucher.voucherType,
                refNo: voucher.refNo,
                description: voucher.description,
                voucherNo: voucher.voucherNo,
                voucherName: voucher.voucherName,
                createdBy: Types.ObjectId(voucher.createdBy),
                updatedBy: Types.ObjectId(voucher.updatedBy),
                createdAt: voucher.createdAt,
                updatedAt: voucher.updatedAt,
                amount,
                act: false,
                actHide: false,
              };
              const invTrns = [];
              const invItems = [];
              for (const item of voucher.invTrns) {
                const batch = batches.find((bat: any) => bat.batch === item.batch);
                if (item.branch === voucher.branch.id) {
                  invTrns.push({
                    _id: item._id,
                    assetAmount: round(item.amount),
                    batch: batch.transactionId,
                    branch: Types.ObjectId(voucher.branch.id),
                    inventory: Types.ObjectId(item.inventory.id),
                    inward: 0,
                    mrp: round(item.mrp),
                    profitAmount: 0,
                    profitPercent: 0,
                    rate: round(item.cost),
                    outward: item.qty * item.unit.conversion,
                    warehouse: voucher.warehouse?.id ?? null,
                  });
                  invItems.push({
                    _id: new Types.ObjectId(),
                    batch: batch.transactionId,
                    inventory: Types.ObjectId(item.inventory.id),
                    mrp: round(item.mrp),
                    qty: item.qty,
                    rate: round(item.cost),
                    unit: Types.ObjectId(item.unit.id),
                    unitConv: item.unit.conversion,
                    unitPrecision: item.unitPrecision,
                  });
                }
                if (item.branch === voucher.targetBranch.id) {
                  let expiry: any;
                  if (item.expMonth && item.expMonth < 10) {
                    expiry = new Date(new Date(`${item.expYear}-${0}${item.expMonth}-01`).setUTCHours(0, 0, 0, 0));
                  } else if (item.expMonth && item.expMonth > 9) {
                    expiry = new Date(new Date(`${item.expYear}-${item.expMonth}-01`).setUTCHours(0, 0, 0, 0));
                  } else {
                    expiry = null;
                  }
                  invTrns.push({
                    _id: batch.transactionId,
                    assetAmount: round(item.amount),
                    batchNo: batch.batchNo,
                    branch: Types.ObjectId(voucher.targetBranch.id),
                    inventory: Types.ObjectId(item.inventory.id),
                    inward: item.qty * item.unit.conversion,
                    expiry,
                    mrp: round(item.mrp),
                    profitAmount: 0,
                    profitPercent: 0,
                    rate: round(item.cost),
                    sRate: round(item.mrp), // No sRate that's why get MRP
                    outward: 0,
                    warehouse: voucher.warehouse?.id ?? null,
                  });
                  invItems.push({
                    _id: new Types.ObjectId(),
                    batchNo: batch.batchNo,
                    inventory: Types.ObjectId(item.inventory.id),
                    expiry,
                    mrp: round(item.mrp),
                    qty: item.qty,
                    rate: round(item.cost),
                    unit: Types.ObjectId(item.unit.id),
                    unitConv: item.unit.conversion,
                    unitPrecision: item.unitPrecision,
                  });
                }
              }
              const acTrns = [];
              if (voucher.approved) {
                acTrns.push(
                  {
                    _id: new Types.ObjectId(),
                    account: Types.ObjectId(accId),
                    branch: Types.ObjectId(voucher.branch.id),
                    credit: round(voucher.amount),
                    debit: 0,
                  },
                  {
                    _id: new Types.ObjectId(),
                    account: Types.ObjectId(accId),
                    branch: Types.ObjectId(voucher.targetBranch.id),
                    credit: 0,
                    debit: round(voucher.amount),
                  },
                );
              } else {
                acTrns.push(
                  {
                    _id: new Types.ObjectId(),
                    account: Types.ObjectId(accId),
                    branch: Types.ObjectId(voucher.branch.id),
                    credit: round(voucher.amount),
                    debit: 0,
                  },
                );
              }
              _.assign(doc, { acTrns, invTrns, invItems });
              let orderedDoc = {};
              _(doc).keys().sort().each((key) => { orderedDoc[key] = doc[key] });
              bulkOperation.insert(orderedDoc);
            }
            const start1 = new Date().getTime();
            console.log(`${skip} to ${limit + skip} object initialized DURATION ${(start1 - afterGetVoucher) / 1000}-sec`);
            console.log(`${skip} to ${limit + skip} patch object initialized`);
            console.log(`${skip} to ${limit + skip} bulk execution start....`);
            const result = await bulkOperation.execute();
            console.log(`DURATION for only insert execute  ${(new Date().getTime() - start1) / 1000}-sec`);
            console.log(`results are` + JSON.stringify({ insert: result.nInserted, err: result.hasWriteErrors() }));
            console.log(`Total DURATION for ${skip} to ${limit + skip}  ${(new Date().getTime() - start) / 1000}-sec`);
          }
          console.log(`END ALL ${collectionName} and DURATION ${(new Date().getTime() - begin) / (1000 * 60)}-min`);
        } else {
          await connection.db(db).dropCollection(collectionName);
          await connection.db(db).createCollection(collectionName);
          console.log(`${collectionName} Not Found`);
        }
      }

      async function voucherNumberings(db: string) {
        const arr = [];
        const voucherNumberings = await connection.db(db).collection('vouchernumberings').find({}).toArray();
        for (const item of voucherNumberings) {
          const obj = {
            updateOne: {
              filter: { _id: item._id },
              update: {
                $set: {
                  branch: Types.ObjectId(item.branch.id),
                  fYear: Types.ObjectId(item.fYear),
                  voucherType: item.voucherType.defaultName,
                },
                $unset: { createdAt: 1, __v: 1 },
              },
            }
          }
          arr.push(obj);
        }
        await connection.db(db).collection('vouchernumberings').bulkWrite(arr);
      }

      async function renameCollections(db: string) {
        const renameCollections = ['sales', 'purchases', 'stock_transfers', 'stock_adjustments'];
        for (const item of renameCollections) {
          await connection.db(db).collection(item).rename(`${item}_old`);
          await connection.db(db).collection(`${item}_new`).rename(item);
        }
        await connection.db(db).collection('inventory_openings').rename(`inventory_openings${new Date()}`);
        await connection.db(db).collection('inventory_openings_new').rename('inventory_openings');
        await connection.db(db).collection('costcategories').rename('cost_categories');
        await connection.db(db).collection('costcentres').rename('cost_centres');
        await connection.db(db).collection('desktopclients').rename('desktop_clients');
        await connection.db(db).collection('vouchernumberings').rename('voucher_numberings');
        await connection.db(db).collection('inventorydealers').rename('inventory_dealers');
        await connection.db(db).collection('financialyears').rename('financial_years');
        // await connection.db(db).collection('activitylogs').rename('activity_logs');
        await connection.db(db).collection('currentpreferences').rename('current_preferences');
        await connection.db(db).collection('printtemplates').rename('print_templates');
        await connection.db(db).collection('cashtransfers').rename('cash_transfers');
      }

      async function inventoryOpening(db: string) {
        const auditplusDB = await connection.db('auditplusdb').collection('organizations').findOne({ name: db });
        const date = auditplusDB.bookBegin;
        date.setDate(date.getDate() - 1);
        const pipeLine = [
          { $match: { voucherName: 'OPENING' } },
          {
            $addFields: {
              expiry: { $toDate: { $concat: ['$year', '-', '$month', '-01'] } },
            }
          },
          {
            $group: {
              _id: { inventory: '$inventory', branch: '$branch' },
              assetAmount: { $last: '$assetAmount' },
              updatedBy: { $last: '$updatedBy' },
              updatedAt: { $last: '$updatedAt' },
              items: {
                $push: {
                  _id: '$transactionId',
                  batchNo: '$batchNo',
                  unitConv: '$unitConv',
                  unitPrecision: '$unitPrecision',
                  qty: '$qty',
                  mrp: '$mrp',
                  rate: '$rate',
                  sRate: '$sRate',
                  expiry: { $cond: [{ $ne: ['$expiry', null] }, '$expiry', '$REMOVE'] },
                }
              },
              invTrns: {
                $push: {
                  _id: '$transactionId',
                  inventory: '$inventory',
                  branch: '$branch',
                  inward: { $multiply: ['$qty', '$unitConv'] },
                  outward: 0,
                  assetAmount: { $round: [{ $multiply: ['$qty', '$rate'] }, 2] },
                  batchNo: '$batchNo',
                  unitConv: '$unitConv',
                  qty: '$qty',
                  mrp: '$mrp',
                  rate: '$rate',
                  sRate: '$sRate',
                  nlc: { $round: [{ $divide: ['$rate', '$unitConv'] }, 2] },
                  expiry: { $cond: [{ $ne: ['$expiry', null] }, '$expiry', '$REMOVE'] },
                }
              }
            }
          },
          { $addFields: { sRateTaxInc: true } },
          {
            $project: {
              _id: 0,
              assetAmount: '$assetAmount',
              date,
              branch: '$_id.branch',
              inventory: '$_id.inventory',
              invTrns: '$invTrns',
              items: '$items',
              sRateTaxInc: 1,
              updatedAt: '$updatedAt',
              updatedBy: '$updatedBy',
            }
          },
          { $merge: 'inventory_openings_new' },
        ];
        await connection.db(db).collection('batches_rearrange').aggregate(pipeLine, { allowDiskUse: true }).toArray();
      }

      const startTime = new Date();
      console.log('.........START...........');
      console.log({ startTime });


      // const dbs = ['velavanmedical', 'velavanstationery', 'velavanhm', 'ttgold'];
      const dbs = ['velavanmedical']; // for checking
      for (const db of dbs) {
        console.log(`${db} org start.....`);
        const adminUserId: Types.ObjectId = (await connection.db(db).collection('users').findOne({ isAdmin: true }))._id;
        await reArrangeBatch(db); // DONE
        await inventoryMaster(db, adminUserId); //
        await inventoryOpening(db); // DONE
        await accountMaster(db, adminUserId); // DONE
        await costCategoryMaster(db, adminUserId); // DONE
        await costCentreMaster(db, adminUserId); // DONE
        await pharmaSaltMaster(db, adminUserId); // DONE
        await rackMaster(db, adminUserId); // DONE
        await roleMaster(db); // DONE
        await manufacturerMaster(db, adminUserId); // DONE
        await sectionMaster(db, adminUserId); // DONE
        await unitMaster(db, adminUserId); // DONE
        await doctorMaster(db); // DONE
        await financialYear(db); // DONE
        await customerMaster(db); // DONE
        await vendorMaster(db); // DONE
        await branchMaster(db); // DONE
        await cashRegisterMaster(db); // DONE
        await accountOpeningMerge(db, adminUserId); // DONE
        await voucherNumberings(db); // DONE
        await mergePendingAdjustment(db); // DONE


        const accounts: any = await connection.db(db).collection('accounts')
          .find({}, { projection: { party: 1, displayName: 1, accountType: 1 } })
          .map((elm: any) => {
            return {
              id: elm._id.toString(),
              displayName: elm.displayName,
              party: elm?.party?.toString(),
              type: elm.accountType,
            }
          })
          .toArray();
        const pendings: any = await connection.db(db).collection('accountpendingadjustments')
          .find({}, { projection: { _id: 0, __v: 0 } }).toArray();
        const collectionNames = [
          'customerpayments', 'customerreceipts',
          'vendorpayments', 'vendorreceipts',
          'accountreceipts', 'accountpayments',
          'expenses', 'incomes',
          'cashdeposits', 'cashwithdrawals',
          'journals'
        ];  
        for (const coll of collectionNames) {
          if (['customerpayments', 'customerreceipts', 'vendorpayments', 'vendorreceipts'].includes(coll)) {
            await accVoucher(db, coll, accounts, pendings); //DONE
          }
          if (['accountreceipts', 'accountpayments', 'expenses', 'incomes', 'cashdeposits', 'cashwithdrawals'].includes(coll)) {
            await accVoucher(db, coll, accounts);
          }
          if (coll === 'journals') {
            await journalVoucher(db, coll, accounts);
          }
        }

        const batches: any = await connection.db(db).collection('batches_rearrange')
          .find({}, { projection: { transactionId: 1, batch: 1, batchNo: 1, _id: 0 } })
          .map((elm: any) => {
            return {
              batch: elm.batch.toString(),
              transactionId: elm.transactionId,
              batchNo: elm.batchNo,
            }
          }).toArray();
        await purchaseVoucher(db, 'purchases', accounts, pendings, batches);
        await purchaseVoucher(db, 'purchase_returns', accounts, pendings, batches);
        await saleVoucher(db, 'sales', accounts, pendings, batches);
        await saleVoucher(db, 'sale_returns', accounts, pendings, batches);
        await stockAdjustments(db, 'stock_adjustments', accounts, batches);
        await stockTransfer(db, 'stock_transfers', accounts, batches);
        await renameCollections(db);
        console.log(`********${db} org end ******`);
      }
      const endTime = new Date();
      console.log('.........END...........');
      console.log({ endTime });
      console.log({ totalDuration: `${(endTime.getTime() - startTime.getTime()) / (1000 * 60)}-min` });
      await connection.close();
      return 'OK';
    } catch (err) {
      console.log(err.message);
      return err.message;
    }
  }

  async delete() {
    try {
      const connection = await new MongoClient(URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }).connect();

      async function deleteCollections(db: string) {  // drop collection and drop Indexes
        const collections = [
          'accountopenings', 'accountpayments', 'accountpendingadjustments', 'accountreceipts', 'activitylogs',
          'act_account_map', 'act_account_openings', 'act_accountbooks', 'act_accounts',
          'act_gst_registrations', 'act_import_field_map', 'act_import_sessions', 'act_inventories',
          'act_inventory_details', 'act_inventory_openings', 'act_inventorybooks', 'act_vouchers',
          'batches', 'batches_rearrange',
          'cashdeposits', 'cashregisterbooks', 'cashwithdrawals', 'configurations',
          'currentpreferences', 'customerbooks', 'customeropenings', 'customerpayments',
          'customerpendingadjustments', 'customerpendings', 'customerreceipts', 'expenses',
          'gstoutwards', 'gsttransactions', 'incomes', 'inventory_openings_old',
          'journals', 'reviews', 'vendorbooks', 'vendoropenings',
          'vendorpayments', 'vendorpendingadjustments', 'vendorpendings', 'vendorreceipts',
          'purchase_returns', 'sale_returns', 'purchases_old', 'sales_old',
        ];

        const lists = (await connection.db(db).listCollections().toArray()).map(col => col.name);
        const dropColls = lists.filter(item => collections.includes(item));
        const dropIndexes = lists.filter(item => !collections.includes(item));
        for (const coll of dropColls) {
          await connection.db(db).collection(coll).drop();
          console.log(`${coll} collection drop`);
        };
        for (const coll of dropIndexes) {
          await connection.db(db).collection(coll).dropIndexes();
          console.log(`${coll} indexes drop`);
        };
      }
      const dbs = ['velavanmedical', 'velavanstationery', 'velavanhm'];
      for (const db of dbs) {
        await deleteCollections(db);
      }
      async function mainDb(db: string) {
        console.log(`${db} drop collections....`);
        await connection.db(db).collection('accounts').drop();
        await connection.db(db).collection('accounttypes').drop();
        await connection.db(db).collection('configurations').drop();
        await connection.db(db).collection('costcategories').drop();
        await connection.db(db).collection('countries').drop();
        await connection.db(db).collection('gstregistrations').drop();
        await connection.db(db).collection('m1inventoryopenings').drop();
        await connection.db(db).collection('m2inventoryopenings').drop();
        await connection.db(db).collection('organizationtypes').drop();
        await connection.db(db).collection('privileges').drop();
        await connection.db(db).collection('states').drop();
        await connection.db(db).collection('taxes').drop();
        await connection.db(db).collection('taxtypes').drop();
        await connection.db(db).collection('templatelayouts').drop();
      }
      await mainDb('auditplusdb');
      await connection.close();
      return 'unnecessary collections dropped and index drop for all collection successfully';
    } catch (err) {
      console.log(err)
      return err.message;
    }
  }
}
