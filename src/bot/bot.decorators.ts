import { SetMetadata } from '@nestjs/common';
import { BOT_HANDLER_METADATA } from './bot.constants';
import { BotHandlerMetadata } from './bot.types';
import { FilterQuery } from 'grammy';

export const BotHandler = <T>(metadata: BotHandlerMetadata<T>) => {
  return SetMetadata(BOT_HANDLER_METADATA, metadata);
};

export const Command = (command: string) => {
  return BotHandler({
    type: 'command',
    triggers: [command],
  });
};

export const OnStart = () => {
  return BotHandler({
    type: 'command',
    triggers: ['start'],
  });
};

export const On = (trigger: FilterQuery) => {
  return BotHandler<FilterQuery>({
    type: 'on',
    triggers: [trigger],
  });
};

export const Hears = (trigger: string | RegExp) => {
  return BotHandler({
    type: 'hears',
    triggers: [trigger],
  });
};

export const OnCallbackQuery = (query: string) => {
  return BotHandler({
    type: 'callback_query',
    triggers: [query],
  });
};
