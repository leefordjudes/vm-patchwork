import { Body, Controller, Post, Put, Query } from '@nestjs/common';
import { RoughService } from './rough.service';

@Controller('rough')
export class RoughController {
  constructor(private readonly roughService: RoughService) {}

  @Put('update')
  async updateRolePrivileges() {
    return await this.roughService.update();
  }
}
