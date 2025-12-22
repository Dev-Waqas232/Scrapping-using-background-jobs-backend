import { Module } from '@nestjs/common';
import { UrlsController } from './urls.controller';
import { UrlsService } from './urls.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from './entities/url.entity';
import { BullModule } from '@nestjs/bullmq';
import { UrlsProcessor } from './urls.worker';
import { DocsGateWay } from 'src/docs/docs-gateway';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'urls',
      defaultJobOptions: {
        attempts: 3,
        removeOnComplete: 10,
        removeOnFail: 100,
      },
    }),
    TypeOrmModule.forFeature([Url]),
  ],
  controllers: [UrlsController],
  providers: [UrlsService, UrlsProcessor, DocsGateWay],
})
export class UrlsModule {}
