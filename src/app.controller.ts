import { Controller, Post } from '@nestjs/common';
import { InventoryImportService } from './inv-import.service';

@Controller('auditplus')
export class AppController {
  constructor(private readonly service: InventoryImportService) {}

  @Post('inv-import')
  async stockValue() {
    console.log('auditplus/InventoryImportService controller init');
    return await this.service.patch();
  }
}
