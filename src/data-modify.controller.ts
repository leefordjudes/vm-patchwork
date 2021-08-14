import { Controller, Post } from '@nestjs/common';

import { DataModifyService } from './data-modify.service';

@Controller('auditplus')
export class DataModifyController {
  constructor(private readonly dataModifyService: DataModifyService) { }

  @Post('amount')
  async checkValidation() {
    console.log('auditplus/amount controller init');
    return await this.dataModifyService.amount();
  }
}
