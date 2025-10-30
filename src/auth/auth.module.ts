import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { EventsModule } from 'src/events/events.module';
import { LoginHistory } from 'src/events/entity/login-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, LoginHistory]),
    JwtModule.register({
      global: true,
      secret: 'jwtsecret',
      signOptions: { expiresIn: '10000s' },
    }),
    EventsModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
