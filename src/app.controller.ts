import { Controller, Post } from '@nestjs/common';
import { BankReconciliationStatementService } from './brs.service';

@Controller('auditplus')
export class AppController {
  constructor(private readonly service: BankReconciliationStatementService) {}

  @Post('brs')
  async stockValue() {
    console.log('auditplus/bank reconciliation statement controller init');
    return await this.service.patch();
  }
}
