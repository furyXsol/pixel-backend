import { Module } from '@nestjs/common';
// import { CacheModule } from '@nestjs/cache-manager';
// import * as redisStore from 'cache-manager-redis-store';
import { PrismaService } from './core/prisma.service';
import { TaskService } from './core/task.service';
import { RedisService } from './core/redis.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TokenModule } from './modules/token/token.module';
import { SolanaPixelService } from "./core/solana_pixel_service";
import { SocketIoService } from './core/socket.service';
import { TokenService } from './core/token.service';

@Module({
  imports: [
    // CacheModule.register({
    //   isGlobal: true,
    //   store: redisStore,
    //   host: process.env.REDIS_HOST,
    //   port: process.env.REDIS_PORT,
    //   username: process.env.REDIS_USER,
    //   password: process.env.REDIS_PASSWORD,
    //   no_ready_check: true,
    // }),
    ScheduleModule.forRoot(),
    TokenModule,
  ],
  controllers: [],
  providers: [
    PrismaService,
    TaskService,
    RedisService,
    SocketIoService,
    TokenService,
    SolanaPixelService,
  ],
})
export class MainModule {}