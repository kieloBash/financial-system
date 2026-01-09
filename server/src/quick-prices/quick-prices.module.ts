import { Module } from '@nestjs/common';
import { QuickPricesService } from './quick-prices.service';
import { QuickPricesController } from './quick-prices.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [QuickPricesController],
  providers: [QuickPricesService],
  exports: [QuickPricesService],
})
export class QuickPricesModule {}
