import { Body, Controller, Post, Put } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Put('update-db-records')
  async updateDbRecords(@Body('orgType') orgType: string) {
    return await this.appService.updateDatabaseRecords(orgType);
  }
}
