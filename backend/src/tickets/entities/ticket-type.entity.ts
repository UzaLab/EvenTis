import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Event } from '../../events/entities/event.entity'; // Chemin relatif pour la relation

@Entity('ticket_types')
export class TicketType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  event_id: number; // Clé étrangère explicite

  @ManyToOne(() => Event, event => event.ticket_types, { onDelete: 'CASCADE' }) // Si l'event est supprimé, ses ticket types aussi
  @JoinColumn({ name: 'event_id' }) // Spécifie la colonne de jointure
  event: Event;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  price: number;

  @Column({ length: 3, default: 'XOF' }) // Devise par défaut pour Afrique de l'Ouest
  currency: string;

  @Column()
  quantity_available: number;

  @Column({ default: 0 })
  quantity_sold: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  sale_start_date: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  sale_end_date: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // TODO pour MVP+: max_tickets_per_order, is_vip, etc.
}