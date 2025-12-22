import { Module } from '@nestjs/common';
import { DocsController } from './docs.controller';
import { DocsService } from './docs.service';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doc } from './entities/docs.entity';
import { DocsProcessor } from './docs.worker';
import { DocsGateWay } from './docs-gateway';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'docs',
      defaultJobOptions: {
        attempts: 3,
        removeOnComplete: 10,
        removeOnFail: 100,
      },
    }),
    TypeOrmModule.forFeature([Doc]),
  ],
  controllers: [DocsController],
  providers: [DocsService, DocsProcessor, DocsGateWay],
})
export class DocsModule {}
