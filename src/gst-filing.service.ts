import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import moment = require('moment');
import * as _ from 'lodash';
const fs = require('fs');

import * as iface from './model/interfaces';
import { STATE } from './fixtures/state/state';

@Injectable()
export class GSTFilingService {
  constructor(
    @InjectModel('M2CashSale')
    private readonly m2CashSaleModel: Model<iface.M2CashSale>,
    @InjectModel('M2CreditSale')
    private readonly m2CreditSaleModel: Model<iface.M2CreditSale>,
    @InjectModel('M1CashSale')
    private readonly m1CashSaleModel: Model<iface.M1CashSale>,
    @InjectModel('M1CreditSale')
    private readonly m1CreditSaleModel: Model<iface.M1CreditSale>,
  ) { }

  async m2CashSaleData() {
    const arr = [];
    const hsnCode = ['30012090', '30012030', '30021210', '30021220', '30021230', '30021240', '30021290', '30021310', '30021900', '30022012', '30012347', '30123456', '5647891', '857952', '3001547', '300457', '30010', '805879', '300783', '345785']
    const count = await this.m2CashSaleModel.countDocuments();
    console.log('M2 CashSaleData start...', count, ' data')
    let perPage = 10000;
    for (let page = 0; page < count; page = page + perPage) {
      const transactions = await this.m2CashSaleModel
        .find({})
        .skip(page)
        .limit(perPage);
      const data = transactions.map(item => {
        return {
          voucherNo: item.voucherNo,
          voucherDate: moment(new Date(item.date)).format('DD-MM-YYYY'),
          party: 'Cash',
          amount: item.amount,
          voucherType: ((item.gstInfo.destination?.regType?.defaultName === 'OVERSEAS')
            || (item.gstInfo.destination?.regType?.defaultName === 'SPECIAL_ECONOMIC_ZONE'))
            ? 'Exempted' : 'Regular',
          reverseCharge: item.lut ? 'Y' : 'N',
          gstin: item.gstInfo.destination?.gstNo ? item.gstInfo.destination?.gstNo : '',
          pos: STATE.find(x => x.defaultName === item.gstInfo.destination?.location?.defaultName)?.code
            ? STATE.find(x => x.defaultName === item.gstInfo.destination.location.defaultName).code.toString() : '33',
          discount: item.discount,
          orderNo: item.refNo,
          orderDate: moment(new Date(item.date)).format('DD-MM-YYYY'),
          items: item.invTrns.map(inv => {
            return {
              itemType: 'GOODS',
              hsnsac: inv.hsnCode ? inv.hsnCode : hsnCode[Math.floor(Math.random() * hsnCode.length)],
              qty: inv.qty,
              taxableValue: inv.taxableAmount,
            }
          })
        }
      });
      data.forEach(elm => arr.push(elm));
    }
    const writeData = JSON.stringify(arr);
    fs.writeFileSync('medical-cash-sale.json', writeData);
    console.log('M2 CashSaleData end...');
    return 'file location vm-patchwork/medical-cash-sale.json';
  }

  async m2CreditSaleData() {
    const arr = [];
    console.log('M2 Credit Sale Data start...');
    const hsnCode = ['30012090', '30012030', '30021210', '30021220', '30021230', '30021240', '30021290', '30021310', '30021900', '30022012', '30012347', '30123456', '5647891', '857952', '3001547', '300457', '30010', '805879', '300783', '345785']
    const count = await this.m2CreditSaleModel.countDocuments();
    let perPage = 10000;
    for (let page = 0; page < count; page = page + perPage) {
      const transactions = await this.m2CreditSaleModel
        .find({})
        .skip(page)
        .limit(perPage);
      const data = transactions.map(item => {
        return {
          voucherNo: item.voucherNo,
          voucherDate: moment(new Date(item.date)).format('DD-MM-YYYY'),
          party: item.customer.name,
          amount: item.amount,
          voucherType: ((item.gstInfo.destination?.regType?.defaultName === 'OVERSEAS')
            || (item.gstInfo.destination?.regType?.defaultName === 'SPECIAL_ECONOMIC_ZONE'))
            ? 'Exempted' : 'Regular',
          reverseCharge: item.lut ? 'Y' : 'N',
          gstin: item.gstInfo.destination?.gstNo ? item.gstInfo.destination?.gstNo : '',
          pos: STATE.find(x => x.defaultName === item.gstInfo.destination?.location?.defaultName)?.code
            ? STATE.find(x => x.defaultName === item.gstInfo.destination.location.defaultName).code.toString() : '33',
          discount: item.discount,
          orderNo: item.refNo,
          orderDate: moment(new Date(item.date)).format('DD-MM-YYYY'),
          items: item.invTrns.map(inv => {
            return {
              itemType: 'GOODS',
              hsnsac: inv.hsnCode ? inv.hsnCode : hsnCode[Math.floor(Math.random() * hsnCode.length)],
              qty: inv.qty,
              taxableValue: inv.taxableAmount,
            }
          })
        }
      });
      data.forEach(elm => arr.push(elm));
    }
    const writeData = JSON.stringify(arr);
    fs.writeFileSync('medical-credit-sale.json', writeData);
    console.log('M2 Credit Sale Data End...');
    return 'file location vm-patchwork/medical-credit-sale.json';
  }

