import { Controller, Get, Query } from '@nestjs/common';

import { CheckService } from './check.service';

@Controller('check')
export class CheckController {
  constructor(private readonly checkService: CheckService) { }

  @Get('sort')
  async getSale(@Query() query: any) {
    return await this.checkService.check(query);
  }
}