import { HttpModule as BaseHttpModule, HttpService } from '@nestjs/axios';
import { Logger, Module, OnModuleInit } from '@nestjs/common';

@Module({
  imports: [BaseHttpModule],
  exports: [BaseHttpModule],
})
export class HttpModule implements OnModuleInit {
  private readonly logger = new Logger(HttpModule.name);

  constructor(private readonly http: HttpService) {}

  async onModuleInit() {
    this.http.axiosRef.interceptors.request.use((config) => {
      return config;
    });

    this.http.axiosRef.interceptors.response.use(
      (response) => {
        return response;
      },
      (err) => {
        this.logger.error(err);
        return Promise.reject(err);
      },
    );
  }
}
