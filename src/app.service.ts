import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as moment from 'moment';
import * as _ from 'lodash';
import { InventoryBook } from './model/interfaces/inventory-book.interface';
import { M2InventoryOpening } from './model/interfaces/m2-inventory-opening.interface';

@Injectable()
export class AppService {
  constructor(
    @InjectModel('InventoryBook')
    private readonly inventoryBookModel: Model<InventoryBook>,
    @InjectModel('M2InventoryOpening')
    private readonly m2InventoryOpeningModel: Model<M2InventoryOpening>,
  ) {}

  async processM2InventoryOpening() {}
}
