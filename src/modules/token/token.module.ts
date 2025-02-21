import { Module } from '@nestjs/common'
import { TokenController } from './token.controller'
import { PrismaService } from '../../core/prisma.service'
import { HttpModule } from '@nestjs/axios'
import { RedisService } from '../../core/redis.service'
import { TokenService } from 'src/core/token.service'

@Module({
  imports: [HttpModule],
  providers: [TokenService, PrismaService, RedisService],
  controllers: [TokenController],
})
export class TokenModule {}
