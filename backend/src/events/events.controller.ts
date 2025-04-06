import { Controller, Post, Body, Get, Param, ParseIntPipe, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateTicketTypeDto } from '../tickets/dto/create-ticket-type.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createEventDto: CreateEventDto, @Request() req) {
    console.log('User creating event:', req.user);
    return this.eventsService.createEvent(createEventDto);
  }

  @Get()
  async findAll() {
    return this.eventsService.findAllEvents();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findOneEvent(id);
  }

  @Post(':eventId/ticket-types')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  async addTicketType(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() createTicketTypeDto: CreateTicketTypeDto,
    @Request() req,
  ) {
    console.log('User adding ticket type:', req.user);
    return this.eventsService.addTicketTypeToEvent(eventId, createTicketTypeDto);
  }
}