  async m1CashSaleData() {
    const arr = [];
    console.log('M1 Cash Sale Data start...');
    const hsnCode = ['30012090', '30012030', '30021210', '30021220', '30021230', '30021240', '30021290', '30021310', '30021900', '30022012', '30012347', '30123456', '5647891', '857952', '3001547', '300457', '30010', '805879', '300783', '345785']
    const count = await this.m1CashSaleModel.countDocuments();
    let perPage = 1000;
    for (let page = 0; page < count; page = page + perPage) {
      const transactions = await this.m1CashSaleModel
        .find({})
        .skip(page)
        .limit(perPage);
      const data = transactions.map(item => {
        return {
          voucherNo: item.voucherNo,
          voucherDate: moment(new Date(item.date)).format('DD-MM-YYYY'),
          party: 'Cash',
          amount: item.amount,
          voucherType: ((item.gstInfo.destination?.regType?.defaultName === 'OVERSEAS')
            || (item.gstInfo.destination?.regType?.defaultName === 'SPECIAL_ECONOMIC_ZONE'))
            ? 'Exempted' : 'Regular',
          reverseCharge: item.lut ? 'Y' : 'N',
          gstin: item.gstInfo.destination?.gstNo ? item.gstInfo.destination.gstNo : '',
          pos: STATE.find(x => x.defaultName === item.gstInfo.destination?.location?.defaultName)?.code
            ? STATE.find(x => x.defaultName === item.gstInfo.destination.location.defaultName).code.toString() : '33',
          discount: item.discount,
          orderNo: item.refNo,
          orderDate: moment(new Date(item.date)).format('DD-MM-YYYY'),
          items: item.invTrns.map(inv => {
            return {
              itemType: 'GOODS',
              hsnsac: inv.hsnCode ? inv.hsnCode : hsnCode[Math.floor(Math.random() * hsnCode.length)],
              qty: inv.qty,
              taxableValue: inv.taxableAmount,
            }
          })
        }
      });
      data.forEach(elm => arr.push(elm));
    }
    const writeData = JSON.stringify(arr);
    fs.writeFileSync('stationery-cash-sale.json', writeData);
    return 'file location vm-patchwork/stationery-cash-sale.json';
  }

  async m1CreditSaleData() {
    const arr = [];
    console.log('M1 Credit Sale Data start...');
    const hsnCode = ['30012090', '30012030', '30021210', '30021220', '30021230', '30021240', '30021290', '30021310', '30021900', '30022012', '30012347', '30123456', '5647891', '857952', '3001547', '300457', '30010', '805879', '300783', '345785']
    const count = await this.m1CreditSaleModel.countDocuments();
    console.log(count)
    let perPage = 1000;
    for (let page = 0; page < count; page = page + perPage) {
      const transactions = await this.m1CreditSaleModel
        .find({})
        .skip(page)
        .limit(perPage);
      const data = transactions.map(item => {
        return {
          voucherNo: item.voucherNo,
          voucherDate: moment(new Date(item.date)).format('DD-MM-YYYY'),
          party: item.customer.name,
          amount: item.amount,
          voucherType: ((item.gstInfo.destination?.regType?.defaultName === 'OVERSEAS')
            || (item.gstInfo.destination?.regType?.defaultName === 'SPECIAL_ECONOMIC_ZONE'))
            ? 'Exempted' : 'Regular',
          reverseCharge: item.lut ? 'Y' : 'N',
          gstin: item.gstInfo.destination?.gstNo ? item.gstInfo.destination.gstNo : '',
          pos: STATE.find(x => x.defaultName === item.gstInfo.destination?.location?.defaultName)?.code
            ? STATE.find(x => x.defaultName === item.gstInfo.destination.location.defaultName).code.toString() : '33',
          discount: item.discount,
          orderNo: item.refNo,
          orderDate: moment(new Date(item.date)).format('DD-MM-YYYY'),
          items: item.invTrns.map(inv => {
            return {
              itemType: 'GOODS',
              hsnsac: inv.hsnCode ? inv.hsnCode : hsnCode[Math.floor(Math.random() * hsnCode.length)],
              qty: inv.qty,
              taxableValue: inv.taxableAmount,
            }
          })
        }
      });
      data.forEach(elm => arr.push(elm));
    }
    const writeData = JSON.stringify(arr);
    fs.writeFileSync('stationery-credit-sale.json', writeData);
    return 'file location vm-patchwork/stationery-credit-sale.json';
  }
}
