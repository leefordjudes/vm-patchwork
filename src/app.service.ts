import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as _ from 'lodash';

import * as iface from './model/interfaces';

import { TAX_TYPE } from './fixtures/tax-type/tax-type';
import { GST_REGISTRATION } from './fixtures/gst-registration/gst-registration';
import { STATE } from './fixtures/state/state';
import { COUNTRY } from './fixtures/country/country';

@Injectable()
export class AppService {
  constructor(
    @InjectModel('Tax') private readonly taxModel: Model<iface.Tax>,
    @InjectModel('Branch') private readonly branchModel: Model<iface.Branch>,
    @InjectModel('Account') private readonly accountModel: Model<iface.Account>,
    @InjectModel('VoucherNumbering')
    private readonly voucherNumberingModel: Model<iface.VoucherNumbering>,
    @InjectModel('Warehouse')
    private readonly warehouseModel: Model<iface.Warehouse>,
    @InjectModel('Customer')
    private readonly customerModel: Model<iface.Customer>,
    @InjectModel('Vendor') private readonly vendorModel: Model<iface.Vendor>,
    @InjectModel('GSTOutward')
    private readonly gstOutwardModel: Model<iface.GSTOutward>,
    @InjectModel('GSTtransaction')
    private readonly gstTransactionModel: Model<iface.GSTtransaction>,
    @InjectModel('State') private readonly stateModel: Model<iface.State>,
    @InjectModel('CustomerBook')
    private readonly customerBookModel: Model<iface.CustomerBook>,
    @InjectModel('M1CashSale')
    private readonly m1CashSaleModel: Model<iface.M1CashSale>,
    @InjectModel('M2CashSale')
    private readonly m2CashSaleModel: Model<iface.M2CashSale>,
    @InjectModel('M1CreditSale')
    private readonly m1CreditSaleModel: Model<iface.M1CreditSale>,
    @InjectModel('M2CreditSale')
    private readonly m2CreditSaleModel: Model<iface.M2CreditSale>,
    @InjectModel('M1CashPurchase')
    private readonly m1CashPurchaseModel: Model<iface.M1CashPurchase>,
    @InjectModel('M2CashPurchase')
    private readonly m2CashPurchaseModel: Model<iface.M2CashPurchase>,
    @InjectModel('M1CreditPurchase')
    private readonly m1CreditPurchaseModel: Model<iface.M1CreditPurchase>,
    @InjectModel('M2CreditPurchase')
    private readonly m2CreditPurchaseModel: Model<iface.M2CreditPurchase>,
    @InjectModel('M1CashSaleReturn')
    private readonly m1CashSaleReturnModel: Model<iface.M1CashSaleReturn>,
    @InjectModel('M2CashSaleReturn')
    private readonly m2CashSaleReturnModel: Model<iface.M2CashSaleReturn>,
    @InjectModel('M1CreditSaleReturn')
    private readonly m1CreditSaleReturnModel: Model<iface.M1CreditSaleReturn>,
    @InjectModel('M2CreditSaleReturn')
    private readonly m2CreditSaleReturnModel: Model<iface.M2CreditSaleReturn>,
    @InjectModel('M1CashPurchaseReturn')
    private readonly m1CashPurchaseReturnModel: Model<
      iface.M1CashPurchaseReturn
    >,
    @InjectModel('M2CashPurchaseReturn')
    private readonly m2CashPurchaseReturnModel: Model<
      iface.M2CashPurchaseReturn
    >,
    @InjectModel('M1CreditPurchaseReturn')
    private readonly m1CreditPurchaseReturnModel: Model<
      iface.M1CreditPurchaseReturn
    >,
    @InjectModel('M2CreditPurchaseReturn')
    private readonly m2CreditPurchaseReturnModel: Model<
      iface.M2CreditPurchaseReturn
    >,
  ) {}

  private async updateTaxes() {
    console.log('taxes update object create start...');
    const updateTaxObj = [];
    for (const taxType of TAX_TYPE) {
      const updateObj = {
        updateMany: {
          filter: { 'taxType.name': taxType.name },
          update: {
            $set: {
              taxType: {
                name: taxType.name,
                defaultName: taxType.defaultName,
              },
            },
          },
        },
      };
      updateTaxObj.push(updateObj);
    }
    console.log('taxes update object created.');
    console.log('taxes bulkwrite start...');
    const taxUpdateResult = await this.taxModel.bulkWrite(updateTaxObj);
    console.log('taxes bulkwrite end');
    console.log('taxes created by, updated by update many start...');
    const taxCreatedByUpdateResult = await this.taxModel.updateMany(
      { createdBy: 'bala79adv' },
      {
        $set: {
          createdBy: '5f1aedb59ea5c9186b75ab77',
          updatedBy: '5f1aedb59ea5c9186b75ab77',
        },
      },
    );
    console.log('taxes created by, updated by update many end');

    return { taxUpdateResult, taxCreatedByUpdateResult };
  }

  private async updateAccounts() {
    console.log('accounts update many start...');
    const accountUpdateResult = await this.accountModel.updateMany(
      {},
      { $unset: { 'type.id': 1 } },
    );
    console.log('accounts update many ends...');
    console.log('accounts created by, updated by update many start...');
    const accountCreatedByUpdateResult = await this.accountModel.updateMany(
      { createdBy: 'bala79adv' },
      {
        $set: {
          createdBy: '5f1aedb59ea5c9186b75ab77',
          updatedBy: '5f1aedb59ea5c9186b75ab77',
        },
      },
    );
    console.log('accounts created by, updated by update many end');
    return { accountUpdateResult, accountCreatedByUpdateResult };
  }

