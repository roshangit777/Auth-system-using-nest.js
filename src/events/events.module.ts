import { Module } from '@nestjs/common';
import { UserEventsService } from './user-event.service';
import { UserRegisteredListener } from './listeners/user-registerd.listeners.event';

@Module({
  imports: [],
  providers: [UserEventsService, UserRegisteredListener],
  exports: [UserEventsService],
})
export class EventsModule {}
