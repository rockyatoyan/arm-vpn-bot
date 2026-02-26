import { Controller, Post, Req, Res } from '@nestjs/common';
import { BotService } from './bot.service';
import { Request, Response } from 'express';

@Controller('bot')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Post('webhook')
  async webhook(@Req() req: Request, @Res() res: Response) {
    const handler = this.botService.getWebhookHandler();
    return handler(req, res);
  }
}