  private async updateVoucherNumberings() {
    console.log('vouchernumberings update many start...');
    console.log('removing voucherType.id from vouchernumberings start...');
    const voucherNumberingUpdateResult1 = await this.voucherNumberingModel.updateMany(
      {},
      { $unset: { 'voucherType.id': 1 } },
    );
    console.log('removing voucherType.id from vouchernumberings end');
    console.log('vouchernumberings update many ends');

    console.log(
      "vouchernumberings update vourcherType from 'SALES' to 'SALE' starts",
    );
    const voucherNumberingUpdateResult2 = await this.voucherNumberingModel.updateMany(
      { 'voucherType.defaultName': 'SALES' },
      { $set: { voucherType: { name: 'Sale', defaultName: 'SALE' } } },
    );
    console.log(
      "vouchernumberings update vourcherType from 'SALES' to 'SALE' ends",
    );
    return { voucherNumberingUpdateResult1, voucherNumberingUpdateResult2 };
  }

  private async updateBranches() {
    console.log('branches gstInfo regType update object create start...');
    const updateBranchObj = [];
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateBranchObj.push(updateObj);
    }
    console.log('branches gstInfo regType update object created');
    console.log('branches gstInfo location update object create start...');
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.location.name': state.name },
          update: {
            $set: {
              'gstInfo.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateBranchObj.push(updateObj);
    }
    console.log('branches gstInfo location update object created');

    console.log('branches addressInfo state update object create start...');
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'addressInfo.state.name': state.name },
          update: {
            $set: {
              'addressInfo.state': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateBranchObj.push(updateObj);
    }
    console.log('branches addressInfo state update object created');

    console.log('branches bulkwrite start...');
    const branchUpdateResult = await this.branchModel.bulkWrite(
      updateBranchObj,
    );
    console.log('branches bulkwrite end...');
    return branchUpdateResult;
  }

  private async updateWarehouses() {
    console.log('warehouses addressInfo state update object create start...');
    const updateWarehouseObj = [];
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'addressInfo.state.name': state.name },
          update: {
            $set: {
              'addressInfo.state': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateWarehouseObj.push(updateObj);
    }
    console.log('warehouses addressInfo state update object created');

    console.log('warehouses bulkwrite start...');
    const branchUpdateResult = await this.warehouseModel.bulkWrite(
      updateWarehouseObj,
    );
    console.log('warehouses bulkwrite end...');
    return branchUpdateResult;
  }

  private async updateCustomers() {
    console.log('customers gstInfo regType update object create start...');
    const updateCustomerObj = [];
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateCustomerObj.push(updateObj);
    }
    console.log('customers gstInfo regType update object created');
    console.log('customers gstInfo location update object create start...');
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.location.name': state.name },
          update: {
            $set: {
              'gstInfo.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateCustomerObj.push(updateObj);
    }
    console.log('customers gstInfo location update object created');

    console.log('customers addressInfo state update object create start...');
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'addressInfo.state.name': state.name },
          update: {
            $set: {
              'addressInfo.state': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateCustomerObj.push(updateObj);
    }
    console.log('customers addressInfo state update object created');
    console.log('customers addressInfo country update object create start...');
    for (const country of COUNTRY) {
      const updateObj = {
        updateMany: {
          filter: { 'addressInfo.country.name': country.name },
          update: {
            $set: {
              'addressInfo.country': {
                name: country.name,
                defaultName: country.defaultName,
              },
            },
          },
        },
      };
      updateCustomerObj.push(updateObj);
    }
    console.log('customers addressInfo country update object created');

    const createdByUpdatedBy = {
      updateMany: {
        filter: {
          createdBy: '5f1aedb59ea5c9186b75ab77',
        },
        update: {
          $set: {
            createdBy: '5f1aedb59ea5c9186b75ab77',
            updatedBy: '5f1aedb59ea5c9186b75ab77',
          },
        },
      },
    };
    updateCustomerObj.push(createdByUpdatedBy);

    console.log('customers bulkwrite start...');
    const customerUpdateResult = await this.customerModel.bulkWrite(
      updateCustomerObj,
    );
    console.log('customers bulkwrite end...');

    const createdUpdatedByResult = await this.customerModel.update(
      { createdBy: { $type: 7 } },
      [
        {
          $set: {
            createdBy: { $toString: '$createdBy' },
            updatedBy: { $toString: '$updatedBy' },
          },
        },
      ],
    );

    return { customerUpdateResult, createdUpdatedByResult };
  }

