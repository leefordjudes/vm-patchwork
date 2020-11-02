import { Body, Controller, Put, Query } from '@nestjs/common';
import { Patch5Service } from './patch5.service';

@Controller('patch5')
export class Patch5Controller {
  constructor(private readonly patch5Service: Patch5Service) {}

  /*
  PATCH 5
  (PUT)
  http://127.0.0.1:3000/patch5/print
  ?DB_USER=muthu&DB_PASS=d46jqtqkNjO6b6wN&DB_HOST=cluster0.1brqu.mongodb.net&DB_NAME=velavanmedical
  body of data src/fixtures/print-config.json
  */

  @Put('print')
  async patchPendings() {
    //return await this.patch5Service.printConfig();
    return await this.patch5Service.config();
  }
}
