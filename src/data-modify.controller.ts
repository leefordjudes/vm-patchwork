import { Controller, Post } from '@nestjs/common';

import { DataModifyService } from './data-modify.service';

@Controller('auditplus')
export class DataModifyController {
  constructor(private readonly dataModifyService: DataModifyService) { }

  @Post('tax-sum')
  async checkValidation() {
    console.log('auditplus/tax-sum controller init');
    return await this.dataModifyService.taxSum();
  }
}
