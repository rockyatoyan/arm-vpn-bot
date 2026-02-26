import { Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApiModule } from './api/api.module';
import { VpnModule } from './vpn/vpn.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BotModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService) => ({
        token: configService.get('TELEGRAM_BOT_TOKEN'),
      }),
      inject: [ConfigService],
    }),
    ApiModule,
    VpnModule,
  ],
})
export class AppModule {}
