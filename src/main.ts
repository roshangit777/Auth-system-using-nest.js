import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import cluster from 'cluster';
import os from 'os';
/* import cors from 'cors'; */

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'debug', 'log', 'verbose', 'warn'],
  });

  //cors configuration
  app.enableCors({
    origin: ['https://localhost:5432/'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });

  // Apply CORS only for a specific route (/auth)
  /* app.use(
    '/auth',
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    }),
  ); */

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: false,
    }),
  );

  app.useGlobalInterceptors(new LoggingInterceptor());

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Worker ${process.pid} running on port ${port}`);
}

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`Master ${process.pid} is running`);
  console.log(`Forking ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died — restarting...`);
    cluster.fork();
  });
} else {
  bootstrap();
}
