import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { URI } from './config';
import { DataModifyController } from './data-modify.controller';
import { DataModifyService } from './data-modify.service';

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
    DataModifyController,
  ],
  providers: [
    DataModifyService,
  ],
})
export class AppModule {}
