import { Controller, Post } from '@nestjs/common';
import { ReWriteService } from './re-write.service';

@Controller('transaction')
export class ReWriteController {
  constructor(private readonly reWriteService: ReWriteService) { }

  @Post('re-write')
  async reWrite() {
    console.log('auditplus2.O transaction controller');
    return await this.reWriteService.reWrite();
  }

}
