import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { User } from '../../users/entities/user.entity'; // Relation avec User
import { TicketType } from './ticket-type.entity'; // Relation avec TicketType
import { v4 as uuidv4 } from 'uuid'; // Pour générer un code unique simple

export enum TicketStatus {
  VALID = 'valid',
  USED = 'used',
  CANCELLED = 'cancelled',
  // TRANSFERRED = 'transferred', // Pour plus tard
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number; // Clé étrangère User

  @ManyToOne(() => User /*, user => user.tickets // Décommenter quand la relation inverse sera ajoutée à User */)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  ticket_type_id: number; // Clé étrangère TicketType

  @ManyToOne(() => TicketType /*, tt => tt.tickets // Décommenter quand la relation inverse sera ajoutée à TicketType */, { eager: true }) // Eager load TicketType info?
  @JoinColumn({ name: 'ticket_type_id' })
  ticket_type: TicketType;

  // On stocke le prix au moment de l'achat au cas où le prix du TicketType change
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  purchase_price: number;

  @Column({ length: 3 })
  purchase_currency: string;

  @Column({ type: 'varchar', length: 36, unique: true }) // UUID v4 est sur 36 caractères
  unique_code: string; // Code unique pour ce billet spécifique

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.VALID })
  ticket_status: TicketStatus;

  @Column({ default: false })
  checked_in: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  checked_in_at: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date; // Date d'achat

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Hook TypeORM pour générer le code unique avant l'insertion
  @BeforeInsert()
  generateUniqueCode() {
    this.unique_code = uuidv4();
  }

  // TODO MVP+: seat_information (JSONB?), transferred_from_user_id?
}