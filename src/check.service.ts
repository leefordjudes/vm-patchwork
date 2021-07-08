import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { Types } from 'mongoose';

import * as _ from 'lodash';

import { URI } from './config';

@Injectable()
export class CheckService {

  async check(data: any) {
    const connection = await new MongoClient(URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }).connect();
    if (!connection.isConnected) {
      return 'Connection Failed';
    }
    const match = { branch: Types.ObjectId(data.branch), voucherType: data.voucherType };
    if (data.fromDate && data.toDate) {
      const fromDate = new Date(new Date(data.fromDate).setUTCHours(0, 0, 0, 0));
      const toDate = new Date(new Date(data.toDate).setUTCHours(0, 0, 0, 0));
      _.assign(match, { date: { $gte: fromDate, $lte: toDate } });
    }
    const pipeLine: any = [
      {
        $match: match,
      },
    ];
    if (data.sortOrder) {
      pipeLine.push({ $sort: { updatedAt: 1 } });
    }
    const startTime = new Date().getTime();
    const result = await connection.db('velavanmedical').collection('sales').aggregate(pipeLine).toArray();
    return `Document Count ${result.length} and Duration ${new Date().getTime() - startTime} -milliSec`;
  }
}