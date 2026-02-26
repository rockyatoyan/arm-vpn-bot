import { Module, DynamicModule } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotModuleOptions, BotModuleOptionsAsync } from './bot.types';
import { PROVIDE_BOT_SYMBOL } from './bot.constants';
import { DiscoveryModule } from '@nestjs/core';
import { BotController } from './bot.controller';

@Module({
  controllers: [BotController],
  providers: [BotService],
})
export class BotModule {
  static register(options: BotModuleOptions): DynamicModule {
    return {
      module: BotModule,
      imports: [DiscoveryModule],
      providers: [
        BotService,
        { provide: PROVIDE_BOT_SYMBOL, useValue: options },
      ],
      exports: [BotService],
      global: true,
    };
  }

  static registerAsync(options: BotModuleOptionsAsync): DynamicModule {
    return {
      module: BotModule,
      imports: [DiscoveryModule, ...(options.imports || [])],
      providers: [
        BotService,
        {
          provide: PROVIDE_BOT_SYMBOL,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ],
      exports: [BotService],
      global: true,
    };
  }
}
