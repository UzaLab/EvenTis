import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { TicketType } from '../../tickets/entities/ticket-type.entity'; // Chemin relatif pour la relation

// Simplification: Pas encore de lien vers Organizer ou Category pour le MVP
// @ManyToOne(() => Organizer, organizer => organizer.events)
// organizer: Organizer;
// @ManyToOne(() => EventCategory, category => category.events)
// category: EventCategory;

export enum EventTypeEnum {
  PHYSICAL = 'physical',
  ONLINE = 'online',
  HYBRID = 'hybrid',
}

export enum EventStatusEnum {
  DRAFT = 'draft',
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Index({ unique: true }) // Slug pour URL conviviale
  @Column({ length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: EventTypeEnum })
  event_type: EventTypeEnum;

  @Column({ type: 'timestamp with time zone' })
  start_date: Date;

  @Column({ type: 'timestamp with time zone' })
  end_date: Date;

  @Column({ length: 50, default: 'UTC' })
  timezone: string;

  @Column({ type: 'text', nullable: true })
  location_address: string; // Pour event physique

  @Column({ length: 500, nullable: true })
  location_url: string; // Pour event en ligne

  @Column({ nullable: true })
  max_capacity: number;

  @Column({ length: 500, nullable: true })
  cover_image_url: string;

  @Column({ type: 'enum', enum: EventStatusEnum, default: EventStatusEnum.DRAFT })
  status: EventStatusEnum;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Relation: Un événement peut avoir plusieurs types de billets
  @OneToMany(() => TicketType, ticketType => ticketType.event, { cascade: true }) // Cascade pour faciliter la création/suppression
  ticket_types: TicketType[];

  // TODO pour MVP+: Ajouter category_id, organizer_id (ForeignKey) quand ces entités existeront
  // TODO pour V2: featured, terms, booking_deadline, seo_metadata etc.
}