import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('m2InventoryOpening')
  async processM2InventoryOpening() {
    return await this.appService.processM2InventoryOpening();
  }
}
