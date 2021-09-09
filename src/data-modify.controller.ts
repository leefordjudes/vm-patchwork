import { Controller, Post } from '@nestjs/common';

import { DataModifyService } from './data-modify.service';

@Controller('auditplus')
export class DataModifyController {
  constructor(private readonly dataModifyService: DataModifyService) { }

  @Post('contact-id')
  async checkValidation() {
    console.log('auditplus/contact-id controller init');
    return await this.dataModifyService.contact();
  }
}
