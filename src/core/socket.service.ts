import { INestApplication, Injectable, OnApplicationBootstrap, OnApplicationShutdown, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Server } from 'socket.io';
import { HttpAdapterHost } from '@nestjs/core';
@Injectable()
export class SocketIoService implements OnModuleInit, OnModuleDestroy{
  private io: Server

  constructor(private adapterHost: HttpAdapterHost) {}
  async onModuleInit() {
    const httpServer = this.adapterHost.httpAdapter.getHttpServer()
    this.io = new Server(httpServer, {
      cors: {
        origin: '*'
      }
    })
    console.log('Socket.IO server initialized and attached to HTTP server')
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`)
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`)
      })
    })
  }

  onModuleDestroy() {
    if (this.io) {
      this.io.close(()=>{
        console.log('SOcket.IO server shutdown')
      })
    }
  }

  broadcast(event: string, data: any): void {
    if (this.io) {
      this.io.emit(event, data)
    }
  }

}