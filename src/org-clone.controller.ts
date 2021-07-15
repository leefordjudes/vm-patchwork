import { Controller, Post } from '@nestjs/common';

import { OrgCloneService } from './org-clone.service';

@Controller('org')
export class OrgCloneController {
  constructor(private readonly orgService: OrgCloneService) { }

  @Post('clone')
  async orgInit() {
    return await this.orgService.clone();
  }
}
