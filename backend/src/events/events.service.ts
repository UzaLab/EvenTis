import { Injectable, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventStatusEnum } from './entities/event.entity';
import { TicketType } from '../tickets/entities/ticket-type.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateTicketTypeDto } from '../tickets/dto/create-ticket-type.dto';
import { slugify } from 'src/utils/slugify'; // Utilitaire simple pour créer des slugs (à créer)

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(TicketType)
    private readonly ticketTypeRepository: Repository<TicketType>,
  ) {}

  async createEvent(createEventDto: CreateEventDto): Promise<Event> {
    const { ticket_types: ticketTypesDto, ...eventData } = createEventDto;

    // 1. Générer un slug simple et vérifier son unicité
    let baseSlug = slugify(eventData.title);
    let slug = baseSlug;
    let counter = 1;
    while (await this.eventRepository.findOneBy({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
        // Ajouter une limite pour éviter boucle infinie si problème
        if (counter > 100) throw new InternalServerErrorException('Impossible de générer un slug unique.');
    }


    // 2. Créer l'instance de l'événement
    const newEvent = this.eventRepository.create({
      ...eventData,
      slug: slug, // Utilise le slug généré
      status: EventStatusEnum.DRAFT, // Statut par défaut
      // Dates sont des strings dans le DTO, TypeORM les convertit si le type de colonne est Date/Timestamp
      start_date: new Date(eventData.start_date),
      end_date: new Date(eventData.end_date),
    });

    // 3. Gérer les ticket types si fournis dans le DTO
    if (ticketTypesDto && ticketTypesDto.length > 0) {
      // Création explicite de l'objet pour chaque ticket type
      newEvent.ticket_types = ticketTypesDto.map(dto => {
        const ticketTypeData: Partial<TicketType> = {
          name: dto.name,
          description: dto.description,
          price: dto.price,
          quantity_available: dto.quantity_available,
          sale_start_date: dto.sale_start_date ? new Date(dto.sale_start_date) : undefined,
          sale_end_date: dto.sale_end_date ? new Date(dto.sale_end_date) : undefined,
        };
        return this.ticketTypeRepository.create(ticketTypeData);
      });
    }

    // 4. Sauvegarder l'événement (et les ticket_types en cascade si configuré)
    try {
        return await this.eventRepository.save(newEvent);
    } catch (error) {
        // Vérifier si l'erreur est une violation de contrainte unique (ex: slug, titre?)
         if (error.code === '23505') { // Code d'erreur PostgreSQL pour unique_violation
            throw new ConflictException('Un événement avec un titre ou slug similaire existe déjà.');
        }
        console.error("Erreur lors de la sauvegarde de l'événement:", error);
        throw new InternalServerErrorException("Impossible de créer l'événement.");
    }
  }

  async findAllEvents(): Promise<Event[]> {
    // TODO MVP+: Ajouter pagination, filtres, tri
    return this.eventRepository.find({
         relations: ['ticket_types'], // Charger les types de billets associés
         order: { start_date: 'ASC' } // Trier par date de début par défaut
        });
  }

  async findOneEvent(id: number): Promise<Event> {
    const event = await this.eventRepository.findOne({
        where: { id },
        relations: ['ticket_types'], // Charger les types de billets associés
    });
    if (!event) {
      throw new NotFoundException(`Événement avec l'ID ${id} non trouvé.`);
    }
    return event;
  }

  // Méthode spécifique pour ajouter un type de billet à un événement existant
  async addTicketTypeToEvent(eventId: number, createTicketTypeDto: CreateTicketTypeDto): Promise<TicketType> {
    const event = await this.findOneEvent(eventId); // Vérifie si l'événement existe

    const newTicketTypeData: Partial<TicketType> = {
        event_id: eventId,
        name: createTicketTypeDto.name,
        description: createTicketTypeDto.description,
        price: createTicketTypeDto.price,
        quantity_available: createTicketTypeDto.quantity_available,
        sale_start_date: createTicketTypeDto.sale_start_date ? new Date(createTicketTypeDto.sale_start_date) : undefined,
        sale_end_date: createTicketTypeDto.sale_end_date ? new Date(createTicketTypeDto.sale_end_date) : undefined,
    };
    const newTicketType = this.ticketTypeRepository.create(newTicketTypeData);

    try {
        return await this.ticketTypeRepository.save(newTicketType);
    } catch (error) {
         console.error("Erreur lors de la sauvegarde du type de billet:", error);
         throw new InternalServerErrorException("Impossible de créer le type de billet.");
    }

  }

  // TODO MVP+: updateEvent, deleteEvent, etc.
}