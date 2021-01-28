import { Controller, Put } from '@nestjs/common';
import { Patch9Service } from './patch9.service';

@Controller('patch9')
export class Patch9Controller {
  constructor(private readonly patch9Service: Patch9Service) {}

  @Put('round')
  async stockStranfer() {
    console.log('patch9 controller acTrns DR,CR round');
    return await this.patch9Service.acTrnsRound();
  }
}
