import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    PostModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: 'postgresql://postgres:0000@db.oocgxjsamsnuzfkdguge.supabase.co:5432/postgres',
      entities: [Posts, Users],
      synchronize: true,
    }),
    HelloModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
