import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import * as schema from './model/schemas';
import { Patch3Controller } from './patch3.controller';
import { Patch4Controller } from './patch4.controller';
import { Patch3Service } from './patch3.service';
import { MergeController } from './merge.controller';
import { MergeService } from './merge.service';
import { Patch4Service } from './patch4.service';
import { GSTFilingController } from './gst-filing.controller';
import { GSTFilingService } from './gst-filing.service';
import { Patch5Controller } from './patch5.controller';
import { Patch5Service } from './patch5.service';
import { URI } from './config';
import { Patch6Controller } from './patch6.controller';
import { Patch6Service } from './patch6.service';
import { Patch7Controller } from './patch7.controller';
import { Patch7Service } from './patch7.service';
import { Patch8Service } from './patch8.service';
import { Patch8Controller } from './patch8.controller';
import { Patch10Controller } from './patch10.controller';
import { Patch10Service } from './patch10.service';
import { Patch11Service } from './patch11.service';
import { Patch11Controller } from './patch11.controller';
import { TestService } from './test.service';
import { TestController } from './test.controller';

// const URI = 'mongodb+srv://username:password@host/database?retryWrites=true&w=majority';
// const URI =  `mongodb://admin:12345678@192.168.1.20:27017/velavanmedical1?authSource=admin`;
// const URI = `mongodb://localhost/velavanstationery`;
@Module({
  imports: [
    MongooseModule.forRoot(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }),
  ],
  controllers: [
    // AppController,
    // Patch3Controller,
    // MergeController,
    // Patch4Controller,
    // GSTFilingController,
    // Patch5Controller,
    // Patch6Controller,
    // Patch7Controller,
    // Patch8Controller,
    // Patch10Controller,
    Patch11Controller,
    TestController,
  ],
  providers: [
    // AppService,
    // Patch3Service,
    // MergeService,
    // Patch4Service,
    // GSTFilingService,
    // Patch5Service,
    // Patch6Service,
    // Patch7Service,
    // Patch8Service,
    // Patch10Service,
    Patch11Service,
    TestService,
  ],
})
export class AppModule {}
