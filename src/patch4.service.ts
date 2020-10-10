import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as _ from 'lodash';

import * as iface from './model/interfaces';

@Injectable()
export class Patch4Service {
  constructor(
    @InjectModel('Customer')
    private readonly customerModel: Model<iface.Customer>,
    @InjectModel('Vendor') private readonly vendorModel: Model<iface.Vendor>,
    @InjectModel('Branch') private readonly branchModel: Model<iface.Branch>,
    @InjectModel('VendorPending')
    private readonly vendorPendingModel: Model<iface.VendorPending>,
    @InjectModel('CustomerPending')
    private readonly customerPendingModel: Model<iface.CustomerPending>,
  ) {}

  async vendorPendingPatch() {
    const vendorPendings = await this.vendorPendingModel.find({});
    const ids = { vendors: [], branches: [] };
    for (const i of vendorPendings) {
      ids.vendors.push(i.vendor);
      ids.branches.push(i.branch);
    }
    ids.vendors = _.uniq(ids.vendors);
    ids.branches = _.uniq(ids.branches);
    const vendors = await this.vendorModel
      .find({ _id: { $in: ids.vendors } })
      .select({ displayName: 1, name: 1 });
    const branches = await this.branchModel
      .find({ _id: { $in: ids.branches } })
      .select({ displayName: 1 });
    const updateConditions = [];
    for (const x of ids.vendors) {
      const vendor = vendors.find(elm => elm.id === x);
      console.log(x);
      console.log(vendor.id, vendor.displayName, vendor.name);
      updateConditions.push({
        updateMany: {
          filter: { vendor: x },
          update: { $set: { vendorName: vendor.displayName } },
        },
      });
    }
    for (const x of ids.branches) {
      const branch = branches.find(elm => elm.id === x);
      console.log(x);
      console.log(branch._id, branch.displayName, branch.name);
      updateConditions.push({
        updateMany: {
          filter: { branch: x },
          update: { $set: { branchName: branch.displayName } },
        },
      });
    }
    const chunks = _.chunk(updateConditions, 500);
    for (const k of chunks) {
      await this.vendorPendingModel.bulkWrite(k);
    }
    return {
      message: `vendor pendings patched, vendors: ${vendors.length}, branches: ${branches.length}`,
    };
  }

  async customerPendingPatch() {
    const customerIds = await this.customerPendingModel.distinct('customer');
    const branchIds = await this.customerPendingModel.distinct('branch');
    const customers = await this.customerModel
      .find({ _id: { $in: customerIds } })
      .select({ displayName: 1, name: 1 });
    const branches = await this.branchModel
      .find({ _id: { $in: branchIds } })
      .select({ displayName: 1 });
    const updateConditions = [];
    for (const x of customerIds) {
      const customer = customers.find(elm => elm.id === x);
      console.log(x);
      console.log(customer.id, customer.displayName, customer.name);
      updateConditions.push({
        updateMany: {
          filter: { customer: x },
          update: {
            $set: {
              customerName: customer?.displayName
                ? customer.displayName
                : customer.name,
            },
          },
        },
      });
    }
    for (const x of branchIds) {
      const branch = branches.find(elm => elm.id === x);
      updateConditions.push({
        updateMany: {
          filter: { branch: x },
          update: { $set: { branchName: branch.displayName } },
        },
      });
    }
    const chunks = _.chunk(updateConditions, 500);
    for (const k of chunks) {
      await this.customerPendingModel.bulkWrite(k);
    }
    return {
      message: `customer pendings patched, customers: ${customerIds.length}, branches: ${branchIds.length},`,
    };
  }
}
