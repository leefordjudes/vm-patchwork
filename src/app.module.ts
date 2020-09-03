import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { inventoryBookSchema } from './model/schemas/inventory-book.schema';
import { m2InventoryOpeningSchema } from './model/schemas/m2-inventory-opening.schema';

// const URI = 'mongodb+srv://username:password@host/database?retryWrites=true&w=majority';
const URI = 'mongodb://localhost/vmpatchwork';

@Module({
  imports: [
    MongooseModule.forRoot(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }),
    MongooseModule.forFeature([
      { name: 'InventoryBook', schema: inventoryBookSchema },
      { name: 'M2InventoryOpening', schema: m2InventoryOpeningSchema },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
