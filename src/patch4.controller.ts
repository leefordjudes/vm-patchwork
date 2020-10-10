import { Body, Controller, Post, Put } from '@nestjs/common';
import { Patch4Service } from './patch4.service';

@Controller('patch4')
export class Patch4Controller {
  constructor(private readonly patch4Service: Patch4Service) {}

  // patch work 4
  @Put('patch-pendings')
  async patchPendings() {
    const vendor = await this.patch4Service.vendorPendingPatch();
    const customer = await this.patch4Service.customerPendingPatch();
    return { vendor, customer };
  }
}
