import { Controller, Post } from '@nestjs/common';
import { BankReconciliationStatementService } from './brs.service';

@Controller('auditplus')
export class AppController {
  constructor(private readonly service: BankReconciliationStatementService) {}

  @Post('index')
  async stockValue() {
    console.log('auditplus/index index-remove controller init');
    return await this.service.patch();
  }
}
