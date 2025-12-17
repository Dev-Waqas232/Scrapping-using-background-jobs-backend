import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { BullModule } from '@nestjs/bullmq';
import { VideoProcessor } from './videos.worker';

@Module({
  imports: [BullModule.registerQueue({ name: 'docs' })], // Registering a new queue
  controllers: [VideosController],
  providers: [VideosService, VideoProcessor],
})
export class VideosModule {}
