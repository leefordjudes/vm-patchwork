import { Controller, Put } from '@nestjs/common';
import { Patch11Service } from './patch11.service';

@Controller('patch11')
export class Patch11Controller {
  constructor(private readonly patch6Service: Patch11Service) {}

  @Put('account')
  async discountConfig() {
    console.log('patch11 controller account');
    return await this.patch6Service.patch11();
  }
  @Put('delete')
  async delete() {
    console.log('patch11 controller account delete collections');
    return await this.patch6Service.delete();
  }
}
