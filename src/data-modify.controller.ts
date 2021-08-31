import { Controller, Post } from '@nestjs/common';

import { DataModifyService } from './data-modify.service';

@Controller('auditplus')
export class DataModifyController {
  constructor(private readonly dataModifyService: DataModifyService) { }

  @Post('inv-barcode')
  async checkValidation() {
    console.log('auditplus/barcode controller init');
    return await this.dataModifyService.barcode();
  }
}
