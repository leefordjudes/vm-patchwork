import { Controller, Post } from '@nestjs/common';

import { DataModifyService } from './data-modify.service';

@Controller('auditplus')
export class DataModifyController {
  constructor(private readonly dataModifyService: DataModifyService) { }

  @Post('voucher-trns')
  async checkValidation() {
    console.log('auditplus/voucher-trns controller init');
    return await this.dataModifyService.trns();
  }
}
