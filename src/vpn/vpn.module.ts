import { Module } from '@nestjs/common';
import { VpnService } from './vpn.service';
import { ApiModule } from 'src/api/api.module';
import { PaymentsModule } from 'src/payments/payments.module';

@Module({
  imports: [ApiModule, PaymentsModule],
  providers: [VpnService],
})
export class VpnModule {}
