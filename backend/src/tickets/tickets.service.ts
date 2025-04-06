import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketType } from './entities/ticket-type.entity';
import { User } from '../users/entities/user.entity'; // Peut être utile plus tard

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(TicketType)
    private readonly ticketTypeRepository: Repository<TicketType>,
    // Injecter DataSource pour pouvoir gérer les transactions
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Simule l'achat d'un billet pour un utilisateur donné et un type de billet.
   * Gère la transaction et la mise à jour du stock.
   */
  async purchaseTicket(userId: number, ticketTypeId: number): Promise<Ticket> {
    // Utilisation d'une transaction pour garantir l'atomicité
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Verrouiller et récupérer le TicketType pour vérifier le stock
      // Utilisation de 'pessimistic_write' pour éviter les race conditions sur le stock
      const ticketType = await queryRunner.manager.findOne(TicketType, {
        where: { id: ticketTypeId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!ticketType) {
        throw new NotFoundException(`Le type de billet avec l'ID ${ticketTypeId} n'existe pas.`);
      }

      if (ticketType.quantity_sold >= ticketType.quantity_available) {
        throw new ConflictException(`Le type de billet "${ticketType.name}" est épuisé.`);
      }

      // 2. Incrémenter la quantité vendue
      ticketType.quantity_sold += 1;
      await queryRunner.manager.save(TicketType, ticketType); // Sauvegarde DANS la transaction

      // 3. Créer le nouveau billet
      const newTicket = queryRunner.manager.create(Ticket, {
        user_id: userId,
        ticket_type_id: ticketTypeId, // ou ticket_type: ticketType si on préfère passer l'objet
        purchase_price: ticketType.price, // Prix au moment de l'achat
        purchase_currency: ticketType.currency,
        // unique_code sera généré par @BeforeInsert
        // ticket_status est 'valid' par défaut
      });
      const savedTicket = await queryRunner.manager.save(Ticket, newTicket); // Sauvegarde DANS la transaction

      // 4. Valider la transaction
      await queryRunner.commitTransaction();

      // Retourner le billet créé (peut-être sans l'user complet pour l'efficacité ?)
      // Recharger avec les relations si nécessaire (pas fait ici pour l'instant)
      return savedTicket;

    } catch (error) {
      // En cas d'erreur, annuler la transaction
      await queryRunner.rollbackTransaction();
      console.error("Erreur lors de l'achat du billet:", error);
      // Renvoyer l'erreur spécifique (NotFound, Conflict) ou une erreur serveur
      if (error instanceof NotFoundException || error instanceof ConflictException) {
          throw error;
      }
      throw new InternalServerErrorException("Impossible de finaliser l'achat du billet.");
    } finally {
      // Toujours libérer le queryRunner
      await queryRunner.release();
    }
  }

  /**
   * Récupère les billets pour un utilisateur donné.
   */
   async findTicketsByUserId(userId: number): Promise<Ticket[]> {
       return this.ticketRepository.find({
           where: { user_id: userId },
           // Charger les relations utiles, ex: le type de billet et l'événement associé
           relations: {
               ticket_type: { // Charger TicketType...
                   event: true // ...et l'Event associé à TicketType
               }
           },
           order: {
               created_at: 'DESC' // Trier par date d'achat
           }
       });
   }

  // TODO: Ajouter d'autres méthodes si nécessaire (getTicketById, etc.)
}