import { Controller, Post } from '@nestjs/common';

import { DataModifyService } from './data-modify.service';

@Controller('auditplus')
export class DataModifyController {
  constructor(private readonly dataModifyService: DataModifyService) { }

  @Post('invTrns')
  async checkValidation() {
    console.log('auditplus/invTrns controller init');
    return await this.dataModifyService.contact();
  }
}
