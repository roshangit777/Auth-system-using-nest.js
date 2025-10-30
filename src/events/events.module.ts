import { Module } from '@nestjs/common';
import { UserEventsService } from './user-event.service';
import { UserRegisteredListener } from './listeners/user-registerd.listeners.event';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginHistory } from './entity/login-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LoginHistory])],
  providers: [UserEventsService, UserRegisteredListener],
  exports: [UserEventsService],
})
export class EventsModule {}
