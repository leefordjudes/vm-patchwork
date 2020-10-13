import { Controller, Put, Query } from "@nestjs/common";
import { GSTFilingService } from "./gst-filing.service";

@Controller('gst')
export class GSTFilingController {

  constructor(private gstFilingService: GSTFilingService) {}
  @Put('/sale')
  async updateDbRecords(
    @Query('companyName') companyName: string
  ) {
    return await this.gstFilingService.gstFiling(companyName);
  }

}