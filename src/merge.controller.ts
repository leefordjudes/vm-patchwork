import { Body, Controller, Post, Put, Query } from '@nestjs/common';

import { MergeService } from './merge.service';

/* 
velavanstationery
1. merge sale,sale-return,purchase,purchase-return
(PUT)
http://127.0.0.1:3000/common/merge?orgType=m1


2. rename, delete collection and print tempate category value change 
(PUT)
http://127.0.0.1:3000/common/rename?orgType=m1&dbname=velavanstationery

3. create default HEAD and also set that head id into all branch & inventory
(POST)
http://127.0.0.1:3000/common/head
BODY of the data:
{
    "name": "head name",
    "pharmacyRetail": false
}

4. In preference setting set as branch wises
(PUT)
http://127.0.0.1:3000/common/preference

*/


/*
velavanmedical
1. merge sale,sale-return,purchase and purchase-return
(PUT)
http://127.0.0.1:3000/common/merge?orgType=m2


2. rename, delete collection and print tempate category value change 
(PUT)
http://127.0.0.1:3000/common/rename?orgType=m2&dbname=velavanmedical

3. create default HEAD and also set that head id into all branch & inventory
(POST)
http://127.0.0.1:3000/common/head
BODY of the data:
{
    "name": "head name",
    "pharmacyRetail": true
}

4. In preference setting set as branch wises
(PUT)
http://127.0.0.1:3000/common/preference

*/


@Controller('common')
export class MergeController {
  constructor(private readonly mergeService: MergeService) {}

  @Put('merge')
  async merge(@Query('orgType') orgType: string) {
    return await this.mergeService.merge(orgType);
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

  @Put('preference')
  async preference() {
    return await this.mergeService.preference();
  }
}
