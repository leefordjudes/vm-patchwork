import { Controller, Put } from '@nestjs/common';
import { Patch10Service } from './patch10.service';

@Controller('patch10')
export class Patch10Controller {
  constructor(private readonly patch10Service: Patch10Service) {}

  @Put('inv-round')
  async round() {
    console.log('patch10 controller all inv-voucher invTrns & acTrns round');
    return await this.patch10Service.round();
  }
  @Put('inv-opening')
  async inventoryOpening() {
    console.log('patch10 controller inv-opening insert _id and purchase invTrns set UnitPrecision');
    return await this.patch10Service.inventoryOpening();
  }

  @Put('act-accountant')
  async actAccount() {
    console.log('patch10 actAccountant set parentDefaultName, and rename collection act_gstregistrations');
    return await this.patch10Service.actAccount();
  }
}
