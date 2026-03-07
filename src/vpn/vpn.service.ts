import { ApiService } from './../api/api.service';
import { Context } from 'grammy';
import { Command, OnCallbackQuery, OnStart } from './../bot/bot.decorators';
import { Injectable } from '@nestjs/common';
import { PaymentsService } from 'src/payments/payments.service';
import { PaymentMethodsEnum } from 'nestjs-yookassa';
import { UiService } from 'src/ui/ui.service';

@Injectable()
export class VpnService {
  constructor(
    private readonly apiService: ApiService,
    private readonly paymentsService: PaymentsService,
    private readonly uiService: UiService,
  ) {}

  @OnStart()
  async start(ctx: Context) {
    const userId = ctx.from?.username || ctx.from?.id;
    if (!userId) {
      return ctx.reply(
        '⚠️ Не удалось определить ваш Telegram ID. Попробуйте снова.',
      );
    }

    const user = await this.apiService.getUser(userId);

    await this.uiService.renderStart(ctx, user);
  }

  @Command('menu')
  async showMenu(ctx: Context) {
    await this.start(ctx);
  }

  @OnCallbackQuery('get_vpn_access')
  async getVpnAccess(ctx: Context) {
    const userId = ctx.from?.username || ctx.from?.id;
    if (!userId) {
      return ctx.reply(
        '⚠️ Не удалось определить ваш Telegram ID. Попробуйте снова.',
      );
    }

    const existedUser = await this.apiService.getUser(userId);
    if (existedUser && new Date(existedUser.expire) > new Date()) {
      const subscriptionUrl = existedUser.subscription_url;

      return await this.uiService.renderSubscriptionLink(ctx, subscriptionUrl);
    }

    const newPayment = await this.paymentsService.createPayment(
      userId,
      String(ctx.chat?.id),
      PaymentMethodsEnum.SBP,
      await this.getBotLink(ctx),
    );

    //@ts-ignore
    const paymentUrl = newPayment.confirmation?.confirmation_url;

    await this.uiService.renderPaymentLink(ctx, paymentUrl);
  }

  @OnCallbackQuery('my_account')
  async getUserAccount(ctx: Context) {
    const userId = ctx.from?.username || ctx.from?.id;
    if (!userId) {
      return ctx.reply(
        '⚠️ Не удалось определить ваш Telegram ID. Попробуйте снова.',
      );
    }

    const user = await this.apiService.getUser(userId);

    const subscriptionUrl = user?.subscription_url;

    await this.uiService.renderSubscriptionLink(ctx, subscriptionUrl);
  }

  @Command('guide')
  async showGuideCommand(ctx: Context) {
    await this.uiService.renderGuide(ctx);
  }

  @OnCallbackQuery('guide')
  async showGuide(ctx: Context) {
    await ctx.answerCallbackQuery();
    await this.uiService.renderGuide(ctx);
  }

  private async getBotLink(ctx: Context) {
    try {
      const botInfo = await ctx.api.getMe();
      const botUsername = botInfo.username;
      return `https://t.me/${botUsername}`;
    } catch (error) {
      return null;
    }
  }
}
