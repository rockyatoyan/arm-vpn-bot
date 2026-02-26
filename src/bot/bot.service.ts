import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BOT_HANDLER_METADATA, PROVIDE_BOT_SYMBOL } from './bot.constants';
import { BotHandlerMetadata, BotModuleOptions } from './bot.types';
import { Bot, FilterQuery } from 'grammy';
import { DiscoveryService } from '@nestjs/core';

@Injectable()
export class BotService implements OnModuleInit {
  private readonly logger = new Logger(BotService.name);

  public bot: Bot;

  constructor(
    private readonly discoveryService: DiscoveryService,
    @Inject(PROVIDE_BOT_SYMBOL) private readonly options: BotModuleOptions,
  ) {}

  async onModuleInit() {
    this.bot = new Bot(this.options.token);

    this.logger.log('🤖 Telegram Bot initialized');
    this.setupDecorators();

    this.bot.start();
  }

  private async setupDecorators() {
    const providers = this.discoveryService.getProviders();
    for (const provider of providers) {
      const instance = provider.instance;
      if (!instance) continue;

      const prototype = Object.getPrototypeOf(instance);
      const methodNames = Object.getOwnPropertyNames(prototype).filter(
        (name) =>
          typeof instance[name] === 'function' && name !== 'constructor',
      );

      for (const methodName of methodNames) {
        const method = instance[methodName];
        const metadata: BotHandlerMetadata = Reflect.getMetadata(
          BOT_HANDLER_METADATA,
          method,
        );
        if (!metadata) continue;

        if (metadata.type === 'command' && metadata.triggers?.[0]) {
          this.logger.log(
            `📌 Registering command handler: ${metadata.triggers[0]} -> ${provider.name}.${methodName}()`,
          );
          this.bot.command(metadata.triggers[0] as string, async (ctx) => {
            await method.call(instance, ctx);
          });
        }

        if (metadata.type === 'on' && metadata.triggers?.[0]) {
          this.logger.log(
            `📌 Registering on handler: ${metadata.triggers[0]} -> ${provider.name}.${methodName}()`,
          );
          this.bot.on(metadata.triggers[0] as FilterQuery, async (ctx) => {
            await method.call(instance, ctx);
          });
        }

        if (metadata.type === 'hears' && metadata.triggers?.[0]) {
          this.logger.log(
            `📌 Registering hears handler: ${metadata.triggers[0]} -> ${provider.name}.${methodName}()`,
          );
          this.bot.hears(
            metadata.triggers[0] as string | RegExp,
            async (ctx) => {
              await method.call(instance, ctx);
            },
          );
        }

        if (metadata.type === 'callback_query' && metadata.triggers?.[0]) {
          this.logger.log(
            `📌 Registering callback query handler: ${metadata.triggers[0]} -> ${provider.name}.${methodName}()`,
          );
          this.bot.callbackQuery(metadata.triggers[0], async (ctx) => {
            await method.call(instance, ctx);
          });
        }
      }
    }
  }
}