  private async updateVendors() {
    console.log('vendors gstInfo regType update object create start...');
    const updateVendorObj = [];
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateVendorObj.push(updateObj);
    }
    console.log('vendors gstInfo regType update object created');
    console.log('vendors gstInfo location update object create start...');
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.location.name': state.name },
          update: {
            $set: {
              'gstInfo.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateVendorObj.push(updateObj);
    }
    console.log('vendors gstInfo location update object created');

    console.log('vendors addressInfo state update object create start...');
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'addressInfo.state.name': state.name },
          update: {
            $set: {
              'addressInfo.state': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateVendorObj.push(updateObj);
    }
    console.log('vendors addressInfo state update object created');
    console.log('vendors addressInfo country update object create start...');
    for (const country of COUNTRY) {
      const updateObj = {
        updateMany: {
          filter: { 'addressInfo.country.name': country.name },
          update: {
            $set: {
              'addressInfo.country': {
                name: country.name,
                defaultName: country.defaultName,
              },
            },
          },
        },
      };
      updateVendorObj.push(updateObj);
    }
    console.log('vendors addressInfo country update object created');

    console.log('vendors bulkwrite start...');
    const vendorUpdateResult = await this.vendorModel.bulkWrite(
      updateVendorObj,
    );
    console.log('vendors bulkwrite end...');
    return vendorUpdateResult;
  }

  private async updateGSTTransactions() {
    /*
    console.log('GST Transaction update object create starts');
    const dbStates = await this.stateModel.find({});
    const states = _.map(dbStates, elm =>
      _.pick(elm, ['id', 'name', 'defaultName', 'code', 'country']),
    );
    const updateGSTTransactionObj = [];
    for (const state of states) {
      const updateObj = {
        updateMany: {
          filter: { contactState: state.id },
          update: {
            $set: {
              contactState: state.name,
            },
          },
        },
      };
      updateGSTTransactionObj.push(updateObj);
    }
    console.log('GST Transaction update object create ends');
    console.log('GST Transaction bulkwrite starts');
    const GSTtransactionUpdateResult = await this.gstTransactionModel.bulkWrite(
      updateGSTTransactionObj,
    );
    console.log('GST Transaction bulkwrite end');
    return GSTtransactionUpdateResult;
    */
  }

