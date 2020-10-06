import { Controller, Delete, Put } from '@nestjs/common';
import { MergeService } from './merge.service';

@Controller('merge')
export class MergeController {
  constructor(private readonly mergeService: MergeService) { }

  @Put('m2')
  async mergeM2() {
    return await this.mergeService.m2Merge();
  }

  @Put('m1')
  async mergeM1() {
    return await this.mergeService.m1Merge();
  }

  @Delete('m1')
  async deleteM1() {
    return await this.mergeService.m1DeleteCollections();
  }

  @Delete('m2')
  async deleteM2() {
    return await this.mergeService.m2DeleteCollections();
  }

}
