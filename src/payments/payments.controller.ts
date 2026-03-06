import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { PaymentsService } from './payments.service'
import { YookassaWebhook } from 'nestjs-yookassa'

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook/yookassa')
  @YookassaWebhook()
  @HttpCode(200)
  handleWebhook(@Body() event: any) {
    const status = event.object.status;
    const metadata = event.object.metadata;
    return this.paymentsService.handleWebhook(status, metadata);
  }
}
