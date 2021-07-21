import { Controller, Post } from '@nestjs/common';

import { DataModifyService } from './data-modify.service';

@Controller('auditplus')
export class DataModifyController {
  constructor(private readonly dataModifyService: DataModifyService) { }

  // @Post('gst')
  // async checkValidation() {
  //   console.log('auditplus/gst controller init');
  //   return await this.dataModifyService.gst();
  // }

  @Post('acv')
  async accountCustomerVendor() {
    console.log('auditplus/acv controller init');
    return await this.dataModifyService.acv();
  }
}
