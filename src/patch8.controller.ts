import { Controller, Put } from '@nestjs/common';
import { Patch8Service } from './patch8.service';

@Controller('patch8')
export class Patch8Controller {
  constructor(private readonly patch8Service: Patch8Service) {}

  @Put('inv-voucher')
  async stockStranfer() {
    console.log('patch8 controller inv-voucher');
    return await this.patch8Service.stockTranfer();
  }
}
