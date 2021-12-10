import { Controller, Post } from '@nestjs/common';

import { StockValueIssueFixService } from './stock-value-issue-fix.service';

@Controller('auditplus')
export class DataModifyController {
  constructor(private readonly service: StockValueIssueFixService) { }

  @Post('stock-value')
  async stockValue() {
    console.log('auditplus/stock value-correction controller init');
    return await this.service.trns();
  }
}
