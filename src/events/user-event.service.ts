import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Users } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { LoginHistory } from './entity/login-history.entity';
import { InjectRepository } from '@nestjs/typeorm';

export interface UserRegisteredEvent {
  user: {
    id: number;
    email: string;
    name: string;
  };
  timeStamp: Date;
}

export interface UserLoginHistoryEven {
  id: number;
  user: number;
  loginTime: Date;
}

@Injectable()
export class UserEventsService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(LoginHistory)
    private readonly loginHistoryRepository: Repository<LoginHistory>,
  ) {}
  emitUserRegistered(user: Users): void {
    const userRegisteredEventData: UserRegisteredEvent = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      timeStamp: new Date(),
    };
    this.eventEmitter.emit('user.registered', userRegisteredEventData);
  }

  async recordLogin(userId: number): Promise<void> {
    const login = this.loginHistoryRepository.create({
      user: { id: userId },
    });
    await this.loginHistoryRepository.save(login);
    this.eventEmitter.emit('user.loginRecord', login);
  }
}
