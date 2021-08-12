import { Controller, Post } from '@nestjs/common';

import { DataModifyService } from './data-modify.service';

@Controller('auditplus')
export class DataModifyController {
  constructor(private readonly dataModifyService: DataModifyService) { }

  @Post('price')
  async checkValidation() {
    console.log('auditplus/price controller init');
    return await this.dataModifyService.price();
  }
}
