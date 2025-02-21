import { NestFactory } from '@nestjs/core';
import { MainModule } from './main.module';

import 'dotenv/config';

async function bootstrap() {
  // const httpsOptions = {
  //   key: fs.readFileSync('./src/secret/private-key.pem'),
  //   cert: fs.readFileSync('./src/secret/public-certificate.pem'),
  // }
  // const app = await NestFactory.create(MainModule, {
  //   httpsOptions,
  // });
  const app = await NestFactory.create(MainModule);
  app.enableCors();
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
