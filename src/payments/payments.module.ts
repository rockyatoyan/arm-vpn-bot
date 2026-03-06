import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { YookassaModule } from 'nestjs-yookassa';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApiModule } from 'src/api/api.module';

@Module({
  imports: [
    YookassaModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        apiKey: configService.getOrThrow('YOOKASSA_SECRET'),
        shopId: configService.getOrThrow('YOOKASSA_SHOP_ID'),
      }),
      inject: [ConfigService],
    }),
    ApiModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
