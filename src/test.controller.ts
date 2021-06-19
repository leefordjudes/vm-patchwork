import { Controller, Post } from '@nestjs/common';
import { TestService } from './test.service';

@Controller('auditplus')
export class TestController {
  constructor(private readonly testService: TestService) { }

  @Post('migration')
  async migration() {
    console.log('auditplus2 controller account');
    return await this.testService.migration();
  }

  @Post('check')
  async checkValidation() {
    return await this.testService.check();
  }
}
