import { Injectable } from '@nestjs/common';
import { BotService } from './bot/bot.service';

@Injectable()
export class AppService {
  constructor(private readonly botService: BotService) {}

  getHello(): string {
    return 'Hello World!';
  }
}
