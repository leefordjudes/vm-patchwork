import { Controller, Put } from '@nestjs/common';
import { Patch6Service } from './patch6.service';

@Controller('patch6')
export class Patch6Controller {
  constructor(private readonly patch6Service: Patch6Service) {}

  @Put('discount')
  async patchPendings() {
    return await this.patch6Service.discountConfig();
  }
}
