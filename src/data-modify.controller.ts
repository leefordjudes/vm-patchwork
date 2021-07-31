import { Controller, Post } from '@nestjs/common';

import { DataModifyService } from './data-modify.service';

@Controller('auditplus')
export class DataModifyController {
  constructor(private readonly dataModifyService: DataModifyService) { }

  @Post('gst-reg')
  async checkValidation() {
    console.log('auditplus/gst-reg controller init');
    return await this.dataModifyService.gstReg();
  }
}
