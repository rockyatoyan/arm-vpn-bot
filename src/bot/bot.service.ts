import { ConfigService } from '@nestjs/config';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BOT_HANDLER_METADATA, PROVIDE_BOT_SYMBOL } from './bot.constants';
import { BotHandlerMetadata, BotModuleOptions } from './bot.types';
import { Bot, FilterQuery, webhookCallback } from 'grammy';
import { DiscoveryService } from '@nestjs/core';
import { isDev } from 'src/util/is-dev.util';

@Injectable()
export class BotService implements OnModuleInit {
  private readonly logger = new Logger(BotService.name);

  public bot: Bot;

  private commands = [
    {
      command: 'start',
      description: 'Запуск бота',
    },
    { command: 'menu', description: 'Главное меню' },
    { command: 'guide', description: 'Инструкция по подключению VPN' },
  ];

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly configService: ConfigService,
    @Inject(PROVIDE_BOT_SYMBOL) private readonly options: BotModuleOptions,
  ) {
    this.bot = new Bot(this.options.token);
    this.logger.log('🤖 Telegram Bot initialized');
  }

  async onModuleInit() {
    this.setupDecorators();

    const commands = await this.bot.api.getMyCommands();
    if (
      !commands?.length ||
      JSON.stringify(commands) !== JSON.stringify(this.commands)
    ) {
      await this.bot.api.setMyCommands(this.commands);
    }

    const { description } = await this.bot.api.getMyDescription();
    if (!description || description !== this.getDescriptionString())
      await this.bot.api.setMyDescription(this.getDescriptionString());

    const { short_description } = await this.bot.api.getMyShortDescription();
    if (
      !short_description ||
      short_description !== this.getShortDescriptionString()
    )
      await this.bot.api.setMyShortDescription(
        this.getShortDescriptionString(),
      );

    this.bot.catch(async (err) => {
      await err.ctx.answerCallbackQuery();
      await err.ctx.reply(
        '⚠️ Произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте снова позже.',
      );
    });

    if (isDev(this.configService)) {
      this.bot.start();
      this.logger.warn(
        '⚠️ Running in development mode. Webhook is not set. Bot is using long polling.',
      );
    } else {
      this.logger.log('🚀 Setting up Telegram webhook...');
      await this.bot.api.setWebhook(
        this.configService.getOrThrow<string>('TELEGRAM_WEBHOOK_URL'),
      );
    }
  }

  getWebhookHandler() {
    return webhookCallback(this.bot, 'express');
  }

  private async setupDecorators() {
    const providers = this.discoveryService.getProviders();
    for (const provider of providers) {
      const instance = provider.instance;
      if (!instance) continue;

      const prototype = Object.getPrototypeOf(instance);
      const methodNames = Object.getOwnPropertyNames(prototype).filter(
        (name) =>
          name !== 'constructor' &&
          !name.startsWith('__') &&
          !this.isRestrictedProperty(name),
      );

      for (const methodName of methodNames) {
        const method = instance[methodName];
        if (typeof method !== 'function') continue;

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

  private isRestrictedProperty(name: string): boolean {
    const restrictedProperties = ['caller', 'callee', 'arguments'];
    return restrictedProperties.includes(name);
  }

  private getDescriptionString() {
    return (
      '🔥 Доступ к миру без границ 🔓\n\n' +
      '🚀 Высокая скорость – без лагов и ограничений\n' +
      '⚡️ Современный протокол – быстрый, надежный, безопасный\n' +
      '💬 Поддержка 24/7 – решение в течение 1 минуты\n' +
      '💰 Всего 99₽ в месяц – низкая цена за отличное качество\n' +
      '⏳ Пробный период – первые 7 дней бесплатно!\n' +
      '👥 Реферальная система – зовите друзей и получайте VPN бесплатно!\n\n' +
      '⭐ Уже 1500+ пользователей выбрали нас!\n\n' +
      '📲 Наслаждайтесь свободным интернетом!'
    );
  }

  private getShortDescriptionString() {
    return (
      '🔥 VPN с высокой скоростью и поддержкой 24/7 🔓\n\n' +
      '💰 Всего 99₽/мес, первые 7 дней бесплатно!\n' +
      '⭐ Уже 1500+ пользователей.\n\n'
    );
  }
}
