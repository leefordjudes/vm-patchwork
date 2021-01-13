import { Controller, Put } from '@nestjs/common';
import { Patch7Service } from './patch7.service';

@Controller('patch7')
export class Patch7Controller {
  constructor(private readonly patch7Service: Patch7Service) {}

  @Put('stock-transfer')
  async stockStranfer() {
    console.log('patch7 controller stock-tranfer');
    return await this.patch7Service.stockTranfer();
  }
}
