import { DynamicModule, FactoryProvider } from '@nestjs/common';

export interface BotModuleOptions {
  token: string;
}

export interface BotModuleOptionsAsync extends Omit<
  FactoryProvider<BotModuleOptions>,
  'provide'
> {
  imports?: DynamicModule['imports'];
}

export type HandlerType =
  | 'command'
  | 'on'
  | 'hears'
  | 'callback_query'
  | 'inline_query';

export interface BotHandlerMetadata<T = string | RegExp> {
  type: HandlerType;
  triggers?: T[];
  description?: string;
}
