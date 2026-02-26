import { Module } from '@nestjs/common';
import { VpnService } from './vpn.service';
import { ApiModule } from 'src/api/api.module';

@Module({
  imports: [ApiModule],
  providers: [VpnService],
})
export class VpnModule {}
