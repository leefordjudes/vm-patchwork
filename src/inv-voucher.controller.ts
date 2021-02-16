import { Controller, Put } from '@nestjs/common';
import { Patch9Service } from './inv-voucher.service';

@Controller('patch9')
export class Patch9Controller {
  constructor(private readonly patch9Service: Patch9Service) {}

  @Put('inv-voucher')
  async stockStranfer() {
    console.log('patch9 controller inv-voucher');
    return await this.patch9Service.acTrnsRound();
  }
  @Put('post-acbook')
  async postAccountBookUpdate() {
    console.log('patch9 controller post account book update.');
    return await this.patch9Service.postAccountBookUpdate();
  }
}
