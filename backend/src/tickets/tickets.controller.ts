import { Controller, Post, Body, Get, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { PurchaseTicketDto } from './dto/purchase-ticket.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('tickets') // Préfixe de route /tickets
@UseGuards(AuthGuard('jwt')) // Protège TOUTES les routes de ce contrôleur par défaut
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post('purchase') // Route: POST /tickets/purchase
  @HttpCode(HttpStatus.CREATED)
  async purchase(
    @Body() purchaseTicketDto: PurchaseTicketDto,
    @Request() req, // Pour obtenir l'ID de l'utilisateur depuis le token JWT
  ) {
    const userId = req.user.userId; // Récupère userId depuis le payload validé par JwtStrategy
    if (!userId) {
        // Ne devrait pas arriver si AuthGuard('jwt') fonctionne
        throw new Error('User ID non trouvé dans la requête après authentification');
    }
    // Appelle le service pour effectuer l'achat simulé
    return this.ticketsService.purchaseTicket(userId, purchaseTicketDto.ticketTypeId);
  }

  @Get('my-tickets') // Route: GET /tickets/my-tickets
  async getMyTickets(@Request() req) {
    const userId = req.user.userId;
     if (!userId) {
        throw new Error('User ID non trouvé dans la requête après authentification');
    }
    // Appelle le service pour récupérer les billets de l'utilisateur
    return this.ticketsService.findTicketsByUserId(userId);
  }
}