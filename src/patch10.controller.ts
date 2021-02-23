import { Controller, Put } from '@nestjs/common';
import { Patch10Service } from './patch10.service';

@Controller('patch10')
export class Patch10Controller {
  constructor(private readonly patch10Service: Patch10Service) {}

  @Put('inv-voucher')
  async round() {
    console.log('patch10 controller inv-voucher');
    return await this.patch10Service.round();
  }
  @Put('inv-opening')
  async inventoryOpening() {
    console.log('patch10 controller inv-opening');
    return await this.patch10Service.inventoryOpening();
  }
}
