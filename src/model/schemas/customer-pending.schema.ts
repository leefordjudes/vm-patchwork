import * as mongoose from 'mongoose';
import { BadRequestException } from '@nestjs/common';

export const schema = new mongoose.Schema({
  customer: {
    type: String,
    required: true,
    index: true,
  },
  customerName: String,
  branch: {
    type: String,
    required: true,
    index: true,
  },
  branchName: String,
  effDate: {
    type: Date,
    required: true,
  },
  refNo: {
    type: String,
  },
  opening: {
    type: Number,
  },
  adjusted: {
    type: Number,
    default: 0,
  },
  closing: {
    type: Number,
  },
  voucherType: {
    type: String,
    required: true,
  },
  voucherNo: String,
});

const updateCallback = async function(next) {
  let opening = this.getUpdate().opening;
  let adjusted = this.getUpdate().$inc?.adjusted || 0;
  const session = this.getOptions().session;
  const pending = await this.model.findOne(this.getQuery()).session(session);
  if (pending) {
    if (opening === undefined) {
      opening = pending.opening;
    }
    adjusted = pending.adjusted + adjusted;
  }
  const closing = opening + adjusted;
  if (opening > 0) {
    if (closing < 0 || closing > opening) {
      throw new BadRequestException('Insufficient balance');
    }
  }
  if (opening < 0) {
    if (closing > 0 || closing < opening) {
      throw new BadRequestException('Insufficient balance');
    }
  }
  if (opening === 0 && closing !== 0) {
    throw new BadRequestException('Insufficient balance');
  }
  this.set({ closing });
  next();
};

schema.pre<any>('updateOne', updateCallback);

schema.pre<any>('findOneAndUpdate', updateCallback);

export const customerPendingSchema = schema;