  private async updateCustomerBook() {
    console.log(
      "Customer Book update vourcherType from 'SALES' to 'SALE' starts",
    );
    const customerBookUpdateResult = await this.customerBookModel.updateMany(
      { voucherType: 'SALES' },
      { $set: { voucherType: 'SALE' } },
    );
    console.log(
      "Customer Book update vourcherType from 'SALES' to 'SALE' ends",
    );
    return customerBookUpdateResult;
  }
  // ntckd
  private async updateM1CashSale() {
    console.log(
      'M1 cash sale gstInfo source regType update object create start...',
    );
    const updateM1CashSaleObj = [];
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.source.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM1CashSaleObj.push(updateObj);
    }
    console.log('M1 cash sale gstInfo source regType update object created');
    console.log(
      'M1 cash sale gstInfo destination regType update object create start...',
    );
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.destination.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM1CashSaleObj.push(updateObj);
    }
    console.log(
      'M1 cash sale gstInfo destination regType update object created',
    );
    console.log(
      'M1 cash sale gstInfo source location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.location.name': state.name },
          update: {
            $set: {
              'gstInfo.source.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM1CashSaleObj.push(updateObj);
    }
    console.log('M1 cash sale gstInfo source location update object created');
    console.log(
      'M1 cash sale gstInfo destination location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.location.name': state.name },
          update: {
            $set: {
              'gstInfo.destination.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM1CashSaleObj.push(updateObj);
    }
    console.log(
      'M1 cash sale gstInfo destination location update object created',
    );

    console.log(
      'M1 cash sale shippingInfo shippingAddress state update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'shippingInfo.shippingAddress.state.name': state.name },
          update: {
            $set: {
              'shippingInfo.shippingAddress.state': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM1CashSaleObj.push(updateObj);
    }
    console.log(
      'M1 cash sale shippingInfo shippingAddress state update object created',
    );
    console.log(
      'M1 cash sale shippingInfo shippingAddress country update object create start...',
    );
    for (const country of COUNTRY) {
      const updateObj = {
        updateMany: {
          filter: { 'shippingInfo.shippingAddress.country.name': country.name },
          update: {
            $set: {
              'shippingInfo.shippingAddress.country': {
                name: country.name,
                defaultName: country.defaultName,
              },
            },
          },
        },
      };
      updateM1CashSaleObj.push(updateObj);
    }
    console.log(
      'M1 cash sale shippingInfo shippingAddress country update object created',
    );
    console.log('M1 cash sale bulkwrite start...');
    const m1cashSaleUpdateResult = await this.m1CashSaleModel.bulkWrite(
      updateM1CashSaleObj,
    );
    console.log('M1 cash sale bulkwrite end...');
    return m1cashSaleUpdateResult;
  }

  private async updateM2CashSale() {
    console.log(
      'M2 cash sale gstInfo source regType update object create start...',
    );
    const updateM2CashSaleObj = [];
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.source.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM2CashSaleObj.push(updateObj);
    }
    console.log('M2 cash sale gstInfo source regType update object created');
    console.log(
      'M2 cash sale gstInfo destination regType update object create start...',
    );
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.destination.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM2CashSaleObj.push(updateObj);
    }
    console.log(
      'M2 cash sale gstInfo destination regType update object created',
    );
    console.log(
      'M2 cash sale gstInfo source location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.location.name': state.name },
          update: {
            $set: {
              'gstInfo.source.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM2CashSaleObj.push(updateObj);
    }
    console.log('M2 cash sale gstInfo source location update object created');
    console.log(
      'M2 cash sale gstInfo destination location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.location.name': state.name },
          update: {
            $set: {
              'gstInfo.destination.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM2CashSaleObj.push(updateObj);
    }
    console.log(
      'M2 cash sale gstInfo destination location update object created',
    );

    console.log(
      'M2 cash sale shippingInfo shippingAddress state update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'shippingInfo.shippingAddress.state.name': state.name },
          update: {
            $set: {
              'shippingInfo.shippingAddress.state': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM2CashSaleObj.push(updateObj);
    }
    console.log(
      'M2 cash sale shippingInfo shippingAddress state update object created',
    );
    console.log(
      'M2 cash sale shippingInfo shippingAddress country update object create start...',
    );
    for (const country of COUNTRY) {
      const updateObj = {
        updateMany: {
          filter: { 'shippingInfo.shippingAddress.country.name': country.name },
          update: {
            $set: {
              'shippingInfo.shippingAddress.country': {
                name: country.name,
                defaultName: country.defaultName,
              },
            },
          },
        },
      };
      updateM2CashSaleObj.push(updateObj);
    }
    console.log(
      'M2 cash sale shippingInfo shippingAddress country update object created',
    );
    console.log('M2 cash sale bulkwrite start...');
    const m2cashSaleUpdateResult = await this.m2CashSaleModel.bulkWrite(
      updateM2CashSaleObj,
    );
    console.log('M2 cash sale bulkwrite end...');
    return m2cashSaleUpdateResult;
  }
  // ntckd
  private async updateM1CreditSale() {
    console.log(
      'M1 credit sale gstInfo source regType update object create start...',
    );
    const updateM1CreditSaleObj = [];
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.source.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM1CreditSaleObj.push(updateObj);
    }
    console.log('M1 credit sale gstInfo source regType update object created');
    console.log(
      'M1 credit sale gstInfo destination regType update object create start...',
    );
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.destination.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM1CreditSaleObj.push(updateObj);
    }
    console.log(
      'M1 credit sale gstInfo destination regType update object created',
    );
    console.log(
      'M1 credit sale gstInfo source location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.location.name': state.name },
          update: {
            $set: {
              'gstInfo.source.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM1CreditSaleObj.push(updateObj);
    }
    console.log('M1 credit sale gstInfo source location update object created');
    console.log(
      'M1 credit sale gstInfo destination location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.location.name': state.name },
          update: {
            $set: {
              'gstInfo.destination.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM1CreditSaleObj.push(updateObj);
    }
    console.log(
      'M1 credit sale gstInfo destination location update object created',
    );

    console.log(
      'M1 credit sale shippingInfo shippingAddress state update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'shippingInfo.shippingAddress.state.name': state.name },
          update: {
            $set: {
              'shippingInfo.shippingAddress.state': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM1CreditSaleObj.push(updateObj);
    }
    console.log(
      'M1 credit sale shippingInfo shippingAddress state update object created',
    );
    console.log(
      'M1 credit sale shippingInfo shippingAddress country update object create start...',
    );
    for (const country of COUNTRY) {
      const updateObj = {
        updateMany: {
          filter: { 'shippingInfo.shippingAddress.country.name': country.name },
          update: {
            $set: {
              'shippingInfo.shippingAddress.country': {
                name: country.name,
                defaultName: country.defaultName,
              },
            },
          },
        },
      };
      updateM1CreditSaleObj.push(updateObj);
    }
    console.log(
      'M1 credit sale shippingInfo shippingAddress country update object created',
    );
    console.log('M1 credit sale bulkwrite start...');
    const m1creditSaleUpdateResult = await this.m1CreditSaleModel.bulkWrite(
      updateM1CreditSaleObj,
    );
    console.log('M1 credit sale bulkwrite end...');
    return m1creditSaleUpdateResult;
  }

  private async updateM2CreditSale() {
    console.log(
      'M2 credit sale gstInfo source regType update object create start...',
    );
    const updateM2CreditSaleObj = [];
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.source.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM2CreditSaleObj.push(updateObj);
    }
    console.log('M2 credit sale gstInfo source regType update object created');
    console.log(
      'M2 credit sale gstInfo destination regType update object create start...',
    );
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.destination.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM2CreditSaleObj.push(updateObj);
    }
    console.log(
      'M2 credit sale gstInfo destination regType update object created',
    );
    console.log(
      'M2 credit sale gstInfo source location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.location.name': state.name },
          update: {
            $set: {
              'gstInfo.source.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM2CreditSaleObj.push(updateObj);
    }
    console.log('M2 credit sale gstInfo source location update object created');
    console.log(
      'M2 credit sale gstInfo destination location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.location.name': state.name },
          update: {
            $set: {
              'gstInfo.destination.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM2CreditSaleObj.push(updateObj);
    }
    console.log(
      'M2 credit sale gstInfo destination location update object created',
    );

    console.log(
      'M2 credit sale shippingInfo shippingAddress state update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'shippingInfo.shippingAddress.state.name': state.name },
          update: {
            $set: {
              'shippingInfo.shippingAddress.state': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM2CreditSaleObj.push(updateObj);
    }
    console.log(
      'M2 credit sale shippingInfo shippingAddress state update object created',
    );
    console.log(
      'M2 credit sale shippingInfo shippingAddress country update object create start...',
    );
    for (const country of COUNTRY) {
      const updateObj = {
        updateMany: {
          filter: { 'shippingInfo.shippingAddress.country.name': country.name },
          update: {
            $set: {
              'shippingInfo.shippingAddress.country': {
                name: country.name,
                defaultName: country.defaultName,
              },
            },
          },
        },
      };
      updateM2CreditSaleObj.push(updateObj);
    }
    console.log(
      'M2 credit sale shippingInfo shippingAddress country update object created',
    );
    console.log('M2 credit sale bulkwrite start...');
    const m2creditSaleUpdateResult = await this.m2CreditSaleModel.bulkWrite(
      updateM2CreditSaleObj,
    );
    console.log('M2 credit sale bulkwrite end...');
    return m2creditSaleUpdateResult;
  }

  private async updateM1CashPurchase() {
    console.log(
      'M1 cash purchase gstInfo source regType update object create start...',
    );
    const updateM1CashPurchaseObj = [];
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.source.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM1CashPurchaseObj.push(updateObj);
    }
    console.log(
      'M1 cash purchase gstInfo source regType update object created',
    );
    console.log(
      'M1 cash purchase gstInfo destination regType update object create start...',
    );
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.destination.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM1CashPurchaseObj.push(updateObj);
    }
    console.log(
      'M1 cash purchase gstInfo destination regType update object created',
    );
    console.log(
      'M1 cash purchase gstInfo source location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.location.name': state.name },
          update: {
            $set: {
              'gstInfo.source.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM1CashPurchaseObj.push(updateObj);
    }
    console.log(
      'M1 cash purchase gstInfo source location update object created',
    );
    console.log(
      'M1 cash purchase gstInfo destination location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.location.name': state.name },
          update: {
            $set: {
              'gstInfo.destination.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM1CashPurchaseObj.push(updateObj);
    }
    console.log(
      'M1 cash purchase gstInfo destination location update object created',
    );

    console.log('M1 cash purchase bulkwrite start...');
    const m1cashPurchaseUpdateResult = await this.m1CashPurchaseModel.bulkWrite(
      updateM1CashPurchaseObj,
    );
    console.log('M1 cash purchase bulkwrite end...');
    return m1cashPurchaseUpdateResult;
  }

  private async updateM2CashPurchase() {
    console.log(
      'M2 cash purchase gstInfo source regType update object create start...',
    );
    const updateM2CashPurchaseObj = [];
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.source.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM2CashPurchaseObj.push(updateObj);
    }
    console.log(
      'M2 cash purchase gstInfo source regType update object created',
    );
    console.log(
      'M2 cash purchase gstInfo destination regType update object create start...',
    );
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.destination.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM2CashPurchaseObj.push(updateObj);
    }
    console.log(
      'M2 cash purchase gstInfo destination regType update object created',
    );
    console.log(
      'M2 cash purchase gstInfo source location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.location.name': state.name },
          update: {
            $set: {
              'gstInfo.source.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM2CashPurchaseObj.push(updateObj);
    }
    console.log(
      'M2 cash purchase gstInfo source location update object created',
    );
    console.log(
      'M2 cash purchase gstInfo destination location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.location.name': state.name },
          update: {
            $set: {
              'gstInfo.destination.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM2CashPurchaseObj.push(updateObj);
    }
    console.log(
      'M2 cash purchase gstInfo destination location update object created',
    );

    console.log('M2 cash purchase bulkwrite start...');
    const m2cashPurchaseUpdateResult = await this.m2CashPurchaseModel.bulkWrite(
      updateM2CashPurchaseObj,
    );
    console.log('M2 cash purchase bulkwrite end...');
    return m2cashPurchaseUpdateResult;
  }

  private async updateM1CreditPurchase() {
    console.log(
      'M1 credit purchase gstInfo source regType update object create start...',
    );
    const updateM1CreditPurchaseObj = [];
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.source.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM1CreditPurchaseObj.push(updateObj);
    }
    console.log(
      'M1 credit purchase gstInfo source regType update object created',
    );
    console.log(
      'M1 credit purchase gstInfo destination regType update object create start...',
    );
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.destination.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM1CreditPurchaseObj.push(updateObj);
    }
    console.log(
      'M1 credit purchase gstInfo destination regType update object created',
    );
    console.log(
      'M1 credit purchase gstInfo source location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.location.name': state.name },
          update: {
            $set: {
              'gstInfo.source.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM1CreditPurchaseObj.push(updateObj);
    }
    console.log(
      'M1 credit purchase gstInfo source location update object created',
    );
    console.log(
      'M1 credit purchase gstInfo destination location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.location.name': state.name },
          update: {
            $set: {
              'gstInfo.destination.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM1CreditPurchaseObj.push(updateObj);
    }
    console.log(
      'M1 credit purchase gstInfo destination location update object created',
    );

    console.log('M1 credit purchase bulkwrite start...');
    const m1creditPurchaseUpdateResult = await this.m1CreditPurchaseModel.bulkWrite(
      updateM1CreditPurchaseObj,
    );
    console.log('M1 credit purchase bulkwrite end...');
    return m1creditPurchaseUpdateResult;
  }

  private async updateM2CreditPurchase() {
    console.log(
      'M2 credit purchase gstInfo source regType update object create start...',
    );
    const updateM2CreditPurchaseObj = [];
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.source.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM2CreditPurchaseObj.push(updateObj);
    }
    console.log(
      'M2 credit purchase gstInfo source regType update object created',
    );
    console.log(
      'M2 credit purchase gstInfo destination regType update object create start...',
    );
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.destination.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM2CreditPurchaseObj.push(updateObj);
    }
    console.log(
      'M2 credit purchase gstInfo destination regType update object created',
    );
    console.log(
      'M2 credit purchase gstInfo source location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.location.name': state.name },
          update: {
            $set: {
              'gstInfo.source.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM2CreditPurchaseObj.push(updateObj);
    }
    console.log(
      'M2 credit purchase gstInfo source location update object created',
    );
    console.log(
      'M2 credit purchase gstInfo destination location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.location.name': state.name },
          update: {
            $set: {
              'gstInfo.destination.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM2CreditPurchaseObj.push(updateObj);
    }
    console.log(
      'M2 credit purchase gstInfo destination location update object created',
    );

    console.log('M2 credit purchase bulkwrite start...');
    const m2creditPurchaseUpdateResult = await this.m2CreditPurchaseModel.bulkWrite(
      updateM2CreditPurchaseObj,
    );
    console.log('M2 credit purchase bulkwrite end...');
    return m2creditPurchaseUpdateResult;
  }

  private async updateM1CashSaleReturn() {
    console.log(
      'M1 cash sale return gstInfo source regType update object create start...',
    );
    const updateM1CashSaleReturnObj = [];
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.source.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM1CashSaleReturnObj.push(updateObj);
    }
    console.log(
      'M1 cash sale return gstInfo source regType update object created',
    );
    console.log(
      'M1 cash sale return gstInfo destination regType update object create start...',
    );
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.destination.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM1CashSaleReturnObj.push(updateObj);
    }
    console.log(
      'M1 cash sale return gstInfo destination regType update object created',
    );
    console.log(
      'M1 cash sale return gstInfo source location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.location.name': state.name },
          update: {
            $set: {
              'gstInfo.source.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM1CashSaleReturnObj.push(updateObj);
    }
    console.log(
      'M1 cash sale return gstInfo source location update object created',
    );
    console.log(
      'M1 cash sale return gstInfo destination location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.location.name': state.name },
          update: {
            $set: {
              'gstInfo.destination.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM1CashSaleReturnObj.push(updateObj);
    }
    console.log(
      'M1 cash sale return gstInfo destination location update object created',
    );
    console.log('M1 cash sale return bulkwrite start...');
    const m1cashSaleReturnUpdateResult = await this.m1CashSaleReturnModel.bulkWrite(
      updateM1CashSaleReturnObj,
    );
    console.log('M1 cash sale return bulkwrite end...');
    return m1cashSaleReturnUpdateResult;
  }

  private async updateM2CashSaleReturn() {
    console.log(
      'M2 cash sale return gstInfo source regType update object create start...',
    );
    const updateM2CashSaleReturnObj = [];
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.source.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM2CashSaleReturnObj.push(updateObj);
    }
    console.log(
      'M2 cash sale return gstInfo source regType update object created',
    );
    console.log(
      'M2 cash sale return gstInfo destination regType update object create start...',
    );
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.destination.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM2CashSaleReturnObj.push(updateObj);
    }
    console.log(
      'M2 cash sale return gstInfo destination regType update object created',
    );
    console.log(
      'M2 cash sale return gstInfo source location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.location.name': state.name },
          update: {
            $set: {
              'gstInfo.source.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM2CashSaleReturnObj.push(updateObj);
    }
    console.log(
      'M2 cash sale return gstInfo source location update object created',
    );
    console.log(
      'M2 cash sale return gstInfo destination location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.location.name': state.name },
          update: {
            $set: {
              'gstInfo.destination.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM2CashSaleReturnObj.push(updateObj);
    }
    console.log(
      'M2 cash sale return gstInfo destination location update object created',
    );
    console.log('M2 cash sale return return bulkwrite start...');
    const m2cashSaleReturnUpdateResult = await this.m2CashSaleReturnModel.bulkWrite(
      updateM2CashSaleReturnObj,
    );
    console.log('M2 cash sale return bulkwrite end...');
    return m2cashSaleReturnUpdateResult;
  }

  private async updateM1CreditSaleReturn() {
    console.log(
      'M1 credit sale return gstInfo source regType update object create start...',
    );
    const updateM1CreditSaleReturnObj = [];
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.source.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM1CreditSaleReturnObj.push(updateObj);
    }
    console.log(
      'M1 credit sale return gstInfo source regType update object created',
    );
    console.log(
      'M1 credit sale return gstInfo destination regType update object create start...',
    );
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.destination.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM1CreditSaleReturnObj.push(updateObj);
    }
    console.log(
      'M1 credit sale return gstInfo destination regType update object created',
    );
    console.log(
      'M1 credit sale return gstInfo source location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.location.name': state.name },
          update: {
            $set: {
              'gstInfo.source.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM1CreditSaleReturnObj.push(updateObj);
    }
    console.log(
      'M1 credit sale return gstInfo source location update object created',
    );
    console.log(
      'M1 credit sale return gstInfo destination location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.location.name': state.name },
          update: {
            $set: {
              'gstInfo.destination.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM1CreditSaleReturnObj.push(updateObj);
    }
    console.log(
      'M1 credit sale return gstInfo destination location update object created',
    );
    console.log('M1 credit sale return bulkwrite start...');
    const m1creditSaleReturnUpdateResult = await this.m1CreditSaleReturnModel.bulkWrite(
      updateM1CreditSaleReturnObj,
    );
    console.log('M1 credit sale return bulkwrite end...');
    return m1creditSaleReturnUpdateResult;
  }

  private async updateM2CreditSaleReturn() {
    console.log(
      'M2 credit sale return gstInfo source regType update object create start...',
    );
    const updateM2CreditSaleReturnObj = [];
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.source.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM2CreditSaleReturnObj.push(updateObj);
    }
    console.log(
      'M2 credit sale return gstInfo source regType update object created',
    );
    console.log(
      'M2 credit sale return gstInfo destination regType update object create start...',
    );
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.destination.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM2CreditSaleReturnObj.push(updateObj);
    }
    console.log(
      'M2 credit sale return gstInfo destination regType update object created',
    );
    console.log(
      'M2 credit sale return gstInfo source location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.location.name': state.name },
          update: {
            $set: {
              'gstInfo.source.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM2CreditSaleReturnObj.push(updateObj);
    }
    console.log(
      'M2 credit sale return gstInfo source location update object created',
    );
    console.log(
      'M2 credit sale return gstInfo destination location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.location.name': state.name },
          update: {
            $set: {
              'gstInfo.destination.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM2CreditSaleReturnObj.push(updateObj);
    }
    console.log(
      'M2 credit sale return gstInfo destination location update object created',
    );
    console.log('M2 credit sale return bulkwrite start...');
    const m2creditSaleReturnUpdateResult = await this.m2CreditSaleReturnModel.bulkWrite(
      updateM2CreditSaleReturnObj,
    );
    console.log('M2 credit sale return bulkwrite end...');
    return m2creditSaleReturnUpdateResult;
  }

  private async updateM1CashPurchaseReturn() {
    console.log(
      'M1 cash Purchase return gstInfo source regType update object create start...',
    );
    const updateM1CashPurchaseReturnObj = [];
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.source.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM1CashPurchaseReturnObj.push(updateObj);
    }
    console.log(
      'M1 cash Purchase return gstInfo source regType update object created',
    );
    console.log(
      'M1 cash Purchase return gstInfo destination regType update object create start...',
    );
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.destination.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM1CashPurchaseReturnObj.push(updateObj);
    }
    console.log(
      'M1 cash Purchase return gstInfo destination regType update object created',
    );
    console.log(
      'M1 cash Purchase return gstInfo source location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.location.name': state.name },
          update: {
            $set: {
              'gstInfo.source.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM1CashPurchaseReturnObj.push(updateObj);
    }
    console.log(
      'M1 cash Purchase return gstInfo source location update object created',
    );
    console.log(
      'M1 cash Purchase return gstInfo destination location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.location.name': state.name },
          update: {
            $set: {
              'gstInfo.destination.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM1CashPurchaseReturnObj.push(updateObj);
    }
    console.log(
      'M1 cash Purchase return gstInfo destination location update object created',
    );
    console.log('M1 cash Purchase return bulkwrite start...');
    const m1cashPurchaseReturnUpdateResult = await this.m1CashPurchaseReturnModel.bulkWrite(
      updateM1CashPurchaseReturnObj,
    );
    console.log('M1 cash Purchase return bulkwrite end...');
    return m1cashPurchaseReturnUpdateResult;
  }

  private async updateM2CashPurchaseReturn() {
    console.log(
      'M2 cash Purchase return gstInfo source regType update object create start...',
    );
    const updateM2CashPurchaseReturnObj = [];
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.source.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM2CashPurchaseReturnObj.push(updateObj);
    }
    console.log(
      'M2 cash Purchase return gstInfo source regType update object created',
    );
    console.log(
      'M2 cash Purchase return gstInfo destination regType update object create start...',
    );
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.destination.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM2CashPurchaseReturnObj.push(updateObj);
    }
    console.log(
      'M2 cash Purchase return gstInfo destination regType update object created',
    );
    console.log(
      'M2 cash Purchase return gstInfo source location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.location.name': state.name },
          update: {
            $set: {
              'gstInfo.source.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM2CashPurchaseReturnObj.push(updateObj);
    }
    console.log(
      'M2 cash Purchase return gstInfo source location update object created',
    );
    console.log(
      'M2 cash Purchase return gstInfo destination location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.location.name': state.name },
          update: {
            $set: {
              'gstInfo.destination.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM2CashPurchaseReturnObj.push(updateObj);
    }
    console.log(
      'M2 cash Purchase return gstInfo destination location update object created',
    );
    console.log('M2 cash Purchase return bulkwrite start...');
    const m2cashPurchaseReturnUpdateResult = await this.m2CashPurchaseReturnModel.bulkWrite(
      updateM2CashPurchaseReturnObj,
    );
    console.log('M2 cash Purchase return bulkwrite end');
    return m2cashPurchaseReturnUpdateResult;
  }

  private async updateM1CreditPurchaseReturn() {
    console.log(
      'M1 Credit Purchase return gstInfo source regType update object create start...',
    );
    const updateM1CreditPurchaseReturnObj = [];
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.source.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM1CreditPurchaseReturnObj.push(updateObj);
    }
    console.log(
      'M1 Credit Purchase return gstInfo source regType update object created',
    );
    console.log(
      'M1 Credit Purchase return gstInfo destination regType update object create start...',
    );
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.destination.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM1CreditPurchaseReturnObj.push(updateObj);
    }
    console.log(
      'M1 Credit Purchase return gstInfo destination regType update object created',
    );
    console.log(
      'M1 Credit Purchase return gstInfo source location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.location.name': state.name },
          update: {
            $set: {
              'gstInfo.source.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM1CreditPurchaseReturnObj.push(updateObj);
    }
    console.log(
      'M1 Credit Purchase return gstInfo source location update object created',
    );
    console.log(
      'M1 Credit Purchase return gstInfo destination location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.location.name': state.name },
          update: {
            $set: {
              'gstInfo.destination.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM1CreditPurchaseReturnObj.push(updateObj);
    }
    console.log(
      'M1 Credit Purchase return gstInfo destination location update object created',
    );
    console.log('M1 Credit Purchase return bulkwrite start...');
    const m1CreditPurchaseReturnUpdateResult = await this.m1CreditPurchaseReturnModel.bulkWrite(
      updateM1CreditPurchaseReturnObj,
    );
    console.log('M1 Credit Purchase return bulkwrite end');
    return m1CreditPurchaseReturnUpdateResult;
  }

  private async updateM2CreditPurchaseReturn() {
    console.log(
      'M2 Credit Purchase return gstInfo source regType update object create start...',
    );
    const updateM2CreditPurchaseReturnObj = [];
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.source.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM2CreditPurchaseReturnObj.push(updateObj);
    }
    console.log(
      'M2 Credit Purchase return gstInfo source regType update object created',
    );
    console.log(
      'M2 Credit Purchase return gstInfo destination regType update object create start...',
    );
    for (const regType of GST_REGISTRATION) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.regType.name': regType.name },
          update: {
            $set: {
              'gstInfo.destination.regType': {
                name: regType.name,
                defaultName: regType.defaultName,
              },
            },
          },
        },
      };
      updateM2CreditPurchaseReturnObj.push(updateObj);
    }
    console.log(
      'M2 Credit Purchase return gstInfo destination regType update object created',
    );
    console.log(
      'M2 Credit Purchase return gstInfo source location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.source.location.name': state.name },
          update: {
            $set: {
              'gstInfo.source.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM2CreditPurchaseReturnObj.push(updateObj);
    }
    console.log(
      'M2 Credit Purchase return gstInfo source location update object created',
    );
    console.log(
      'M2 Credit Purchase return gstInfo destination location update object create start...',
    );
    for (const state of STATE) {
      const updateObj = {
        updateMany: {
          filter: { 'gstInfo.destination.location.name': state.name },
          update: {
            $set: {
              'gstInfo.destination.location': {
                name: state.name,
                defaultName: state.defaultName,
              },
            },
          },
        },
      };
      updateM2CreditPurchaseReturnObj.push(updateObj);
    }
    console.log(
      'M2 Credit Purchase return gstInfo destination location update object created',
    );
    console.log('M2 Credit Purchase return bulkwrite start...');
    const m2CreditPurchaseReturnUpdateResult = await this.m2CreditPurchaseReturnModel.bulkWrite(
      updateM2CreditPurchaseReturnObj,
    );
    console.log('M2 Credit Purchase return bulkwrite end');
    return m2CreditPurchaseReturnUpdateResult;
  }

  async updateDatabaseRecords(orgType: string) {
    return await this.customerModel.update({ createdBy: { $type: 7 } }, [
      {
        $set: {
          createdBy: { $toString: '$createdBy' },
          updatedBy: { $toString: '$updatedBy' },
        },
      },
    ]);
  }

  async updateDatabaseRecords1(orgType: string) {
    const taxes = await this.updateTaxes();
    const accounts = await this.updateAccounts();
    const vouchernumberings = await this.updateVoucherNumberings();
    const branches = await this.updateBranches();
    const warehouses = await this.updateWarehouses();
    const customers = await this.updateCustomers();
    const vendors = await this.updateVendors();
    //const gstTransaction = await this.updateGSTTransactions(); // no need to update
    const customerBook = await this.updateCustomerBook();
    let cashSale,
      creditSale,
      cashSaleReturn,
      creditSaleReturn,
      cashPurchase,
      creditPurchase,
      cashPurchaseReturn,
      creditPurchaseReturn;
    if (orgType === 'm1') {
      cashSale = await this.updateM1CashSale();
      creditSale = await this.updateM1CreditSale();
      cashPurchase = await this.updateM1CashPurchase();
      creditPurchase = await this.updateM1CreditPurchase();
      cashSaleReturn = await this.updateM1CashSaleReturn();
      creditSaleReturn = await this.updateM1CreditSaleReturn();
      cashPurchaseReturn = await this.updateM1CashPurchaseReturn();
      creditPurchaseReturn = await this.updateM1CreditPurchaseReturn();
    } else if (orgType === 'm2') {
      cashSale = await this.updateM2CashSale();
      creditSale = await this.updateM2CreditSale();
      cashPurchase = await this.updateM2CashPurchase();
      creditPurchase = await this.updateM2CreditPurchase();
      cashSaleReturn = await this.updateM2CashSaleReturn();
      creditSaleReturn = await this.updateM2CreditSaleReturn();
      cashPurchaseReturn = await this.updateM2CashPurchaseReturn();
      creditPurchaseReturn = await this.updateM2CreditPurchaseReturn();
    }

    return {
      taxes,
      accounts,
      vouchernumberings,
      branches,
      warehouses,
      customers,
      vendors,
      // gstTransaction,
      customerBook,
      cashSale,
      creditSale,
      cashPurchase,
      creditPurchase,
      cashSaleReturn,
      creditSaleReturn,
      cashPurchaseReturn,
      creditPurchaseReturn,
    };
  }
}
