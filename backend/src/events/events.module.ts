import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { TicketType } from '../tickets/entities/ticket-type.entity';
import { EventsService } from './events.service'; // Import ajouté
import { EventsController } from './events.controller'; // Import ajouté

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, TicketType])
  ],
  controllers: [EventsController], // Ajouté aux controllers
  providers: [EventsService], // Ajouté aux providers
  exports: [EventsService],   // Ajouté aux exports (si d'autres modules en ont besoin)
})
export class EventsModule {}