import { Body, Controller, Post, Put } from '@nestjs/common';
import { Patch3Service } from './patch3.service';

@Controller('patch3')
export class Patch3Controller {
  constructor(private readonly patch3Service: Patch3Service) {}

  // patch work 3
  @Put('update-role-privileges')
  async updateRolePrivileges() {
    return await this.patch3Service.updateRolePrivileges();
  }
}
