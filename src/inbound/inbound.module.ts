import { Module } from '@nestjs/common';
import { AdminInboundController } from './admin-inbound.controller';
import { InboundController } from './inbound.controller';
import { InboundService } from './inbound.service';

@Module({
  controllers: [InboundController, AdminInboundController],
  providers: [InboundService],
})
export class InboundModule {}
