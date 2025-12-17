import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullModule } from '@nestjs/bullmq';
import { VideosModule } from './videos/videos.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: { host: 'localhost', port: 6379 },
      defaultJobOptions: {
        attempts: 3,
        removeOnComplete: 10,
        removeOnFail: 1000,
      },
    }),
    VideosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
