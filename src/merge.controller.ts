import { Body, Controller, Delete, Post, Put, Query } from '@nestjs/common';

import { MergeService } from './merge.service';

@Controller('merge')
export class MergeController {
  constructor(private readonly mergeService: MergeService) {}

  @Put('m2')
  async mergeM2() {
    return await this.mergeService.m2Merge();
  }

  @Put('m1')
  async mergeM1() {
    return await this.mergeService.m1Merge();
  }

  @Put('rename')
  async rename(
    @Query('orgType') orgType: string,
    @Query('dbname') dbname: string,
  ) {
    return await this.mergeService.rename(orgType, dbname);
  }

  @Post('head')
  async head(@Body() data: any) {
    console.log(data);
    return await this.mergeService.head(data);
  }
}
