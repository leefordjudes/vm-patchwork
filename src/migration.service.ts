import { BadRequestException, HttpService, Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { Types } from 'mongoose';
import * as _ from 'lodash';

import { URI } from './config';
import { GST_TAXES } from './fixtures/gst-tax';
import { STATE } from './fixtures/state/state';
import { round } from './utils/utils';

@Injectable()
export class MigrationService {
  async migration() {
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
          const $unset = { __v: 1 };
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
          if (!cus.aliasName) {
            _.assign($unset, { aliasName: 1, validateAliasName: 1 });
          }
          if (!cus.customerGroup) {
            _.assign($unset, { customerGroup: 1 });
          }
          bulkCustomer.find({ _id: cus._id }).updateOne({ $set, $unset });
        }
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
          const $unset = { __v: 1 };
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
          if (!cus.aliasName) {
            _.assign($unset, { aliasName: 1, validateAliasName: 1 });
          }
          bulkCustomer.find({ _id: cus._id }).updateOne({ $set, $unset });
        }
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
          const $unset = {
            tdsApplicable: 1,
            tdsRatio: 1,
            type: 1,
            __v: 1,
          };
          if (!acc.aliasName) {
            _.assign($unset, { aliasName: 1, validateAliasName: 1 })
          }
          if (!acc.description) {
            _.assign($unset, { description: 1 });
          }
          if (acc.parentIds?.length > 0) {
            _.assign($set, { parentIds: acc.parentIds.map((a) => Types.ObjectId(a)) });
          } else {
            _.assign($unset, { parentAccount: 1, parentIds: 1 });
          }
          bulkAccountUpdate.find({ _id: acc._id }).updateOne({ $set, $unset });
        }
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
        if (customers.length > 0) {
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
        }
        if (vendors.length > 0) {
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
        }
        if (vendors.length + customers.length > 0) {
          const createAccount = await bulkAccountInsert.execute();
          console.log(
            createAccount.nInserted === vendors.length + customers.length ?
              'All Credit Account created sucessfully' :
              'Credit account createion Something error'
          );
          console.log('account creation end....');
        }
      }

      async function costCategoryMaster(db: string, user: Types.ObjectId) {
        await connection.db(db).collection('costcategories').updateOne({ defaultName: 'PRIMARY' }, { $set: { validateName: 'primary' } });
        await connection.db(db).collection('costcategories').updateMany({}, { $set: { updatedBy: user, createdBy: user }, $unset: { __v: 1, aliasName: 1, validateAliasName: 1 } });
      }

      async function costCentreMaster(db: string, user: Types.ObjectId) {
        await connection.db(db).collection('costcentres').updateMany({}, { $set: { updatedBy: user, createdBy: user }, $unset: { __v: 1, aliasName: 1, validateAliasName: 1 } });
      }

      async function branchMaster(db: string, user: Types.ObjectId) {
        const branches: any = await connection.db(db).collection('branches')
          .find({}, { projection: { displayName: 1, gstInfo: 1, otherInfo: 1, addressInfo: 1, contactInfo: 1 } }).toArray();
        const arr = [];
        const accArr = [];
        for (const branch of branches) {
          const accId = new Types.ObjectId();
          const branchAccObj = {
            _id: accId,
            name: branch.displayName,
            displayName: branch.displayName,
            validateName: branch.displayName.replace(/[^a-z0-9]/gi, '').toLowerCase(),
            accountType: 'BRANCH_TRANSFER',
            hide: false,
            createdBy: user,
            updatedBy: user,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          accArr.push(branchAccObj);
          const $unset = { __v: 1 };
          if (!branch.aliasName) {
            _.assign($unset, { aliasName: 1, validateAliasName: 1 });
          }
          const $set = {
            account: accId,
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
        await connection.db(db).collection('accounts').insertMany(accArr);
      }

      async function warehouseMaster(db: string) {
        const warehouses: any = await connection.db(db).collection('warehouses')
          .find({}, { projection: { aliasName: 1, addressInfo: 1, contactInfo: 1 } }).toArray();
        const arr = [];
        for (const warehouse of warehouses) {
          const $unset = { __v: 1 };
          if (!warehouse.aliasName) {
            _.assign($unset, { aliasName: 1, validateAliasName: 1 });
          }
          if (warehouse.addressInfo) {
            if (!warehouse.addressInfo.address && !warehouse.addressInfo.city && !warehouse.addressInfo.pincode) {
              _.assign($unset, { addressInfo: 1 });
            } else {
              if (!warehouse.addressInfo.address) {
                _.assign($unset, { 'addressInfo.address': 1 });
              }
              if (!warehouse.addressInfo.city) {
                _.assign($unset, { 'addressInfo.city': 1 });
              }
              if (!warehouse.addressInfo.pincode) {
                _.assign($unset, { 'addressInfo.pincode': 1 });
              }
            }
          }
          if (!warehouse.contactInfo.mobile && !warehouse.contactInfo.alternateMobile && !warehouse.contactInfo.telephone && !warehouse.contactInfo.email) {
            _.assign($unset, { contactInfo: 1 });
          } else {
            if (!warehouse.contactInfo.mobile) {
              _.assign($unset, { 'contactInfo.mobile': 1 });
            }
            if (!warehouse.contactInfo.telephone) {
              _.assign($unset, { 'contactInfo.telephone': 1 });
            }
            if (!warehouse.contactInfo.email) {
              _.assign($unset, { 'contactInfo.email': 1 });
            }
          }
          const obj: any = {
            updateOne: {
              filter: { _id: warehouse._id },
              update: {
                $unset,
              },
            },
          };
          if (warehouse.addressInfo.state) {
            _.assign(obj.updateOne.update.$set, { 'addressInfo.state': warehouse.addressInfo.state.defaultName });
          }
          arr.push(obj);
        }
        await connection.db(db).collection('warehouses').bulkWrite(arr);
      }

      async function cashRegisterMaster(db: string) {
        await connection.db(db).collection('cashregisters').updateMany({}, { $unset: { enabledFor: 1, __v: 1 } });
      }

      async function saleIncharge(db: string, user: Types.ObjectId) {
        const count = await connection.db(db).collection('sales_people').countDocuments();
        if (count > 0) {
          const salesPeople = await connection.db(db).collection('sales_people').find({}).toArray();
          const arr = [];
          for (const item of salesPeople) {
            const doc = {
              _id: item._id,
              name: item.name,
              displayName: item.name,
              code: item.code,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
              createdBy: user,
              updatedBy: user,
              validateName: item.validateName,
            };
            arr.push(doc);
          }
          await connection.db(db).collection('sale_incharges').insertMany(arr);
        } else {
          console.log('No sales_people found');
        }

      }

      async function desktopClientMaster(db: string) {
        const desktops: any = await connection.db(db).collection('desktopclients')
          .find({}, { projection: { name: 1, createdAt: 1 } }).toArray();
        const arr = [];
        for (const desk of desktops) {
          const obj = {
            updateOne: {
              filter: { _id: desk._id },
              update: {
                $set: {
                  validateName: desk.name.replace(/[^a-z0-9]/gi, '').toLowerCase(),
                  updatedAt: new Date(),
                },
                $unset: { __v: 1 },
              },
            },
          };
          arr.push(obj);
        }
        await connection.db(db).collection('desktopclients').bulkWrite(arr);
      }

      async function doctorMaster(db: string, user: Types.ObjectId) {
        await connection.db(db).collection('doctors')
          .updateMany({}, { $set: { createdBy: user, updatedBy: user }, $unset: { __v: 1 } });
        await connection.db(db).collection('doctors')
          .updateMany({ $or: [{ aliasName: '' }, { aliasName: null }] }, { $unset: { aliasName: 1, validateAliasName: 1 } });
      }

      async function patientMaster(db: string, user: Types.ObjectId) {
        await connection.db(db).collection('patients')
          .updateMany({}, { $set: { createdBy: user, updatedBy: user, createdAt: new Date(), updatedAt: new Date() }, $unset: { __v: 1 } });
        await connection.db(db).collection('patients')
          .updateMany({ $or: [{ aliasName: '' }, { aliasName: null }] }, { $unset: { aliasName: 1, validateAliasName: 1 } });
      }

      async function financialYear(db: string) {
        await connection.db(db).collection('financialyears').updateMany({}, { $unset: { fSync: 1, fNo: 1, __v: 1 } });
      }

      async function manufacturerMaster(db: string, user: Types.ObjectId) {
        await connection.db(db).collection('manufacturers')
          .updateMany({}, { $set: { createdBy: user, updatedBy: user }, $unset: { __v: 1 } });
        await connection.db(db).collection('manufacturers')
          .updateMany({ $or: [{ aliasName: '' }, { aliasName: null }] }, { $unset: { aliasName: 1, validateAliasName: 1 } });
      }

      async function sectionMaster(db: string, user: Types.ObjectId) {
        await connection.db(db).collection('sections').updateMany({}, { $set: { createdBy: user, updatedBy: user }, $unset: { __v: 1 } });
        await connection.db(db).collection('sections')
          .updateMany({ $or: [{ parentSection: null }, { parentSection: '' }] }, { $unset: { parentIds: 1, parentSection: 1 } });
        await connection.db(db).collection('sections')
          .updateMany({ $or: [{ aliasName: '' }, { aliasName: null }] }, { $unset: { aliasName: 1, validateAliasName: 1 } });
      }

      async function unitMaster(db: string, user: Types.ObjectId) {
        const units = await connection.db(db).collection('units').find({}).toArray();
        const arr = [];
        if (units.length > 0) {
          for (const unit of units) {
            if (!unit.uqc) {
              const updateObj = {
                updateOne: {
                  filter: { _id: unit._id },
                  update: {
                    $set: { uqc: 'OTH' }
                  },
                }
              };
              arr.push(updateObj);
            }
          }
        }
        if (arr.length > 0) {
          await connection.db(db).collection('units').bulkWrite(arr);
        }
        await connection.db(db).collection('units')
          .updateMany({ $or: [{ aliasName: '' }, { aliasName: null }] }, { $unset: { aliasName: 1, validateAliasName: 1 } });
        await connection.db(db).collection('units')
          .updateMany({}, { $set: { createdBy: user, updatedBy: user }, $unset: { __v: 1 } });
      }

      async function pharmaSaltMaster(db: string, user: Types.ObjectId) {
        await connection.db(db).collection('pharmasalts')
          .updateMany({ $or: [{ aliasName: '' }, { aliasName: null }] }, { $unset: { aliasName: 1, validateAliasName: 1 } });
        await connection.db(db).collection('pharmasalts')
          .updateMany({}, { $set: { createdBy: user, updatedBy: user }, $unset: { __v: 1 } });
      }

      async function rackMaster(db: string, user: Types.ObjectId) {
        await connection.db(db).collection('racks')
          .updateMany({ $or: [{ aliasName: '' }, { aliasName: null }] }, { $unset: { aliasName: 1, validateAliasName: 1 } });
        await connection.db(db).collection('racks')
          .updateMany({}, { $set: { createdBy: user, updatedBy: user }, $unset: { __v: 1 } });
      }

      async function roleMaster(db: string) {
        await connection.db(db).collection('roles').deleteOne({ validateName: 'admin' });
        await connection.db(db).collection('roles')
          .updateMany({}, { $unset: { isDefault: 1, __v: 1 } });
        await connection.db(db).collection('users').updateOne({ isAdmin: true }, { $unset: { role: 1 } });
        await connection.db(db).collection('users')
          .updateMany({}, { $unset: { __v: 1 } });
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
            const invBranchDetailBulk = connection.db(db).collection('inv_branch_details').initializeOrderedBulkOp();
            const invBulk = connection.db(db).collection('inventories').initializeOrderedBulkOp();
            const inventories: any = await connection.db(db).collection('inventories')
              .find({}, { sort: { _id: 1 }, skip, limit }).toArray();
            const manufacturerIds = [];
            const taxIds = [];
            const sectionIds = [];
            const vendorIds = [];
            const unitIds = [];

            for (const inventory of inventories) {
              taxIds.push(inventory.tax);
              unitIds.push(inventory.unit);
              if (inventory.manufacturer) {
                manufacturerIds.push(inventory.manufacturer);
              }
              if (inventory.section) {
                sectionIds.push(inventory.section);
              }
              if (inventory.preferredVendor) {
                vendorIds.push(inventory.preferredVendor);
              }
              if (inventory.unitConversion?.length > 0) {
                for (const u of inventory.unitConversion) {
                  unitIds.push(u.unit);
                }
              }
            }
            const taxes: any = await connection.db(db).collection('taxes')
              .find({ _id: { $in: taxIds } }, { projection: { gstRatio: 1 } }).toArray();
            const sections: any = await connection.db(db).collection('sections')
              .find({ _id: { $in: sectionIds } }, { projection: { displayName: 1 } }).toArray();
            const manufacturers: any = await connection.db(db).collection('manufacturers')
              .find({ _id: { $in: manufacturerIds } }, { projection: { displayName: 1 } }).toArray();
            const vendors: any = await connection.db(db).collection('vendors')
              .find({ _id: { $in: vendorIds } }, { projection: { displayName: 1 } }).toArray();
            const unitDatas: any = await connection.db(db).collection('units')
              .find({ _id: { $in: unitIds } }, { projection: { displayName: 1 } }).toArray();
            for (const inventory of inventories) {
              const exTax = taxes.find((a) => inventory.tax.toString() === a._id.toString()).gstRatio;
              const tax = GST_TAXES.find((t) => t.ratio.igst === round(exTax.cgst + exTax.sgst)).code;
              const units = [{
                unitId: inventory.unit,
                unitName: unitDatas.find((x) => x._id.toString() === inventory.unit.toString()).displayName,
                conversion: 1,
                preferredForPurchase: true,
                preferredForSale: true,
              }];
              if (inventory.unitConversion?.length > 0) {
                for (const item of inventory.unitConversion) {
                  const unitConv = {
                    unitId: item.unit,
                    unitName: unitDatas.find((x) => x._id.toString() === item.unit.toString()).displayName,
                    conversion: item.conversion,
                    preferredForPurchase: false,
                    preferredForSale: false,
                  };
                  if (item.preferredForPurchase) {
                    _.assign(unitConv, { preferredForPurchase: true });
                    units[0].preferredForPurchase = false;
                  }
                  if (item.preferredForSale) {
                    _.assign(unitConv, { preferredForSale: true });
                    units[0].preferredForSale = false;
                  }
                  units.push(unitConv);
                }
              }
              const $set = {
                bwd: true,
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
              if (inventory.preferredVendor) {
                const preferredVendor = vendors.find((v) => v._id.toString() === inventory.preferredVendor.toString());
                _.assign($set, { vendorId: preferredVendor._id, vendorName: preferredVendor.displayName });
              }
              const $unset = {
                section: 1,
                manufacturer: 1,
                unitConversion: 1,
                racks: 1,
                unit: 1,
                sDiscount: 1,
                sMargin: 1,
                aliasName: 1,
                validateAliasName: 1,
                preferredVendor: 1,
                __v: 1,
              };
              if (db.includes('velavanmedical')) {
                if (inventory.salts.length < 1) {
                  _.assign($unset, { salts: 1 });
                }
              } else {
                _.assign($unset, { scheduleH: 1, scheduleH1: 1, salts: 1, narcotics: 1 });
              }
              if (!inventory.barCode) {
                _.assign($unset, { barcode: 1 });
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
                      _.assign(obj, { sDisc: inventory.sDiscount[key].ratio });
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
            console.log(`${skip} to ${limit + skip} invenory updated`);
            await invBulk.execute();
            console.log(`${skip} to ${limit + skip} invBranchDetail bulk insert started....`);
            await invBranchDetailBulk.execute();
            console.log(`${skip} to ${limit + skip} invBranchDetail bulk insert end....`);
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
            $addFields: {
              account: { $toObjectId: '$account.id' },
            }
          },
          {
            $lookup: {
              from: 'accounts',
              localField: 'account',
              foreignField: '_id',
              as: 'accs',
            },
          },
          {
            $unwind: '$accs',
          },
          {
            $project: {
              _id: 0,
              account: '$accs._id',
              branch: { $toObjectId: '$branch.id' },
              date,
              items: [
                {
                  credit: '$credit',
                  debit: '$debit',
                }
              ],
              acTrns: [
                {
                  account: '$accs._id',
                  accountType: '$accs.accountType',
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
                  accountType: 'TRADE_RECEIVABLE',
                  refNo: '$refNo',
                  effDate: '$effDate',
                  credit: '$credit',
                  debit: '$debit',
                },
              },
              items: {
                $push: {
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
                  accountType: 'TRADE_PAYABLE',
                  effDate: '$effDate',
                  refNo: '$refNo',
                  credit: '$credit',
                  debit: '$debit',
                },
              },
              items: {
                $push: {
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
            const vouchers: any = await connection.db(db).collection(collectionName)
              .find({}, { projection: { cashRegister: 0 }, sort: { _id: 1 }, skip, limit }).toArray();
            for (const voucher of vouchers) {
              let voucherPending: string;
              let credit: number;
              let debit: number;
              let partyAcc: any;
              let voucherName: string;
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
                voucherName = 'Payment';
                debit = round(voucher.amount);
                credit = 0;
              }
              if (receiptCollections.includes(collectionName)) {
                voucherName = 'Receipt';
                credit = round(voucher.amount);
                debit = 0;
              }
              if (collectionName === 'cashdeposits') {
                credit = round(voucher.amount);
                debit = 0;
                voucherName = 'Cash Deposit';
              }
              if (collectionName === 'cashwithdrawals') {
                debit = round(voucher.amount);
                credit = 0;
                voucherName = 'Cash Withdrawal';
              }
              if (collectionName === 'incomes') {
                voucherName = 'Income';
              }
              if (collectionName === 'expenses') {
                voucherName = 'Expense';
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
                actHide: false,
                amount: round(voucher.amount),
                voucherNo: voucher.voucherNo,
                voucherName,
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
              const trns: any = [
                {
                  account: Types.ObjectId(partyAcc.id),
                  debit,
                  credit,
                },
                {
                  account: Types.ObjectId(cashAcc.id),
                  debit: credit,
                  credit: debit,
                },
              ];
              const acTrns: any = [
                {
                  account: Types.ObjectId(partyAcc.id),
                  accountType: partyAcc.type,
                  debit,
                  credit,
                },
                {
                  account: Types.ObjectId(cashAcc.id),
                  accountType: cashAcc.type,
                  debit: credit,
                  credit: debit,
                },
              ];
              if (voucher.instNo) {
                trns[1].instNo = voucher.instNo;
              }
              if (voucher.instDate) {
                trns[1].instDate = new Date(new Date(voucher.instDate).setUTCHours(0, 0, 0, 0));
              }
              _.assign(doc, { trns });
              _.assign(doc, { acTrns });
              if (creditCollections.includes(collectionName)) {
                acTrns[0]._id = Types.ObjectId(voucherPending);
                if (voucher.refNo) {
                  acTrns[0].refNo = voucher.refNo;
                }
                const adjs = pendings
                  .filter((pending) => (pending.byPending === voucherPending) && (pending.byPending > pending.toPending))
                  .map((p) => {
                    return {
                      pending: Types.ObjectId(p.toPending),
                      amount: round(p.amount),
                    };
                  });
                if (adjs.length > 0) {
                  _.assign(doc.trns[0], { adjs });
                  _.assign(doc.acTrns[0], { adjs });
                }
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
            const branch = Types.ObjectId(voucher.branch.id);
            const doc = {
              _id: voucher._id,
              branch,
              date: voucher.date,
              act: false,
              actHide: false,
              amount: round(voucher.amount),
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

            const trns = [];
            const acTrns = [];
            for (const txn of voucher.transactions) {
              const acc = accounts.find(acc => txn.account.id === acc.id);
              acTrns.push(
                {
                  account: Types.ObjectId(acc.id),
                  accountType: acc.type,
                  credit: round(txn.credit),
                  debit: round(txn.debit),
                }
              );
              trns.push(
                {
                  account: Types.ObjectId(acc.id),
                  credit: round(txn.credit),
                  debit: round(txn.debit),
                }
              );
            }
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
              batchNo: { $ifNull: [{ $toUpper: '$trns.batchNo' }, 'NA'] },
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
            $project: {
              _id: 0,
              transactionId: '$invTrns._id',
              batch: '$invTrns.batch',
              batchNo: { $ifNull: [{ $toUpper: '$invTrns.batchNo' }, 'NA'] },
              voucherName: 'PURCHASE',
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
              allowNegativeStock: false,
              voucherName: 'TRANSFER',
            },
          },
          {
            $project: {
              _id: 0,
              transactionId: '$invTrns._id',
              batch: '$invTrns.batch',
              sRate: '$batchArr.sRate',
              batchNo: { $ifNull: [{ $toUpper: '$batchArr.batchNo' }, 'NA'] },
              voucherName: 1
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
        const skipSpecialChars: any = await connection.db(db).collection('batches_rearrange')
          .aggregate([
            {
              $match: { batchNo: RegExp('[^0-9A-Za-z]') }
            },
            {
              $project: { _id: 1, batchNo: 1 }
            },
          ]).toArray();
        const skipSpecialArr = [];
        for (const elm of skipSpecialChars) {
          const updateObj = {
            updateOne: {
              filter: { _id: elm._id },
              update: {
                $set: { batchNo: elm.batchNo.replace(/[^a-z0-9]/gi, '').length ? elm.batchNo.replace(/[^a-z0-9]/gi, '') : 'NA' }
              },
            }
          };
          skipSpecialArr.push(updateObj);
        }
        if (skipSpecialArr.length > 0) {
          await connection.db(db).collection('batches_rearrange').bulkWrite(skipSpecialArr);
        }
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
                .update({ $set: { batchNo: `${item.batchNo}${Math.random().toString(36).substring(2, 6).toUpperCase()}` } });
            }
          }
          bulk.find({ batchNo: '' }).update({ $set: { batchNo: 'NA' } });
          await bulk.execute();
          console.log(`Batch_rearrange updated sucessfully..`);
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
          for (let skip = 0; skip <= count; skip = skip + limit) {
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
            console.log(`get ${skip} to ${limit + skip} voucher duration ${(new Date().getTime() - sttt) / 1000}-sec`);
            const afterGetVoucher = new Date().getTime();
            for (const voucher of vouchers) {
              const partyLoc = STATE.find((loc) => voucher.gstInfo.source.location.defaultName === loc.defaultName).code;
              const initialDoc: any = {
                _id: voucher._id,
                date: voucher.date,
                billDate: collectionName === 'purchases' ? voucher?.billDate ?? voucher.date : undefined,
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
                actHide: false,
                refNo: voucher.refNo,
                warehouse: voucher.warehouse?.id ? Types.ObjectId(voucher.warehouse.id) : null,
                description: voucher.description,
              };
              const doc = _.pickBy(initialDoc, (key) => key !== null && key !== undefined && key !== '');
              const acItems = [];
              const acTrns = [];
              for (const item of voucher.acTrns) {
                let account = accounts.find((acc) => acc.id === item.account.id);
                if (['ROUNDED_OFF_SHORTAGE', 'ROUNDED_OFF_SURPLUS', 'DISCOUNT_RECEIVED'].includes(item.account?.defaultName)) {
                  if (item.account.defaultName.includes('ROUNDED')) {
                    account = accounts.find((acc: any) => acc.displayName === 'Rounded Off (Shortage)');
                  }
                  const acItemObj = {
                    account: Types.ObjectId(account.id),
                    accountType: account.type,
                    amount: item.credit > 0 ? round(-item.credit) : round(item.debit),
                  }
                  acItems.push(acItemObj);
                }

                let trnObj: any;
                if (item.account.defaultName === 'TRADE_PAYABLE') {
                  account = accounts.find((party) => party.party === voucher.vendor.id);
                  const adjs = pendings
                    .filter((pending) => (pending.byPending === voucher.vendorPending) && (pending.byPending > pending.toPending))
                    .map((p) => {
                      return {
                        pending: Types.ObjectId(p.toPending),
                        amount: round(p.amount),
                      };
                    });
                  trnObj = {
                    _id: Types.ObjectId(voucher.vendorPending),
                    account: Types.ObjectId(account.id),
                    accountType: account.type,
                    adjs,
                    credit: round(item.credit),
                    debit: round(item.debit),
                  };
                  if (voucher.refNo) {
                    _.assign(trnObj, { refNo: voucher.refNo });
                  }
                  _.assign(doc, { creditAdjs: adjs, creditAccount: Types.ObjectId(account.id), creditAmount: round(voucher.amount) });
                } else {
                  if (account.type === 'CASH') {
                    _.assign(doc, { cashAmount: (item.credit > 0) ? round(item.credit) : round(item.debit) });
                  }
                  if (account.type === 'BANK_ACCOUNT' || account.type === 'BANK_OD_ACCOUNT') {
                    _.assign(doc, { bankAmount: (item.credit > 0) ? round(item.credit) : round(item.debit), bankAccount: Types.ObjectId(account.id) });
                  }
                  trnObj = {
                    account: Types.ObjectId(account.id),
                    accountType: account.type,
                    credit: round(item.credit),
                    debit: round(item.debit),
                  }
                }
                acTrns.push(trnObj);
              }
              const invItems = [];
              const invTrns = [];
              const invBatches = _.intersectionBy(batches, voucher.invTrns, 'batch');
              for (const item of voucher.invTrns) {
                const tax = GST_TAXES.find(tax => tax.ratio.igst === round(item.tax.gstRatio.sgst + item.tax.gstRatio.cgst)).code;
                const batch: any = invBatches.find((bat: any) => bat.batch === item.batch);

                const invItemObj = {
                  inventory: Types.ObjectId(item.inventory.id),
                  unitConv: item.unit.conversion,
                  qty: item.qty,
                  mrp: round(item.mrp),
                  rate: round(item.rate),
                  unitPrecision: item.unitPrecision,
                  tax,
                  disc: round(item.discount) || 0,
                };

                const invTrnObj = {
                  inventory: Types.ObjectId(item.inventory.id),
                  taxableAmount: round(item.taxableAmount),
                  assetAmount: round(item.assetAmount),
                  unitConv: item.unit.conversion,
                  mrp: round(item.mrp),
                  tax,
                  rate: round(item.rate),
                  outward: 0,
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
                if (collectionName === 'purchases') {
                  let expiry: any;
                  if (item.expMonth && item.expMonth < 10) {
                    expiry = new Date(new Date(`${item.expYear}-${0}${item.expMonth}-01`).setUTCHours(0, 0, 0, 0));
                  } else if (item.expMonth && item.expMonth > 9) {
                    expiry = new Date(new Date(`${item.expYear}-${item.expMonth}-01`).setUTCHours(0, 0, 0, 0));
                  }
                  if (expiry) {
                    _.assign(invItemObj, { expiry });
                    _.assign(invTrnObj, { expiry });
                  }
                  const freeQty: number = item?.freeQty || 0;
                  const inward = (item.qty + freeQty) * item.unit.conversion;
                  const nlc = round(item.taxableAmount / (item.qty + freeQty) / item.unit.conversion);
                  _.assign(invItemObj, { batchNo: batch.batchNo.replace(/[^a-z0-9]/gi, '').toUpperCase(), freeQty, sRate: round(item.sRate) });
                  _.assign(invTrnObj, { _id: batch.transactionId, barcode: new Types.ObjectId(), nlc, batchNo: batch.batchNo.replace(/[^a-z0-9]/gi, '').toUpperCase(), inward, sRate: round(item.sRate), pRateTaxInc: false, sRateTaxInc: true });
                } else {
                  const inward = item.qty * item.unit.conversion * -1;
                  _.assign(invItemObj, { batch: batch.transactionId });
                  _.assign(invTrnObj, { inward, batch: batch.transactionId });
                }
                invItems.push(invItemObj);
                invTrns.push(invTrnObj);
              }
              const roundOff = voucher.acTrns.find((acc: any) => (acc.account.defaultName?.includes('ROUNDED')));
              const acAdjs = {};
              if (voucher.discount > 0) {
                _.assign(acAdjs, { discount: round(voucher.discount) });
              }
              if (roundOff) {
                _.assign(acAdjs, { roundedOff: roundOff.credit > 0 ? round(roundOff.credit * -1) : round(roundOff.debit) });
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
              .find({}, {
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
                customer: voucher.customer ? Types.ObjectId(voucher.customer.id) : null,
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
                act: false,
                actHide: false,
                description: voucher.description,
                warehouse: voucher.warehouse?.id ? Types.ObjectId(voucher.warehouse.id) : null,
              };
              const doc = _.pickBy(initialDoc, (key) => key !== null && key !== undefined && key !== '');
              if (voucher.customer) {
                const regType = voucher.gstInfo.destination?.regType?.defaultName;
                let partyGst = {};
                if (regType && voucher.gstInfo.destination?.location?.defaultName) {
                  partyGst = { regType };
                  if (regType !== 'OVERSEAS') {
                    const location = STATE.find((loc) => voucher.gstInfo.destination.location.defaultName === loc.defaultName).code;
                    _.assign(partyGst, { location });
                  }
                  if (['REGULAR', 'SPECIAL_ECONOMIC_ZONE'].includes(regType)) {
                    const gstNo = voucher.gstInfo.destination.gstNo;
                    _.assign(partyGst, { gstNo });
                  }
                } else {
                  const custInfo = await connection.db(db).collection('customers').findOne({ _id: Types.ObjectId(voucher.customer.id) });
                  partyGst = custInfo.gstInfo;
                }
                _.assign(doc, { partyGst });
              }
              const acTrns = [];
              const acItems = [];
              const acAdjs = {};
              for (const item of voucher.acTrns) {
                let account = accounts.find((acc) => acc.id === item.account.id);
                if (['ROUNDED_OFF_SURPLUS', 'ROUNDED_OFF_SHORTAGE', 'DISCOUNT_GIVEN'].includes(item.account?.defaultName)) {
                  if (['ROUNDED_OFF_SHORTAGE', 'ROUNDED_OFF_SURPLUS'].includes(item.account.defaultName)) {
                    account = accounts.find((acc) => acc.displayName === 'Rounded Off (Surplus)');
                    _.assign(acAdjs, { roundedOff: item.credit > 0 ? round(-item.credit) : round(item.debit) });
                  }
                  if (item.account.defaultName === 'DISCOUNT_GIVEN') {
                    _.assign(acAdjs, { discount: item.credit > 0 ? round(-item.credit) : round(item.debit) });
                  }
                  const acItemObj = {
                    account: Types.ObjectId(account.id),
                    accountType: account.type,
                    amount: item.credit > 0 ? -item.credit : item.debit,
                  }
                  acItems.push(acItemObj);
                }
                let trnObj: any;
                if (item.account.defaultName === 'TRADE_RECEIVABLE') {
                  account = accounts.find((party) => party.party === voucher.customer.id);
                  const adjs = pendings
                    .filter((pending) => (pending.byPending === voucher.customerPending) && (pending.byPending > pending.toPending))
                    .map((p) => {
                      return {
                        pending: Types.ObjectId(p.toPending),
                        amount: round(p.amount),
                      };
                    });
                  trnObj = {
                    _id: Types.ObjectId(voucher.customerPending),
                    account: Types.ObjectId(account.id),
                    accountType: account.type,
                    credit: round(item.credit),
                    debit: round(item.debit),
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
                    account: Types.ObjectId(account.id),
                    accountType: account.type,
                    credit: round(item.credit),
                    debit: round(item.debit),
                  }
                }
                acTrns.push(trnObj);
              }
              const invItems = [];
              const invTrns = [];
              const incSum = [];
              const invBatches: any = _.intersectionBy(batches, voucher.invTrns, 'batch');
              for (const item of voucher.invTrns) {
                if (item.sInc) {
                  incSum.push({
                    sInc: item.sInc,
                    taxableAmount: item.taxableAmount,
                    amount: item.taxableAmount + item.sgstAmount + item.igstAmount + item.cgstAmount,
                  });
                }
                const tax = GST_TAXES.find(tax => tax.ratio.igst === round(item.tax.gstRatio.cgst + item.tax.gstRatio.sgst)).code;
                const batch = invBatches.find((bat: any) => bat.batch === item.batch);
                const invItemObj = {
                  batch: batch.transactionId,
                  inventory: Types.ObjectId(item.inventory.id),
                  qty: item.qty,
                  mrp: round(item.mrp),
                  rate: round(item.rate),
                  unitConv: item.unit.conversion,
                  unitPrecision: item.unitPrecision,
                  tax,
                  disc: round(item.discount) || 0,
                };
                const invTrnObj = {
                  batch: batch.transactionId,
                  inventory: Types.ObjectId(item.inventory.id),
                  inward: 0,
                  unitConv: item.unit.conversion,
                  taxableAmount: round(item.taxableAmount),
                  assetAmount: round(item.assetAmount),
                  mrp: round(item.mrp),
                  tax,
                  rate: round(item.rate),
                  profitAmount: round(item.taxableAmount - item.assetAmount),
                  profitPercent: round((item.taxableAmount - item.assetAmount) / item.taxableAmount * 100),
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
                if (item.sInc) {
                  _.assign(invItemObj, { sInc: Types.ObjectId(item.sInc) });
                }
                if (collectionName === 'sales') {
                  _.assign(invTrnObj, { outward: item.qty * item.unit.conversion });
                } else {
                  _.assign(invTrnObj, { outward: item.qty * item.unit.conversion * -1 });
                }
                invTrns.push(invTrnObj);
                invItems.push(invItemObj);
              }
              const incSummary = [];
              const mode = collectionName === 'sales' ? 1 : -1;
              const grouped = _.groupBy(incSum, x => x.sInc);
              for (const key in grouped) {
                if (grouped.hasOwnProperty(key) && key) {
                  const amt = _.reduce(grouped[key], (s, n) => s + n.amount, 0);
                  const taxableAmt = _.reduce(grouped[key], (s, n) => s + n.taxableAmount, 0);
                  incSummary.push({
                    sInc: Types.ObjectId(key),
                    amount: round(amt * mode),
                    taxableAmount: round(taxableAmt * mode),
                  });
                }
              }
              const taxSummary = [];
              const taxGroup = _.groupBy(invTrns, x => x.tax);
              for (const key in taxGroup) {
                if (taxGroup.hasOwnProperty(key) && key) {
                  const taxableAmount = _.reduce(taxGroup[key], (s, n) => s + n.taxableAmount, 0);
                  const cgstAmount = _.reduce(taxGroup[key], (s, n) => s + n.cgstAmount, 0);
                  const sgstAmount = _.reduce(taxGroup[key], (s, n) => s + n.sgstAmount, 0);
                  const igstAmount = _.reduce(taxGroup[key], (s, n) => s + n.igstAmount, 0);
                  taxSummary.push({
                    tax: key,
                    taxableAmount: round(taxableAmount),
                    cgstAmount: round(cgstAmount) || 0,
                    sgstAmount: round(sgstAmount) || 0,
                    igstAmount: round(igstAmount) || 0,
                  });
                }
              }

              if (voucher.shippingInfo?.tax?.id) {
                const shippingTax = GST_TAXES.find(t => t.ratio.igst === voucher.shippingInfo.tax.gstRatio.igst).code;
                _.assign(acAdjs, { shippingTax, shippingCharge: round(voucher.shippingInfo.shippingCharge) });
                const shippingAcc = accounts.find((a) => a.displayName === 'Shipping Charge').id;
                const ship = acTrns.find((ship) => ship.account.toString() === shippingAcc)?.account;
                acItems.push({
                  account: Types.ObjectId(shippingAcc),
                  accountType: 'DIRECT_INCOME',
                  amount: round(voucher.shippingInfo.shippingCharge) * -1,
                });
                if (!ship) {
                  acTrns.push({
                    account: Types.ObjectId(shippingAcc),
                    accountType: 'DIRECT_INCOME',
                    credit: round(voucher.shippingInfo.shippingCharge),
                    debit: 0,
                  });
                }
              }
              if (incSummary.length > 0) {
                _.assign(doc, { incSummary });
              }
              _.assign(doc, { acAdjs, acItems, acTrns, invTrns, invItems, taxSummary });
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
          const inventories: any = await connection.db(db).collection('inventories')
            .find({}, { projection: { tax: 1 } }).map((inv: any) => { return { inventory: { id: inv._id.toString(), tax: inv.tax } } }).toArray();
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
              const initialDoc: any = {
                _id: voucher._id,
                date: voucher.date,
                branch: Types.ObjectId(voucher.branch.id),
                warehouse: voucher.warehouse?.id ? Types.ObjectId(voucher.warehouse.id) : null,
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
                sRateTaxInc: true,
              };
              const doc = _.pickBy(initialDoc, (v) => v !== null && v !== undefined && v !== '');
              if (amount !== 0) {
                _.assign(doc, {
                  acTrns: [
                    {
                      account: Types.ObjectId(accId),
                      accountType: 'STOCK',
                      credit: amount < 0 ? Math.abs(amount) : 0,
                      debit: amount > 0 ? amount : 0,
                    }
                  ]
                });
              }
              const invItems = [];
              const invTrns = [];
              const invBatches: any = _.intersectionBy(batches, voucher.invTrns, 'batch');
              const invs: any = _.intersectionBy(inventories, voucher.invTrns, 'inventory.id');
              for (const item of voucher.invTrns) {
                const batch = invBatches.find((bat: any) => bat.batch === item.batch);
                const invItemObj = {
                  batch: batch.transactionId,
                  inventory: Types.ObjectId(item.inventory.id),
                  qty: item.qty,
                  cost: round(item.cost),
                  tax: invs.find((inv) => inv.inventory.id === item.inventory.id).tax,
                  unitConv: item.unit.conversion,
                  unitPrecision: item.unitPrecision,
                };
                const value = item.qty * item.unit.conversion;
                const invTrnObj = {
                  assetAmount: round(item.amount),
                  unitConv: item.unit.conversion,
                  batch: batch.transactionId,
                  inventory: Types.ObjectId(item.inventory.id),
                  inward: value > 0 ? value : 0,
                  outward: value < 0 ? Math.abs(value) : 0,
                  rate: round(item.cost),
                };
                invItems.push(invItemObj);
                invTrns.push(invTrnObj);
              }
              _.assign(doc, { invTrns, invItems });
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
            const targetBranchCount = _(vouchers)
              .groupBy('targetBranch.id')
              .map((items, branch) => ({ branch: Types.ObjectId(branch), voucherCount: items.length }))
              .value();
            const voucherNumbers: any = await connection.db(db).collection('vouchernumberings')
              .find({
                branch: { $in: targetBranchCount.map((b) => b.branch) }, voucherType: 'STOCK_JOURNAL'
              }, { sort: { _id: -1 }, limit: targetBranchCount.length }).toArray();
            const updateArr = [];
            const newNumberings = [];
            for (const vNo of voucherNumbers) {
              const branch = targetBranchCount.find((b) => b.branch.toString() === vNo.branch.toString());
              if (branch) {
                const sequence = branch.voucherCount + vNo.sequence;
                const obj = {
                  branch: branch.branch.toString(),
                  prefix: vNo.prefix,
                  suffix: vNo.suffix,
                  startSeq: vNo.sequence,
                };
                newNumberings.push(obj);
                const updateObj = {
                  updateOne: {
                    filter: { _id: vNo._id },
                    update: {
                      $set: {
                        sequence,
                      },
                    },
                  },
                };
                updateArr.push(updateObj);
              }
            }
            console.log(`get ${skip} to ${limit + skip} voucher duration ${new Date().getTime() - sttt}`);
            const afterGetVoucher = new Date().getTime();
            const newVouchers = [];
            for (const voucher of vouchers) {
              const amount = round(voucher.amount);
              const sourceBranchDoc: any = {
                _id: voucher._id,
                date: voucher.date,
                branch: Types.ObjectId(voucher.branch.id),
                voucherType: 'STOCK_JOURNAL',
                refNo: voucher.refNo,
                description: voucher.description,
                voucherNo: voucher.voucherNo,
                voucherName: 'Stock Adjustment',
                createdBy: Types.ObjectId(voucher.createdBy),
                updatedBy: Types.ObjectId(voucher.createdBy),
                createdAt: voucher.createdAt,
                updatedAt: voucher.createdAt,
                amount,
                sRateTaxInc: true,
                pRateTaxInc: false,
                act: false,
                actHide: false,
              };
              if (voucher.warehouse?.id) {
                _.assign(sourceBranchDoc, { warehouse: Types.ObjectId(voucher.warehouse?.id) });
              }
              const targetBranchDoc: any = {
                date: new Date(new Date(voucher.updatedAt).setUTCHours(0, 0, 0, 0)),
                branch: Types.ObjectId(voucher.targetBranch.id),
                voucherType: 'STOCK_JOURNAL',
                refNo: voucher.refNo ? `${voucher.voucherNo}${voucher.refNo}` : voucher.voucherNo,
                description: `${voucher.description || ''} - from ${voucher.branch.name}`,
                voucherName: 'Stock Adjustment',
                createdBy: Types.ObjectId(voucher.updatedBy),
                updatedBy: Types.ObjectId(voucher.updatedBy),
                createdAt: voucher.updatedAt,
                updatedAt: voucher.updatedAt,
                amount,
                sRateTaxInc: true,
                pRateTaxInc: false,
                act: false,
                actHide: false,
              };
              if (voucher.targetWarehouse?.id) {
                _.assign(targetBranchDoc, { warehouse: Types.ObjectId(voucher.targetWarehouse.id) });
              }
              const sourceInvTrns = [];
              const sourceInvItems = [];
              const targetInvItems = [];
              const targetInvTrns = [];
              const invBatches: any = _.intersectionBy(batches, voucher.invTrns, 'batch');
              for (const item of voucher.invTrns) {
                const batch = invBatches.find((bat: any) => bat.batch === item.batch);
                if (item.branch === voucher.branch.id) {
                  sourceInvTrns.push({
                    inventory: Types.ObjectId(item.inventory.id),
                    unitConv: item.unit.conversion,
                    unitPrecision: item.unitPrecision,
                    assetAmount: round(item.amount),
                    batch: batch.transactionId,
                    inward: 0,
                    rate: round(item.cost),
                    outward: item.qty * item.unit.conversion,
                  });
                  sourceInvItems.push({
                    inventory: Types.ObjectId(item.inventory.id),
                    unitConv: item.unit.conversion,
                    unitPrecision: item.unitPrecision,
                    tax: GST_TAXES.find((t) => t.ratio.igst === item.tax.gstRatio.igst).code,
                    batch: batch.transactionId,
                    qty: item.qty,
                    cost: round(item.cost),
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
                  const trnObj = {
                    _id: batch.transactionId,
                    barcode: new Types.ObjectId(),
                    assetAmount: round(item.amount),
                    batchNo: batch.batchNo.replace(/[^a-z0-9]/gi, '').toUpperCase(),
                    inventory: Types.ObjectId(item.inventory.id),
                    inward: item.qty * item.unit.conversion,
                    unitConv: item.unit.conversion,
                    mrp: round(item.mrp),
                    rate: round(item.cost),
                    sRate: round(batch.sRate),
                    outward: 0,
                    nlc: round(item.cost / item.unit.conversion),
                    pRateTaxInc: false,
                    sRateTaxInc: true,
                  };
                  const itemObj = {
                    batchNo: batch.batchNo.replace(/[^a-z0-9]/gi, '').toUpperCase(),
                    inventory: Types.ObjectId(item.inventory.id),
                    tax: GST_TAXES.find((t) => t.ratio.igst === item.tax.gstRatio.igst).code,
                    mrp: round(item.mrp),
                    qty: item.qty,
                    cost: round(item.cost),
                    sRate: round(batch.sRate),
                    unitConv: item.unit.conversion,
                    unitPrecision: item.unitPrecision,
                  }
                  if (expiry) {
                    _.assign(trnObj, { expiry });
                    _.assign(itemObj, { expiry });
                  }
                  targetInvTrns.push(trnObj);
                  targetInvItems.push(itemObj);
                }
              }
              _.assign(targetBranchDoc, {
                invTrns: targetInvTrns,
                invItems: targetInvItems,
                acTrns: [
                  {
                    account: Types.ObjectId(accId),
                    accountType: 'STOCK',
                    debit: round(voucher.amount),
                    credit: 0,
                  }
                ]
              });
              newVouchers.push(targetBranchDoc);
              _.assign(sourceBranchDoc, {
                invItems: sourceInvItems,
                invTrns: sourceInvTrns,
                acTrns: [
                  {
                    account: Types.ObjectId(accId),
                    accountType: 'STOCK',
                    credit: round(voucher.amount),
                    debit: 0,
                  }
                ]
              });
              bulkOperation.insert(sourceBranchDoc);
            }
            for (const newNo of newNumberings) {
              const docs = newVouchers.filter((newDoc) => newDoc.branch.toString() === newNo.branch);
              for (let i = 0; i < docs.length; i++) {
                _.assign(docs[i], { voucherNo: `${newNo.prefix}${newNo.startSeq + i}${newNo.suffix}` });
                bulkOperation.insert(docs[i]);
              }
            }
            const start1 = new Date().getTime();
            console.log(`${skip} to ${limit + skip} object initialized DURATION ${(start1 - afterGetVoucher) / 1000}-sec`);
            console.log(`${skip} to ${limit + skip} patch object initialized`);
            console.log(`${skip} to ${limit + skip} bulk execution start....`);
            const result = await bulkOperation.execute();
            console.log('voucher numbering update start...');
            await connection.db(db).collection('vouchernumberings')
              .bulkWrite(updateArr);
            console.log('voucher numberings updated end..');
            console.log(`DURATION for only insert execute  ${(new Date().getTime() - start1) / 1000}-sec`);
            console.log(`results are` + JSON.stringify({ insert: result.nInserted, err: result.hasWriteErrors() }));
            console.log(`Total DURATION for ${skip} to ${limit + skip}  ${(new Date().getTime() - start) / 1000}-sec`);
          }
          console.log(`END ALL ${collectionName} and DURATION ${(new Date().getTime() - begin) / (1000 * 60)}-min`);
        } else {
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
            },
          };
          arr.push(obj);
        }
        await connection.db(db).collection('vouchernumberings').bulkWrite(arr);
      }

      async function preferencesChange(db: string) {
        const preferences = await connection.db(db).collection('preferences')
          .find({}).toArray();
        if (preferences.length > 0) {
          const preArr = [];
          for (const pre of preferences) {
            let code = pre.code;
            if (code === 'sale-return') {
              code = 'saleReturn';
            }
            if (code === 'stock-transfer') {
              code = 'stockTransfer';
            }
            if (code === 'purchase-return') {
              code = 'purchaseReturn';
            }
            if (code === 'sales-people') {
              code = 'saleIncharge';
            }
            if (code === 'banking') {
              code = 'contra';
            }
            if (code === 'stock-adjustment') {
              code = 'stockAdjustment';
            }
            const updateObj = {
              updateOne: {
                filter: { _id: pre._id },
                update: { $set: { branch: Types.ObjectId(pre.branch), updatedAt: new Date(), code } }
              }
            };
            preArr.push(updateObj);
          }
          await connection.db(db).collection('preferences').bulkWrite(preArr);
        } else {
          console.log('preferences not found');
        }
      }



      async function renameCollections(db: string) {
        console.log('rename collection start');
        const allCollections = (await connection.db(db).listCollections().toArray()).map((n) => n.name);
        if (allCollections.includes('inventory_openings_old')) {
          await connection.db(db).collection('inventory_openings_old').drop();
        }
        const renameColls = ['sales', 'purchases', 'stock_adjustments', 'inventory_openings'];
        for (const oldName of allCollections) {
          if (renameColls.includes(oldName)) {
            await connection.db(db).collection(oldName).rename(`${oldName}_old`);
            await connection.db(db).collection(`${oldName}_new`).rename(oldName);
          }
          if (oldName === 'costcategories') {
            await connection.db(db).collection(oldName).rename('cost_categories');
          }
          if (oldName === 'costcentres') {
            await connection.db(db).collection(oldName).rename('cost_centres');
          }
          if (oldName === 'desktopclients') {
            await connection.db(db).collection(oldName).rename('desktop_clients');
          }
          if (oldName === 'vouchernumberings') {
            await connection.db(db).collection(oldName).rename('voucher_numberings');
          }
          if (oldName === 'financialyears') {
            await connection.db(db).collection(oldName).rename('financial_years');
          }
          if (oldName === 'inventorydealers') {
            await connection.db(db).collection(oldName).rename('inventory_dealers');
          }
          if (oldName === 'pharmasalts') {
            await connection.db(db).collection(oldName).rename('pharma_salts');
          }
          if (oldName === 'printtemplates') {
            await connection.db(db).collection(oldName).rename('print_templates');
          }
          // if (oldName === 'cashtransfers') {
          //   await connection.db(db).collection(oldName).rename('cash_transfers');
          // }
          if (oldName === 'cashregisters') {
            await connection.db(db).collection(oldName).rename('cash_registers');
          }
          if (oldName === 'currentpreferences') {
            await connection.db(db).collection(oldName).rename('current_preferences');
          }
        }
      }

      async function deleteCollections(db: string) {
        const collections = [
          'accountbooks', 'accountopenings', 'accountpayments', 'accountpendingadjustments', 'accountreceipts', 'activitylogs',
          'act_account_map', 'act_account_openings', 'act_accountbooks', 'act_accounts', 'act_financial_years',
          'act_gst_registrations', 'act_gstregistrations', 'act_import_field_map', 'act_import_sessions', 'act_inventories',
          'act_inventory_details', 'act_inventory_openings', 'act_inventorybooks', 'act_vouchers', 'activitylogs', // ask activitylogs
          'batches', 'branchbooks', 'cashtransfers',
          // 'batches_rearrange', 
          'cashdeposits', 'cashregisterbooks', 'cashwithdrawals', 'configurations',
          'customerbooks', 'customeropenings', 'customerpayments',
          'customerpendingadjustments', 'customerpendings', 'customerreceipts', 'expenses',
          'gstoutwards', 'gsttransactions', 'incomes', 'inventory_openings_old', 'inventorybooks',
          'journals', 'reviews', 'reorder_analysis', 'vendorbooks', 'vendoropenings',
          'vendorpayments', 'vendorpendingadjustments', 'vendorpendings', 'vendorreceipts',
          'purchase_returns', 'sale_returns', 'stock_transfers', 'purchases_old', 'sales_old', 'stock_adjustments_old',
          'taxes', 'sales_people',
        ];
        const medicalColls = ['doctors', 'patients', 'pharma_salts', 'pharmasalts'];
        const allCollections = (await connection.db(db).listCollections().toArray()).map((n) => n.name);
        for (const coll of allCollections) {
          if (collections.includes(coll) || coll.includes('temp_')) {
            await connection.db(db).collection(coll).drop();
          }
          if (!db.includes('velavanmedical') && medicalColls.includes(coll)) {
            await connection.db(db).collection(coll).drop();
          }
        }
      }

      async function inventoryOpening(db: string) {
        const countDoc = await connection.db(db).collection('inventory_openings').countDocuments();
        if (countDoc > 0) {
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
                assetAmount: { $first: '$assetAmount' },
                updatedBy: { $last: '$updatedBy' },
                updatedAt: { $last: '$updatedAt' },
                items: {
                  $push: {
                    batchNo: { $toUpper: '$batchNo' },
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
                    barcode: '$_id',
                    inventory: '$inventory',
                    inward: { $multiply: ['$qty', '$unitConv'] },
                    outward: 0,
                    assetAmount: { $round: [{ $multiply: ['$qty', '$rate'] }, 2] },
                    batchNo: { $toUpper: '$batchNo' },
                    unitConv: '$unitConv',
                    qty: '$qty',
                    mrp: '$mrp',
                    rate: '$rate',
                    sRate: '$sRate',
                    nlc: { $round: [{ $divide: ['$rate', '$unitConv'] }, 2] },
                    expiry: { $cond: [{ $ne: ['$expiry', null] }, '$expiry', '$REMOVE'] },
                    pRateTaxInc: false,
                    sRateTaxInc: true,
                  }
                }
              }
            },
            { $addFields: { sRateTaxInc: true, pRateTaxInc: false } },
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
                pRateTaxInc: 1,
                updatedAt: '$updatedAt',
                updatedBy: '$updatedBy',
              }
            },
            { $merge: { into: 'inventory_openings_new' } },
          ];
          await connection.db(db).collection('batches_rearrange').aggregate(pipeLine, { allowDiskUse: true }).toArray();
          const assertAcc = (await connection.db(db).collection('accounts').findOne({ accountType: 'STOCK' }))._id;
          const records = await connection.db(db).collection('inventory_openings_new')
            .aggregate([
              {
                $group: {
                  _id: '$branch',
                  debit: { $sum: '$assetAmount' },
                  user: { $last: '$updatedBy' },
                }
              }
            ]).toArray();
          const arr = records.map((rec) => {
            return {
              date,
              act: false,
              actHide: false,
              isOpening: true,
              createdBy: rec.user,
              updatedBy: rec.user,
              createdAt: new Date(),
              updatedAt: new Date(),
              account: assertAcc,
              accountType: 'STOCK',
              branch: rec._id,
              credit: 0,
              debit: round(rec.debit),
            }
          });
          await connection.db(db).collection('account_transactions').insertMany(arr);
        } else {
          await connection.db(db).createCollection('inventory_openings_new');
          console.log(`No inventory opening in ${db}`);
        }
      }

      async function createOpening(db: string, user: Types.ObjectId) {
        const tempBatches: any = await connection.db(db).collection('batches_rearrange')
          .find({}, { projection: { _id: 0, batch: 1 } }).map((c: any) => Types.ObjectId(c.batch)).toArray();
        const missedBatches = await connection.db(db).collection('batches')
          .find({ _id: { $nin: tempBatches } }).toArray();
        const docs = missedBatches.map((elm) => {
          return {
            assetAmount: 0,
            batch: elm._id.toString(),
            batchNo: `DEV${Math.floor(Math.random() * 1000)}`,
            branch: Types.ObjectId(elm.branch),
            inventory: Types.ObjectId(elm.inventory),
            month: elm.expMonth ? elm.expMonth.toString() : null,
            mrp: elm.mrp,
            qty: 0,
            rate: elm.pRate,
            sRate: elm.sRate,
            transactionId: elm._id,
            unitConv: elm.unitConversion,
            unitPrecision: 2,
            updatedAt: new Date(),
            updatedBy: user,
            voucherName: 'OPENING',
            year: elm.expYear ? elm.expYear.toString() : null,
            missed: true,
            voucherType: elm.voucherType,
            exnlc: elm.netLandingCost,
          }
        });
        if (docs.length > 0) {
          await connection.db(db).collection('batches_rearrange').insertMany(docs);
        }
        await connection.db(db).collection('batches')
          .aggregate([
            {
              $match: { _id: { $nin: tempBatches } }
            },
            {
              $group: {
                _id: { branch: '$branch', inventory: '$inventory' },
                trns: {
                  $push: {
                    _id: '$_id',
                    batch: { $toString: '$_id' },
                    batchNo: '$batchNo',
                    qty: 0,
                    mrp: '$mrp',
                    rate: '$rate',
                    sRate: '$sRate',
                    expYear: '$expYear',
                    expMonth: '$expMonth',
                    unit: { id: '$unit', conversion: '$unitConversion' },
                    unitPrecision: 2,
                  },
                },
              }
            },
            {
              $addFields: {
                pRateTaxInc: false,
                sRateTaxInc: true,
                branchId: '$_id.branch',
                inventoryId: '$_id.inventory',
                assetAmount: 0,
                updatedAt: new Date(),
                updatedBy: user.toString(),
              }
            },
            {
              $project: {
                _id: 0,
              },
            },
            {
              $merge: 'inventory_openings'
            }
          ], { allowDiskUse: true }).toArray();
      }

      async function dropIndexes(db: string) {
        const allCollections = (await connection.db(db).listCollections().toArray()).map((n) => n.name);
        for (const coll of allCollections) {
          await connection.db(db).collection(coll).dropIndexes();
        }
      }

      const startTime = new Date();
      console.log('.........START...........');
      console.log({ startTime });

      const dbs = ['velavanstationery', 'velavanhm', 'ttgold', 'ttgoldpalace', 'auditplustech', 'ramasamy', 'velavanmedical'];
      for (const db of dbs) {
        const adminUserId: Types.ObjectId = (await connection.db(db).collection('users').findOne({ isAdmin: true }))._id;
        await dropIndexes(db);
        console.log('Drop All collections Index End');
        await connection.db(db).collection('inventory_openings')
          .updateMany({ trns: { $elemMatch: { expMonth: 0 } } }, { $set: { 'trns.$.expMonth': 1 } });
        console.log(`${db} org start.....`);
        await reArrangeBatch(db);
        console.log('reArrangeBatch End');
        await createOpening(db, adminUserId);
        console.log('createOpening End');
        await inventoryMaster(db, adminUserId);
        console.log('inventoryMaster End');
        await accountMaster(db, adminUserId);
        console.log('Account master End');
        await inventoryOpening(db);
        console.log('inventoryOpening End');
        await mergePendingAdjustment(db);
        console.log('merge pening End');
        await costCategoryMaster(db, adminUserId);
        console.log('costCategoryMaster End');
        await costCentreMaster(db, adminUserId);
        console.log('costCentreMaster End');
        if (db.includes('velavanmedical')) {
          await pharmaSaltMaster(db, adminUserId);
          console.log('pharmaSaltMaster End');
          await doctorMaster(db, adminUserId);
          console.log('doctorMaster End');
          await patientMaster(db, adminUserId);
          console.log('patientMaster End');
        }
        await rackMaster(db, adminUserId);
        console.log('rackMaster End');
        await roleMaster(db);
        console.log('roleMaster End');
        await manufacturerMaster(db, adminUserId);
        console.log('manufacturerMaster End');
        await sectionMaster(db, adminUserId);
        console.log('sectionMaster End');
        await unitMaster(db, adminUserId);
        console.log('unitMaster End');
        if (await connection.db(db).collection('deskstopclients').countDocuments() > 0) {
          await desktopClientMaster(db);
        }
        console.log('desktopClientMaster End');
        await financialYear(db);
        console.log('financialYear End');
        if (await connection.db(db).collection('customers').countDocuments() > 0) {
          await customerMaster(db);
        }
        console.log('customerMaster End');
        if (await connection.db(db).collection('vendors').countDocuments() > 0) {
          await vendorMaster(db);
        }
        console.log('vendorMaster End');
        if (await connection.db(db).collection('branches').countDocuments() > 0) {
          await branchMaster(db, adminUserId);
        }
        console.log('branchMaster End');
        if (await connection.db(db).collection('warehouses').countDocuments() > 0) {
          await warehouseMaster(db);
        }
        console.log('warehouses Master End');
        if (await connection.db(db).collection('cashregisters').countDocuments() > 0) {
          await cashRegisterMaster(db);
        }
        console.log('cashRegisterMaster End');
        await saleIncharge(db, adminUserId);
        console.log('saleIncharge End');
        await accountOpeningMerge(db, adminUserId);
        console.log('accountOpeningMerge End');
        await voucherNumberings(db);
        console.log('voucherNumberings End');
        await preferencesChange(db);
        console.log('preferencesChange End');

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
          .find({}, { projection: { _id: 0, __v: 0 } }).toArray(); // for vouchers only DONE
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
            await accVoucher(db, coll, accounts, pendings);
          }
          if (['accountreceipts', 'accountpayments', 'expenses', 'incomes', 'cashdeposits', 'cashwithdrawals'].includes(coll)) {
            await accVoucher(db, coll, accounts);
          }
          if (coll === 'journals') {
            await journalVoucher(db, coll, accounts);
          }
        }

        const st = new Date().getTime();
        const batches: any = await connection.db(db).collection('batches_rearrange')
          .find({}, { projection: { batch: 1, batchNo: 1, transactionId: 1, sRate: 1 } })
          .map((elm: any) => {
            return {
              batch: elm.batch,
              transactionId: elm.transactionId,
              batchNo: elm.batchNo,
              sRate: elm.sRate,
            }
          }).toArray();
        console.log(`GET batch duration ${(new Date().getTime() - st) / 1000}-sec`);
        await connection.db(db).createCollection('purchases_new');
        await purchaseVoucher(db, 'purchases', accounts, pendings, batches); // duration p & p_r 10min
        console.log('purchase end');
        await purchaseVoucher(db, 'purchase_returns', accounts, pendings, batches);
        console.log('purchase return end');
        await connection.db(db).createCollection('sales_new');
        await saleVoucher(db, 'sales', accounts, pendings, batches);
        console.log('sales end');
        await saleVoucher(db, 'sale_returns', accounts, pendings, batches);
        console.log('sales return end');
        await connection.db(db).createCollection('stock_adjustments_new');
        await stockAdjustments(db, 'stock_adjustments', accounts, batches);
        console.log('stockAdjustments end');
        await stockTransfer(db, 'stock_transfers', accounts, batches);
        console.log('stockTransfer converted stockAdjs end');
        await renameCollections(db);
        console.log('renameCollections end');
        await deleteCollections(db);
        console.log('deleteCollections end');
        console.log(`********${db} org end ******`);
      }
      const endTime = new Date();
      console.log('.........END...........');
      console.log({ endTime });
      console.log({ totalDuration: `${(endTime.getTime() - startTime.getTime()) / (1000 * 60)}-min` });
      console.log(`acc-book and inv-book re-write Start.....`);
      const start = new Date().getTime();
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
          createdBy: data.isOpening ? data.updatedBy : data.createdBy,
          updatedBy: data.updatedBy,
          createdAt: data.isOpening ? data.updatedAt : data.createdAt,
          updatedAt: data.updatedAt,
          voucherId: data.voucherId,
          voucherNo: data.voucherNo,
          voucherName: data.voucherName,
          voucherType: data.voucherType,
          refNo: data.refNo,
        };
        const crAlt: any = _.maxBy(
          trns?.filter(x => x.accountType !== 'STOCK'),
          'debit',
        );
        const drAlt: any = _.maxBy(
          trns?.filter(x => x.accountType !== 'STOCK'),
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
                altAccount: trn.credit > 0 ? crAlt?.account ?? undefined : drAlt?.account ?? undefined,
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
              altAccount: trn.credit > 0 ? crAlt?.account ?? undefined : drAlt?.account ?? undefined,
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
          createdBy: data.isOpening ? data.updatedBy : data.createdBy,
          updatedBy: data.updatedBy,
          createdAt: data.isOpening ? data.updatedAt : data.createdAt,
          updatedAt: data.updatedAt,
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
            barcode: trn.barcode ?? undefined,
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
                  createdAt: voucher.createdAt,
                  updatedAt: voucher.updatedAt,
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
                  createdBy: voucher.updatedBy,
                  updatedBy: voucher.updatedBy,
                  createdAt: voucher.updatedAt,
                  updatedAt: voucher.updatedAt,
                };
                invTxn = applyInvTransactions(bookObj);
              }
              if (collection === 'account_openings') {
                bookObj = {
                  trns: voucher.acTrns,
                  date: voucher.date,
                  branch: voucher.branch,
                  isOpening: true,
                  createdBy: voucher.updatedBy,
                  updatedBy: voucher.updatedBy,
                  createdAt: voucher.updatedAt,
                  updatedAt: voucher.updatedAt
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
                  createdAt: voucher.createdAt,
                  updatedAt: voucher.updatedAt,
                  refNo: voucher.refNo,
                };
                accTxn = applyAccTransactions(_.assign(bookObj, { trns: voucher.acTrns || [] }));
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

      for (const db of dbs) {
        const dbStart = new Date().getTime();
        console.log(`------${db} started----`);
        const collections = ['vouchers', 'account_openings', 'inventory_openings', 'sales', 'purchases', 'stock_adjustments'];
        for (const collection of collections) {
          await reWriteVouchers(db, collection);
        }
        const dbEnd = new Date().getTime();
        console.log(`******${db} duration ${(dbEnd - dbStart) / (1000 * 600)}-min end*****`);
        const end = new Date().getTime();
        const totalDuration = (end - start) / (1000 * 60);
        return `re-write completed ${totalDuration}-min`;
      }
      await connection.close();
      return 'OK';
    } catch (err) {
      console.log(err.message);
      return err.message;
    }
  }

  async check() {
    const connection = await new MongoClient(URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }).connect();
    if (!connection.isConnected) {
      return 'Connection failed';
    }
    console.log('checking start...');
    const start = new Date().getTime();
    const result = await checkValidation();
    if (result.length > 0) {
      console.log(result);
      throw new BadRequestException(result);
    } else {
      console.log(`Everything Correct`);
      return true;
    }
    async function checkValidation() {
      const igst = GST_TAXES.map((x) => x.ratio.igst);
      const dbs = ['velavanstationery', 'velavanhm', 'ttgold', 'ttgoldpalace', 'auditplustech', 'ramasamy', 'velavanmedical'];
      const errArray = [];
      for (const db of dbs) {
        const cashRegisterBooks: any = await connection.db(db).collection('cashregisterbooks')
          .find({ isApproved: false }, {
            projection: { voucherNo: 1, accountName: 1, voucherName: 1, date: 1 },
            sort: { accountName: 1, date: 1 }
          }).toArray();
        for (const book of cashRegisterBooks) {
          errArray.push({
            registerName: book.accountName,
            voucherNo: book.voucherNo,
            voucherName: book.voucherName,
            date: book.date,
          });
        }
        const inventories = await connection.db(db).collection('inventories')
          .aggregate([
            {
              $lookup: {
                from: 'taxes',
                localField: 'tax',
                foreignField: '_id',
                as: 'taxx',
              },
            },
            {
              $unwind: '$taxx'
            },
            {
              $project: { igst: { $sum: ['$taxx.gstRatio.cgst', '$taxx.gstRatio.sgst'] }, displayName: 1, name: 1 }
            },
            { $match: { igst: { $nin: igst } } }
          ]).toArray();
        if (inventories.length > 0) {
          for (const inv of inventories) {
            errArray.push({
              organization: db,
              inventoryName: inv.name,
              inventoryDisplayName: inv.displayName,
              errMsg: `Tax Ratio ${inv.igst} invalid`,
            });
          }
        }
        const cashTrnsvouchers: any = await connection.db(db).collection('cashtransfers')
          .find(
            { $or: [{ isApproved: null }, { isApproved: false }] },
            {
              projection: { destination: 1, amount: 1, date: 1 },
              sort: { 'destination.name': 1, date: 1 }
            }
          )
          .toArray();
        const stockTrnsvouchers: any = await connection.db(db).collection('stock_transfers')
          .find(
            { $or: [{ approved: null }, { approved: false }] },
            {
              projection: { targetBranch: 1, amount: 1, date: 1, voucherNo: 1 },
              sort: { 'targetBranch.name': 1, date: 1, voucherNo: 1 }
            }
          )
          .toArray();
        for (const cashVoucher of cashTrnsvouchers) {
          errArray.push({
            organization: db,
            destinationRegsister: cashVoucher.destination.displayName,
            voucherName: 'Cash Transfer',
            amount: cashVoucher.amount,
            errMsg: 'Cash Transfer not approved',
          });
        }
        for (const stockVoucher of stockTrnsvouchers) {
          errArray.push({
            organization: db,
            destinationBranch: stockVoucher.targetBranch.displayName,
            voucherNo: stockVoucher.voucherNo,
            voucherName: 'Stock Transfer',
            date: new Date(stockVoucher.date).toLocaleDateString(),
            amount: stockVoucher.amount,
            errMsg: 'Stock Transfer not approved',
          });
        }
        const invCollections = ['purchases', 'purchase_returns', 'sales', 'sale_returns', 'stock_transfers'];
        for (const coll of invCollections) {
          const vouchers: any = await connection.db(db).collection(coll)
            .find(
              { invTrns: { $elemMatch: { 'tax.gstRatio.igst': { $nin: igst } } } },
              { projection: { voucherNo: 1, voucherName: 1, branch: 1 } }
            )
            .toArray();
          for (const voucher of vouchers) {
            errArray.push({
              organization: db,
              voucherNo: voucher.voucherNo,
              voucherName: voucher.voucherName,
              branchName: voucher.branch.name,
              errMsg: 'Invalid Tax Ratio',
            });
          }
        }
      }
      return errArray;
    }
  }

  async closing() {
    const connection = await new MongoClient(URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }).connect();
    if (!connection.isConnected) {
      return 'Connection failed';
    }
    async function branchPayableValue(db: string) {
      const registerBookPipeLine = [
        {
          $group: {
            _id: { accountId: '$accountId' },
            amount: { $sum: { $subtract: ['$debit', '$credit'] } },
            registerName: { $last: '$accountName' },
          }
        },
        {
          $project: { _id: 0, voucherName: 'Register Closing', registerName: 1, amount: 1 }
        },
        { $merge: 'branch_transactions' }
      ]
      await connection.db(db).collection('cashregisterbooks')
        .aggregate(registerBookPipeLine).toArray();
      const registers = await connection.db(db).collection('cashregisters')
        .find({}).toArray();
      const branches = await connection.db(db).collection('branches')
        .find({}).toArray();
      for (const register of registers) {
        const cashTrnsferPipeLine = [
          {
            $match: { 'source.id': register._id.toString() }
          },
          {
            $group: {
              _id: { destination: '$destination.id' },
              amount: { $sum: '$amount' }
            }
          },
          {
            $addFields: { destination: { $toObjectId: '$_id.destination' } },
          },
          {
            $lookup: {
              from: 'cashregisters',
              localField: 'destination',
              foreignField: '_id',
              as: 'regs',
            },
          },
          {
            $unwind: '$regs'
          },
          {
            $addFields: {
              destinationBranchId: '$regs.branch',
              sourceBranchId: register.branch,
            }
          },
          { $match: { $expr: { $ne: ['$sourceBranchId', '$destinationBranchId'] } } },
          {
            $lookup: {
              from: 'branches',
              localField: 'destinationBranchId',
              foreignField: '_id',
              as: 'brs',
            },
          },
          { $unwind: '$brs' },
          {
            $project: {
              _id: 0,
              voucherName: 'Cash Transfer',
              amount: 1,
              // sourceRegId: register._id,
              // sourceRegName: register.name,
              // sourceBranchId: 1,
              sourceBranchName: branches.find((br) => br._id.toString() === register.branch.toString()).name,
              // destinationRegId: '$destination',
              // destinationRegName: '$regs.name',
              // destinationBranchId: 1,
              destinationBranchName: '$brs.name',
            }
          },
          { $merge: 'branch_transactions' }
        ];
        await connection.db(db).collection('cashtransfers')
          .aggregate(cashTrnsferPipeLine).toArray();
      }
      for (const branch of branches) {
        const stockTrnsferPipeLine = [
          {
            $match: { 'branch.id': branch._id.toString() }
          },
          {
            $group: {
              _id: { destination: '$targetBranch.id' },
              amount: { $sum: '$amount' },
            }
          },
          {
            $addFields: { destination: { $toObjectId: '$_id.destination' } },
          },
          {
            $lookup: {
              from: 'branches',
              localField: 'destination',
              foreignField: '_id',
              as: 'regs',
            },
          },
          {
            $unwind: '$regs'
          },
          {
            $project: {
              _id: 0,
              voucherName: 'Stock Transfer',
              amount: 1,
              // sourceBranchId: branch._id,
              sourceBranchName: branch.name,
              // destinationBranchId: '$destination',
              destinationBranchName: '$regs.name'
            }
          },
          { $merge: 'branch_transactions' }
        ];
        await connection.db(db).collection('stock_transfers')
          .aggregate(stockTrnsferPipeLine).toArray();
      }
    }
    const start = new Date().getTime();
    const dbs = ['velavanstationery', 'velavanhm', 'ttgold', 'ttgoldpalace', 'auditplustech', 'ramasamy', 'velavanmedical'];
    for (const db of dbs) {
      await branchPayableValue(db);
    }
    const end = new Date().getTime();
    console.log(`Duration ${end - start}-ms`);
    return `cash_regs closing and branch_transactions calc DONE`;
  }
}
