import { Controller, Post, Put } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('set-temp-inventory-book')
  async setTempM2InventoryBookFromM2InventoryOpening() {
    return await this.appService.setTempM2InventoryBookFromM2InventoryOpening();
  }

  @Put('patch-inventory-book')
  async patchM2InventoryBookFromM2InventoryOpening() {
    return await this.appService.patchM2InventoryBookFromM2InventoryOpening();
  }

  @Post('copy-inventory-book')
  async copyM2InventoryBook() {
    return await this.appService.copyM2InventoryBook();
  }
}
