import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('patch-inventory-book')
  async patchM2InventoryBookFromM2InventoryOpening() {
    return await this.appService.patchM2InventoryBookFromM2InventoryOpening();
  }
}
