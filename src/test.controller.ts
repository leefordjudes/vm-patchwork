import { Controller, Put } from '@nestjs/common';
import { TestService } from './test.service';

@Controller('auditplus2.O')
export class TestController {
  constructor(private readonly testService: TestService) { }

  @Put('account')
  async auditplusTWOPO() {
    console.log('auditplus2 controller account');
    return await this.testService.test();
  }

  @Put('delete')
  async discountConfig() {
    console.log('auditplus2.O delete controller account');
    return await this.testService.delete();
  }

}
