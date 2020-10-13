import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as moment from 'moment';
const fs = require('fs');

import * as iface from './model/interfaces';
import { STATE } from './fixtures/state/state';

export class GSTFilingService {
  constructor(
    @InjectModel('GST_Filing') private readonly gstFilingModel: Model<iface.GSTFiling>,
    @InjectModel('Sale')
    private readonly saleModel: Model<iface.Sale>,
  ) { }

  async gstFiling(companyName: string) {
    const hsnCode = [
      '30012090', '30012030', '30021210', '30021220', '30021230',
      '30021240', '30021290', '30021310', '30021900', '30022012',
      '30012347', '30123456', '5647891', '857952', '3001547',
      '300457', '30010', '805879', '300783', '345785'
    ];
    const proj = {
      _id: 0,
      voucherNo: 1,
      date: 1,
      refNo: 1,
      customer: 1,
      lut: 1,
      invTrns: 1,
      amount: 1,
      discount: 1,
      gstInfo: 1,
      saleType: 1,
    }
    const sales = await this.saleModel.aggregate([
      { $project: proj }
    ]);
    const data = sales.map(item => {
      return {
        voucherNo: item.voucherNo,
        voucherDate: moment(new Date(item.date)).format('DD-MM-YYYY'),
        party: item.saleType === 'cash' ? 'CASH' : item.customer.name,
        amount: item.amount,
        voucherType: ((item.gstInfo.destination?.regType?.defaultName === 'OVERSEAS')
          || (item.gstInfo.destination?.regType?.defaultName === 'SPECIAL_ECONOMIC_ZONE'))
          ? 'Exempted' : 'Regular',
        reverseCharge: item.lut ? 'Y' : 'N',
        gstin: item.gstInfo.destination?.gstNo ? item.gstInfo.destination?.gstNo : '',
        pos: STATE.find(x => x.defaultName === item.gstInfo.destination?.location?.defaultName)?.code
          ? STATE.find(x => x.defaultName === item.gstInfo.destination.location.defaultName).code.toString() : '33',
        discount: item.discount,
        orderNo: item.refNo ? item.refNo : '',
        orderDate: moment(new Date(item.date)).format('DD-MM-YYYY'),
        items: item.invTrns.map((inv) => {
          return {
            itemType: 'GOODS',
            hsnsac: inv.hsnCode ? inv.hsnCode : hsnCode[Math.floor(Math.random() * hsnCode.length)],
            qty: inv.qty,
            taxableValue: inv.taxableAmount,
          }
        })
      }
    });
    await this.gstFilingModel.insertMany(data);
    console.log('Temp collection created');
    await this.gstFilingModel.aggregate([
      { $addFields: { companyName } },
      { $merge: {into: { db: 'auditplus_accountant', coll:  'gst_filings' }} },
    ]);
    console.log('new auditplus_accountant db and gst_filings collection created');
    await this.gstFilingModel.db.dropCollection('gst_filings');
    console.log('Temp collection deleted');
    const writeData = JSON.stringify(data);
    fs.writeFileSync(`${companyName}-gst.json`, writeData);
    console.log('json file created');
    return 'new auditplus_accountant db and gst_filings collection created';
  }

}