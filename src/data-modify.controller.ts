import { Controller, Post } from '@nestjs/common';

import { StockTransferIssueFixService } from './stktrns-issue-fix.service';

@Controller('auditplus')
export class DataModifyController {
  constructor(private readonly service: StockTransferIssueFixService) { }

  @Post('patch')
  async checkValidation() {
    console.log('auditplus/stk-transfer-correction controller init');
    return await this.service.trns();
  }
}
