import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullModule } from '@nestjs/bullmq';
import { DocsModule } from './docs/docs.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doc } from './docs/entities/docs.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UrlsModule } from './urls/urls.module';
import { Url } from './urls/entities/url.entity';

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
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'waqas',
      database: 'postgres',
      entities: [Doc, Url],
      synchronize: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    DocsModule,
    UrlsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
