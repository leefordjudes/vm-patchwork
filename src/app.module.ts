import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { URI } from './config';
import { DataModifyController } from './data-modify.controller';
import { StockValueIssueFixService } from './stock-value-issue-fix.service';

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
    StockValueIssueFixService,
  ],
})
export class AppModule {}
