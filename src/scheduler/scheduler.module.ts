import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { ApiModule } from 'src/api/api.module';

@Module({
  imports: [ApiModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
