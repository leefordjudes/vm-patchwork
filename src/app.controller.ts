import { Controller, Post } from '@nestjs/common';
import { PriceConfigService } from './price-config.service';

@Controller('auditplus')
export class AppController {
  constructor(private readonly service: PriceConfigService) { }

  @Post('price-config')
  async stockValue() {
    console.log('auditplus/price-config controller init');
    return await this.service.patch();
  }
}
