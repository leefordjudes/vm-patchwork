import { Controller, Post } from '@nestjs/common';

import { MigrationService } from './migration.service';

@Controller('auditplus')
export class MigrationController {
  constructor(private readonly migrationService: MigrationService) { }

  @Post('check')
  async checkValidation() {
    console.log('auditplus2.0 checkValidation controller init');
    return await this.migrationService.check();
  }

  @Post('closing')
  async check() {
    console.log('auditplus2.0 closing controller init');
    return await this.migrationService.closing();
  }

  @Post('migration')
  async migration() {
    console.log('auditplus2.0 migration controller init');
    return await this.migrationService.migration();
  }

  @Post('refNo')
  async refNo() {
    console.log('auditplus2.0 unset acTrns.refNo controller init');
    return await this.migrationService.refNo();
  }

}
