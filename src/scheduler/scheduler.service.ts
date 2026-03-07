import { UiService } from './../ui/ui.service';
import { BotService } from './../bot/bot.service';
import { Injectable, Logger } from '@nestjs/common';
import { ApiService } from 'src/api/api.service';
import { InlineKeyboard } from 'grammy';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly apiService: ApiService,
    private readonly botService: BotService,
    private readonly uiService: UiService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3PM)
  async notificateExpiringUsers() {
    this.logger.log('Starting expiring users notification task');
    try {
      const users = await this.apiService.getUsers();
      for (const user of users) {
        if (user.status !== 'active') continue;

        const expireDate = new Date(user.expire * 1000);
        const diffTime = Math.abs(+new Date() - +expireDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 3 && diffDays >= 0) {
          const chatId = Number(user.note);

          const combined =
            this.uiService.renderExpringUsersNotification(diffDays);

          const keyboard = new InlineKeyboard().text(
            '🔑 Получить доступ к VPN',
            'get_vpn_access',
          );

          await this.botService.bot.api.sendMessage(chatId, combined.text, {
            reply_markup: keyboard,
            entities: combined.entities,
          });
        }
      }
    } catch (error) {
      this.logger.error(`Error during users notification: ${error.message}`);
    } finally {
      this.logger.log('Finished expiring users notification task');
    }
  }
}
