import { ApiService } from './../api/api.service';
import { Context, InlineKeyboard } from 'grammy';
import { Command, OnCallbackQuery, OnStart } from './../bot/bot.decorators';
import { Injectable } from '@nestjs/common';

@Injectable()
export class VpnService {
  constructor(private readonly apiService: ApiService) {}

  @OnStart()
  async start(ctx: Context) {
    const userId = ctx.from?.username || ctx.from?.id;
    if (!userId) {
      return ctx.reply(
        '⚠️ Не удалось определить ваш Telegram ID. Попробуйте снова.',
      );
    }

    const user = await this.apiService.getUser(userId);

    const keyboard = new InlineKeyboard().text('📖 Инструкция', 'guide').row();
    if (user) {
      keyboard.text('👤 Мой аккаунт', 'my_account').row();
    }
    keyboard.text('🔑 Получить доступ к VPN', 'get_vpn_access');

    await ctx.reply(
      `
			<b>Привет, ${ctx.from.first_name}! 👋</b>

${!user ? 'Добро пожаловать' : 'C возвращением'} в наш VPN-сервис!
			
Здесь вы можете получить доступ к безопасному и быстрому интернету, а также управлять своим аккаунтом.

Если вы ${!user ? 'не знакомы с работой' : 'забыли как подключить'} VPN, не беспокойтесь!
<b>Просто нажмите на кнопку "📖 Инструкция" ниже</b>
			`,
      { reply_markup: keyboard, parse_mode: 'HTML' },
    );
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
    if (existedUser) {
      const subscriptionUrl = existedUser.subscription_url;

      return await this.renderAuthorizedCopySettings(ctx, subscriptionUrl);
    }

    const user = await this.apiService.createUser(userId);

    const subscriptionUrl = user.subscription_url;
    if (!subscriptionUrl) {
      await ctx.answerCallbackQuery();
      return ctx.reply(
        'Не удалось получить ссылку на подписку. Попробуйте снова.',
      );
    }

    const keyboard = new InlineKeyboard().copyText(
      '🔑 Скопировать ссылку',
      subscriptionUrl,
    );

    await ctx.answerCallbackQuery();
    await ctx.reply(
      `
			<b>✅ Ваш аккаунт добавлен!</b>
			
Теперь просто нажмите на кнопку ниже для копирования настроек и в скачанном приложение выберите опцию "Импортировать из буфера обмена" или аналогичную опцию.
	`,
      { reply_markup: keyboard, parse_mode: 'HTML' },
    );
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
    if (!subscriptionUrl) {
      await ctx.answerCallbackQuery();
      return ctx.reply(
        '⚠️ Похоже, ваша подписка закончилась. Снова получите доступ из главного меню или обратитесь в поддержку.',
      );
    }

    await this.renderAuthorizedCopySettings(ctx, subscriptionUrl);
  }

  @Command('guide')
  async showGuideCommand(ctx: Context) {
    await this.renderGuide(ctx);
  }

  @OnCallbackQuery('guide')
  async showGuide(ctx: Context) {
    await ctx.answerCallbackQuery();
    await this.renderGuide(ctx);
  }

  private renderGuide(ctx: Context) {
    return ctx.reply(
      `📖 <b>Инструкция по использованию VPN</b>

1️⃣ <b>Установка приложения для туннелирования</b>
- Для Android: Рекомендуем использовать <a href="https://play.google.com/store/apps/details?id=app.hiddify.com">Hiddify</a> или <a href="https://play.google.com/store/apps/details?id=com.v2raytun.android&hl=ru">v2RayTun</a>.
- Для iOS: <a href="https://apps.apple.com/us/app/hiddify-proxy-vpn/id6596777532">Hiddify</a> или <a href="https://apps.apple.com/us/app/v2raytun/id6476628951">v2RayTun</a>.
- Для ПК: <a href="https://github.com/hiddify/hiddify-app/releases/latest/download/Hiddify-Windows-Setup-x64.exe">Hiddify</a> или <a href="https://v2raytun.com/">v2RayTun</a>.

2️⃣ <b>Получение ссылки на подписку</b>
- Нажмите на кнопку "🔑 Получить доступ к VPN" в главном меню бота или под инструкцией.
- Нажмите на кнопку "Скопировать ссылку".

3️⃣ <b>Подключение к VPN</b>
- Откройте скачанное приложение (Hiddify, v2RayTun или выбранное вами) и выберите "Добавить из буфера обмена" или аналогичную опцию.
- В списке появятся наши VPN подключение, выбирайте любое из них.

- Подключитесь и наслаждайтесь безопасным интернетом!`,
      {
        parse_mode: 'HTML',
        reply_markup: new InlineKeyboard().text(
          '🔑 Получить доступ к VPN',
          'get_vpn_access',
        ),
        link_preview_options: {
          is_disabled: true,
        },
      },
    );
  }

  private async renderAuthorizedCopySettings(
    ctx: Context,
    subscriptionUrl: string,
  ) {
    const keyboard = new InlineKeyboard().copyText(
      '🔑 Скопировать ссылку',
      subscriptionUrl,
    );

    await ctx.answerCallbackQuery();
    await ctx.reply(
      `
			<b>✅ Ваш аккаунт активен!</b>

Нажмите на кнопку ниже для копирования настроек и в скачанном приложение выберите опцию "Импортировать из буфера обмена" или аналогичную опцию.
	`,
      { reply_markup: keyboard, parse_mode: 'HTML' },
    );
  }
}
