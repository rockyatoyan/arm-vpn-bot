import { Injectable } from '@nestjs/common';
import { Context, InlineKeyboard } from 'grammy';
import { CreateUserResponse } from 'src/api/api.types';
import { FormattedString } from '@grammyjs/parse-mode';

@Injectable()
export class UiService {
  async renderStart(ctx: Context, user: CreateUserResponse | null) {
    const keyboard = new InlineKeyboard().text('📖 Инструкция', 'guide').row();
    if (user) {
      keyboard.text('👤 Мой аккаунт', 'my_account').row();
    }
    keyboard.text('🔑 Получить доступ к VPN', 'get_vpn_access');

    const combined = FormattedString.b(
      `Привет, ${ctx.from?.first_name}! 👋\n\n`,
    )
      .plain(
        'Здесь вы можете получить доступ к безопасному и быстрому интернету, а также управлять своим аккаунтом.\n\n',
      )
      .plain(
        `Если вы ${
          !user ? 'не знакомы с работой' : 'забыли как подключить'
        } VPN, не беспокойтесь!\n`,
      )
      .b('Просто нажмите на кнопку "📖 Инструкция" ниже');

    await ctx.reply(combined.text, {
      reply_markup: keyboard,
      entities: combined.entities,
    });
  }

  async renderPaymentLink(ctx: Context, url?: string) {
    if (!url) {
      await ctx.answerCallbackQuery();
      return ctx.reply('⚠️ Не удалось создать платеж. Попробуйте снова.');
    }

    const keyboard = new InlineKeyboard().url('💳 Оплатить', url);

    const combined = FormattedString.b(
      'Для доступа к VPN, пожалуйста, оплатите подписку.\n\n',
    ).plain(
      'После подтверждения оплаты вам будет предоставлен доступ в ответном сообщении!',
    );

    await ctx.answerCallbackQuery();
    await ctx.reply(combined.text, {
      reply_markup: keyboard,
      entities: combined.entities,
    });
  }

  async renderSubscriptionLink(ctx: Context, url?: string) {
    if (!url) {
      await ctx.answerCallbackQuery();
      return ctx.reply(
        '⚠️ Похоже, ваша подписка закончилась. Снова получите доступ из главного меню или обратитесь в поддержку.',
      );
    }

    const keyboard = new InlineKeyboard().copyText(
      '🔑 Скопировать ссылку',
      url,
    );

    const combined = FormattedString.b('✅ Ваш аккаунт активен!\n\n').plain(
      'Нажмите на кнопку ниже для копирования настроек и в скачанном приложение выберите опцию "Импортировать из буфера обмена" или аналогичную опцию.',
    );

    await ctx.answerCallbackQuery();
    await ctx.reply(combined.text, {
      reply_markup: keyboard,
      entities: combined.entities,
    });
  }

  renderWebhookSuccessPaymentFromNewUser() {
    const combined = FormattedString.b(
      '✅ Ваш платеж успешно обработан! Доступ к VPN активирован. Подписка начнет действовать месяц только с момента, когда вы подключите сервис в приложении, все честно!\n\n',
    ).plain(
      'Нажмите на кнопку ниже для копирования настроек и в скачанном приложение выберите опцию "Импортировать из буфера обмена" или аналогичную опцию.',
    );

    return combined;
  }

  renderWebhookSuccessPaymentFromExistedUser() {
    const combined = FormattedString.b(
      '✅ Ваш платеж успешно обработан! Подписка продлена на месяц. Доступ к VPN активирован.\n\n',
    )
      .plain(
        'Если VPN перестал работать, в приложении нажмите на кнопку обновления подписки 🔄️ и все!\n\n',
      )
      .plain(
        'Если после этого работа не восстановлена, просто нажмите на кнопку ниже для копирования настроек и в скачанном приложение выберите опцию "Импортировать из буфера обмена" или аналогичную опцию.',
      );

    return combined;
  }

  async renderGuide(ctx: Context) {
    const combined = FormattedString.b(
      `📖 <b>Инструкция по использованию VPN</b>\n\n\n`,
    )
      .b('1️⃣ <b>Установка приложения для туннелирования</b>\n\n')
      .plain(
        '- Для Android: Рекомендуем использовать <a href="https://play.google.com/store/apps/details?id=com.v2raytun.android&hl=ru">v2RayTun</a> или <a href="https://play.google.com/store/apps/details?id=app.hiddify.com">Hiddify</a>.\n',
      )
      .plain(
        '- Для iOS: <a href="https://apps.apple.com/us/app/v2raytun/id6476628951">v2RayTun</a> или <a href="https://apps.apple.com/us/app/hiddify-proxy-vpn/id6596777532">Hiddify</a>.\n',
      )
      .plain(
        '- Для ПК: <a href="https://v2raytun.com/">v2RayTun</a> или <a href="https://github.com/hiddify/hiddify-app/releases/latest/download/Hiddify-Windows-Setup-x64.exe">Hiddify</a>.\n\n\n',
      )

      .b('2️⃣ <b>Получение ссылки на подписку</b>\n\n')
      .plain(
        '- Нажмите на кнопку "🔑 Получить доступ к VPN" в главном меню бота или под инструкцией.\n',
      )
      .plain(
        '- Появится приглашение на оплату. При успешной оплате, в боте придет сообщение с доступом к VPN.\n',
      )
      .plain(
        '- Нажмите на кнопку "Скопировать ссылку" в сообщении о получении доступа.\n\n\n',
      )

      .plain(
        `По всем вопросам оплаты (не прошла оплата, после оплаты не появился доступ и т.д) обращайтесь в поддержку в главном меню бота. Мы решим вопрос в течение минуты.\n\n\n`,
      )

      .b('3️⃣ <b>Подключение к VPN</b>\n\n')
      .plain(
        '- Откройте скачанное приложение (Hiddify, v2RayTun или выбранное вами) и выберите "Добавить из буфера обмена" или аналогичную опцию.\n',
      )
      .plain(
        '- В списке появятся наши VPN подключение, выбирайте любое из них.\n\n\n',
      )

      .b('<b> - Подключитесь и наслаждайтесь безопасным интернетом!</b>');

    return ctx.reply(combined.text, {
      reply_markup: new InlineKeyboard().text(
        '🔑 Получить доступ к VPN',
        'get_vpn_access',
      ),
      entities: combined.entities,
      parse_mode: 'HTML',
      link_preview_options: {
        is_disabled: true,
      },
    });
  }
}
