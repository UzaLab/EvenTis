import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketType } from './entities/ticket-type.entity';
import { Ticket } from './entities/ticket.entity';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([TicketType, Ticket]) // Ticket ajouté ici
  ],
  controllers: [TicketsController],
  providers: [TicketsService],   // Vide
  exports: [TicketsService]     // Vide
})
export class TicketsModule {}