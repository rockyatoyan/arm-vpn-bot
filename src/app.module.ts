import { Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VpnModule } from './vpn/vpn.module';
import { UiModule } from './ui/ui.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { ScheduleModule } from '@nestjs/schedule';

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
    ScheduleModule.forRoot(),
    VpnModule,
    UiModule,
    SchedulerModule,
  ],
})
export class AppModule {}
