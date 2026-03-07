import { ApiService } from './../api/api.service';
import { BotService } from './../bot/bot.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InlineKeyboard } from 'grammy';
import {
  CurrencyEnum,
  type CreatePaymentRequest,
  PaymentMethodsEnum,
  YookassaService,
  ConfirmationEnum,
} from 'nestjs-yookassa';
import { UiService } from 'src/ui/ui.service';
import { isDev } from 'src/util/is-dev.util';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly yookassaService: YookassaService,
    private readonly botService: BotService,
    private readonly apiService: ApiService,
    private readonly uiService: UiService,
    private readonly configService: ConfigService,
  ) {}

  async createPayment(
    userId: string | number,
    chatId: string,
    type: PaymentMethodsEnum.SBP | PaymentMethodsEnum.BANK_CARD,
    returnUrl: string | null,
  ) {
    try {
      const paymentData: CreatePaymentRequest = {
        amount: {
          value: 100,
          currency: CurrencyEnum.RUB,
        },
        payment_method_data: isDev(this.configService) ? undefined : { type },
        capture: true,
        confirmation: {
          type: ConfirmationEnum.REDIRECT,
          return_url: returnUrl || '',
        },
        metadata: {
          userId: String(userId),
          chatId,
        },
      };

      const newPayment =
        await this.yookassaService.payments.create(paymentData);
      newPayment.confirmation?.type;

      return newPayment;
    } catch (error) {
      throw new BadRequestException(
        `Ошибка при создании платежа: ${error.message}`,
      );
    }
  }

  async handleWebhook(
    status: 'succeeded' | 'failed',
    metadata: {
      chatId: string;
      userId: string;
    },
  ) {
    const userId = isNaN(Number(+metadata.userId))
      ? metadata.userId
      : Number(metadata.userId);
    const chatId = Number(metadata.chatId);

    if (status === 'succeeded') {
      const existedUser = await this.apiService.getUser(userId);

      if (existedUser) {
        const renewedUser =
          await this.apiService.renewUserSubscription(existedUser);

        if (!renewedUser) {
          await this.botService.bot.api.sendMessage(
            chatId,
            '❌ К сожалению, произошла ошибка при продлении вашей подписки. Пожалуйста, попробуйте снова или свяжитесь с поддержкой.',
          );
          return true;
        }

        const keyboard = new InlineKeyboard().copyText(
          '🔑 Скопировать ссылку',
          renewedUser.subscription_url,
        );

        const combined =
          this.uiService.renderWebhookSuccessPaymentFromExistedUser();
        await this.botService.bot.api.sendMessage(chatId, combined.text, {
          reply_markup: keyboard,
          entities: combined.entities,
        });

        return true;
      }

      const user = await this.apiService.createUser(userId, chatId);

      const subscriptionUrl = user.subscription_url;
      const keyboard = new InlineKeyboard().copyText(
        '🔑 Скопировать ссылку',
        subscriptionUrl,
      );
      const combined = this.uiService.renderWebhookSuccessPaymentFromNewUser();
      await this.botService.bot.api.sendMessage(chatId, combined.text, {
        reply_markup: keyboard,
        entities: combined.entities,
      });

      return true;
    }

    if (status === 'failed') {
      await this.botService.bot.api.sendMessage(
        chatId,
        '❌ К сожалению, произошла ошибка при обработке вашего платежа. Пожалуйста, попробуйте снова или свяжитесь с поддержкой.',
      );
      return true;
    }
  }
}
