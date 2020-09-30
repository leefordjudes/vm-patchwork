import { Controller, Get } from '@nestjs/common';
import { GSTFilingService } from './gst-filing.service';

@Controller('gst')
export class GSTFilingController {
  constructor(private readonly gstFilingService: GSTFilingService) { }

  @Get('m2-cash-sale')
  async m2CashSaleGSTFiling() {
    return await this.gstFilingService.m2CashSaleData();
  }

  @Get('m2-credit-sale')
  async m2CreditSaleGSTFiling() {
    return await this.gstFilingService.m2CreditSaleData();
  }

  @Get('m1-cash-sale')
  async m1CashSaleGSTFiling() {
    return await this.gstFilingService.m1CashSaleData();
  }

  @Get('m1-credit-sale')
  async m1CreditSaleGSTFiling() {
    return await this.gstFilingService.m1CreditSaleData();
  }
}
