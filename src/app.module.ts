import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HelloModule } from './hello/hello.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { PostModule } from './post/post.module';
import appConfig from './config/app.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Posts } from './post/entity/post.entity';
import { AuthModule } from './auth/auth.module';
import { Users } from './auth/entities/user.entity';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { FileUploadModule } from './file-upload/file-upload.module';
import { File } from './file-upload/entity/cloudinary.entity';
import { EventsModule } from './events/events.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerMiddleware } from './middleware/logger.middleware';
import { LoginHistory } from './events/entity/login-history.entity';
import cors from 'cors';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 5,
        },
      ],
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 30000,
      max: 100,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    PostModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: 'postgresql://postgres:0000@db.oocgxjsamsnuzfkdguge.supabase.co:5432/postgres',
      entities: [Posts, Users, File, LoginHistory],
      synchronize: true,
    }),
    EventEmitterModule.forRoot({
      global: true,
      wildcard: false,
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),
    HelloModule,
    UserModule,
    AuthModule,
    FileUploadModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    //cors configuration only for auth route
    consumer
      .apply(cors({ origin: 'http://localhost:3000', credentials: true }))
      .forRoutes('auth');
    // apply the middlewares for all the routes
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
