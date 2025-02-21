import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class RedisService {
  constructor(private readonly prisma: PrismaService) {}

  async set(key: string, value: string): Promise<void> {
    await this.prisma.keyValueMapping.upsert({
      where: {
        key,
      },
      update: {
        value,
      },
      create: {
        key,
        value,
      },
    });
  }

  async setValue(key: string, value: number): Promise<void> {
    await this.prisma.keyValueMapping.upsert({
      where: {
        key,
      },
      update: {
        value: value.toString(),
      },
      create: {
        key,
        value: value.toString(),
      },
    });
  }

  async get(key: string): Promise<string> {
    const value = await this.prisma.keyValueMapping.findFirst({
      where: {
        key,
      },
    });
    return value?.value || '';
  }

  async getValue(key: string): Promise<number> {
    const value = await this.prisma.keyValueMapping.findFirst({
      where: {
        key,
      },
    });
    return Number(value?.value) || 0;
  }
}
