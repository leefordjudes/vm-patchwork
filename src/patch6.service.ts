import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';

import { URI } from './config';

@Injectable()
export class Patch6Service {
  async discountConfig() {
    try {
      const connection = await new MongoClient(URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }).connect();
      console.log('---connected---');
      console.log('1.sMargin unset if sMargin is NULL');
      const sMargin = await connection.db().collection('inventories').updateMany({ $and : [ { sMargin : null }, { sMargin : { $exists : true } } ] }, { $unset: { sMargin: 1 } });
      console.log('2.sDiscount unset if sDiscount is NULL');
      const sDisc = await connection.db().collection('inventories').updateMany({ $and : [ { sDiscount : null }, { sDiscount : { $exists : true } } ] }, { $unset: { sDiscount: 1 } });
      console.log('unset finished');
      await connection.close();
      return { sMargin, sDisc };
    } catch (err) {
      return false;
    }
  }
}
