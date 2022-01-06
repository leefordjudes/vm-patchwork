import { Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { InventoryImportService } from './inv-import.service';

@Controller('auditplus')
export class AppController {
  constructor(private readonly service: InventoryImportService) {}

  @Post('inv-import')
  @UseInterceptors(FilesInterceptor('files'))
  async invImport(@UploadedFiles() files: any) {
    console.log('auditplus/InventoryImportService controller init');
    return await this.service.invImport(files);
  }
}
